<ul class="zotero-items">
	<% for (var item of obj.items) { %>
		<%= obj.renderer.renderItem(item) %>
	<% } %>
</ul>