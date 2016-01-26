<ul class="zotero-groups">
	<% for (var group of obj.groups) { %>
		<%= obj.renderer.renderGroup(group) %>
	<% } %>
</ul>