import template from 'lodash/template';

export default template`
<div class="zotero-publications">
	<%= obj.renderer.renderGroups(obj.groups) %>
	<%= obj.renderer.renderBranding() %>
</div>`;
