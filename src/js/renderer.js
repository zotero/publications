import _ from 'lodash';
import itemTpl from './tpl/partial/item.tpl';
import itemTemplatedTpl from './tpl/partial/item-templated.tpl';
import itemCitationTpl from './tpl/partial/item-citation.tpl';
import itemsTpl from './tpl/partial/items.tpl';
import groupTpl from './tpl/partial/group.tpl';
import groupsTpl from './tpl/partial/groups.tpl';
import brandingTpl from './tpl/partial/branding.tpl';
import groupViewTpl from './tpl/group-view.tpl';
import plainViewTpl from './tpl/plain-view.tpl';
import {
	GROUP_EXPANDED_SUMBOL,
	GROUP_TITLE
} from './constants.js';
import {
	formatCategoryName
} from './utils.js';
import fieldMap from './field-map.js';
import typeMap from './type-map';
import hiddenFields from './hidden-fields.js';

_.templateSettings.variable = 'obj';

/**
 * Zotero Renderer constructor
 * @param {ZoteroPublications} [zotero]			- ZoteroPublications object
 */
function Renderer(zotero) {
	this.zotero = zotero;
	this.config = zotero.config;
	this.fieldMap = fieldMap;
	this.typeMap = typeMap;
	this.hiddenFields = hiddenFields;
}

/**
 * Render single Zotero item
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
Renderer.prototype.renderItem = function(zoteroItem) {
	return itemTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render citation part of a single Zotero using custom template
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
Renderer.prototype.renderItemTemplated = function(zoteroItem) {
	return itemTemplatedTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render citation part of a single Zotero item using api-provided citation
 * @param  {Object} zoteroItem       - Single Zotero item data
 * @return {String}                  - Rendered markup of a Zotero item
 */
Renderer.prototype.renderItemCitation = function(zoteroItem) {
	return itemCitationTpl({
		'item': zoteroItem,
		'data': zoteroItem.data,
		'renderer': this
	});
};

/**
 * Render a list of Zotero items
 * @param  {Object[]} zoteroItems - List of Zotero items
 * @return {String}                          - Rendered markup of a list of Zotero items
 */
Renderer.prototype.renderItems = function(zoteroItems) {
	return itemsTpl({
		'items': zoteroItems,
		'renderer': this
	});
};

/**
 * Render a group of Zotero items
 * @param  {Object[]} items 	- List of items for this group
 * @return {String}             - Rendered markup of a group
 */
Renderer.prototype.renderGroup = function(items) {
	return groupTpl({
		'title': formatCategoryName(items[GROUP_TITLE]),
		'items': items,
		'expand': items[GROUP_EXPANDED_SUMBOL],
		'renderer': this
	});
};

/**
 * Renders a list of groups of Zotero items
 * @param {Object[]} 	- List of groups to render
 * @return {String} 	- Rendered markup of groups
 */
Renderer.prototype.renderGroups = function(groups) {
	return groupsTpl({
		'groups': groups,
		'renderer': this
	});
};

/**
 * Render a Group View
 * @param {ZoteroData} 	- List of groups to render
 * @return {String} 	- Rendered markup of a complete group view
 */
Renderer.prototype.renderGroupView = function(data) {
	return groupViewTpl({
		'groups': data,
		'renderer': this
	});
};

/**
 * Render a Plain View
 * @param  {ZoteroData} zoteroItems - List of Zotero items
 * @return {String} 	- Rendered markup of a complete plain view
 */
Renderer.prototype.renderPlainView = function(data) {
	return plainViewTpl({
		'items': data,
		'renderer': this
	});
};

/**
 * Render Zotero branding
 * @return {String}
 */
Renderer.prototype.renderBranding = function() {
	if(this.config.showBranding) {
		return brandingTpl();
	} else {
		return '';
	}
};

module.exports = Renderer;
