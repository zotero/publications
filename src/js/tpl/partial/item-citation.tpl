<% const constants = require('../../constants'); %>
<% const utils = require('../../utils'); %>
<h3 class="zotero-item-title">
	<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
	<a href="<%- utils.sanitizeURL(obj.item[constants.VIEW_ONLINE_URL]) %>" rel="nofollow">
		<%= obj.item.citation %>
	</a>
	<% } else { %>
		<%= obj.item.citation %>
	<% } %>
</h3>