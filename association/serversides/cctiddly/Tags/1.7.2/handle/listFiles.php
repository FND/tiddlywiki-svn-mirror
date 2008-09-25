<?php
$u = $_POST['username'];
$w = $_REQUEST['workspace_name'];
$a = $_PO['action'];

$cct_base = "../";
include_once($cct_base."includes/header.php");

if(!user_session_validate())
{
	sendHeader("403");
	echo '<b>You do not appear to be logged in. You may need to refresh the page to recieve the login prompt.</b>';
	exit;	
}

if (!user_isAdmin($user['username'], $_w))
{
	if ($tiddlyCfg['only_workspace_admin_can_upload']==1)
	{
		sendHeader("401");
		echo '<b> You do not have permissions to upload files,  Only workspace owners can upload files. You could try creating your own workspace.</b>';
		exit;
	}
}


if($w=="")
	$w='default';

if($_POST['action']=="DELETEFILE")
{

	echo unlink($_SERVER['DOCUMENT_ROOT'].dirname(dirname($_SERVER['SCRIPT_NAME']))."/uploads/workspace/".$w."/".$_POST['file']);
	exit;
}

$folder =  $_SERVER['DOCUMENT_ROOT'].dirname(dirname($_SERVER['SCRIPT_NAME']))."/uploads/workspace/".$w;
if ($handle = opendir($folder)) {
	echo "[";    
	while (false !== ($file = readdir($handle))) {
        if ($file != "." && $file != "..") {
			$loc = $folder."/".$file;
			$file_size = array_reduce (array (" B", " KB", " MB"), create_function ('$a,$b', 'return is_numeric($a)?($a>=1024?$a/1024:number_format($a,2).$b):$a;'), filesize ($loc));
			$out .= "{'filename':'".$file."','fileSize':'".$file_size."', 'url':'".dirname(getUrl())."/uploads/workspace/".$w."/".$file."'},";
		}
	}
	echo substr_replace($out ,"",-1)."]";
}
?>