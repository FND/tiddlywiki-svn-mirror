<?php 



$max_file_size = 233300000;
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
$err = ""; $status = 0;
if (isset($_FILES["userfile"])) 
{
 if (check_vals()) 
  {
  
  
  if (($_FILES["userfile"]["type"] == "image/gif") || ($_FILES["userfile"]["type"] == "image/jpeg")|| ($_FILES["userfile"]["type"] == "image/pjpeg"))
   {
  $upload_dir = 'uploads/images';   

   } 
   else
   {
      $upload_dir = 'uploads/other';

   }
   

  
  
    if (filesize($_FILES["userfile"]["tmp_name"]) > $max_file_size)
 	{
		$err .= "Maximum file size limit: $max_file_size bytes";
    }
	else 
    {
  // if (move_uploaded_file($_FILES["userfile"]["tmp_name"], $upload_dirs[$_POST["path"]]["dir"].$_FILES["userfile"]["name"])) 
      if (move_uploaded_file($_FILES["userfile"]["tmp_name"], "/Applications/xampp/xamppfiles/htdocs/cctw5/".$upload_dir.$_FILES["userfile"]["name"])) 
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
	$output =  $_SERVER['SERVER_NAME']."/"	.$upload_dir."/".$_FILES["userfile"]["name"]."&quot; was successfully uploaded.</h4>";
	$url= 'http://'.$_SERVER['SERVER_NAME']."/".$upload_dir."/".$_FILES["userfile"]["name"];
  
	if($upload_dir == 'uploads/images' )  
	{
		$output .= "<img src='http://".$_SERVER['SERVER_NAME'].'/upload/'.$upload_dirs[$_POST["path"]]["dir"].$_FILES["userfile"]["name"]."' /><p>";
		$output .= ' You can include this image into a tiddlywiki using the code below : ';
		$output .= '[img['.$url.'][EmbeddedImages]]';
	}

  
	if($upload_dir == 'uploads/other')  
	{
		$output .= ' <br />You can view the uploaded file at the url  below : <br /> ';
		$output .= "<a href=".$url." target=new_window>".$url."</a>";
	}
	echo $output;
//	  header( 'Location:'.$url ) ;  
}

?>