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
$response = readFile($feed."&format=json");
exit;
?>