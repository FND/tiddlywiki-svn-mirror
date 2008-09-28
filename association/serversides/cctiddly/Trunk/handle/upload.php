<?php 

$cct_base = "../";
include_once($cct_base."includes/header.php");

if(!user_session_validate()){
	sendHeader("403");
	exit;	
}

if (!user_isAdmin($user['username'], $_POST['workspaceName'])){
	if ($tiddlyCfg['only_workspace_admin_can_upload']==1){
		sendHeader("401");
		exit;
	}
}

function makeFolder($path){
	if(!file_exists($path)){
		mkdir($path, 0700, true);
	}
}

function check_vals(){
	global $upload_dirs, $err, $ccT_msg;
	if (!ini_get("file_uploads")){
			sendHeader("405");
		$err .= $ccT_msg['upload']['blockedConfig']; return 0; 
	}
	$pos = strpos(ini_get("disable_functions"), "move_uploaded_file");
	if ($pos !== false){
			sendHeader("405");
	$err .= $ccT_msg['upload']['blockedFunction']; return 0; 
	}

  	if (!isset($_FILES["userFile"])) {
  		$err .= $ccT_msg['upload']['noFile']; return 0;
  	}
  	elseif (!is_uploaded_file($_FILES['userFile']['tmp_name'])) {
  		$err .= $ccT_msg['upload']['emptyFile']; return 0; 
  	}
	return 1;
}

if ($_POST['saveTo'] == 'workspace'){
	if  ($_POST['workspaceName'] !== ""){
		$folder = "/workspace/".$_POST['workspaceName'];
	}else{
		$folder = "/workspace/default";
	}
}
elseif ($_POST['saveTo'] == 'user'){
 	$folder = "/user/".$_POST['username'];
}

$local_root = $_SERVER['DOCUMENT_ROOT'].dirname(dirname($_SERVER['SCRIPT_NAME']));
$remote_root = dirname(getURL());
$path = ltrim(rtrim($_POST['ccPath'], "/"), "/");
$folder = str_replace("../", "","/uploads".$folder.'/'.$path."");
makeFolder($local_root.$folder);

if ($_POST['ccHTMLName'] || $_POST['ccHTML']){
	if (!$_POST['ccHTMLName'] || !$_POST['ccHTML']){
		sendHeader("402");
		echo $ccT_msg['upload']['specifyFileorHtml'];
		exit;
	}
	
	$ext = end(explode(".", $_POST['ccHTMLName']));
	$ext =  strtolower($ext);

//	if (in_array($ext, $allowed_ext))
//	{
		$file = $_POST['ccHTMLName'];
//	}else
//	{
//		echo "You are not allowed to crate files of that type.";
//		exit;
//	}
	
	
	$myFile = $local_root.$folder.$file;
	$fh = fopen($myFile, 'w') or die("can't open file");

	if(fwrite($fh, $_POST['ccHTML'])){
		sendHeader("201");
		$url = $remote_root.$folder.$_POST['ccHTMLName'];
		echo "click here to view it <a href='".$url."'>".$url."</a>";
		exit;
	}
	fclose($fh);		
}


$err = ""; 
$status = 0;


if (isset($_FILES["userFile"])){
	$_FILES["userFile"]["type"];
	if (check_vals()){
		if (($_FILES["userFile"]["type"] == "image/gif") || ($_FILES["userFile"]["type"] == "image/jpeg")|| ($_FILES["userFile"]["type"] == "image/pjpeg")){
			$file_type = 'image';
		}
		else if(in_array($_FILES["userFile"]["type"], $tiddlyCfg['upload_allow_extensions'])){
			$file_type = 'text';
		}else{
			echo '<b>'.$ccT_msg['upload']['typeNotSupported'].'</b>';
			exit;
		}
		
		$upload_dir = $folder;
	
		if (filesize($_FILES["userFile"]["tmp_name"]) > $tiddlyCfg['max_file_size']){
			sendHeader("400");
			$err .= $ccT_msg['upload']['maxFileSize'];
		}
		else{
			$from =  $_FILES["userFile"]["tmp_name"];
			$to = $local_root.$folder."/".$_FILES["userFile"]["name"];
			if(file_exists($to)){
				echo '<b>'.$ccT_msg['upload']['fileExists'].'</b>';
				exit;
			}
			
			if (move_uploaded_file($from, $to)){
				$status = 1;
			}
			else $err .= $ccT_msg['upload']['unknownError'];
		}
	}
}

if (!$status){
	if (strlen($err) > 0)
	echo "<h4>$err</h4>";
}
else{
	$url = $remote_root.$folder.$_FILES["userFile"]["name"];
	if($file_type == 'image'){
		$output .= '<h2>'.$ccT_msg['upload']['uploadedTitle'].'</h2> ';
		$output .= "<a href='".$url."'><img src='".$url."' height=100 /></a><p>".$ccT_msg['upload']['includeCode']."</p><form name='tiddlyCode' ><input type=text name='code' id='code' onclick='this.focus();this.select();' cols=90 rows=1 value='[img[".$url."][EmbeddedImages]]' /></form>";
	}
	else{		
		$output .= "<a href='".$url."'/>".$url."</a>";	
	}
echo $output;
}

?>	