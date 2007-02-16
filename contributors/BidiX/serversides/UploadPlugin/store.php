<?php
/***
! User settings
Edit these lines according to your need
***/
//{{{
$AUTHENTICATE_USER = true;	// true | false
$USERS = array(
	'UserName1'=>'Password1', 
	'UserName2'=>'Password2', 
	'UserName3'=>'Password3'); // set usernames and strong passwords
$DEBUG = false;				// true | false
error_reporting(E_ERROR | E_WARNING | E_PARSE);
//}}}
/***
!Code
No change needed under
***/
//{{{

/***
 * store.php - upload a file in this directory
 * version :1.5.2 - 2007/02/13 - BidiX@BidiX.info
 * 
 * see : 
 *	http://tiddlywiki.bidi.info/#UploadPlugin for usage
 *	http://www.php.net/manual/en/features.file-upload.php 
 *		for détails on uploading files
 * usage : 
 *	POST  
 *		UploadPlugin[backupDir=<backupdir>;user=<user>;password=<password>;uploadir=<uploaddir>;[debug=1];;]
 *		userfile <file>
 *	GET
 *
 * Revision history
 * V1.5.2 - 2007/02/13
 * Enhancement: Add optional debug option in client parameters
 * V1.5.1 - 2007/02/01
 * Enhancement: Check value of file_uploads in php.ini. Thanks to Didier Corbière
 * V1.5.0 - 2007/01/15
 * Correct: a bug in moving uploadFile in uploadDir thanks to DaniGutiérrez for reporting
 * Refactoring
 * V 1.4.3 - 2006/10/17 
 * Test if $filename.lock exists for GroupAuthoring compatibility
 * return mtime, destfile and backupfile after the message line
 * V 1.4.2 - 2006/10/12
 *  add error_reporting(E_PARSE);
 * v 1.4.1 - 2006/03/15
 *	add chmo 0664 on the uploadedFile
 * v 1.4 - 2006/02/23
 * 	add uploaddir option :  a path for the uploaded file relative to the current directory
 *	backupdir is a relative path
 *	make recusively directories if necessary for backupDir and uploadDir
 * v 1.3 - 2006/02/17
 *	presence and value of user are checked with $USERS Array (thanks to PauloSoares)
 * v 1.2 - 2006/02/12 
  *	POST  
 *		UploadPlugin[backupDir=<backupdir>;user=<user>;password=<password>;]
 *		userfile <file>
*	if $AUTHENTICATE_USER
 *		presence and value of user and password are checked with 
 *		$USER and $PASSWORD
 * v 1.1 - 2005/12/23 
 *	POST  UploadPlugin[backupDir=<backupdir>]  userfile <file>
 * v 1.0 - 2005/12/12 
 *	POST userfile <file>
 *
 * Copyright (c) BidiX@BidiX.info 2005-2007
 ***/
//}}}

//{{{

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
	/*
	 * GET Request
	 */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
		<title>BidiX.info - TiddlyWiki UploadPlugin - Store script</title>
	</head>
	<body>
		<p>
		<p>store.php V 1.5.2
		<p>BidiX@BidiX.info
		<p>&nbsp;</p>
		<p>&nbsp;</p>
		<p>&nbsp;</p>
		<p align="center">This page is designed to upload a <a href="http://www.tiddlywiki.com/">TiddlyWiki<a>.</p>
		<p align="center">for details see : <a href="http://TiddlyWiki.bidix.info/#HowToUpload">TiddlyWiki.bidix.info/#HowToUpload<a>.</p>	
	</body>
</html>
<?php
exit;
}

/*
 * POST Request
 */
	 
// Recursive mkdir
function mkdirs($dir) {
	if( is_null($dir) || $dir === "" ){
		return false;
	}
	if( is_dir($dir) || $dir === "/" ){
		return true;
	}
	if( mkdirs(dirname($dir)) ){
		return mkdir($dir);
	}
	return false;
}

function toExit() {
	global $DEBUG, $filename, $backupFilename, $options;
	if ($DEBUG) {
		echo ("\nHere is some debugging info : \n");
		echo("\$filename : $filename \n");
		echo("\$backupFilename : $backupFilename \n");
		print ("\$_FILES : \n");
		print_r($_FILES);
		print ("\$options : \n");
		print_r($options);
}
exit;
}


// Check if file_uploads is active in php config
if (ini_get('file_uploads') != '1') {
   echo "Error : File upload is not active in php.ini\n";
   toExit();
}

// var definitions
$uploadDir = './';
$uploadDirError = false;
$backupError = false;
$optionStr = $_POST['UploadPlugin'];
$optionArr=explode(';',$optionStr);
$options = array();
$backupFilename = '';
$filename = $_FILES['userfile']['name'];
$destfile = $filename;

// get options
foreach($optionArr as $o) {
	list($key, $value) = split('=', $o);
	$options[$key] = $value;
}

// debug activated by client
if ($options['debug'] == 1) {
	$DEBUG = true;
}

// authenticate User
if (($AUTHENTICATE_USER)
	&& ((!$options['user']) || (!$options['password']) || ($USERS[$options['user']] != $options['password']))) {
	echo "Error : UserName or Password do not match \n";
	echo "UserName : [".$options['user']. "] Password : [". $options['password'] . "]\n";
	toExit();
}

// make uploadDir
if ($options['uploaddir']) {
	$uploadDir = $options['uploaddir'];
	if (! is_dir($uploadDir)) {
		mkdirs($uploadDir);
	}
	if (! is_dir($uploadDir)) {
		echo "UploadDirError : $uploadDirError - File NOT uploaded !\n";
		toExit();
	}
	if ($uploadDir{strlen($uploadDir)-1} != '/') {
		$uploadDir = $uploadDir . '/';
	}
}
$destfile = $uploadDir . $filename;

// backup existing file
if (file_exists($destfile) && ($options['backupDir'])) {
	if (! is_dir($options['backupDir'])) {
		mkdirs($options['backupDir']);
		if (! is_dir($options['backupDir'])) {
			$backupError = "backup mkdir error";
		}
	}
	$backupFilename = $options['backupDir'].'/'.substr($filename, 0, strpos($filename, '.'))
				.date('.Ymd.His').substr($filename,strpos($filename,'.'));
	rename($destfile, $backupFilename) or ($backupError = "rename error");
}

// move uploaded file to uploadDir
if (move_uploaded_file($_FILES['userfile']['tmp_name'], $destfile)) {
	chmod($destfile, 0644);
	if($DEBUG) {
		echo "Debug mode \n\n";
	}
	if (!$backupError) {
		echo "0 - File successfully loaded in " .$destfile. "\n";
	} else {
		echo "BackupError : $backupError - File successfully loaded in " .$destfile. "\n";
	}
	echo("destfile:$destfile \n");
	if (($backupFilename) && (!$backupError)) {
		echo "backupfile:$backupFilename\n";
	}
	$mtime = filemtime($destfile);
	echo("mtime:$mtime");
} 
else {
	echo "Error : " . $_FILES['error']." - File NOT uploaded !\n";

}
toExit();
//}}}
?>