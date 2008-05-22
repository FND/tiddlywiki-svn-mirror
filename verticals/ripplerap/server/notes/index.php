<?php
/*
 *  produce an edition of RippleRap from a set of parameters:
 *
 *  http://ripplerap.com/edition?baseURI={baseURI}&type=confabb&conferenceName={conferenceName}
 *
 *  Where:
 *
 *  - baseURI is the confabb base URI for a conference, url encoded
 *    e.g. http%3A%2F%2Fconfabb.com%2Fconferences%2F16074-web-2-0-conference-2006
 *
 *  - type indicates the format of the data at the baseURI
 *    e.g. "confabb"
 *
 *  - conferenceName is the friendly dispayed title for the conference
 *    e.g. "The Big BackYard Seminar 2008"
 *
 *  requires a "blank" ripplerap.html file
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
