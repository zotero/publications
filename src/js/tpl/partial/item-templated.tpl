<div class="zotero-item-header-container">
	<% if (obj.data.itemType == 'book') { %>
			<div class="zotero-item-header">
				<h3 class="zotero-item-title">
					<% if (obj.item[Symbol.for('viewOnlineUrl')]) { %>
						<a href="<%- obj.item[Symbol.for('viewOnlineUrl')] %>" rel="nofollow"><%- obj.data.title %></a>
					<% } else { %>
						<%- obj.data.title %>
					<% } %>
				</h3>
				<div class="zotero-item-subline">
					By <%- obj.data[Symbol.for('authors')] %>
					<% if (obj.data[Symbol.for('formattedDate')]) { %>
					(<%- obj.data[Symbol.for('formattedDate')] %>)
					<% } %>
				</div>
			</div>
			<div class="zotero-item-indicator-container">
				<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
			</div>
		<% } else if (obj.data.itemType == 'journalArticle') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[Symbol.for('viewOnlineUrl')]) { %>
					<a href="<%- obj.item[Symbol.for('viewOnlineUrl')] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.journalAbbreviation %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>
		</div>
		<div class="zotero-item-indicator-container">
			<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
		</div>
	<% } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[Symbol.for('viewOnlineUrl')]) { %>
					<a href="<%- obj.item[Symbol.for('viewOnlineUrl')] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.publicationTitle %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>
		</div>
		<div class="zotero-item-indicator-container">
			<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
		</div>
	<% } else if (obj.data.itemType == 'blogPost') { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[Symbol.for('viewOnlineUrl')]) { %>
					<a href="<%- obj.item[Symbol.for('viewOnlineUrl')] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.blogTitle %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>
		</div>
		<div class="zotero-item-indicator-container">
			<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
		</div>
	<% } else { %>
		<div class="zotero-item-header">
			<h3 class="zotero-item-title">
				<% if (obj.item[Symbol.for('viewOnlineUrl')]) { %>
					<a href="<%- obj.item[Symbol.for('viewOnlineUrl')] %>" rel="nofollow"><%- obj.data.title %></a>
				<% } else { %>
					<%- obj.data.title %>
				<% } %>
			</h3>

			<% if (obj.item[Symbol.for('authors')] || obj.data[Symbol.for('formattedDate')]) { %>
				<div class="zotero-item-subline">
					<% if (obj.item[Symbol.for('authors')]) { %>
						By <%- obj.data[Symbol.for('authors')] %>
					<% } %>
						
					<% if (obj.data[Symbol.for('formattedDate')]) { %>
					(<%- obj.data[Symbol.for('formattedDate')] %>)
					<% } %>
				</div>
			<% } %>
		</div>
		<div class="zotero-item-indicator-container">
			<%= obj.renderer.renderAttachmentIndicator(obj.item) %>
		</div>
	<% } %>
</div>