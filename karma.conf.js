/*eslint-env node */
module.exports = function(config) {
	var reporters = process.env.COVERALLS_REPO_TOKEN ? ['dots', 'coverage', 'coveralls'] : ['dots', 'coverage'];
	// var stringifyTransform = require('stringify')(['html']);
	// var istanbul = require('browserify-istanbul');

	config.set({
	basePath: '',
	plugins: [
		'karma-jasmine',
		'karma-coverage',
		'karma-coveralls',
		'karma-chrome-launcher',
		'karma-firefox-launcher',
		'karma-source-map-support',
		'karma-babel-preprocessor',
		'karma-browserify'
	],
	frameworks: [
		'jasmine',
		'browserify',
		'source-map-support'
	],
	preprocessors: {
		'src/js/*.js': ['browserify'],
		'test/*.js': ['browserify'],
		'test/fixtures/*.html': ['browserify']
	},
	browserify: {
		debug: true,
		transform: [
			'babelify',
			['node-underscorify', {
                'extensions': ['tpl'],
                requires: [{variable: '_', module: 'lodash'}]
            }],
			['stringify', {extensions: ['.html']}],
			'browserify-istanbul'
		]
	},
	babelPreprocessor: {
		options: {
			sourceMap: 'inline'
		}
	},
	files: [
		'src/js/*.js',
		'test/*.js'
	],

	reporters: reporters,
	coverageReporter: {
		//would be lcov but https://github.com/karma-runner/karma-coverage/issues/157
		//					https://github.com/karma-runner/karma-coverage/issues/167
		type: 'text',
		dir: 'coverage/'
	},
	port: 9876,
	colors: true,
	logLevel: config.LOG_INFO,
	autoWatch: true,
	browsers: ['Chrome'],
	singleRun: false
	});
};
