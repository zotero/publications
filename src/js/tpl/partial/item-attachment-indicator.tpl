<% const constants = require('../../constants.js'); %>
<% if (obj.item[constants.CHILD_ATTACHMENTS] && obj.item[constants.CHILD_ATTACHMENTS].length) { %>
	<a href="<%- obj.item[constants.CHILD_ATTACHMENTS][0].url %>" class="zotero-attachment-indicator" rel="nofollow">
		<span class="zotero-icon zotero-icon-<%- obj.item[constants.CHILD_ATTACHMENTS][0].type === 'application/pdf' ? 'pdf' : 'download' %>" role="presentation" aria-hidden="true"></span>
	</a>
<% }%>