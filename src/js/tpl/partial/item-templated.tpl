<% if (obj.data.itemType == 'book') { %>
	<h3 class="zotero-item-title">
		<a href="" data-trigger="details"><%- obj.data.title %></a>
	</h3>
	<div class="zotero-item-subline">
		By <%- obj.data[Symbol.for('authors')] %>
		<% if (obj.data[Symbol.for('formattedDate')]) { %>
		(<%- obj.data[Symbol.for('formattedDate')] %>)
		<% } %>
	</div>
<% } else if (obj.data.itemType == 'journalArticle') { %>
	<h3 class="zotero-item-title">
		<a href="" data-trigger="details"><%- obj.data.title %></a>
	</h3>
	<div class="zotero-item-subline">
		<%- obj.data.journalAbbreviation %>
		<% if (obj.data[Symbol.for('formattedDate')]) { %>
		(<%- obj.data[Symbol.for('formattedDate')] %>)
		<% } %>
	</div>
<% } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') { %>
	<h3 class="zotero-item-title">
		<a href="" data-trigger="details"><%- obj.data.title %></a>
	</h3>
	<div class="zotero-item-subline">
		<%- obj.data.publicationTitle %>
		<% if (obj.data[Symbol.for('formattedDate')]) { %>
		(<%- obj.data[Symbol.for('formattedDate')] %>)
		<% } %>
	</div>
<% } else if (obj.data.itemType == 'blogPost') { %>
	<h3 class="zotero-item-title">
		<a href="" data-trigger="details"><%- obj.data.title %></a>
	</h3>
	<div class="zotero-item-subline">
		<%- obj.data.blogTitle %>
		<% if (obj.data[Symbol.for('formattedDate')]) { %>
		(<%- obj.data[Symbol.for('formattedDate')] %>)
		<% } %>
	</div>
<% } else { %>
	<%= obj.renderer.renderItemCitation(obj.item) %>
<% } %>