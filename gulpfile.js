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
var tplTransform = require('node-underscorify').transform({
    extensions: ['tpl']
});
var _ = require('lodash');

gulp.task('default', function () {
	var b = browserify({
		entries: 'src/js/app.js',
		debug: true,
		standalone: 'zoteroMyPublications'
	});

	b.transform(babelify);
	b.transform(tplTransform);
	
	rimraf.sync('dist/');

	return b.bundle()
		.on('error', gutil.log)
		.pipe(source('mypub.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist/'))
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('./dist/'));
});
