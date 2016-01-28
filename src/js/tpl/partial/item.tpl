<li class="zotero-item zotero-<%- obj.data.itemType %>" data-item="<%- obj.item.key %>" id="<%- obj.item.key %>">

	<!-- Reference -->
	<% if (obj.renderer.config.alwaysUseCitationStyle) { %>
		<h3 class="zotero-item-title">
			<%= obj.item.citation %>
		</h3>

	<!-- Templated -->
	<% } else { %>
		<% if (obj.data.itemType == 'book') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</h3>
			<div class="zotero-item-subline">
				By <%- obj.data[Symbol.for('authors')] %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (obj.data.itemType == 'journalArticle') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.journalAbbreviation %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.publicationTitle %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (obj.data.itemType == 'blogPost') { %>
			<h3 class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</h3>
			<div class="zotero-item-subline">
				<%- obj.data.blogTitle %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else { %>
			<h3 class="zotero-item-title">
				<a href="#"><%= obj.item.citation %></a>
			</h3>
		<% } %>
	<% } %>

	<!-- Details toggle -->
	<div>
		<a href="#<%- obj.item.key %>" data-trigger="details">
			Details
		</a>
	</div>

	<!-- Details -->
	<div class="zotero-details zotero-collapsed zotero-collapsable">
		<div class="zotero-details-inner">
			<% if (obj.data.abstractNote && obj.data.abstractNote.length) { %>
				<h4>Abstract</h4>
				<p class="zotero-abstract">
					<%- obj.data.abstractNote %>
				</p>
			<% } %>

			<% if (obj.item[Symbol.for('childNotes')] && obj.item[Symbol.for('childNotes')].length) { %>
				<h4>Notes</h4>
				<ul class="zotero-notes">
					<% for(var childItem of obj.item[Symbol.for('childNotes')]) { %>
						<li>
							<%= childItem.data.note %>
						</li>
					<% } %>
				</ul>
			<% } %>

			<% if (obj.item[Symbol.for('childAttachments')] && obj.item[Symbol.for('childAttachments')].length) { %>
				<h4>Attachments</h4>
				<ul class="zotero-attachments">
					<% for(var childItem of obj.item[Symbol.for('childAttachments')]) { %>
						<li>
							<a href="#">
								<span class="zotero-icon zotero-icon-paperclip"></span><!--
								--><%- childItem.data.title %>
							</a>
						</li>
					<% } %>
				</ul>
			<% } %>
			<% if(obj.renderer.zotero.userId) { %>
			<!-- Cite -->
				<div class="zotero-toolbar">
					<ul class="zotero-list-inline">
						<li><a data-trigger="cite">Cite</a></li><!--
						--><li><a>Copy as BibTeX</a></li>
					</ul>
				</div>
				<div class="zotero-cite-container zotero-collapsed zotero-collapsable">
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
						<%= obj.item.citation %>
					</p>
				</div>
			<% } %>
		</div>
	</div>
</li>