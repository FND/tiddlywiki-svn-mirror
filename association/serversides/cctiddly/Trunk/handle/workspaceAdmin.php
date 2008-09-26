<?php
// THIS WILL BECOME A MODULE IN 1.7

$cct_base = "../";
include_once($cct_base."includes/header.php");

$a = $_POST['action']?$_POST['action']:$_REQUEST['action'];
$u = $_POST['username']?$_POST['username']:$_REQUEST['username'];
$w = $_POST['workspace_name']?$_POST['workspace_name']:$_REQUEST['workspace_name'];

if(!user_session_validate())
	sendHeader("403", null, null, 1);

if ($a =="LISTWORKSPACES")
{
	$data['workspace_name']=$w;
	$result = db_workspace_selectOwnedBy(user_getUsername());  
	$out = "";
	 while ($r = db_fetch_assoc($result))
	{
		$out .= "'".$r['workspace_name']."', ";
	}
	echo substr_replace($out ,"",-2)." ";	
 	exit;
}

if (!user_isAdmin(user_getUsername(), $w))
	sendHeader("401", null, null, 1);

if($a == "DELETEADMIN")
{
	$users = explode( ",", $u);
	foreach($users as $user)
	{
		if ($user)
		{
			$data['username'] = $user;
			$data['workspace_name'] =  $w; 
			$r = db_record_delete($tiddlyCfg['table']['admin'],$data);	
		}	
	}	
	exit;
}

if ($a =="LISTALL")
{
	$data['workspace_name']=$w;
 	$r = db_record_select($tiddlyCfg['table']['admin'], $data);	
 	$out = "[";	
    $count = 0;
	foreach ($r as $k=>$v)
	{
		$out .="{'username':'".$v[username]."',";
		$data1['username']=$v[username];
		$data1['workspace']=$w;
	 	$r1 = db_record_select($tiddlyCfg['table']['workspace_view'], $data1, null ,"order by id limit 1");	
		$out .= "'lastVisit':'".$r1[0]['time']."'},";
	}	
	echo substr_replace($out ,"",-1)."]";		
	exit;
}

if ($u && $w)
{
	$data['username'] = $u;
	$data['workspace_name'] = $w;
}else
{
	exit;
}

$res = db_record_insert($tiddlyCfg['table']['admin'],$data);

if ($res !=1)
	sendHeader(304, null, null, 1);
else
	sendHeader("201");



?> 
