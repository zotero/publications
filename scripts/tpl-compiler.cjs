const _ = require('lodash');
const glob = require('glob');
const fs = require('fs-extra');
const path = require('path');

const rootDir =  path.join(__dirname, '..');
const basePath = path.join(rootDir, 'src', 'js', 'tpl');
var filesChanged = 0;

const compile = async (file, options) => {
	const content = await fs.readFile(file, 'utf8');
	const relativePath = path.relative(basePath, file);
	const parsedPath = path.parse(path.join(path.join(rootDir, 'lib', 'js', 'tpl'), relativePath));
	delete parsedPath.base;
	parsedPath.ext = '.js';
	const targetPath = path.format(parsedPath);
	const dirPath = path.dirname(targetPath);
	await fs.ensureDir(dirPath);
	const template = _.template(content, options).source;
	let retval = 'var _ = require(\'lodash\');';
	retval += 'module.exports = ' + template + ';';
	await fs.writeFile(targetPath, retval);
	filesChanged++;
}

(async () => {
	var promises;

	glob(`${basePath}/**/*.tpl`, async (_, files) => {
		promises = files.map(f => compile(f));
		await Promise.all(promises);
		console.log(`Compiled ${filesChanged}/${files.length} templates.`);
	});
})();
