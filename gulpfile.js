/*eslint-env node */
'use strict';

const rimraf = require('rimraf');
const browserify = require('browserify');
const gulp = require('gulp');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const gutil = require('gulp-util');
const lodash = require('lodash');
const uglify = require('gulp-uglify-es').default;
const rename = require('gulp-rename');
const babelify = require('babelify');
const symlink = require('gulp-symlink');
const jstify = require('jstify');
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

function onError(err) {
	gutil.log(gutil.colors.red('Error:'), err);
}

function onSuccess(msg) {
	gutil.log(gutil.colors.green('Build:'), msg);
}

function getBrowserify(dev, version) {
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
				'extensions': ['.js', '.tpl']
			}]
		]
	});
}

function getJS(dev, bundle) {
	const filename = 'zotero-publications.js';

	return bundle.bundle()
		.on('error', onError)
		.pipe(source(filename))
		.pipe(buffer())
		.pipe(gulp.dest(buildDir))
		.pipe(gulpif(!dev, rename({ extname: '.min.js' })))
		.pipe(gulpif(!dev, uglify()))
		.pipe(gulpif(!dev, gulp.dest(buildDir)))
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

function getDemo() {
	return merge(
		gulp.src(['src/demo/index.html', 'src/demo/local-grouped.html', 'src/demo/local-ungrouped.html', 'src/demo/local-templated.html', 'src/demo/local-xss.html'])
			.pipe(symlink(['tmp/index.html', 'tmp/local-grouped.html', 'tmp/local-ungrouped.html', 'tmp/local-templated.html', 'tmp/local-xss.html'])),
		gulp.src('node_modules/lodash/lodash.js')
			.pipe(symlink('tmp/lodash.js'))
		);
}

gulp.task('scss', function() {
	return getSass(true);
});


gulp.task('build', ['clean:build'], function() {
	buildDir = './dist/';
	return merge(getJS(false, getBrowserify(false, 'compat')), getSass());
});

gulp.task('dev', ['clean:dev'], function(done) {
	buildDir = './tmp/';

	connect.server({
		root: 'tmp',
		port: 8001,
		livereload: true
	});

	gulp.watch('./src/scss/*.scss', ['scss']);
	return merge(
		getDemo(),
		getJS(true, getBrowserify(true, 'compat')),
		getSass()
	);
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
