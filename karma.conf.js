/*eslint-env node */
module.exports = function(config) {
	var reporters = process.env.COVERALLS_REPO_TOKEN ? ['dots', 'coverage', 'coveralls'] : ['dots', 'coverage'];

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
		'src/js/*.js': ['browserify', 'coverage'],
		'test/*.js': ['browserify']
	},
	browserify: {
		debug: true,
		transform: [
			'babelify',
			['node-underscorify', {
                'extensions': ['tpl']
            }]
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
		type: 'lcov',
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
