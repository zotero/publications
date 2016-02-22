<ul class="zotero-groups" role="tree">
	<% for (var group of obj.groups) { %>
		<%= obj.renderer.renderGroup(group) %>
	<% } %>
</ul>