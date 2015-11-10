<li class="zotero-item zotero-<%- data.itemType %>">
	<%= bib %>
	<% if (data.abstractNote && data.abstractNote.length) { %>
    	<p class="zotero-abstract">
    		<%- data.abstractNote %>
    	</p>
	<% } %>
</li>