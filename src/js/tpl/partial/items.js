import template from 'lodash/template';

export default template`
<ul class="zotero-items" role="<%- obj.renderer.data && obj.renderer.data.grouped > 0 ? 'group': 'list' %>">
	<% for (var item of obj.items) { %>
		<%= obj.renderer.renderItem(item) %>
	<% } %>
</ul>`;
