<ul class="zotero-groups">
	<% for (var group of groups) { %>
		<%= renderer.renderGroup(group) %>
	<% } %>
</ul>