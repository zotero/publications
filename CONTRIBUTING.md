Below you can find overview on how to get up & running with development. We would love to see patches, fixes and new functionality implemented by the community. To contribute, please push changes to your fork and submit a pull request.

Requirements
------------

* NodeJS >=5.0.0 with npm

Installation
------------

Clone the repo (you might want to fork at this point):

	git clone https://github.com/zotero/publications.git

Fetch the dependencies:

	cd zotero-publications
    npm install

Development
-----------

The following command will put build development version of the package and serve a demo on port 8001:

    npm start

While the development server is running, changes to any of the file in *src* dir will result in respecive file being rebuilt in the live development environment. Demo server supports [livereload](http://livereload.com/) but does not serve middleware (meaning you need a [plugin](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei)).

Tests
--------------

The following command will execute all tests in a real browser (Chrome/Chromium by default) using [Karma](http://karma-runner.github.io):

    npm test

Furthermore this command starts a server and will continue executing relevant tests as needed whenever a *js* file change in *src* is detected. If this behaviour is not desired, you can instead use:

    npm run test-once

To execute tests only once.

Build
-----

`dist` folder contains the latest build and should not be included in the repository. To build the package execute:

    npm run build
 

