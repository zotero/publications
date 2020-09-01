/*eslint-env node */
module.exports = function(config) {
	var reporters = process.env.TRAVIS ? ['dots', 'coverage', 'coveralls'] : ['dots', 'coverage'];

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
			'src/js/main.js': ['browserify'],
			'test/*.js': ['browserify'],
		},
		browserify: {
			debug: true,
			transform: [
				[ 'babelify' ],
				[ 'browserify-istanbul', { instrumenterConfig: { embedSource: true } } ]
			]
		},
		files: [
			'src/js/main.js',
			'test/*.spec.js'
		],

		reporters: reporters,
		coverageReporter: {
			reporters: [
				{ type: 'lcov', dir: 'coverage/' },
				{ type: 'html' },
				{ type: 'text' }
			]
		},
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: ['Chrome'],
		singleRun: false,
		concurrency: 1
	});
};
