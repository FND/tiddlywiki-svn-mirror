<?php
include_once('includes/header.php');

//extract tiddlers
$locations['PRE_HEAD']['start'] = '<!--PRE-HEAD-START-->';
$locations['PRE_HEAD']['end'] = '<!--PRE-HEAD-END-->';
$locations['PRE_HEAD']['type'] = 'text';
$locations['PRE_HEAD']['tiddler'] = 'MarkUpPreHead';
$locations['POST_HEAD']['start'] = '<!--POST-HEAD-START-->';
$locations['POST_HEAD']['end'] = '<!--POST-HEAD-END-->';
$locations['PRE_HEAD']['type'] = 'text';

$file = file_get_contents('tiddlywikis/empty.html');

foreach($locations as $loc)
{
	$start_pos = strpos($file, $loc['start'])+strlen($loc['start']);
	$end_pos = strpos($file, $loc['end']) - $start_pos;
	$body = substr($file, $start_pos, $end_pos);	
	$tiddler = tiddler_create($loc['tiddler'], $body);
	tiddler_insert($tiddler);
}
	
exit;



$start = '<!--PRE-HEAD-START-->';
$end = '<!--PRE-HEAD-END-->';
$start_pos = strpos($file, $start)+strlen($start);
$end_pos = strpos($file, $end) - $start_pos - strlen($start);

echo substr($file, $start_pos, $end_pos);

?>

