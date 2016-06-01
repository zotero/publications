<h3 class="zotero-item-title">
	<% if (obj.item[Symbol.for('viewOnlineUrl')]) { %>
	<a href="<%- obj.item[Symbol.for('viewOnlineUrl')] %>" rel="nofollow">
		<%= obj.item.citation %>
	</a>
	<% } else { %>
		<%= obj.item.citation %>
	<% } %>
	<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
</h3>