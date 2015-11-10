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
var tplTransform = require('node-underscorify').transform({
    extensions: ['tpl'],
    requires: [{variable: '_', module: 'lodash'}]
});
var _ = require('lodash');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var autoprefixer = require('gulp-autoprefixer');

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
		.pipe(gulp.dest('./dist'));
});

gulp.task('js', function() {
	var b = browserify({
		entries: 'src/js/app.js',
		debug: true,
		standalone: 'zoteroPublications'
	});

	b.transform(babelify);
	b.transform(tplTransform);
	b.transform(stringify);
	
	rimraf.sync('dist/');

	return b.bundle()
		.on('error', gutil.log)
		.pipe(source('zotero-publications.js'))
		.pipe(buffer())
		.pipe(gulp.dest('./dist/'))
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['js', 'less']);
