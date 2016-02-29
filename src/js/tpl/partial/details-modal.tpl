<div class="modal fade" id="detailsModal" tabindex="-1" role="dialog" aria-labelledby="detailsModalTitle">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
					<h4 class="modal-title" id="detailsModalTitle">
						<%- obj.data.title %>
					</h4>
			</div>
			<div class="modal-body zotero-details">
				<div class="zotero-details-inner">
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
							hello world
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
			<div class="modal-footer">
				<span role="tablist">
					<button data-trigger="cite" role="tab" type="button" class="btn btn-default" aria-controls="<%- obj.item.key %>-cite">Cite</button>
					<button data-trigger="export" role="tab" type="button" class="btn btn-default" aria-controls="<%- obj.item.key %>-export">Export</button>
				</span>
				<button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
			</div>
		</div>
	</div>
</div>