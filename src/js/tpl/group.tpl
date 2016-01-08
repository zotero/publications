<li class="zotero-group<%- expand ? ' zotero-group-expanded' : '' %>" aria-expanded="<%- expand ? ' true' : 'false' %>" >
	<h3 class="zotero-group-title"><%- title %></h3>
	<% for (var item of items) { %>
		<%= renderer.renderItem(item) %>
	<% } %>
</li>