<li class="zotero-item zotero-<%- data.itemType %>" data-item="<%- item.key %>" id="<%- item.key %>">

	<!-- Reference -->
	<% if (renderer.config.alwaysUseCitationStyle) { %>
		<div class="zotero-item-title">
			<%= item.citation %>
		</div>

	<!-- Templated -->
	<% } else { %>
		<% if (data.itemType == 'book') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				By <%- data[Symbol.for('authors')] %> (<%- data[Symbol.for('year')] %>)
			</div>

		<% } else if (data.itemType == 'journalArticle') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- data.journalAbbreviation %> (<%- data[Symbol.for('year')] %>)
			</div>

		<% } else if (data.itemType == 'newspaperArticle' || data.itemType == 'magazineArticle') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- data.publicationTitle %> (<%- data[Symbol.for('year')] %>)
			</div>

		<% } else if (data.itemType == 'blogPost') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- data.blogTitle %> (<%- data[Symbol.for('year')] %>)
			</div>

		<% } else { %>
			<div class="zotero-item-title">
				<a href="#"><%= item.citation %></a>
			</div>
		<% } %>
	<% } %>

	<!-- Details toggle -->
	<% if ((data.abstractNote && data.abstractNote.length) || (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) || (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length)) { %>
		<div>
			<a href="#<%- item.key %>" data-trigger="details">
				Details
			</a>
		</div>
	<% } %>

	<!-- Details -->
	<% if ((data.abstractNote && data.abstractNote.length) || (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) || (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length)) { %>
		<div class="zotero-details">
			<div class="zotero-details-inner">
				<% if (!renderer.config.alwaysUseCitationStyle) { %>
					<div class="zotero-reference">
						<%= item.citation %>
					</div>
				<% } %>

				<% if (data.abstractNote && data.abstractNote.length) { %>
					<h3>
						Abstract
					</h3>
					<p class="zotero-abstract">
						<%- data.abstractNote %>
					</p>
				<% } %>

				<% if (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) { %>
					<h3>Notes</h3>
					<ul class="zotero-notes">
						<% for(var childItem of item[Symbol.for('childNotes')]) { %>
							<li>
								<%= childItem.data.note %>
							</li>
						<% } %>
					</ul>
				<% } %>

				<% if (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length) { %>
					<h3>Attachments</h3>
					<ul class="zotero-attachments">
						<% for(var childItem of item[Symbol.for('childAttachments')]) { %>
							<li>
								<a>
									<%- childItem.data.title %>
								</a>
							</li>
						<% } %>
					</ul>
				<% } %>
			</div>
		</div>
	<% } %>
</li>