<h2 class="zotero-heading">
	<%- data.title %>
</h2>
<% if (data.abstractNote && data.abstractNote.length) { %>
	<h3>
		Abstract
	</h3>
	<p>
		<%- data.abstractNote %>
	</p>
<% } %>