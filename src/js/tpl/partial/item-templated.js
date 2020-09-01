import template from 'lodash/template';

export default template`
<div class="zotero-item-header-container">
	<% if (obj.data.itemType == 'book') { %>
			<div class="zotero-item-header">
				<h3 class="zotero-item-title">
					<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
						<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow"><%= obj.utils.escapeFormattedValue(obj.data.title) %></a> <% if(obj.item[obj.constants.HAS_PDF]) { %> [PDF]<% } %>
					<% } else { %>
						<%= obj.utils.escapeFormattedValue(obj.data.title) %>
					<% } %>
				</h3>
				<div class="zotero-item-subline">
					<% if (obj.data.publisher) { %>
						<%- obj.data.publisher %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
					<% } %>
					<% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
						<%- obj.data[obj.constants.FORMATTED_DATE_SYMBOL] %>
					<% } %>
				</div>
			</div>
		<% } else if (obj.data.itemType == 'thesis') { %>
			<div class="zotero-item-header">
				<h3 class="zotero-item-title">
					<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
						<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow"><%= obj.utils.escapeFormattedValue(obj.data.title) %></a> <% if(obj.item[obj.constants.HAS_PDF]) { %> [PDF]<% } %>
					<% } else { %>
						<%= obj.utils.escapeFormattedValue(obj.data.title) %>
					<% } %>
				</h3>
				<div class="zotero-item-subline">
					<% if (obj.data.university) { %>
						<%- obj.data.university %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
					<% } %>
					<% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
						<%- obj.data[obj.constants.FORMATTED_DATE_SYMBOL] %>
					<% } %>
				</div>
			</div>
		<% } else if (obj.data.itemType == 'journalArticle') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow"><%= obj.utils.escapeFormattedValue(obj.data.title) %></a> <% if(obj.item[obj.constants.HAS_PDF]) { %> [PDF]<% } %>
				<% } else { %>
					<%= obj.utils.escapeFormattedValue(obj.data.title) %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<% if (obj.data.publicationTitle) { %>
					<%- obj.data.publicationTitle %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
				<% } else if (obj.data.journalAbbreviation) { %>
					<%- obj.data.journalAbbreviation %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
				<% } %>
				<% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
					<%- obj.data[obj.constants.FORMATTED_DATE_SYMBOL] %>
				<% } %>
			</div>
		</div>
	<% } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow"><%= obj.utils.escapeFormattedValue(obj.data.title) %></a> <% if(obj.item[obj.constants.HAS_PDF]) { %> [PDF]<% } %>
				<% } else { %>
					<%= obj.utils.escapeFormattedValue(obj.data.title) %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<% if (obj.data.publicationTitle) { %>
					<%- obj.data.publicationTitle %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
				<% } %>
				<% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
					<%- obj.data[obj.constants.FORMATTED_DATE_SYMBOL] %>
				<% } %>
			</div>
		</div>
	<% } else if (obj.data.itemType == 'blogPost') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow"><%= obj.utils.escapeFormattedValue(obj.data.title) %></a> <% if(obj.item[obj.constants.HAS_PDF]) { %> [PDF]<% } %>
				<% } else { %>
					<%= obj.utils.escapeFormattedValue(obj.data.title) %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<% if (obj.data.blogTitle) { %>
					<%- obj.data.blogTitle %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
				<% } %>
				<% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
					<%- obj.data[obj.constants.FORMATTED_DATE_SYMBOL] %>
				<% } %>
			</div>
		</div>
	<% } else { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[obj.constants.VIEW_ONLINE_URL]) { %>
					<a href="<%- obj.utils.sanitizeURL(obj.item[obj.constants.VIEW_ONLINE_URL]) %>" rel="nofollow"><%= obj.utils.escapeFormattedValue(obj.data.title) %></a> <% if(obj.item[obj.constants.HAS_PDF]) { %> [PDF]<% } %>
				<% } else { %>
					<%= obj.utils.escapeFormattedValue(obj.data.title) %>
				<% } %>
			</h3>

			<% if (obj.data[obj.constants.AUTHORS_SYMBOL] || obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
				<div class="zotero-item-subline">
					<% if (obj.data[obj.constants.AUTHORS_SYMBOL] && obj.data[obj.constants.AUTHORS_SYMBOL]['Author']) { %>
						By <%- obj.data[obj.constants.AUTHORS_SYMBOL]['Author'].join(' & ') %><% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>, <% } %>
					<% } %>

					<% if (obj.data[obj.constants.FORMATTED_DATE_SYMBOL]) { %>
						<%- obj.data[obj.constants.FORMATTED_DATE_SYMBOL] %>
					<% } %>
				</div>
			<% } %>
		</div>
	<% } %>
</div>`;
