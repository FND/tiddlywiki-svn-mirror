<?php
	$allowed = array('osmosoft.com', 'wiki.osmosoft.com', 'tiddlytools.com', 'tiddlythemes.com', 'wikidev.osmosoft.com', 'itw.bidix.info', '127.0.0.1', 'localhost');
	$feed = $_REQUEST['feed'];
	$url = parse_url($feed);
	if(in_array($url[host], $allowed))
	{
		
	}
	else
	{
		exit;
	}
	if($feed != '' && strpos($feed, 'http') === 0)
	{
		readfile($feed);
		return;
	}
?>