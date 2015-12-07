Overview
--------
This library will pull items from Zotero API and display them in a user friendly way. It it intended to be easilly embeddable on your own page. We're offering variety of builds to maximize potential use cases. Basic usage documentation and description of available builds are included below. For advanced usage please see examples and comments in the code. 

Getting The Library
-------------------

The easiest way to obtain the latest version is to use [bower](http://bower.io/):

    bower install <PACKAGE_NAME_TBC>

Alternaitvely you can download the latest release directly from Github:

    <URL TBC>

Whichever option you choose, the `dist` folder contains variety of builds as described in a section "Builds" below. Whichever build you choose, you will need to include one *css* and one *js* file on your page.

The easiest way to do that is to add css file somewhere within `<head>` on your page:

    <link rel="stylesheet" href="zotero-publications.min.css">

And add js file somewhere at the end of the file but before final `</html>`:

    <script src="zotero-publications.lodash-compat.min.js"></script>

All builds are following the [Universal Module Definition](https://github.com/umdjs/umd) pattern which means you can also use this library in systems that use AMD (e.g. [RequireJS](http://requirejs.org/)) or CommonJS module loader mechanism.


Usage
-----

Use the following code to fetch "My Publications" for user ID 1 and render them inside #container: 

    <script>
         new ZoteroPublications()
            .render('users/1/publications/items', document.getElementById('container'));
    </script>

You can also specify additional configuration by passing a config object to the constructor, for example to enable grouping by item type:

    <script>
         new ZoteroPublications({group: 'type'})
            .render('users/1/publications/items', document.getElementById('container'));
    </script>

Please see "Config Options" below to see all accepted parameters.

Finally if you need more control over what happens while data is being retrieved, would like to introduce custom error handling or data processing, you can use the following syntax:

    <script>
         var zp = new ZoteroPublications();
         var promise = zp.get('users/1/publications/items');
         //optionally do something here while data is being fetched

         promise.then(function(data) {
            //optionally process your data here
            zp.render(data, document.getElementById('container'));
        });

        promise.catch(function(reason) {
            //optionally implement custom error handling here
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
Which [Citation style](https://www.zotero.org/styles/) should be used.
Default: 'apa-annotated-bibliography'

**limit**
How many items to fetch from the API per batch. Please note that ZoteroPublications will retriever all items batch by batch. Changing this will only affect performance.
Default: 100

**include**
What formats that API should include. You probably shouldn't change that.
Default: ['data', 'citation']

**group**
Enable grouping. Accepted values are: 'type' to group by type, 'collection' to group by top-level collections and *false* to disable grouping 
Default: false

**expand**
Only applicable if grouping is enable, pre-expands selected groups. Can be an array of group names (type names if grouping by type and collection names if grouping by top-level collections), e.g. `['book', 'journalArticle']` or a keyword 'all'.
Default:

Builds
------

We offer minified **.min.js** and **.min.css** builds for use in production and **.js** and **.css** builds to use for debug/development. Furthermore we offer following variants of incremental size:

**zotero-publications.min.js** (~6KB zipped)
This is the smallest build containing only Zotero Publication code for very modern browsers. To use this build **you need to include [underscore.js](http://underscorejs.org/) or [lodash.js](https://lodash.com/) manually**. Furthermore this build **will only work in very recent browsers**, see see compatiblity table below.

**zotero-publications-compat.min.js** (~14KB zipped)
This build contains only Zotero Publications and few polyfills to make it work in all common browers. To use this build **you need to include [underscore.js](http://underscorejs.org/) or [lodash.js](https://lodash.com/) manually**.

**zotero-publications.lodash.min.js** (~24KB zipped)
This build contains only Zotero Publications and lodash. Because it lacks polyfills it **will only work in very recent browsers**, see see compatiblity table below.

**dist/zotero-publications.lodash-compat.min.js** (~32KB zipped)
This build contains Zotero Publications, lodash and polyfills. **This is the safest build to use**.

Browser Compatibility
=====================

Build | ![Chrome](https://raw.github.com/alrra/browser-logos/master/chrome/chrome_48x48.png) | ![EDGE](https://raw.github.com/alrra/browser-logos/master/edge/edge_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/internet-explorer/internet-explorer_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/opera/opera_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/safari/safari_48x48.png)
--- | --- | --- | --- | --- | --- | --- |
Modern | Latest ✔ | ✗ | Latest ✔ | ✗ | Latest ✔ | ✗ |
Compat | Latest ✔ | Latest ✔ | Latest ✔ | 10+ ✔ | 6.1+ ✔ |


Development & Contributing
===========

For setup, build, tests etc. as well as contribution guidelines please see [CONTRIBUTING.md](CONTRIBUTING.md).
