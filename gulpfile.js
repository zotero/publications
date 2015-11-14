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
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');
var connect = require('gulp-connect');
var gulpif = require('gulp-if');
var watchify = require('watchify');
var runSequence = require('run-sequence');
var fs = require('fs');
var watch;
var buildDir;

function bundleShare(b) {
	return b.bundle()
		.on('error', gutil.log)
		.pipe(source('zotero-publications.js'))
		.pipe(buffer())
		.pipe(gulp.dest(buildDir))
		.pipe(gulpif(!watch, uglify()))
		.pipe(gulpif(!watch, rename({ extname: '.min.js' })))
		.pipe(gulpif(!watch, gulp.dest(buildDir)))
		.pipe(gulpif(watch, connect.reload()));
}

gulp.task('js', function() {
	var b = browserify({
			cache: {},
			packageCache: {},
			fullPaths: true,
			entries: 'src/js/app.js',
			debug: true,
			standalone: 'ZoteroPublications'
	});

	b.transform(babelify);
	b.transform(tplTransform);
	b.transform(stringify);

	if(watch) {
    	b = watchify(b);
    	b.on('update', function() {
    		bundleShare(b);
    	});
	}
	
	return bundleShare(b);
});

gulp.task('less', function() {
	gulp.src('./src/less/zotero-publications.less')
	.pipe(sourcemaps.init())
	.pipe(less().on('error', function(msg) {
		gutil.log(gutil.colors.red(msg));
	}))
	.pipe(autoprefixer({
		browsers: ['last 2 versions']
	}))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest(buildDir));
});

gulp.task('html', function() {
	return gulp.src('src/demo/index.html')
		.pipe(symlink('tmp/index.html'));
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
	runSequence('setup-dist', ['js', 'less'], done);
});

gulp.task('dev', function(done) {
	connect.server({
		root: 'tmp',
		port: 8001,
		livereload: true
	});

	gulp.watch('./src/less/*.less', ['less']);
	runSequence('setup-dev', ['html', 'js', 'less'], done);
});

gulp.task('default', ['setup-dev'], function() {
	return gulp.start('dev');
});
