<% const constants = require('../../constants.js'); %>
<li class="zotero-item zotero-<%- obj.data.itemType %>" data-item="<%- obj.item.key %>" id="item-<%- obj.item.key %>" role="listitem">
	<a href="#" class="zotero-line" aria-hidden="true" role="presentation" tabindex="-1"></a>

	<!-- Citation -->
	<% if (obj.renderer.config.useCitationStyle) { %>
		<%= obj.renderer.renderItemCitation(obj.item) %>
	<!-- Templated -->
	<% } else { %>
		<%= obj.renderer.renderItemTemplated(obj.item) %>
	<% } %>

	<div class="zotero-item-actions">
		<a href="" data-trigger="details" aria-controls="item-<%- obj.item.key %>-details">
			Details
		</a>
		<% if(obj.renderer.zotero.config.zorgIntegration) { %>
			<a href="" data-trigger="add-to-library" aria-controls="item-<%- obj.item.key %>-details">
				Add to Library
			</a>
		<% } %>
	</div>

	<!-- Details -->
	<section class="zotero-details zotero-collapsed zotero-collapsable" aria-hidden="true" aria-expanded="false" id="item-<%- obj.item.key %>-details">
		<div class="zotero-details-inner">
			<h4>Details</h4>
			<div class="zotero-meta">
				<% if(obj.item.data['itemType']) { %>
					<div class="zotero-meta-item">
						<div class="zotero-meta-label"><%- obj.renderer.fieldMap['itemType'] %></div>
						<div class="zotero-meta-value"><%- obj.renderer.typeMap[obj.item.data['itemType']] %></div>
					</div>
				<% } %>

				<% if(obj.item.data[constants.AUTHORS_SYMBOL]) { %>
					<% for(var i=0, keys=Object.keys(obj.item.data[constants.AUTHORS_SYMBOL]); i < keys.length; i++) { %>
						<div class="zotero-meta-item">
							<div class="zotero-meta-label"><%- keys[i] %></div>
							<div class="zotero-meta-value"><%- obj.item.data[constants.AUTHORS_SYMBOL][keys[i]].join(' & ') %></div>
						</div>
					<% } %>
				<% } %>
				<% for(var i=0, keys=Object.keys(obj.data); i < keys.length; i++) { %>
					<% if(obj.renderer.hiddenFields.indexOf(keys[i]) === -1) { %>
						<% if(obj.data[keys[i]]) { %>
							<% if(keys[i] !== 'itemType') { %>
								<div class="zotero-meta-item">
									<div class="zotero-meta-label"><%- obj.renderer.fieldMap[keys[i]] %></div>
									<div class="zotero-meta-value">
										<% if(keys[i] === 'DOI') { %>
											<a href="https://doi.org/<%- obj.data[keys[i]] %>" rel="nofollow">
												<%- obj.data[keys[i]] %>
											</a>
										<% } else if(keys[i] === 'url') { %>
											<a href="<%- obj.data[keys[i]] %>" rel="nofollow">
												<%- obj.data[keys[i]] %>
											</a>
										<% } else { %>
											<%- obj.data[keys[i]] %>
										<% } %>
									</div>
								</div>
							<% } %>
						<% } %>
					<% } %>
				<% } %>
			</div>
			<% if (obj.data.abstractNote && obj.data.abstractNote.length) { %>
				<h4>Abstract</h4>
				<div class="zotero-abstract">
					<%= obj.data[constants.ABSTRACT_NOTE_PROCESSED] %>
				</div>
			<% } %>

			<% if (obj.item[constants.CHILD_NOTES] && obj.item[constants.CHILD_NOTES].length) { %>
				<h4>Notes</h4>
				<ul class="zotero-notes">
					<% for(var childItem of obj.item[constants.CHILD_NOTES]) { %>
						<li>
							<%= childItem.data.note %>
						</li>
					<% } %>
				</ul>
			<% } %>

			<% if (obj.item[constants.CHILD_ATTACHMENTS] && obj.item[constants.CHILD_ATTACHMENTS].length) { %>
				<h4>Attachments</h4>
				<ul class="zotero-attachments">
					<% for(var childItem of obj.item[constants.CHILD_ATTACHMENTS]) { %>
						<% if(childItem.url || (childItem.links && childItem.links.enclosure && childItem.links.enclosure.href)) { %>
						<li>
							<a href="<%- childItem.url %>" rel="nofollow">
								<span class="zotero-icon zotero-icon-paperclip" role="presentation" aria-hidden="true"></span><!--
								--><%- childItem.title %>
							</a>
						</li>
						<% }%>
					<% } %>
				</ul>
			<% } %>
			<% if(obj.renderer.zotero.userId) { %>
				<!-- Cite & export -->
				<div class="zotero-toolbar">
					<ul class="zotero-list-inline" role="tablist">
						<li class="zotero-tab" >
							<a href="" data-trigger="cite" role="tab" aria-selected="false" aria-controls="item-<%- obj.item.key %>-cite">Cite</a>
						</li>
						<li class="zotero-tab">
							<a href="" data-trigger="export" role="tab" aria-selected="false" aria-controls="item-<%- obj.item.key %>-export">Export</a>
						</li>
					</ul>
				</div>

				<div class="zotero-tab-content">
					<!-- Cite -->
					<div role="tabpanel" class="zotero-cite-container zotero-tabpanel" aria-expanded="false" id="item-<%- obj.item.key %>-cite">
						<div class="zotero-container-inner">
							<select class="zotero-form-control" data-trigger="cite-style-selection">
								<% for(var citationStyle in obj.renderer.zotero.config.citeStyleOptions) { %>
									<option value="<%= citationStyle %>" <% if(citationStyle === obj.renderer.config.citeStyleOptionDefault) { %> selected <% } %>>
										<%= obj.renderer.zotero.config.citeStyleOptions[citationStyle] %>
									</option>
								<% } %>
							</select>
							<p class="zotero-citation" id="item-<%- obj.item.key %>-citation"></p>
							<% if(!/iPhone|iPad/i.test(navigator.userAgent)) { %>
								<button class="zotero-btn zotero-citation-copy tooltipped tooltipped-e" data-clipboard-target="#item-<%- obj.item.key %>-citation" aria-label="Copy to clipboard">Copy</button>
							<% } %>
						</div>
					</div>

					<!-- Export -->
					<div role="tabpanel" class="zotero-export-container zotero-tabpanel" aria-expanded="false" aria-hidden="true" id="item-<%- obj.item.key %>-export">
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
	</section>
</li>