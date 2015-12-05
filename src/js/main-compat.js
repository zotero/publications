// require('core-js/es5');

// doesn't seem to work very well in IE
// require('es6-promise').polyfill();
require('core-js/es6/promise');
require('whatwg-fetch');
import { ZoteroPublications } from './main.js';

module.exports = ZoteroPublications;