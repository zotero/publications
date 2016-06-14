# Zotero Publications

[![Build Status](https://travis-ci.org/zotero/publications.svg?branch=master)](https://travis-ci.org/zotero/publications)
[![Coverage Status](https://coveralls.io/repos/github/zotero/publications/badge.svg?branch=master)](https://coveralls.io/github/zotero/publications?branch=master)
[![Dependency Status](https://david-dm.org/zotero/publications.svg)](https://david-dm.org/zotero/publications)
[![npm version](https://badge.fury.io/js/zotero-publications.svg)](https://badge.fury.io/js/zotero-publications)

Overview
--------
This library will pull items from Zotero API and display them in a user friendly way. It is intended to be easily embeddable on your own page. We're offering variety of builds to maximize potential use cases. Basic usage documentation and description of available builds are included below. For advanced usage please see examples and comments in the code. 

Getting The Library
-------------------

The easiest way to obtain the latest version is to use npm:

    npm i zotero-publications

Alternatively you can download the latest release directly from Github:

    https://github.com/zotero/publications

In most cases you will want to look into the `dist` folder, which contains variety of builds as described in a section "Builds" below. Whichever build you choose, you will need to include one *css* and one *js* file on your page.

The easiest way to do that is to add css file somewhere within `<head>` on your page:

    <link rel="stylesheet" href="zotero-publications.min.css">

And add js file somewhere at the end of the file but before final `</html>`:

    <script src="zotero-publications-compat-lodash.min.js"></script>

Alternatively, if you're compiling your JS using Browserify/Babelify or similar, you can just include/require "zotero-publications" in your app.

Finally, all the builds in `dist` folder are following the [Universal Module Definition](https://github.com/umdjs/umd) pattern which means you can also use this library in systems that use AMD (e.g. [RequireJS](http://requirejs.org/)) or CommonJS module loader mechanism.

Usage
-----

Use the following code to fetch "My Publications" for user ID 1 and render them inside #container: 

    <script>
         new ZoteroPublications(1, document.getElementById('container'));
    </script>

You can also specify additional configuration by passing a config object to the constructor, for example to enable grouping by item type:

    <script>
         new ZoteroPublications(1, document.getElementById('container'), {group: 'type'});
    </script>

Please see "Config Options" below to see all accepted parameters.

Finally if you need more control over what happens while data is being retrieved, would like to introduce custom error handling or data processing, you can use the following syntax:

    <script>
         var zp = new ZoteroPublications();
         var promise = zp.getPublications(1);
         //optionally do something here while data is being fetched

         promise.then(function(data) {
            //optionally process your data here
            zp.render(data, document.getElementById('container'));
        });

        promise.catch(function(reason) {
            //optionally implement custom error handling here
            console.warn(reason);
        });
    </script>


See [src/demo/index.html](src/demo/index.html) for a complete example.

Config Options
--------------
`ZoteroPublications` takes the following configuration options:

**apiBase**
Host name of the API.
Default: 'api.zotero.org' 

**citationStyle**
Which [Citation style](https://www.zotero.org/styles/) if *useCitationStyle* is enabled, defined which citation style will be used for item rendering.
Default: '' (none, API decides)

**storeCitationPreference**
Whether to store citation preference in local storage. If enabled returning users that use "Cite" functionality will have the last-selected citation style preselected.
Default: false

**group**
Enable grouping. Accepted values are: 'type' to group by type, 'collection' to group by top-level collections and *false* to disable grouping 
Default: false

**useCitationStyle**
Whether to use citation style instead of templated item rendering.
Default: false

**showBranding**
Whether to display minimalisic Zotero branding
Default: true

**useHistory**
Whether to store currently opened item (details pane) in the url fragment identifier. If used and fragment is present in the url, matching item will be opened scrolled to when page has first loaded.
Default: true

**expand**
Only applicable if grouping is enable, pre-expands selected groups. Can be an array of group names (type names if grouping by type and collection names if grouping by top-level collections), e.g. `['book', 'journalArticle']` or a keyword 'all'.
Default: 'all'

**citeStyleOptions**
A map of citation styles (key => user friendly name) available in the "Cite" functionality select box.
Default: List similar to citations styles pre-installed in Zotero Client

**exportFormats**
Definitions for export formats available in "Export" functionality.
Default: Definitions for BibTeX, RIS and Zotero RDF

**getQueryParamsDefault**
Contains default query params included in all the GET requests made by the library.
Default: Parameters that trigger sorting by date, batching requests by 100 items etc.

Builds
------

We offer minified **.min.js** and **.min.css** builds for use in production and **.js** and **.css** builds to use for debug/development. Furthermore we offer following variants of incremental size:

**zotero-publications.min.js** (~16KB zipped)
This is the smallest build containing only Zotero Publication code for very modern browsers. To use this build **you need to include [underscore.js](http://underscorejs.org/) or [lodash.js](https://lodash.com/) manually**. Furthermore this build **will only work in very recent browsers**, see see compatiblity table below.

**zotero-publications-compat.min.js** (~26KB zipped)
This build contains only Zotero Publications and few polyfills to make it work in all common browers. To use this build **you need to include [underscore.js](http://underscorejs.org/) or [lodash.js](https://lodash.com/) manually**.

**zotero-publications-lodash.min.js** (~38KB zipped)
This build contains only Zotero Publications and lodash. Because it lacks polyfills it **will only work in very recent browsers**, see compatiblity table below.

**dist/zotero-publications-compat-lodash.min.js** (~47KB zipped)
This build contains Zotero Publications, lodash and polyfills. **This is the safest build to use**.

Browser Compatibility
=====================

Build | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![EDGE](https://raw.github.com/alrra/browser-logos/master/edge/edge_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- | --- | --- |
Modern | Latest ✔ | ✗ | Latest ✔ | ✗ | Latest ✔ | ✗ |
Compat | Latest ✔ | Latest ✔ | Latest ✔ | 10+ ✔ | Latest ✔ | 6.1+ ✔ |


Development & Contributing
===========

For setup, build, tests etc. as well as contribution guidelines please see [CONTRIBUTING.md](CONTRIBUTING.md).
