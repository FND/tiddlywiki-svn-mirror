<?php


$u = $_POST['username'];
$w = $_REQUEST['workspace_name'];

$folder =  $_SERVER['DOCUMENT_ROOT'].dirname(dirname($_SERVER['SCRIPT_NAME']))."/uploads/workspace/".$w;

if ($handle = opendir($folder)) {
	echo "[";    
	while (false !== ($file = readdir($handle))) {
        if ($file != "." && $file != "..") {
	$loc = $folder."/".$file;
	$file_size = array_reduce (array (" B", " KB", " MB"), create_function ('$a,$b', 'return is_numeric($a)?($a>=1024?$a/1024:number_format($a,2).$b):$a;'), filesize ($loc));

	
			$out .= "{'username':'".$file."','lastVisit':'12121212','fileSize':'".$file_size."','downloads':'2','bandwidth':'4.6mb','cost':'£2.23'},";
		}
	}
	echo substr_replace($out ,"",-1)."]";
}


exit;














if ($handle = opendir($folder)) {
    while (false !== ($file = readdir($handle))) {
        if ($file != "." && $file != "..") {
        	$out .="'".$file."',";
		}
   }
}
closedir($handle);
echo substr_replace($out ,"",-1)."";		


exit;

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



?>