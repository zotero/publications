<ul class="zotero-items">
	<% for (var item of items) { %>
		<%= renderer.renderItem(item) %>
	<% } %>
</ul>
<%= renderer.renderBranding() %>