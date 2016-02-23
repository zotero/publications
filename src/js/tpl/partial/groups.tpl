<ul class="zotero-groups" role="list">
	<% for (var group of obj.groups) { %>
		<%= obj.renderer.renderGroup(group) %>
	<% } %>
</ul>