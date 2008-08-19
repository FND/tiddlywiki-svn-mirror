<?php
$cct_base = "../";
include_once($cct_base."includes/header.php");

if(!user_session_validate())
{
	sendHeader("403");
	echo '<b>You do not appear to be logged in</b>';
	exit;	
}

if (!user_isAdmin($user['username'], $_POST['ccCreateWorkspace']))
{
	sendHeader("401");
	echo '<b> You do not have permissions to upload files, please contact your system administrator.</b>';
	exit;
}
$odata['name']= $_POST['ccCreateWorkspace'];

if(isset($_REQUEST['ccAnonPerm']) && $_REQUEST['ccAnonPerm'] != "")
$ndata['default_anonymous_perm']=$_REQUEST['ccAnonPerm']; 
if(isset($_REQUEST['ccUserPerm']) && $_REQUEST['ccUserPerm'] != "")
$ndata['default_user_perm']=$_REQUEST['ccUserPerm'];

$res = db_record_update($tiddlyCfg['table']['workspace'],$odata,$ndata);

if ($res >0 )
{
	echo 'Permissions updated';
	
}else
{
	echo 'Permissions Not changed';
}

?>