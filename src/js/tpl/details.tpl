<div>
	<a data-trigger="details-exit">
		Back
	</a>
</div>
<h2 class="zotero-heading">
	<%- data.title %>
</h2>
<% if (data.abstractNote && data.abstractNote.length) { %>
	<h3>
		Abstract
	</h3>
	<p>
		<%- data.abstractNote %>
	</p>
<% } %>



<% if (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) { %>
	<h3>Notes</h3>
	<ul>
		<% for(var childItem of item[Symbol.for('childNotes')]) { %>
			<li>
				<a>
					<%= childItem.data.note %>
				</a>
			</li>
		<% } %>
	</ul>
<% } %>

<% if (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length) { %>
	<h3>Attachments</h3>
	<ul>
		<% for(var childItem of item[Symbol.for('childAttachments')]) { %>
			<li>
				<a>
					<%- childItem.data.title %>
				</a>
			</li>
		<% } %>
	</ul>
<% } %>