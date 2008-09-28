<?php
$url = parse_url(getURL());
$filename = $tiddlyCfg['pref']['upload_dir']."workspace/".$tiddlyCfg['workspace_name'];
$file_extension = strtolower(substr(strrchr($filename,"."),1));

if(is_file($filename)){	
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

?>