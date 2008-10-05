<?php
if(!isset($cct_base)) {
	$cct_base= "../";
}

include_once($cct_base."includes/header.php");
include_once($cct_base."includes/config.php");
	$feed = $_REQUEST['feed'];
	

$url = parse_url($feed);
if(!in_array($url[host], $tiddlyCfg['allowed_proxy_list']))
{
	error_log("");
	exit;
}

if($feed != '' && strpos($feed, 'http') === 0)
{
	if($_REQUEST['format'])
		readfile($feed."&format=".$_REQUEST['format']);
	else
		readfile($feed);
		
	return;
}
?>