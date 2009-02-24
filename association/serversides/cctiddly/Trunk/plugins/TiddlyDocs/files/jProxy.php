<?php
//{{{
/***
 * [[proxy.php]] - access an url if the target host is allowed
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
 
 

$ALLOWED_SITE_FILENAME = '[[allowedsites.txt]]';
//error_reporting(E_ERROR | E_PARSE);
//error_reporting(E_ALL);

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
		//exit;	
	}
	return in_array($host, $allowedHosts);
}
/*
 * Main
 */

// help command

if (array_key_exists('help',$_GET)) {
	display('');
	//exit;
}


// list command

if (array_key_exists('list',$_GET)) {
	echo "<h3>Hosts allowed through this proxy :</h3>\n<ul>\n";	
	$allowedHosts = array_map('rtrim',file($ALLOWED_SITE_FILENAME));
	foreach ($allowedHosts as $host) 
		echo("<li>$host</li>\n");
	echo "</ul>\n";
	//exit;
}

// url command

//control url

//$url = $_GET['url'];

// $_POST['BROWSER'] = "IE";
// $_POST['API_KEY'] = urlencode("hJHLNc3+mGtyo4HpMzZ78YwogWMEZXOY8XWizs2oBZcyTnh+d3F24w==");
// $url = "http://draw.labs.autodesk.com/ADDraw/api/set/";

if (!$url) {
//	display('');
	//exit;
}

// is $host allowed ?
/*if (!inMyDomain($host) && !isAllowed($host)) {
	echo("Host '$host' is not allowed.");
	exit;
}*/
$written = "";
$chunked = false;
function curl_request($url, $type, $request_body, $cookie) {
		global $written;
	global $chunked;
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_VERBOSE, 1);
	$fp = fopen('/tmp/curl_error_log', 'a');
	curl_setopt($ch, CURLOPT_STDERR, $fp);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_HEADERFUNCTION, 'readHeader');
	curl_setopt($ch, CURLOPT_WRITEFUNCTION, 'writeData');
	//curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
	if($type == 'POST') {
		curl_setopt($ch, CURLOPT_POST, 1);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $request_body);
	}
	//curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	/* psd/mahemoff suggest user-agent and referrer headers not being set properly might cause problems */
	if($cookie) {
		curl_setopt($ch, CURLOPT_COOKIE, $cookie);
	}
	curl_exec($ch);
	//$data = curl_exec($ch);
	//header("Data: ".$written,false);
	//echo $data;
	//header("Keep-Alive: timeout=15, max=100",false);
	//header("Connection: Keep-Alive",false);
	//header("Transfer-Encoding: chunked",false);
	//header("Content-Length: ".strlen($written));
	error_log("about to send body, length: ".strlen($written));
	if($chunked) { // see http://www.jmarshall.com/easy/http/#http1.1c2
		// Content-Length is ignored if content is chunked: see http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.4
		error_log("body is chunked, needs wrapping");
		$written = dechex(strlen($written))."\n".$written."0\n\n";
	}
	error_log("body is ".$written);
	echo $written;
	curl_close($ch);
}

/*function readHeader($ch, $header) {
	if(preg_match("/^Location: (.*)/i", $header, $matches)) {
		echo "a location header: ".$header;
	} else {
		header($header);
	}
	return strlen($header);
}*/
function readHeader($ch, $header) {
	global $chunked;
	error_log("header data: ".$header);
	//grab location
	if (preg_match("/^Location: (.*)/i", $header, $matches)) {
		$location_url = str_replace("Location: ", "", $header);
		$location_url = substr($location_url,0,-2);
		$url = urldecode($location_url);
		if (substr($url,0,1)=='/') { // assume relative link and append host domain
			$get_url_array = parse_url($_GET['url']);
			$scheme = $get_url_array['scheme'];
			$host = $get_url_array['host'];
			$url = $scheme."://".$host.$url;
		} else if (substr($url, 0, 4) != 'http') {
			$url = 'http://'.$url;
		}
		$urlArray = parse_url($url);
		if (!$urlArray) {
			echo("URL '$url' is not well formed");
			//exit(); - note - if I'm going to echo errors and quit, then if I'm using the chunking strategy they will have to be wrapped
		}
		$url = "Location: ".$_SERVER['PHP_SELF']."?url=".urlencode($url);
		header($url,true);
	} else if(preg_match("/^Set-Cookie: (.*)/i", $header, $matches)) {
		$cookie = preg_replace("/domain=(.*)/i","domain=.intra.bt.com",$header);
		header($cookie,false);
	} else if (preg_match("/^Transfer-Encoding: chunked/i", $header, $matches)) {
		error_log("Transfer-Encoding: chunked found");
		//$chunked = true;
		//header($header,false);
	} else {
		header($header,false);
	}
	return strlen($header);
}

function writeData($ch, $data) {
	error_log("body data: ".$data);
	global $written;
	$written = $written.$data;
	return strlen($data); 
}

// GET $file at $host:$port
// grab $headers and $content
function get($url) {


	error_log("SESSIONS : ".print_r($_SESSION, true));
	error_log("COOKIES : ".print_r($_COOKIE, true));
	error_log("GET : ".print_r($_GET, true));
	error_log("POST : ".print_r($_POST, true));

	//error_log(print_r($_REQUEST, true));
	if (substr($url, 0, 4) != 'http') // should cope with https too!
		$url = 'http://'.$url;
	$urlArray = parse_url($url);
	if (!$urlArray) {
		echo("URL '$url' is not well formed");
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
	$type = $_POST ? 'POST' : 'GET';
	error_log("We are doing a ".$type);
	$post_string = "";
	
	$api_key = $_POST["API_KEY"];
	error_log("API KEY -- :::" . $api_key . ":::encoded:::" . urlencode($api_key) . ":::decoded-:::" . urldecode($api_key) . ":::");
	
	if($_POST) {
		$postvars = $_POST; 
		foreach ($postvars as $key=>$value) { 
		$post_string .= "&".$key."=".urlencode($value);
		}
		$post_string = substr($post_string,1);
		
		
		error_log("sending Post string : ".$post_string);
	}
	$cookies = $_SERVER['HTTP_COOKIE']; // use this instead exploding $_COOKIE as the latter is urldecoded
	curl_request($url,$type,$post_string,$cookies);
}

get($url);
exit;

//}}}