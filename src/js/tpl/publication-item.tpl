<li class="zotero-item zotero-<%- data.itemType %>">
	<%= citation %>
	<% if (data.abstractNoteShort && data.abstractNoteShort.length) { %>
    	<p class="zotero-abstract-short">
    		<%- data.abstractNoteShort %>
    		<a class="zotero-abstract-toggle" aria-controls="za-<%- key %>">...</a>
    	</p>
	<% } %>
	<% if (data.abstractNote && data.abstractNote.length) { %>
    	<p id="za-<%- key %>" class="zotero-abstract" aria-expanded="false">
    		<%- data.abstractNote %>
    		<a class="zotero-abstract-toggle">...</a>
    	</p>
	<% } %>
</li>