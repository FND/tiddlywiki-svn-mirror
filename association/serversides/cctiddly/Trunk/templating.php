<?php
include_once('includes/header.php');

$locations['SITE_TITLE']['start'] = '<title>';
$locations['SITE_TITLE']['end'] = '</title>';
$locations['SITE_TITLE']['type'] = 'text';
$locations['SITE_TITLE']['tiddler'] = 'SiteTitle';


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

$file = file_get_contents('tiddlywikis/teamtasks.html');

foreach($locations as $loc)
{
	$start_pos = strpos($file, $loc['start'])+strlen($loc['start']);
	$end_pos = strpos($file, $loc['end']) - $start_pos;
	$body = substr($file, $start_pos, $end_pos);	
	$tiddler = tiddler_create($loc['tiddler'], $body);
	tiddler_insert($tiddler);
echo $loc['tiddler'].'create </br>';
}

?>
	