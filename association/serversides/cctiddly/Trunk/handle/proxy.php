<?php

$ch = curl_init($_REQUEST['feed']);
curl_exec($ch);
curl_close($ch);

exit;


// This file requires refactoring....
$feed = $_REQUEST['feed'];
$url = parse_url($feed);
if(!in_array($url[host], $tiddlyCfg['allowed_proxy_list']))
{
	exit;
}
$url = $feed;
$params = array('http' => array(
'method' => 'GET',
'header'=> 'accept:application/json',
'content' => $data));
$ctx = stream_context_create($params);
$fp = fopen($url, 'rb', false, $ctx);
echo $response = stream_get_contents($fp);

// in some situtations this needs to replace the above line. 
//echo $response = readExternalFile($feed);
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