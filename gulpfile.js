/*eslint-env node */
'use strict';

const rimraf = require('rimraf');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const uglifyHarmony = require('uglify-js');
const lodash = require('lodash');
const uglify = lodash.partial(require('gulp-uglify/minifier'), lodash, uglifyHarmony);
const rename = require('gulp-rename');
const babelify = require('babelify');
const symlink = require('gulp-symlink');
const jstify = require('jstify');
const shim = require('browserify-shim');
const sourcemaps = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssminify = require('gulp-minify-css');
const connect = require('gulp-connect');
const gulpif = require('gulp-if');
const babel = require('gulp-babel');
const tplCompiler = require('./gulp/tpl-compiler');
const watchify = require('watchify');
const runSequence = require('run-sequence');
const merge = require('merge-stream');
const fs = require('fs');

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

function onError(err) {
	gutil.log(gutil.colors.red('Error:'), err);
}

function onSuccess(msg) {
	gutil.log(gutil.colors.green('Build:'), msg);
}

function getBrowserify(dev, version, variant) {
	return browserify({
			cache: {},
			packageCache: {},
			entries: `src/js/main-${version}.js`,
			debug: dev,
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
				'plugins':  presets[version] || []
			}],
			['browserify-shim', shimConfigs[variant]],
		]
	});
}

function getJS(dev, filename, bundle) {
	filename = filename || 'zotero-publications.js';

	return bundle.bundle()
		.on('error', onError)
		.pipe(source(filename))
		.pipe(buffer())
		.pipe(gulp.dest(buildDir))
		.pipe(gulpif(dev, connect.reload()));
}

function getSass(dev) {
	return merge(
		gulp.src('./src/scss/zotero-publications.scss')
			.pipe(gulpif(dev, sourcemaps.init()))
			.pipe(sass().on('error', onError))
			.pipe(autoprefixer({
				browsers: ['last 2 versions', 'IE 10']
			}))
			.pipe(gulpif(dev, sourcemaps.write()))
			.pipe(gulp.dest(buildDir))
			.pipe(gulpif(!dev, rename({ extname: '.min.css' })))
			.pipe(gulpif(!dev, cssminify()))
			.pipe(gulpif(!dev, gulp.dest(buildDir))),
		gulp.src('./src/scss/demo.scss')
			.pipe(gulpif(dev, sourcemaps.init()))
			.pipe(sass().on('error', onError))
			.pipe(autoprefixer({
				browsers: ['last 2 versions', 'IE 10']
			}))
			.pipe(gulpif(dev, sourcemaps.write()))
			.pipe(gulp.dest('./tmp/'))
	);
}

function getSingleJS() {
	let bundle = getBrowserify(true, 'modern', 'nodeps');
	bundle.plugin(watchify);
	bundle.on('update', function() {
		return getJS(true, 'zotero-publications.js', bundle);
	});
	bundle.on('log', onSuccess);
	return getJS(true, 'zotero-publications.js', bundle);
}

function getMultiJS() {
	let variants = [],
		streams = [];

	variants.push([false, 'modern', 'nodeps']);
	variants.push([false, 'compat', 'nodeps']);
	variants.push([false, 'modern', 'lodash']);;
	variants.push([false, 'compat', 'lodash']);

	variants.forEach(variant => {
		let bundle = getBrowserify.apply(null, variant);
		let stream = getJS(variant[0], `zotero-publications${variant[1] === 'compat' ? '-compat' : ''}${variant[2] === 'lodash' ? '-lodash' : ''}.js`, bundle)
			.pipe(uglify())
			.pipe(rename({ extname: '.min.js' }))
			.pipe(gulp.dest(buildDir));

		streams.push(stream);
	});

	return merge.apply(null, streams);
}

function getDemo() {
	return merge(
		gulp.src(['src/demo/index.html', 'src/demo/local-grouped.html', 'src/demo/local-ungrouped.html', 'src/demo/local-templated.html'])
			.pipe(symlink(['tmp/index.html', 'tmp/local-grouped.html', 'tmp/local-ungrouped.html', 'tmp/local-templated.html'])),
		gulp.src('node_modules/lodash/lodash.js')
			.pipe(symlink('tmp/lodash.js'))
		);
}

gulp.task('scss', function() {
	return getSass(true);
});


gulp.task('build', ['clean:build'], function() {
	buildDir = './dist/';
	return merge(getMultiJS(), getSass());
});

gulp.task('dev', ['clean:dev'], function(done) {
	buildDir = './tmp/';

	connect.server({
		root: 'tmp',
		port: 8001,
		livereload: true
	});

	gulp.watch('./src/scss/*.scss', ['scss']);
	return merge(getDemo(), getSingleJS(), getSass());
});

gulp.task('default', ['dev']);

gulp.task('clean:dev', function(done) {
	rimraf('./tmp/', done);
});

gulp.task('clean:build', function(done) {
	rimraf('./dist/', done);
});


gulp.task('clean:prepublish', function(done) {
	rimraf('./lib/', done);
});

gulp.task('prepublish:tpl', function() {
	return gulp.src('./src/js/tpl/**/*.tpl')
			.pipe(tplCompiler({
				variable: 'obj'
			}))
			.pipe(babel({
				plugins: presets['compat']
			}))
			.pipe(rename({ extname: '.tpl' }))
			.pipe(gulp.dest('./lib/tpl/'));
});

gulp.task('prepublish:js', function() {
	return gulp.src('./src/js/**/*.js')
			.pipe(babel({
				plugins: presets['compat']
			}))
			.pipe(gulp.dest('./lib/'));
});


gulp.task('prepublish', ['clean:prepublish'], function(done) {
	runSequence('prepublish:tpl', 'prepublish:js', done);
});

gulp.task('postpublish', ['clean:prepublish']);
