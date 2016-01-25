<li class="zotero-item zotero-<%- data.itemType %>" data-item="<%- item.key %>" id="<%- item.key %>">

	<!-- Reference -->
	<% if (renderer.config.alwaysUseCitationStyle) { %>
		<h3 class="zotero-item-title">
			<%= item.citation %>
		</h3>

	<!-- Templated -->
	<% } else { %>
		<% if (data.itemType == 'book') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</h3>
			<div class="zotoero-item-subline">
				By <%- data[Symbol.for('authors')] %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (data.itemType == 'journalArticle') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</h3>
			<div class="zotoero-item-subline">
				<%- data.journalAbbreviation %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (data.itemType == 'newspaperArticle' || data.itemType == 'magazineArticle') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</h3>
			<div class="zotoero-item-subline">
				<%- data.publicationTitle %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (data.itemType == 'blogPost') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</h3>
			<div class="zotoero-item-subline">
				<%- data.blogTitle %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else { %>
			<h3 class="zotero-item-title">
				<a href="#"><%= item.citation %></a>
			</h3>
		<% } %>
	<% } %>

	<!-- Details toggle -->
	<div>
		<a href="#<%- item.key %>" data-trigger="details">
			Details
		</a>
	</div>

	<!-- Details -->
	<div class="zotero-details">
		<div class="zotero-details-inner">
			<% if (data.abstractNote && data.abstractNote.length) { %>
				<h4>Abstract</h4>
				<p class="zotero-abstract">
					<%- data.abstractNote %>
				</p>
			<% } %>

			<% if (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) { %>
				<h4>Notes</h4>
				<ul class="zotero-notes">
					<% for(var childItem of item[Symbol.for('childNotes')]) { %>
						<li>
							<%= childItem.data.note %>
						</li>
					<% } %>
				</ul>
			<% } %>

			<% if (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length) { %>
				<h4>Attachments</h4>
				<ul class="zotero-attachments">
					<% for(var childItem of item[Symbol.for('childAttachments')]) { %>
						<li>
							<a href="#">
								<span class="zotero-icon zotero-icon-paperclip"></span><!--
								--><%- childItem.data.title %>
							</a>
						</li>
					<% } %>
				</ul>
			<% } %>

			<!-- Cite -->
			<% if(renderer.zotero.userId) { %>
				<div class="zotero-toolbar">
					<a data-trigger="cite">Cite</a>
				</div>
				<div class="zotero-cite-container">
					<select class="zotero-form-control" data-trigger="cite-style-selection">
						<option value="american-anthropological-association">
							American Anthropological Association
						</option>
						<option value="cell">
							Cell
						</option>
						<option value="chicago-author-date">
							Chicago Manual of Style 16th edition (author-date)
						</option>
						<option value="elsevier-harvard">
							Elsevier Harvard (with titles)
						</option>
						<option value="ieee">
							IEEE
						</option>
						<option value="modern-humanities-research-association-author-date">
							Modern Humanities Research Association 3rd edition (author-date)
						</option>
						<option value="modern-language-association">
							Modern Language Association 7th edition
						</option>
						<option value="nature">
							Nature
						</option>
						<option value="vancouver">
							Vancouver
						</option>
					</select>
					<p class="zotero-citation">
						<%= item.citation %>
					</p>
				</div>
			<% } %>
		</div>
	</div>
</li>