<?php 


$cct_base = "../";
include_once($cct_base."includes/header.php");


function check_vals()
{
	global $upload_dirs, $err;
	if (!ini_get("file_uploads")) 
	{
		$err .= "HTTP file uploading is blocked in php configuration file (php.ini). Please, contact to server administrator."; return 0; 
	}
	$pos = strpos(ini_get("disable_functions"), "move_uploaded_file");
	if ($pos !== false) 
	{
	$err .= "PHP function move_uploaded_file is blocked in php configuration file (php.ini). Please, contact to server administrator."; return 0; 
	}

  	if (!isset($_FILES["userfile"])) 
  	{
  		$err .= "Empty file"; return 0;
  	}
  	elseif (!is_uploaded_file($_FILES['userfile']['tmp_name'])) {
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
 	$folder = "/user/".$_POST['ccUsername'];
}
else
{
	echo "<p>Please specify where you wish to save this file</p>";
}


if (!$_POST['ccHTMLname'] || !$_POST['ccHTML'])
{
	if ($_POST['ccHTMLname'] || $_POST['ccHTML'])
	{
		echo "Please specify a file name or provide HTML";
		exit;
	}
}
$folder = "".$folder."/";
$file = $_POST['ccHTMLname'].".html";

if(!file_exists($folder))
{
	echo 'making folder ';
	mkdir($folder, 0700, true);
}

$myFile = $folder.$file;
$fh = fopen($myFile, 'w') or die("can't open file");

if(fwrite($fh, $_POST['ccHTML']))
{
	echo 'File Created </br>';
	$uploaded_file = str_replace('/handle/upload.php', '', getURL()).str_replace("..", "", $myFile); 
	echo "click here to view it <a href='".$uploaded_file."'>".$uploaded_file."</a>";
}
fclose($fh);	



$err = ""; $status = 0;
if (isset($_FILES["userfile"])) 
{
	if (check_vals()) 
	{
		if (($_FILES["userfile"]["type"] == "image/gif") || ($_FILES["userfile"]["type"] == "image/jpeg")|| ($_FILES["userfile"]["type"] == "image/pjpeg"))
		{
			$file_type = 'image';
		}
		else if(($_FILES["userfile"]["type"] == "text/plain")||($_FILES["userfile"]["type"] == "text/xml")||($_FILES["userfile"]["type"] == "text/html"))
		{
			$file_type = 'text';
		}else
		{
			echo '<b>File Type not supported</b>';
			exit;
		}
		
		
		$upload_dir = $folder;
	
		if (filesize($_FILES["userfile"]["tmp_name"]) > $tiddlyCfg['max_file_size'])
		{
			$err .= "Maximum file size limit: ".$tiddlyCfg['max_file_size']." bytes";
		}
		else 
		{
			$from =  $_FILES["userfile"]["tmp_name"];
			$to = "/Applications/xampp/xamppfiles/htdocs/rel/uploads".$upload_dir.$_FILES["userfile"]["name"];
			if (move_uploaded_file($from, $to))
			{
		//		$chmod_result = chmod ($to, 0700);
				$status = 1;
			}
			else $err .= "There are some errors!";
		}
	}
}

echo "<h1>".$file_type."</h1>";

if (!$status) 
{
	if (strlen($err) > 0)
		echo "<h4>$err</h4>";
}
else 
{
	
	
 	$url = dirname(getURL()).'/uploads/'.$upload_dir.$_FILES["userfile"]["name"];
	
	if($file_type == 'image')  
	{
		$output .= "<img src='".$url."' height=100/><p>";
		$output .= ' You can include this image into a tiddlywiki using the code below : ';
		$output .= '[img['.$url.'][EmbeddedImages]]';
	}
	else
	{		
		$output .= "<a href='".$url."'/>".$url."</a>";	
	}

echo $output;
}

?>	