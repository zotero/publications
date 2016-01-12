<div class="zotero-publications">
	<ul class="zotero-groups">
		<% for (var group of groups) { %>
			<%= renderer.renderGroup(group) %>
		<% } %>
	</ul>
	<%= renderer.renderBranding() %>
</div>