const presets = [
	["@babel/preset-env", { "debug": !!process.env.DEBUG || false, "corejs": 3, "useBuiltIns": "usage" }],
];

const plugins = [
	["./scripts/babel-lodash-precompile.cjs", { "variable": "obj" }]
];


module.exports = {
	presets,
	plugins,
	"env": {
		"test": {
			"plugins": [ "istanbul" ]
		}
	}
};
