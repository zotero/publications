'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var _ = require('lodash');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-underscore-compile';

module.exports = function (options) {
	options = options || {};

	function compiler(file) {
		var html = file.contents.toString();
		var template = _.template(html, options).source;

		return 'module.exports = ' + template + ';';
	}

	return through.obj(function (file, enc, callback) {

		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {
			this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
			return callback();
		}

		var filePath = file.path;

		try {
			var compiled = compiler(file);

			file.contents = new Buffer(compiled);
		} catch (err) {
			this.emit('error', new PluginError(PLUGIN_NAME, err, {fileName: filePath}));
			return callback();
		}

		this.push(file);
		callback();
	});
};
