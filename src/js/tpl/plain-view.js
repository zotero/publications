import template from 'lodash/template';

export default template`
<div class="zotero-publications">
	<%= obj.renderer.renderItems(obj.items) %>
	<%= obj.renderer.renderBranding() %>
</div>`;
