<?php
$cct_base = '../';
include_once('../includes/header.php');


$locations['STORE_AREA']['start'] = '<!--POST-SHADOWAREA-->
<div id="storeArea">';
$locations['STORE_AREA']['end'] = '</div>
<!--POST-STOREAREA-->';
$locations['POST_HEAD']['type'] = 'store';
$locations['POST_HEAD']['text'] = ' text goes here - >';

/*

$locations['SITE_TITLE']['start'] = '<title>';
$locations['SITE_TITLE']['end'] = '</title>';
$locations['SITE_TITLE']['type'] = 'text';
$locations['SITE_TITLE']['tiddler'] = 'SiteTitle';
$locations['SITE_TITLE']['text'] = ' new title from simon';

$locations['PRE_HEAD']['start'] = '<!--PRE-HEAD-START-->';
$locations['PRE_HEAD']['end'] = '<!--PRE-HEAD-END-->';
$locations['PRE_HEAD']['type'] = 'text';
$locations['PRE_HEAD']['tiddler'] = 'MarkUpPreHead';

$locations['POST_HEAD']['start'] = '<!--POST-HEAD-START-->';
$locations['POST_HEAD']['end'] = '<!--POST-HEAD-END-->';
$locations['POST_HEAD']['type'] = 'text';
$locations['POST_HEAD']['tiddler'] = 'MarkUpPostHead';

$locations['PRE_BODY']['start'] = '<!--PRE-BODY-START-->';
$locations['PRE_BODY']['end'] = '<!--PRE-BODY-END-->';
$locations['PRE_BODY']['type'] = 'text';
$locations['PRE_BODY']['tiddler'] = 'MarkUpPostHead';

$locations['POST_SCRIPT']['start'] = '<!--POST-SCRIPT-START-->';
$locations['POST_SCRIPT']['end'] = '<!--POST-SCRIPT-END-->';
$locations['POST_SCRIPT']['type'] = 'text';
$locations['POST_SCRIPT']['tiddler'] = 'MarkUpPostHead';

* */
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
echo $part1.$loc['text'].$part2;







	//$tiddler = tiddler_create($loc['tiddler'], $body);
	//tiddler_insert($tiddler);
	//echo $loc['tiddler'].'create </br>';
	
}

?>
	
