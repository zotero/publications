<div class="modal zotero-modal" id="detailsModal" tabindex="-1" role="dialog" aria-labelledby="detailsModalTitle">
	<div class="modal-dialog modal-lg" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h4 class="modal-title" id="detailsModalTitle">
						<%- obj.data.title %>
					</h4>
			</div>
			<div class="modal-body zotero-details">
				<div class="zotero-details-inner">
					<div class="zotero-meta">
						<% if(obj.item.data[Symbol.for('authors')]) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Authors</div>
								<div class="zotero-meta-value"><%- obj.item.data[Symbol.for('authors')] %></div>
							</div>
						<% } %>
						<% if(obj.item.data.series) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Series</div>
								<div class="zotero-meta-value"><%- obj.item.data.series %></div>
							</div>
						<% } %>
						<% if(obj.item.data.seriesNumber) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Series Number</div>
								<div class="zotero-meta-value"><%- obj.item.data.seriesNumber %></div>
							</div>
						<% } %>
						<% if(obj.item.data.volume) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Volumne</div>
								<div class="zotero-meta-value"><%- obj.item.data.volume %></div>
							</div>
						<% } %>
						<% if(obj.item.data.numberOfVolumes) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Number of Volumnes</div>
								<div class="zotero-meta-value"><%- obj.item.data.numberOfVolumes %></div>
							</div>
						<% } %>
						<% if(obj.item.data.edition) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Edition</div>
								<div class="zotero-meta-value"><%- obj.item.data.edition %></div>
							</div>
						<% } %>
						<% if(obj.item.data.place) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Place</div>
								<div class="zotero-meta-value"><%- obj.item.data.place %></div>
							</div>
						<% } %>
						<% if(obj.item.data.publisher) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Publisher</div>
								<div class="zotero-meta-value"><%- obj.item.data.publisher %></div>
							</div>
						<% } %>
						<% if(obj.item.data.date) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Date</div>
								<div class="zotero-meta-value"><%- obj.item.data.date %></div>
							</div>
						<% } %>
						<% if(obj.item.data.numPages) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Number of Pages</div>
								<div class="zotero-meta-value"><%- obj.item.data.numPages %></div>
							</div>
						<% } %>
						<% if(obj.item.data.language) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Language</div>
								<div class="zotero-meta-value"><%- obj.item.data.language %></div>
							</div>
						<% } %>
						<% if(obj.item.data.ISBN) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">ISBN</div>
								<div class="zotero-meta-value"><%- obj.item.data.ISBN %></div>
							</div>
						<% } %>
						<% if(obj.item.data.shortTitle) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Short Title</div>
								<div class="zotero-meta-value"><%- obj.item.data.shortTitle %></div>
							</div>
						<% } %>
						<% if(obj.item.data.url) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">URL</div>
								<div class="zotero-meta-value"><%- obj.item.data.url %></div>
							</div>
						<% } %>
						<% if(obj.item.data.accessDate) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Access Date</div>
								<div class="zotero-meta-value"><%- obj.item.data.accessDate %></div>
							</div>
						<% } %>
						<% if(obj.item.data.archive) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Archive</div>
								<div class="zotero-meta-value"><%- obj.item.data.archive %></div>
							</div>
						<% } %>
						<% if(obj.item.data.archiveLocation) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Archive Location</div>
								<div class="zotero-meta-value"><%- obj.item.data.archiveLocation %></div>
							</div>
						<% } %>
						<% if(obj.item.data.libraryCatalog) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Library Catalog</div>
								<div class="zotero-meta-value"><%- obj.item.data.libraryCatalog %></div>
							</div>
						<% } %>
						<% if(obj.item.data.callNumber) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Call Number</div>
								<div class="zotero-meta-value"><%- obj.item.data.callNumber %></div>
							</div>
						<% } %>
						<% if(obj.item.data.rights) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Rights</div>
								<div class="zotero-meta-value"><%- obj.item.data.rights %></div>
							</div>
						<% } %>
						<% if(obj.item.data.extra) { %>
							<div class="zotero-meta-item">
								<div class="zotero-meta-label">Extra</div>
								<div class="zotero-meta-value"><%- obj.item.data.extra %></div>
							</div>
						<% } %>
					</div>
					<% if (obj.data.abstractNote && obj.data.abstractNote.length) { %>
						<h4>Abstract</h4>
						<div class="zotero-abstract">
							<%= obj.data[Symbol.for('abstractNoteProcessed')] %>
						</div>
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
								<% if(childItem.url || (childItem.links && childItem.links.enclosure && childItem.links.enclosure.href)) { %>
								<li>
									<a href="<%- (childItem.url || (childItem.links && childItem.links.enclosure && childItem.links.enclosure.href)) %>">
										<span class="zotero-icon zotero-icon-paperclip" role="presentation" aria-hidden="true"></span><!--
										--><%- childItem.data.title %>
									</a>
								</li>
								<% }%>
							<% } %>
						</ul>
					<% } %>
					<% if(obj.renderer.zotero.userId) { %>
						<div class="zotero-tab-content" aria-expanded="false">
							<!-- Cite -->
							<div role="tabpanel" class="zotero-cite-container zotero-tabpanel" id="<%- obj.item.key %>-cite">
								<div class="zotero-container-inner">
									<select class="zotero-form-control" data-trigger="cite-style-selection">
										<% for(var citationStyle in obj.renderer.zotero.config.citeStyleOptions) { %>
											<option value="<%= citationStyle %>" <% if(citationStyle === obj.renderer.config.citeStyleOptionDefault) { %> selected <% } %>>
												<%= obj.renderer.zotero.config.citeStyleOptions[citationStyle] %>
											</option>
										<% } %>
									</select>
									<p class="zotero-citation" id="<%- obj.item.key %>-citation"></p>
									<% if(!/iPhone|iPad/i.test(navigator.userAgent)) { %>
										<button class="zotero-citation-copy tooltipped tooltipped-e" data-clipboard-target="#<%- obj.item.key %>-citation" aria-label="Copy to clipboard">Copy</button>
									<% } %>
								</div>
							</div>

							<!-- Export -->
							<div role="tabpanel" class="zotero-export-container zotero-tabpanel" aria-expanded="false" aria-hidden="true" id="<%- obj.item.key %>-export">
								<div class="zotero-container-inner">
									<select class="zotero-form-control" data-trigger="export-format-selection">
										<% for(var exportFormat in obj.renderer.zotero.config.exportFormats) { %>
											<option value="<%= exportFormat %>">
												<%= obj.renderer.zotero.config.exportFormats[exportFormat].name %>
											</option>
										<% } %>
									</select>
									<p class="zotero-export"></p>
								</div>
							</div>
						</div>
					<% } %>
				</div>
			</div>
		</div>
	</div>
</div>