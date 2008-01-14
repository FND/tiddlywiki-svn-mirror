<?php

//This server side search has been implemented so the search functionality still exists when the entire Tiddlywiki content is not downloaded.

$cct_base = "../";
include_once($cct_base."includes/header.php");

$search = $_REQUEST['search'];
$search = $_POST['search'];


$tiddlers = getAllTiddlers('simon', $search);

if(!$tiddlers)
{
	echo "{no results found}";
	exit;
}
$count = 1;
$str=  "{";
foreach($tiddlers as $t)
{
	$str .= "'".$count++."':'";
	$str .= $t['title']."',";
}
echo $str = substr($str,0,	(strlen($str)-1));		//remove last ","
print "}";


?>