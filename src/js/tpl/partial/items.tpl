<ul class="zotero-items" role="group">
	<% for (var item of obj.items) { %>
		<%= obj.renderer.renderItem(item) %>
	<% } %>
</ul>