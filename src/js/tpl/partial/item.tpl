<li class="zotero-item zotero-<%- obj.data.itemType %>" data-item="<%- obj.item.key %>" id="<%- obj.item.key %>">

	<!-- Reference -->
	<% if (obj.renderer.config.alwaysUseCitationStyle) { %>
		<div class="zotero-item-title">
			<%= obj.item.citation %>
		</div>

	<!-- Templated -->
	<% } else { %>
		<% if (obj.data.itemType == 'book') { %>
			<div class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				By <%- obj.data[Symbol.for('authors')] %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (obj.data.itemType == 'journalArticle') { %>
			<div class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- obj.data.journalAbbreviation %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (obj.data.itemType == 'newspaperArticle' || obj.data.itemType == 'magazineArticle') { %>
			<div class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- obj.data.publicationTitle %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else if (obj.data.itemType == 'blogPost') { %>
			<div class="zotero-item-title">
				<a href="#"><%- obj.data.title %></a>
			</div>
			<div class="zotoero-item-subline">
				<%- obj.data.blogTitle %>
				<% if (obj.data[Symbol.for('formattedDate')]) { %>
				(<%- obj.data[Symbol.for('formattedDate')] %>)
				<% } %>
			</div>

		<% } else { %>
			<div class="zotero-item-title">
				<a href="#"><%= obj.item.citation %></a>
			</div>
		<% } %>
	<% } %>

	<!-- Details toggle -->
	<div>
		<a href="#<%- obj.item.key %>" data-trigger="details">
			Details
		</a>
	</div>

	<!-- Details -->
	<div class="zotero-details">
		<div class="zotero-details-inner">
			<% if (!obj.renderer.config.alwaysUseCitationStyle) { %>
				<div class="zotero-reference">
					<%= obj.item.citation %>
				</div>
			<% } %>

			<% if (obj.data.abstractNote && obj.data.abstractNote.length) { %>
				<h3>
					Abstract
				</h3>
				<p class="zotero-abstract">
					<%- obj.data.abstractNote %>
				</p>
			<% } %>

			<% if (obj.item[Symbol.for('childNotes')] && obj.item[Symbol.for('childNotes')].length) { %>
				<h3>Notes</h3>
				<ul class="zotero-notes">
					<% for(var childItem of obj.item[Symbol.for('childNotes')]) { %>
						<li>
							<%= childItem.data.note %>
						</li>
					<% } %>
				</ul>
			<% } %>

			<% if (obj.item[Symbol.for('childAttachments')] && obj.item[Symbol.for('childAttachments')].length) { %>
				<h3>Attachments</h3>
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
						<%= obj.item.citation %>
					</textarea>
				</div>
			<% } %>
		</div>
	</div>
</li>