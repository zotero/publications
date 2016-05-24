/*eslint-env node */

'use strict';

var rimraf = require('rimraf');
var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var uglifyHarmony = require('uglify-js');
var lodash = require('lodash');
var uglify = lodash.partial(require('gulp-uglify/minifier'), lodash, uglifyHarmony);
var rename = require('gulp-rename');
var babelify = require('babelify');
var symlink = require('gulp-symlink');
var jstify = require('jstify');
var shim = require('browserify-shim');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssminify = require('gulp-minify-css');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');
var babel = require('gulp-babel');
var tplCompiler = require('./gulp/tpl-compiler');
var watchify = require('watchify');
var runSequence = require('run-sequence');
var merge = require('merge-stream');
var fs = require('fs');
var watch;
var buildDir;


var shimConfigs = {
	'nodeps': {
		"browser": {
			"lodash": "./node_modules/lodash/lodash.js"
		},
		"shim": {
			"lodash": "global:_"
		}
	},
	'lodash': {
		"browser": {
			"lodash": "./node_modules/lodash/lodash.js"
		}
	}
}

var presets = {
	'modern': [
		'check-es2015-constants',
		'transform-es2015-modules-commonjs'
	],
	'compat': [
		'check-es2015-constants',
		'transform-es2015-arrow-functions',
		'transform-es2015-block-scoped-functions',
		'transform-es2015-block-scoping',
		'transform-es2015-classes',
		'transform-es2015-computed-properties',
		'transform-es2015-destructuring',
		'transform-es2015-for-of',
		'transform-es2015-function-name',
		'transform-es2015-literals',
		'transform-es2015-modules-commonjs',
		'transform-es2015-object-super',
		'transform-es2015-parameters',
		'transform-es2015-shorthand-properties',
		'transform-es2015-spread',
		'transform-es2015-sticky-regex',
		'transform-es2015-template-literals',
		'transform-es2015-typeof-symbol',
		'transform-es2015-unicode-regex',
		'transform-regenerator'
	]
}

function bundleShare(b, filename) {
	filename = filename || 'zotero-publications.js';
//	if(variant) {
//		filename = `zotero-publications.${variant}.js`;
//	} else {
//		filename = 'zotero-publications.js';
//	}
	return b.bundle()
		.on('error', gutil.log)
		.pipe(source(filename))
		.pipe(buffer())
		.pipe(gulp.dest(buildDir))
		.pipe(gulpif(watch, connect.reload()));
}

/**
 * Returns pre-configured browserify
 * @param  {Boolean} debug  Whether to enable debug mode in Browserify
 * @param  {String} version Build version, i.e. modern or compat
 * @param  {String} variant Build variant, i.e. lodash or nodeps
 * @return {Object}         Browserify object
 */
function getBrowserify(debug, version, variant) {
	var babelPlugins = presets[version] || [];

	var b = browserify({
			cache: {},
			packageCache: {},
			entries: `src/js/main-${version}.js`,
			debug: debug,
			standalone: 'ZoteroPublications',
			transform: [
			['node-underscorify', {
                'extensions': ['tpl'],
                'requires': [{variable: '_', module: 'lodash'}],
                'templateSettings': {
                	variable: 'obj'
                }
            }],
            ['babelify', {
            	'extensions': ['.js', '.tpl'],
            	'plugins': babelPlugins
        	}],
			['browserify-shim', shimConfigs[variant]],

		]
	});

	return b;
}

gulp.task('js', function() {
	let b = getBrowserify(watch, 'modern', 'nodeps');

	if(watch) {
    	b = watchify(b);
    	b.on('update', function() {
    		bundleShare(b);
    	});
	}
	return bundleShare(b);
});

gulp.task('multi-js', function() {
	let bnodeps = getBrowserify(false, 'modern', 'nodeps'),
		bnodepsCompat = getBrowserify(false, 'compat', 'nodeps'),
		blodash = getBrowserify(false, 'modern', 'lodash'),
		blodashComapt = getBrowserify(false, 'compat', 'lodash');

	return merge(
		bundleShare(bnodeps, 'zotero-publications.js')
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir)),
		bundleShare(bnodepsCompat, 'zotero-publications-compat.js')
//			.pipe(rename({ suffix: '-compat' }))
			//.pipe(gulp.dest(buildDir))
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir)),
		bundleShare(blodash, 'zotero-publications-lodash.js')
//			.pipe(rename({ suffix: '-compat-lodash' }))
			//.pipe(gulp.dest(buildDir))
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir)),
		bundleShare(blodashComapt, 'zotero-publications-compat-lodash.js')
//			.pipe(rename({ suffix: '-compat' }))
//			.pipe(gulp.dest(buildDir))
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir))
	);
});

gulp.task('scss', function() {
	return merge(
		gulp.src('./src/scss/zotero-publications.scss')
			.pipe(gulpif(watch, sourcemaps.init()))
			.pipe(sass().on('error', function(msg) {
				gutil.log(gutil.colors.red(msg));
			}))
			.pipe(autoprefixer({
				browsers: ['last 2 versions']
			}))
			.pipe(gulpif(watch, sourcemaps.write()))
			.pipe(gulp.dest(buildDir))
			.pipe(gulpif(!watch, rename({ extname: '.min.css' })))
			.pipe(gulpif(!watch, cssminify()))
			.pipe(gulpif(!watch, gulp.dest(buildDir))),
		gulp.src('./src/scss/demo.scss')
			.pipe(gulpif(watch, sourcemaps.init()))
			.pipe(sass().on('error', function(msg) {
				gutil.log(gutil.colors.red(msg));
			}))
			.pipe(autoprefixer({
				browsers: ['last 2 versions']
			}))
			.pipe(gulpif(watch, sourcemaps.write()))
			.pipe(gulp.dest('./tmp/'))
	);
});

gulp.task('demo', function() {
	return merge(
		gulp.src(['src/demo/index.html', 'src/demo/local-grouped.html', 'src/demo/local-ungrouped.html', 'src/demo/local-templated.html'])
			.pipe(symlink(['tmp/index.html', 'tmp/local-grouped.html', 'tmp/local-ungrouped.html', 'tmp/local-templated.html'])),
		gulp.src('node_modules/lodash/lodash.js')
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
	runSequence('setup-dist', ['multi-js', 'scss'], done);
});

gulp.task('dev', function(done) {
	connect.server({
		root: 'tmp',
		port: 8001,
		livereload: true
	});

	gulp.watch('./src/scss/*.scss', ['scss']);
	runSequence('setup-dev', ['demo', 'js', 'scss'], done);
});

gulp.task('default', ['setup-dev'], function() {
	return gulp.start('dev');
});

gulp.task('clean:prepublish', function(done) {
	rimraf('./lib/', done);
});

gulp.task('prepublish:tpl', function() {
	return gulp.src('./src/js/tpl/**/*.tpl')
			.pipe(tplCompiler())
			.pipe(gulp.dest('./lib/tpl/'));
});

gulp.task('prepublish:js', function() {
	return gulp.src('./src/js/**/*.js')
			.pipe(babel({
				plugins: presets['modern']
			}))
			.pipe(gulp.dest('./lib/'));
});


gulp.task('prepublish', ['clean:prepublish'], function(done) {
	runSequence('prepublish:tpl', 'prepublish:js', done);
});
