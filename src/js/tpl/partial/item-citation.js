import template from 'lodash/template';

export default template`
<h3 class="zotero-item-title">
	<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
	<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow">
		<%= obj.item.citation %>
	</a>
	<% } else { %>
		<%= obj.item.citation %>
	<% } %>
</h3>`;
