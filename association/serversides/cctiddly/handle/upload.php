<?php 

$cct_base = "../";
include_once($cct_base."includes/header.php");




if(!user_session_validate())
{
	sendHeader("403");
	echo '<b>You do not appear to be logged in. You may need to refresh the page to recieve the login prompt.</b>';
	exit;	
}

if (!user_isAdmin($user['username'], $_POST['workspaceName']))
{
	sendHeader("401");
	echo '<b> You do not have permissions to upload files, please contact your system administrator.</b>';
	exit;
}


function makeFolder($path)
{
	if(!file_exists($path))
	{
		mkdir($path, 0700, true);
	}
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




$local_root = $_SERVER['DOCUMENT_ROOT'].dirname(dirname($_SERVER['SCRIPT_NAME']));
$remote_root = dirname(getURL());
$folder = str_replace("../", "","/uploads".$folder.'/'.$_POST['ccPath']."/");
makeFolder($local_root.$folder);





if ($_POST['ccHTMLName'] || $_POST['ccHTML'])
{
	if (!$_POST['ccHTMLName'] || !$_POST['ccHTML'])
	{
		sendHeader("402");
		echo "Please specify a file name or provide HTML";
		exit;
	}
	
	
	$ext = end(explode(".", $_POST['ccHTMLName']));
	$ext =  strtolower($ext);


	$allowed_ext = array("txt", "html", "rss", "xml", "js");

	if (in_array($ext, $allowed_ext))
	{
		$file = $_POST['ccHTMLName'];
	}else
	{
		echo "You are not allowed to crate files of that type.";
		exit;
	}
	
	
	 $myFile = $local_root.$folder.$file;
	$fh = fopen($myFile, 'w') or die("can't open file");

	if(fwrite($fh, $_POST['ccHTML']))
	{
		sendHeader("201");
		$url = $remote_root.$folder.$_POST['ccHTMLName'];
		echo "click here to view it <a href='".$url."'>".$url."</a>";
		exit;
	}
	fclose($fh);	

	
	
}




$err = ""; 
$status = 0;

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
		
		$upload_dir = $folder;
	
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
	$url = $remote_root.$folder.$_FILES["userFile"]["name"];
	if($file_type == 'image')  
	{
	
		$output .= '<h2>Image Uploaded</h2> ';
		$output .= "<a href='".$url."'><img src='".$url."' height=100 /></a><p>You can include this image into a tiddlywiki using the code below : </p><form name='tiddlyCode' ><input type=text name='code' id='code' onclick='this.focus();this.select();' cols=90 rows=1 value='[img[".$url."][EmbeddedImages]]' /></form>";
	}
	else
	{		
		$output .= "<a href='".$url."'/>".$url."</a>";	
	}
echo $output;
}

?>	