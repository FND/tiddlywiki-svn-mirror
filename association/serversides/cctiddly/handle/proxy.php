<?php
	$allowed = array('osmosoft.com', 'wiki.osmosoft.com', 'tiddlytools.com', 'tiddlythemes.com', 'itw.bidix.info');
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