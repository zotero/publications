<li class="zotero-group<%- expand ? ' zotero-group-expanded' : '' %>" aria-expanded="<%- expand ? ' true' : 'false' %>" >
	<h2 class="zotero-group-title" data-trigger="expand-group"><%- title %></h2>
	<%= renderer.renderItems(items) %>
</li>