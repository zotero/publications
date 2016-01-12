<li class="zotero-item zotero-<%- data.itemType %>" data-item="<%- item.key %>">
    <% if (renderer.config.alwaysUseCitationStyle) { %>
        <h3 class="zotero-item-title">
            <%= item.citation %>
        </h3>
        <div>
            <% if ((data.abstractNote && data.abstractNote.length) || (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) || (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length)) { %>
                <a data-trigger="details">
                    Details
                </a>
            <% } %>
        </div>
    <% } else { %>
        <% if (data.itemType == 'book') { %>
            <a class="zotero-item-title" data-trigger="details" data-item="<%- item.key %>">
                <%- data.title %>
            </a>
            <p>
                By <%- data[Symbol.for('authors')] %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else if (data.itemType == 'journalArticle') { %>
            <a class="zotero-item-title" data-trigger="details" data-item="<%- item.key %>">
                <%- data.title %>
            </a>
            <p>
                <%- data.journalAbbreviation %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else if (data.itemType == 'newspaperArticle' || data.itemType == 'magazineArticle') { %>
            <a class="zotero-item-title" data-trigger="details" data-item="<%- item.key %>">
                <%- data.title %>
            </a>
            <p>
                <%- data.publicationTitle %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else if (data.itemType == 'blogPost') { %>
            <a class="zotero-item-title" data-trigger="details" data-item="<%- item.key %>">
                <%- data.title %>
            </a>
            <p>
                <%- data.blogTitle %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else { %>
            <a class="zotero-item-title" data-trigger="details" data-item="<%- item.key %>">
                <%= item.citation %>
            </a>
        <% } %>
    <% } %>
   <% if ((data.abstractNote && data.abstractNote.length) || (item[Symbol.for('childNotes')] && item[Symbol.for('childNotes')].length) || (item[Symbol.for('childAttachments')] && item[Symbol.for('childAttachments')].length)) { %>
        <div class="zotero-details">
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
        </div>
    <% } %>
</li>