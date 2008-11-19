<?php

/*
 * // Is this needed?
$locations['SITE_TITLE']['start'] = '<title>';
$locations['SITE_TITLE']['end'] = '</title>';
$locations['SITE_TITLE']['type'] = 'text';
$locations['SITE_TITLE']['tiddler'] = 'SiteTitle';
$locations['SITE_TITLE']['text'] = ' new title from simon';

$locations['STORE_AREA']['start'] = '<!--POST-SHADOWAREA-->
<div id="storeArea">';
$locations['STORE_AREA']['end'] = '<!--POST-STOREAREA-->';
$locations['POST_HEAD']['type'] = 'store';
$locations['POST_HEAD']['text'] = '<div id="storeArea"><div title="SiteTitle" modifier="PhilHawksworth" created="200708161546" modified="200709241632">
<pre>//teamtasks//</pre>
</div></div>';

* */

$cct_base = '../';
include_once('../includes/header.php');
 	$tiddlers = getAllTiddlers();


$locations['STORE_AREA']['start'] = '<!--POST-SHADOWAREA-->';
$locations['STORE_AREA']['end'] = '<!--POST-STOREAREA-->';
$locations['STORE_AREA']['tiddlers'] = $tiddlers;


$locations['PRE_HEAD']['start'] = '<!--PRE-HEAD-START-->';
$locations['PRE_HEAD']['end'] = '<!--PRE-HEAD-END-->';
$locations['PRE_HEAD']['tiddlers'] = $tiddlers['MarkupPreHead'];

$locations['POST_HEAD']['start'] = '<!--POST-HEAD-START-->';
$locations['POST_HEAD']['end'] = '<!--POST-HEAD-END-->';
$locations['POST_HEAD']['tiddlers'] = $tiddlers['MarkupPostHead'];

$locations['PRE_BODY']['start'] = '<!--PRE-BODY-START-->';
$locations['PRE_BODY']['end'] = '<!--PRE-BODY-END-->';
$locations['PRE_BODY']['tiddlers'] = $tiddlers['MarkupPreBody'];

$locations['POST_SCRIPT']['start'] = '<!--POST-SCRIPT-START-->';
$locations['POST_SCRIPT']['end'] = '<!--POST-SCRIPT-END-->';
$locations['POST_SCRIPT']['tiddlers'] = $tiddlers['MarkupPostBody'];


$file = file_get_contents('teamtasks.html');

foreach($locations as $loc)
{
	$str_start = $loc['start'];
	$str_end = $loc['end'];
	$string = $file;
	$start_pos = strpos($string, $str_start)+strlen($str_start);
	$end_pos = strpos($string, $str_end);
	$part1 = substr($string, 0, $start_pos);
	$part2 = substr($string, $end_pos, strlen($string));
	if($loc['tiddlers'])
	{

		foreach($loc['tiddlers'] as $tiddler)
		print_r($part1.tiddler_bodyDecode($tiddler['body'])).$part2;
	
	

	}
}

echo $file;
?>
