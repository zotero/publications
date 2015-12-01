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

Development & Contributing
===========

For setup, build, tests etc. as well as contribution guidelines please see [CONTRIBUTING.md](CONTRIBUTING.md).