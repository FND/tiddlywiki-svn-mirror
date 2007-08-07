<?php
//{{{
/***
 * proxy.php - access an url if the target host is allowed
 * version: 2.2.0 - 2007/08/03 - BidiX@BidiX.info
 * source: http://tiddlywiki.bidix.info/#proxy.php
 * license: BSD open source license (http://tiddlywiki.bidix.info/#[[BSD open source license]])
 * Copyright (c) BidiX@BidiX.info 2006-2007
 *			 
 * usage: 
 * 		proxy.php?url=<hostAndParameters>
 *			return the corresponding url if the host is included in the <ALLOWED_SITE_FILENAME> file 
 *			or is in the same domain
 *		proxy.php?list
 *			list all allowedHosts
 *		proxy.cgi[?help]
 *			Display an help page
 *			
 * require: 
 * 		<ALLOWED_SITE_FILENAME> a file located on the server containing a list af allowed hosts
 *			each host on a separate line. 
 *     example :
 *				www.tiddlywiki.com
 *				tiddliwiki.bidix.info
 *				tiddlyspot.com
 ***/

$ALLOWED_SITE_FILENAME = 'allowedsites.txt';
error_reporting(E_ERROR | E_PARSE);

function display($msg) {
	?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
	<html>
		<head>
			<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
			<title>BidiX.info - TiddlyWiki - proxy script</title>
		</head>
		<body>
			<p>
			<p>proxy.php V 2.2.0
			<p>BidiX@BidiX.info
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p align="center"><?=$msg?></p>
			<p align="center">Usage : http://<?=$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF']?>[?url=<i>URL</i>|help|list].</p>	
			<p align="center">for details see : <a href="http://TiddlyWiki.bidix.info/#proxy.php">TiddlyWiki.bidix.info/#proxy.php<a>.</p>	
		</body>
	</html>
	<?php
	return;
}

function domain($host) {
	// get last two segments of host name
	// See : http://fr2.php.net/manual/en/function.preg-match.php#id5827438
	preg_match('/[^.]+\.[^.]+$/', $host, $matches);
	return $matches[0];
}

function inMyDomain($host) {
	return (domain($_SERVER['HTTP_HOST']) == domain($host));
}

function isAllowed($host) {
	global $ALLOWED_SITE_FILENAME;
	// load allowed hosts
	$allowedHosts = array_map('rtrim',file($ALLOWED_SITE_FILENAME));
	if (!$allowedHosts) {
		echo("allowedSites file '$ALLOWED_SITE_FILENAME' is not found or empty.");
		exit;	
	}
	return in_array($host, $allowedHosts);
}
/*
 * Main
 */

// help command

if (array_key_exists('help',$_GET)) {
	display('');
	exit;
}


// list command

if (array_key_exists('list',$_GET)) {
	echo "<h3>Hosts allowed through this proxy :</h3>\n<ul>\n";	
	$allowedHosts = array_map('rtrim',file($ALLOWED_SITE_FILENAME));
	foreach ($allowedHosts as $host) 
		echo("<li>$host</li>\n");
	echo "</ul>\n";
	exit;
}

// url command

//control url
$url = $_GET['url'];
if (!$url) {
	display('');
	exit;
}

if (substr($url, 0, 4) != 'http')
	$url = 'http://'.$url;
$urlArray = parse_url($url);
if (!$urlArray) {
	echo("URL '$url' is not well formed");
	exit;
}
$host = strtolower($urlArray['host']);

if (isset($urlArray['port']))
	$port = $urlArray['port'];
else
	$port = '80';
$file = $urlArray['path'];
if (isset($urlArray['query']))
	$file = $file.'?'.$urlArray['query'];
if (isset($urlArray['fragment']))
	$file = $file.'#'.$urlArray['fragment'];

// is $host allowed ?
if (!inMyDomain($host) && !isAllowed($host)) {
	echo("Host '$host' is not allowed.");
	exit;
}

// GET $file at $host:$port
// grab $headers and $content
$fp = fsockopen($host, $port, $errno, $errstr, 30);
if (!$fp) {
    echo "$errstr ($errno)\n";
} else {
    $out = "GET $file HTTP/1.1\r\n";
    $out .= "Host: $host\r\n";
    $out .= "Connection: Close\r\n\r\n";

    fwrite($fp, $out);
    $fheader = 1;
    $headers = "";
	$content_type = "";
	$content = "";	
    while (!feof($fp)) {
		$line = fgets($fp, 128);
		//Grab the headers
        if ($fheader == 1) {
            if ($line == "\r\n") { 
                $fheader = 0;
            } else {
                //Assemble the headers
                $headers .= $line;
				//grab content_type
				if (preg_match("/Content-Type: (\w+\/\w+)(.*)/i", $line, $matches)) {
					$content_type = $line;
				}
            }
        } else {
            //Grab the page content
            $content .= $line;
        }
    }
    fclose($fp);
}

header($content_type);
echo ($content);
//}}}
