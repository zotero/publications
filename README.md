Usage
=====

Obtain the latest version using git:

    git clone git@github.com:tnajdek/zotero-publications.git

Copy files from `dist` folder to your application, then:

Add css file somewhere within `<head>`:

    <link rel="stylesheet" href="zotero-publications.css">

Add js file somewhere at the end of the file but before final `</html>`:

    <script src="zotero-publications.js"></script>

Use the following code to fetch "My Publications" for user ID 1 and render them inside #container: 

    <script>
         var zp = new ZoteroPublications({ userId: 23862 });
         zp.render(document.getElementById('container'));
    </script>


See `src/demo/index.html` for a complete example.

Development
===========

Requirements
------------

* NodeJS >=4.0.0 with npm

Installation
------------

Run the following commands:

	git clone git@github.com:tnajdek/zotero-publications.git
	cd zotero-publications
    npm install

Development
-----------

The following command will put build development version of the package and serve a demo on port 8001:

    npm start

While the development server is running, changes to any of the file in *src* dir will result in respecive file being rebuilt in the live development environment. Demo server supports [livereload](http://livereload.com/) but does not serve middleware (meaning you need a [plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)).

Tests
--------------

The following command will execute all tests in a real browser (Chrome/Chromium by default):

    npm test

Furthermore this command starts a server and will continue executing relevant tests as needed whenever a *js* file change in *src* is detected. If this behaviour is not desired, you can instead use:

    npm run test-once

To execute tests only once.

Build
-----

`dist` folder contains the latest build and is included in the repository. To re-build the package execute:

    npm run build

This will produce files for all build variants.
