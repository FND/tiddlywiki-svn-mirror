<?php
//allows files in the uploods/workpspace/WORKSPACENAME/FILE.blah folder can appear as simply /WORKSPACENAME/FILE.blah 

// Return Tiddler 
$filename = $tiddlyCfg['pref']['upload_dir']."tiddlers/".$tiddlyCfg['workspace_name']."";
error_log($filename);
if(is_file($filename)){	
	$file_extension = strtolower(substr(strrchr($filename,"."),1));
	switch ($file_extension) {
		case "pdf": $ctype="application/pdf"; break;
		case "zip": $ctype="application/zip"; break;
		case "doc": $ctype="application/msword"; break;
		case "xls": $ctype="application/vnd.ms-excel"; break;
		case "ppt": $ctype="application/vnd.ms-powerpoint"; break;
		case "gif": $ctype="image/gif"; break;
		case "png": $ctype="image/png"; break;
		case "jpe":$ctype="image/jpg"; break;
		case "jpeg":$ctype="image/jpg"; break;
		case "jpg": $ctype="image/jpg"; break;
	}
	header("Content-Type: $ctype");
	header("Content-Length: ".@filesize($filename));
	readfile($filename);
	exit;
}


// Return SiteMap 

if($_SERVER["REQUEST_URI"] == "/".$_SERVER["SERVER_NAME"]."-sitemap.xml")
{
	include(getcwd()."/plugins/seo/files/sitemap.php");
	exit;
}

?>