import template from 'lodash/template';

export default template`
<a href="data:<%- obj.contentType %>;base64,<%- obj.content %>" download="<%- obj.filename %>">
	Download
</a>`;
