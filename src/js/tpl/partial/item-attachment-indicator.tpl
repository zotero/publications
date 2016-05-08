<% if (obj.item[Symbol.for('childAttachments')] && obj.item[Symbol.for('childAttachments')].length) { %>
	<% if(obj.item[Symbol.for('childAttachments')][0].url || (obj.item[Symbol.for('childAttachments')][0].links && obj.item[Symbol.for('childAttachments')][0].links.enclosure && obj.item[Symbol.for('childAttachments')][0].links.enclosure.href)) { %>
		<a href="<%- (obj.item[Symbol.for('childAttachments')][0].url || (obj.item[Symbol.for('childAttachments')][0].links && obj.item[Symbol.for('childAttachments')][0].links.enclosure && obj.item[Symbol.for('childAttachments')][0].links.enclosure.href)) %>">
			<span class="zotero-icon zotero-icon-download" role="presentation" aria-hidden="true"></span>
		</a>
	<% }%>
<% }%>