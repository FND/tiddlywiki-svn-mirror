<?php
// This file requires refactoring....
if(!isset($cct_base)) 
	$cct_base= "../../../";
include_once($cct_base."includes/header.php");
include_once($cct_base."includes/config.php");
debug($_SERVER['PHP_SELF'], "handle");	
$feed = $_REQUEST['feed'];
$url = parse_url($feed);
if(!in_array($url[host], $tiddlyCfg['allowed_proxy_list']))
{
	exit;
}
$url = $feed;
echo $response = readFile($feed."&max=30");
exit;

if($feed != '' && strpos($feed, 'http') === 0)
{
	if($_REQUEST['format'])
		readfile($feed."&format=".$_REQUEST['format']);
	else
		readfile($feed);
		
	return;
}
?>