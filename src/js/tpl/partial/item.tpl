<li class="zotero-item zotero-<%- obj.data.itemType %>" data-item="<%- obj.item.key %>" id="<%- obj.item.key %>" role="listitem">
	<a href="#" class="zotero-line" aria-hidden="true" role="presentation" tabindex="-1"></a>

	<!-- Citation -->
	<% if (obj.renderer.config.alwaysUseCitationStyle) { %>
		<%= obj.renderer.renderItemCitation(obj.item) %>
	<!-- Templated -->
	<% } else { %>
		<%= obj.renderer.renderItemTemplated(obj.item) %>
	<% } %>
</li>