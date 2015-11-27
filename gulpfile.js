/*eslint-env node */

'use strict';

var rimraf = require('rimraf');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var babelify = require('babelify');
var stringify = require('stringify')(['html']);
var symlink = require('gulp-symlink');
var tplTransform = require('node-underscorify').transform({
	extensions: ['tpl'],
	requires: [{variable: '_', module: 'lodash'}]
	});
var shim = require('browserify-shim');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var cssminify = require('gulp-minify-css');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');
var watchify = require('watchify');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var insert = require('gulp-insert');
var fs = require('fs');
var promisePF = fs.readFileSync('./bower_components/es6-promise/promise.js', "utf8");
var fetchPF = fs.readFileSync('./bower_components/fetch/fetch.js', "utf8");
var watch;
var buildDir;

var shimConfigs = {
	'nodeps': {
		"browser": {
			"lodash": "./bower_components/lodash/lodash.js"
		},
		"shim": {
			"lodash": "global:_"
		}
	},
	'lodash': {
		"browser": {
			"lodash": "./bower_components/lodash/lodash.js"
		}
	}
}

function bundleShare(b, variant) {
	var filename;
	if(variant) {
		filename = `zotero-publications.${variant}.js`;
	} else {
		filename = 'zotero-publications.js';
	}
	return b.bundle()
		.on('error', gutil.log)
		.pipe(source(filename))
		.pipe(buffer())
		.pipe(gulp.dest(buildDir))
		.pipe(gulpif(watch, connect.reload()));
}

function getBrowserify(debug, shimConfig) {
	var b = browserify({
			cache: {},
			packageCache: {},
			fullPaths: true,
			entries: 'src/js/app.js',
			debug: debug,
			standalone: 'ZoteroPublications'
	});
	
	b.transform(babelify);
	b.transform(tplTransform);
	b.transform(stringify);
	b.transform(shim, shimConfig);
	return b;
}

gulp.task('js', function() {
	let b = getBrowserify(watch, shimConfigs.nodeps);
	
	if(watch) {
    	b = watchify(b);
    	b.on('update', function() {
    		bundleShare(b);
    	});
	}
	return bundleShare(b);
});

gulp.task('multi-js', function() {
	let bnodeps = getBrowserify(false, shimConfigs.nodeps),
		blodash = getBrowserify(false, shimConfigs.lodash);

	return merge(
		bundleShare(bnodeps)
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir)),
		bundleShare(bnodeps)
			.pipe(rename({ suffix: '-compat' }))
			.pipe(insert.prepend(promisePF))
			.pipe(insert.prepend(fetchPF))
			.pipe(gulp.dest(buildDir))
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir)),
		bundleShare(blodash, 'lodash')
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir)),
		bundleShare(blodash, 'lodash')
			.pipe(rename({ suffix: '-compat' }))
			.pipe(insert.prepend(promisePF))
			.pipe(insert.prepend(fetchPF))
			.pipe(gulp.dest(buildDir))
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir))
	);
});

gulp.task('less', function() {
	gulp.src('./src/less/zotero-publications.less')
	.pipe(gulpif(watch, sourcemaps.init()))
	.pipe(less().on('error', function(msg) {
		gutil.log(gutil.colors.red(msg));
	}))
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(gulpif(watch, sourcemaps.write()))
	.pipe(gulp.dest(buildDir))
	.pipe(gulpif(!watch, rename({ extname: '.min.css' })))
	.pipe(gulpif(!watch, cssminify()))
	.pipe(gulpif(!watch, gulp.dest(buildDir)));
});

gulp.task('demo', function() {
	return merge(
		gulp.src('src/demo/index.html')
			.pipe(symlink('tmp/index.html')),
		gulp.src('bower_components/lodash/lodash.js')
			.pipe(symlink('tmp/lodash.js'))
		);
});

gulp.task('setup-dist', function(done) {
	watch = false;
	buildDir = './dist/';
	done();
});

gulp.task('setup-dev', function(done) {
	watch = true;
	buildDir = './tmp/';
	rimraf(buildDir, done);
});

gulp.task('build', function(done) {
	runSequence('setup-dist', ['multi-js', 'less'], done);
});

gulp.task('dev', function(done) {
	connect.server({
		root: 'tmp',
		port: 8001,
		livereload: true
	});

	gulp.watch('./src/less/*.less', ['less']);
	runSequence('setup-dev', ['demo', 'js', 'less'], done);
});

gulp.task('default', ['setup-dev'], function() {
	return gulp.start('dev');
});
