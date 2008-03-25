<?php 

$cct_base = "../";
include_once($cct_base."includes/header.php");

if(!user_session_validate())
{
	sendHeader("403");
	echo '<b>You do not appear to be logged in</b>';
	exit;	
}

if (!user_isAdmin($user['username'], $tiddlyCfg['workspace_name']))
{
	sendHeader("401");
	echo '<b> You do not have permissions to upload files, please contact your system administrator.</b>';
	exit;
}

function check_vals()
{
	global $upload_dirs, $err;
	if (!ini_get("file_uploads")) 
	{
			sendHeader("405");
		$err .= "HTTP file uploading is blocked in php configuration file (php.ini). Please, contact to server administrator."; return 0; 
	}
	$pos = strpos(ini_get("disable_functions"), "move_uploaded_file");
	if ($pos !== false) 
	{
			sendHeader("405");
	$err .= "PHP function move_uploaded_file is blocked in php configuration file (php.ini). Please, contact to server administrator."; return 0; 
	}

  	if (!isset($_FILES["userFile"])) 
  	{
  		$err .= "No file recieved, please check it was "; return 0;
  	}
  	elseif (!is_uploaded_file($_FILES['userFile']['tmp_name'])) {
  		$err .= "Empty file"; return 0; 
  	}
	return 1;
}



if ($_POST['saveTo'] == 'workspace')
{
	if  ($_POST['workspaceName'] !== "")
	{
		$folder = "/workspace/".$_POST['workspaceName'];
	}else
	{
		$folder = "/workspace/default";
	}
}
elseif ($_POST['saveTo'] == 'user')
{
 	$folder = "/user/".$_POST['username'];
}
else
{
	echo "<p>Please specify where you wish to save this file</p>";
}


if (!$_POST['ccHTMLname'] || !$_POST['ccHTML'])
{
	if ($_POST['ccHTMLname'] || $_POST['ccHTML'])
	{
		sendHeader("402");
		echo "Please specify a file name or provide HTML";
		exit;
	}
}

$local_root = $_SERVER['DOCUMENT_ROOT'].dirname(dirname($_SERVER['SCRIPT_NAME']));
$remote_root = dirname(getURL());
$folder = "/uploads".$folder;
$file = $_POST['ccHTMLname'].".html";

if(!file_exists($local_root.$folder))
{
	mkdir($local_root.$folder, 0700, true);
}

$myFile = $local_root.$folder.$file;
$fh = fopen($myFile, 'w') or die("can't open file");

if(fwrite($fh, $_POST['ccHTML']))
{
	sendHeader("201");
	$uploaded_file = str_replace('/handle/upload.php', '', getURL()).str_replace("..", "", $myFile); 
	echo "click here to view it <a href='".$uploaded_file."'>".$uploaded_file."</a>";
}
fclose($fh);	

$err = ""; $status = 0;
if (isset($_FILES["userFile"])) 
{
	if (check_vals()) 
	{
		if (($_FILES["userFile"]["type"] == "image/gif") || ($_FILES["userFile"]["type"] == "image/jpeg")|| ($_FILES["userFile"]["type"] == "image/pjpeg"))
		{
			$file_type = 'image';
		}
		else if(($_FILES["userFile"]["type"] == "text/plain")||($_FILES["userFile"]["type"] == "text/xml")||($_FILES["userFile"]["type"] == "text/html"))
		{
			$file_type = 'text';
		}else
		{
			echo '<b>File Type not supported</b>';
			exit;
		}
		
		$upload_dir = $folder;a
	
		if (filesize($_FILES["userFile"]["tmp_name"]) > $tiddlyCfg['max_file_size'])
		{
			sendHeader("400");
			$err .= "Maximum file size limit: ".$tiddlyCfg['max_file_size']." bytes";
		}
		else 
		{
			$from =  $_FILES["userFile"]["tmp_name"];
			$to = $local_root.$folder."/".$_FILES["userFile"]["name"];
			if(file_exists($to))
			{
				echo '<b>file already exists.  Please try again with a different file name.</b>';
				exit;
			}
			
			if (move_uploaded_file($from, $to))
			{
				$status = 1;
			}
			else $err .= "There are some errors!";
		}
	}
}

if (!$status) 
{
	if (strlen($err) > 0)
	echo "<h4>$err</h4>";
}
else 
{
 	$url = $remote_root.$folder."/".$_FILES["userFile"]["name"];	
	if($file_type == 'image')  
	{
		$output .= '<h2>Image Uploaded</h2> You can include this image into a tiddlywiki using the code below : <p>';
		$output .= "<img src='".$url."' height=100 col=1/><form name='tiddlyCode' id='tiddlyCode'><textarea name='code ' id='code' onclick='document.tiddlyCode.code.focus();document.tiddlyCode.code.select();' cols=90>[img[".$url."][EmbeddedImages]]</textarea>";
	}
	else
	{		
		$output .= "<a href='".$url."'/>".$url."</a>";	
	}
echo $output;
}

?>	