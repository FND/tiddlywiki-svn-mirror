<?php


// DEPRECIATED 

exit;




$title = formatParametersGET($_GET['title']);
$format = formatParametersGET($_GET['format']);


$cct_base = "../";
include_once($cct_base."includes/header.php");

function tiddlerToJson($tiddler)
{
	$output = "{\n";
	$output .= '"title":'.$tiddler['title']."\n";
	$output .= '"text":'.$tiddler['body']."\n";
	$output .= '"modifier":'.$tiddler['modifier']."\n";
	$output .= '"created":'.$tiddler['created']."\n";
	$output .= '"modified":'.$tiddler['modified']."\n";
	$output .= '"tags":'.$tiddler['tags']."\n";
	$output .= '"fields":'.$tiddler['fields'];
	$output .= "}\n";
	return $output;
}
function tiddlerToText($tiddler)
{
	$output = $tiddler['title']."\n";
	$output .= $tiddler['body']."\n";
	$output .= $tiddler['modifier']."\n";
	$output .= $tiddler['modified']."\n";
	$output .= $tiddler['created']."\n";
	$output .= $tiddler['tags']."\n";
	$output .= $tiddler['revision']."\n";
	$output .= $tiddler['fields'];
	return $output;
}
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
if( !isset($_GET['title']) ) {
	sendHeader(400,$ccT_msg['misc']['no_title'],"",1);
}

//////////////////////////////////////////////////////////start of code//////////////////////////////////////////////////////////////

$tiddler = db_tiddlers_mainSelectTitle($title);
if( $tiddler === FALSE ) {//not found
	sendHeader(204,$ccT_msg['error']['tidder_not_found'],"",1);
}

if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$tiddler['tags'])) ) { //if read privilege ok, output
	//print tiddler content
	if( $format == 'json') {
		$output = tiddlerToJson($tiddler);
	} else {
		$output = tiddlerToText($tiddler);
	}
	sendHeader(200,"", $output,1);
}else{ //if no read privilege, stop
	sendHeader(204,$ccT_msg['error']['tiddler_not_found'],"",1);
}

sendHeader(204,$ccT_msg['error']['tiddler_not_found'],"",1);
?>