<% if (obj.item[Symbol.for('childAttachments')] && obj.item[Symbol.for('childAttachments')].length) { %>
	<a href="<%- obj.item[Symbol.for('childAttachments')][0].url %>" class="zotero-attachment-indicator">
		<span class="zotero-icon zotero-icon-<%- obj.item[Symbol.for('childAttachments')][0].type === 'application/pdf' ? 'pdf' : 'download' %>" role="presentation" aria-hidden="true"></span>
	</a>
<% }%>