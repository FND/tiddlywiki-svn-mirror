<?php

/*
 * // Is this needed?
$locations['SITE_TITLE']['start'] = '<title>';
$locations['SITE_TITLE']['end'] = '</title>';
$locations['SITE_TITLE']['type'] = 'text';
$locations['SITE_TITLE']['tiddler'] = 'SiteTitle';
$locations['SITE_TITLE']['text'] = ' new title from simon';
*/

$cct_base = '../';
include_once('../includes/header.php');
 	$tiddlers = getAllTiddlers();

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

$locations['STORE_AREA']['start'] = '<!--POST-SHADOWAREA-->';
$locations['STORE_AREA']['end'] = '<!--POST-STOREAREA-->';
$locations['STORE_AREA']['tiddlers'] = $tiddlers;
$locations['STORE_AREA']['type'] = 'store';

$file = file_get_contents('teamtasks.html');

foreach($locations as $loc)
{
	if($loc['tiddlers'])
	{
		$part = splitString($file, $loc['start'], $loc['end']);
		foreach($loc['tiddlers'] as $tiddler)
			$tiddler_str .= tiddler_outputDIV($tiddler);	
		if($loc['type']=='store')
			$file = $part['1'].'<div id="storeArea">'.$tiddler_str.'</div>'.$part['2'];		
		else
			$file .= $part['1'].$tiddler_str.$part['2'];
	}
}
echo $file;
?>
