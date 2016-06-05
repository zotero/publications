<% const constants = require('../../constants.js'); %>
<h3 class="zotero-item-title">
	<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
	<a href="<%- obj.item[constants.VIEW_ONLINE_URL] %>" rel="nofollow">
		<%= obj.item.citation %>
	</a>
	<% } else { %>
		<%= obj.item.citation %>
	<% } %>
	<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
</h3>