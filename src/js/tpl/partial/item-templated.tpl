<% const constants = require('../../constants.js'); %>
<div class="zotero-item-header-container">
	<% if (obj.data.itemType == 'book') { %>
			<div class="zotero-item-header">
				<h3 class="zotero-item-title">
					<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
						<a href="<%- obj.item[constants.VIEW_ONLINE_URL] %>" rel="nofollow"><%- obj.data.title %></a>
					<% } else { %>
						<%- obj.data.title %>
					<% } %>
				</h3>
				<div class="zotero-item-subline">
					<% if (obj.data[constants.AUTHORS_SYMBOL] && obj.data[constants.AUTHORS_SYMBOL]['Author']) { %>
						By <%- obj.data[constants.AUTHORS_SYMBOL]['Author'].join(' & ') %>
					<% } %>
					<% if (obj.data[constants.FORMATTED_DATE_SYMBOL]) { %>
						(<%- obj.data[constants.FORMATTED_DATE_SYMBOL] %>)
					<% } %>
				</div>
			</div>
		<% } else if (obj.data.itemType == 'journalArticle') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.item[constants.VIEW_ONLINE_URL] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.journalAbbreviation %>
				<% if (obj.data[constants.FORMATTED_DATE_SYMBOL]) { %>
				(<%- obj.data[constants.FORMATTED_DATE_SYMBOL] %>)
				<% } %>
			</div>
		</div>
	<% } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.item[constants.VIEW_ONLINE_URL] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.publicationTitle %>
				<% if (obj.data[constants.FORMATTED_DATE_SYMBOL]) { %>
				(<%- obj.data[constants.FORMATTED_DATE_SYMBOL] %>)
				<% } %>
			</div>
		</div>
	<% } else if (obj.data.itemType == 'blogPost') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.item[constants.VIEW_ONLINE_URL] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.blogTitle %>
				<% if (obj.data[constants.FORMATTED_DATE_SYMBOL]) { %>
				(<%- obj.data[constants.FORMATTED_DATE_SYMBOL] %>)
				<% } %>
			</div>
		</div>
	<% } else { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.item[constants.VIEW_ONLINE_URL] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>

			<% if (obj.data[constants.AUTHORS_SYMBOL] || obj.data[constants.FORMATTED_DATE_SYMBOL]) { %>
				<div class="zotero-item-subline">
					<% if (obj.data[constants.AUTHORS_SYMBOL] && obj.data[constants.AUTHORS_SYMBOL]['Author']) { %>
						By <%- obj.data[constants.AUTHORS_SYMBOL]['Author'].join(' & ') %>
					<% } %>
						
					<% if (obj.data[constants.FORMATTED_DATE_SYMBOL]) { %>
					(<%- obj.data[constants.FORMATTED_DATE_SYMBOL] %>)
					<% } %>
				</div>
			<% } %>
		</div>
	<% } %>
</div>