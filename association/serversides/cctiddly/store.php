<?php
	include_once("includes/header.php");
/***
 * store.php - upload a file in this directory
 * version :1.4.3 - 2006/10/17 - BidiX@BidiX.info
 * 
 * see : 
 *	http://tiddlywiki.bidi.info/#UploadPlugin for usage
 *	http://www.php.net/manual/en/features.file-upload.php 
 *		for details on uploading files
 * usage : 
 *	POST  
 *		UploadPlugin[backupDir=<backupdir>;user=<user>;password=<password>;uploadir=<uploaddir>]
 *		userfile <file>
 *	GET
 *
 * Revision history
 * V 1.4.3 - 2006/10/17 
 * Test if $filename.lock exists for GroupAuthoring compatibility
 * return mtime, destfile and backupfile after the message line
 * V 1.4.2 - 2006/10/12
 *  add error_reporting(E_PARSE);
 * v 1.4.1 - 15/03/2006
 *	add chmo 0664 on the uploadedFile
 * v 1.4 - 23/02/2006 :
 * 	add uploaddir option :  a path for the uploaded file relative to the current directory
 *	backupdir is a relative path
 *	make recusively directories if necessary for backupDir and uploadDir
 * v 1.3 - 17/02/2006 :
 *	presence and value of user are checked with $USERS Array (thanks to PauloSoares)
 * v 1.2 - 12/02/2006 : 
  *	POST  
 *		UploadPlugin[backupDir=<backupdir>;user=<user>;password=<password>;]
 *		userfile <file>
*	if $AUTHENTICATE_USER
 *		presence and value of user and password are checked with 
 *		$USER and $PASSWORD
 * v 1.1 - 23/12/2005 : 
 *	POST  UploadPlugin[backupDir=<backupdir>]  userfile <file>
 * v 1.0 - 12/12/2005 : 
 *	POST userfile <file>
 *
 * Copyright (c) BidiX@BidiX.info 2005-2006
 ***/


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
			<p>store.php V 1.4.3
			<p>BidiX@BidiX.info
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p align="center">This page is designed to upload a <a href="http://www.tiddlywiki.com/">TiddlyWiki<a>.</p>
			<p align="center">for details see : <a href="http://TiddlyWiki.bidix.info/#HowToUpload">TiddlyWiki.bidix.info/#HowToUpload<a>.</p>	
		</body>
	</html>
	<?php
}
else {
	/*
	 * POST Request
	 */
	//echo "debug mode \n\n";
	// var definitions
	$optionStr = formatParametersPOST($_POST['UploadPlugin']);
	$optionArr=explode(';',$optionStr);
	$options = array();
	
	// get options
	foreach($optionArr as $o) {
		list($key, $value) = split('=', $o);
		$options[$key] = $value;
	}
	
	// authenticate User
	$user = user_create($options['user'],"",0,"",user_encodePassword($options['password']));
	if( !tiddler_privilegeMiscCheck($user, "upload") )
	{
		exit($ccT_msg['warning']['not_authorized']);
	}
	
	//upload file will be left in temp directory and access it from there
	$fileData = file_get_contents($_FILES['userfile']['tmp_name']);
	if( $fileData === FALSE )
	{
		exit($ccT_msg['uploadPlugin']['file_open_error']);
	}
	
	//grab storeArea and break it down into array
	$fileData =substr( $fileData, strpos($fileData,'<div id="storeArea">')+strlen('<div id="storeArea">') );
	$fileData = tiddler_htmlToArray($fileData);
	
	$output = "";	//output string
	$error = 0;
	
	$output .= "<table border=\"1\"><tr><th>".$ccT_msg['import']['title']."</th>
			<th>".$ccT_msg['import']['action']."</th>
			<th>".$ccT_msg['import']['result']."</th>
			<th>".$ccT_msg['import']['error']."</th></tr>";
		
	//convert HTML to array form and insert into DB
	//WARNING: everything will be overwritten so beware
	foreach( $fileData as $r )
	{
		if( !in_array($r['title'],$tiddlyCfg['pref']['uploadPluginIgnoreTitle']) )
		{
			$tiddler = tiddler_selectTitle(tiddler_create($r['title']));
			$ntiddler = tiddler_create($r['title'], $r['body'],$r['modifier'],$r['modified'],$r['tags'],"","",$r['created'],$r['fields']);

			if( sizeof($tiddler)>0 )
			{
				$action = "update";
				$result = updateTiddler($user, $ntiddler, $tiddler);
			}else{
				$action = "insert";
				$result = insertTiddler($user,$ntiddler);
			}
			$output .= "\n<tr><td>".$ntiddler['title']."</td>";
			$output .= "<td>".$action."</td>";
			if( strcmp($result,"001")==0 || strcmp($result,"002")==0 )
			{
				$output .= "<td>".$ccT_msg['import']['success']."</td>";
				$output .= "<td>&nbsp;</td>";
			}else{
				$output .= "<td>".$ccT_msg['import']['failed']."</td>";
				$output .= "<td>".db_error()."</td>";
				$error++;
			}
			$output .= "</tr>";
		}
	}
	$output .= "</table>";
	print $error.$output;
}
?> 