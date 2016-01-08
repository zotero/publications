<li class="zotero-item zotero-<%- data.itemType %>">
    <% if (renderer.config.alwaysUseCitationStyle) { %>
        <a class="zotero-item-title">
            <%= item.citation %>
        </a>
    <% } else { %>
        <% if (data.itemType == 'book') { %>
            <a class="zotero-item-title">
                <%- data.title %>
            </a>
            <p>
                By <%- data[Symbol.for('authors')] %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else if (data.itemType == 'journalArticle') { %>
            <a class="zotero-item-title">
                <%- data.title %>
            </a>
            <p>
                <%- data.journalAbbreviation %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else if (data.itemType == 'newspaperArticle' || data.itemType == 'magazineArticle') { %>
            <a class="zotero-item-title">
                <%- data.title %>
            </a>
            <p>
                <%- data.publicationTitle %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else if (data.itemType == 'blogPost') { %>
            <a class="zotero-item-title">
                <%- data.title %>
            </a>
            <p>
                <%- data.blogTitle %> (<%- data[Symbol.for('year')] %>)
            </p>
        <% } else { %>
            <a class="zotero-item-title">
                <%= item.citation %>
            </a>
        <% } %>
    <% } %>
</li>