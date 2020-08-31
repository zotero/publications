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
			'src/js/*.js': ['browserify'],
			'test/*.js': ['browserify'],
			'test/fixtures/*.html': ['browserify']
		},
		browserify: {
			debug: true,
			extensions: ['.tpl'],
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
					'plugins': [
					'check-es2015-constants',
					'transform-es2015-modules-commonjs'
					]
				}],
				[ 'browserify-istanbul', { instrumenterConfig: { embedSource: true } } ]
			]
		},
		babelPreprocessor: {
			options: {
				sourceMap: 'inline'
			}
		},
		files: [
			'src/js/*.js',
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
		singleRun: false
	});
};
