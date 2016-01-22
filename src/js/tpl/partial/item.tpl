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
				By <%- data[Symbol.for('authors')] %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (data.itemType == 'journalArticle') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- data.journalAbbreviation %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (data.itemType == 'newspaperArticle' || data.itemType == 'magazineArticle') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- data.publicationTitle %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (data.itemType == 'blogPost') { %>
			<div class="zotero-item-title">
				<a href="#"><%- data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- data.blogTitle %>
				<% if (data[Symbol.for('formattedDate')]) { %>
				(<%- data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else { %>
			<div class="zotero-item-title">
				<a href="#"><%= item.citation %></a>
			</div>
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
							<a href="#">
								<span class="zotero-icon zotero-icon-paperclip"></span><!--
								--><%- childItem.data.title %>
							</a>
						</li>
					<% } %>
				</ul>
			<% } %>
			<% if(renderer.zotero.userId) { %>
				<div>
					<button class="zotero-cite-button" data-trigger="cite">
						Cite
					</button>
				</div>
				<div class="zotero-cite-container">
					<select data-trigger="cite-style-selection">
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
					<textarea class="zotero-citation" cols="30" rows="5">
						<%= item.citation %>
					</textarea>
				</div>
			<% } %>
		</div>
	</div>
</li>