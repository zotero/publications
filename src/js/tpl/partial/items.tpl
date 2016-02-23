<ul class="zotero-items" role="list">
	<% for (var item of obj.items) { %>
		<%= obj.renderer.renderItem(item) %>
	<% } %>
</ul>