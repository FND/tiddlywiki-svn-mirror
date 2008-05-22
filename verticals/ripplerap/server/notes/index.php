<?php
/*
 *  store / list notes feeds
 *
 *  http://ripplerap.com/test/{blah-blah}/notes
 *
 *  POST:
 *      feed  - the notes XML
 *      username - the TiddlyWiki author's name
 *
 *  GET: 
 *      returns OPML list of stored notes
 */

$feedtext = $_POST['feed'];
$username = $_POST['username'];
$baseuri = "http://ripplerap.com/test";
$conf = basename(dirname(getcwd()));

if (0 != strlen($feedtext)) {

	// not very i18n friendly ..
	$username = preg_replace("/[^A-Za-z0-9]+/", "", $username);

	if (0 != strlen($usernamer)) {
		$username = "default";
	}

	file_put_contents("./$username.xml", $feedtext);
}

    header('Content-type: text/xml;charset=UTF-8');
    print '<opml version="1.0">
    <head>
        <title>Conference notes</title>
      </head>
      <body>
';

    foreach (glob("*.xml") as $filename) { 
	$username = basename($filename, '.xml');
	print "<outline text=\"Notes from $username\" title=\"$username\" type=\"rss\" xmlUrl=\"$baseuri/$conf/notes/$filename\" />\n";
    }

    print '
      </body>
   </opml>
';
?>
