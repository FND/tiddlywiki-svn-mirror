<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");
include_once($cct_base."includes/print.php");
include_once($cct_base."includes/login.php");
$tiddlyCfg['workspace_name'] = '';
	$tiddlers = getAllVersionTiddly($title);
	$t = array();
	$tiddlers = getAllTiddlers();
	// if($_REQUEST['skin']) 
	//{
		$skin_tiddlers = getSkinTiddlers($_REQUEST['skin']); 
		$tiddlers = array_merge($skin_tiddlers, $tiddlers); 
	//}

	echo "[";

	if( sizeof($tiddlers)>0 )
	{
		foreach( $tiddlers as $t )
		{
			$a .= "{'title':'".$t['title']."', 'revision':".$t['revision']."}".",";
			
 		}
	}
	
	//echo $a;
	echo substr($a,0,strlen($a)-1); 
	echo "]";
	
	
?>