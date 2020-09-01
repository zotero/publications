const compile = require('./compile.cjs');

module.exports = function({ types }) {
  const imports = ['lodash/template'],
        identifier = types.identifier('template');

  return {
    visitor : {
      ImportDeclaration(path) {
        const node = path.node.source.value;
        const newImportSpecifier =  types.importDefaultSpecifier(types.identifier('_escape'));

        if (imports.indexOf(node) > -1) {
          path.replaceWithMultiple([
            (types.importDeclaration(
              [newImportSpecifier],
              types.stringLiteral('lodash/escape')
            )),
            types.variableDeclaration('const', [
              types.variableDeclarator(types.identifier('_'), 
                types.objectExpression([
                  types.objectProperty(
                    types.identifier('escape'),
                    types.identifier('_escape')
                  )
                ])
              )]
            )
          ]);
        }
      },

      CallExpression(path, file) {
        const { node } = path,
              { opts } = file,
              [templateStr, settings] = node.arguments;

        if (types.isIdentifier(node.callee, identifier)) {
          let template;

          if (types.isTemplateLiteral(templateStr)) {
            template = templateStr.quasi.quasis.map(quasi => quasi.value.cooked).join('');
          }

          if (types.isLiteral(templateStr)) {
            template = node.arguments.length > 0 && node.arguments[0].value;
          }

          if (!template) {
            throw path.buildCodeFrameError(`${node.callee.name} requires a string or template literal`);
          }

          if (settings) {
            Object.assign(opts, settings);
          }

          compile(template, opts, path);
        }
      },

      TaggedTemplateExpression(path, file) {
        const { node } = path,
              { opts } = file;

        if (types.isIdentifier(node.tag, identifier)) {
          const template = node.quasi.quasis.map(quasi => quasi.value.cooked).join('');

          compile(template, opts, path);
        }
      }
    }
  };
}
