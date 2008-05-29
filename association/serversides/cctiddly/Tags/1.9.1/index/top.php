<?php
//timing
function recordTime_float($name="unnamed")
{
	global $time;
	if( !isset($time) )		//stop if time var not exist
	{
		return FALSE;
	}
	list($usec, $sec) = explode(" ", microtime());
	$time[] = array("name"=>$name, "time"=>((float)$usec + (float)$sec));
	return TRUE;
}

$time=array();
recordTime_float("Start");

//includes
$cct_base = "";
include_once($cct_base."includes/header.php");
include_once($cct_base."includes/print.php");
include_once($cct_base."includes/login.php");

recordTime_float("includes");

//RSS
if( strcmp($cctAction,"RSS")==0 )
{
	include_once($cct_base."handle/rss.php");
	exit;
}

//check if getting revision
if( isset($_GET['title']) )
{
	$tiddlers = getAllVersionTiddly($title);
	$t = array();
	foreach( $tiddlers as $tid )
	{
		$tid['title'] .= " revision ".$tid['revision'];
		$t[] = $tid;
	}
	$tiddlers = $t;
}elseif( isset($_GET['tags']) )
{
	$tiddlers = getTiddlersWithTags($yesTags, $noTags);
}else{
	$tiddlers = getAllTiddlers();
	if($_REQUEST['skin']) 
	{
		$skin_tiddlers = getSkinTiddlers($_REQUEST['skin']); 
		$tiddlers = array_merge($skin_tiddlers, $tiddlers); 
	}
}
recordTime_float("get all tiddlers");
	
// log the workspace viewing : 
$data1['username'] = $user['username'];
$data1['workspace'] = $workspace;

$data1['time'] = date( 'Y-m-d H:i:s', mktime());
db_record_insert($tiddlyCfg['table']['workspace_view'],$data1);
?>

