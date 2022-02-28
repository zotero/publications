/*eslint-env node */
module.exports = function(config) {
	var reporters = process.env.TRAVIS ? ['dots', 'coverage'] : ['dots', 'coverage'];

	config.set({
		basePath: '',
		plugins: [
			'karma-jasmine',
			'karma-coverage',
			'karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-source-map-support',
			'karma-browserify'
		],
		frameworks: [
			'jasmine',
			'browserify',
			'source-map-support'
		],
		preprocessors: {
			'src/js/**/*.js': ['browserify'],
			'test/*.js': ['browserify'],
		},
		browserify: {
			debug: true,
			transform: [
				[ 'babelify' ]
			]
		},
		files: [
			'src/js/**/*.js',
			'test/*.spec.js'
		],

		reporters: reporters,
		coverageReporter: {
			instrumenterOptions: {
				istanbul: { noCompact: true }
			},
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
