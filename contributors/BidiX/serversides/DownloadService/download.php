<?php
//{{{
/***
 * download.php - download an html file as an attachement. 
 * version:1.1.1 - 2008/08/22 - BidiX@BidiX.info
 * source: http://tiddlywiki.bidix.info/#download.php
 * license: BSD open source license (http://tiddlywiki.bidix.info/#[[BSD open source license]])
 *
 * Simply put [[download|download.php?]] in your TiddlyWiki viewed over http to download it in one click*.
 *	* If it is named index.html 
 * usage :
 *			http://host/path/to/download.php[?file=afile.html|?help]
 *				afile.html : for security reason, must be a file with an .html suffix
 *				?file=afile.html : if not specified index.html is used
 *				?help : display the "usage" message
 * 
 *	each external javascript file is included in the downloaded file
 ***/

function display($msg) {
	?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
	<html>
		<head>
			<meta http-equiv="Content-Type" content="text/html;charset=utf-8" >
			<title>BidiX.info - TiddlyWiki - download script</title>
		</head>
		<body>
			<p>
			<p>download.php V 1.1.0
			<p>BidiX@BidiX.info
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p>&nbsp;</p>
			<p align="center"><?=$msg?></p>
			<p align="center">Usage : http://<?=$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF']?>[?file=<i>afile.html</i>]. If no file is specified uses index.html</p>	
			<p align="center">for details see : <a href="http://TiddlyWiki.bidix.info/#download.php">TiddlyWiki.bidix.info/#download.php<a>.</p>	
		</body>
	</html>
	<?php
	return;
}

/*
 * Recusrsively for each external javascript
 *		- Insert a comment : DOWNLOAD-INSERT-FILE
 *		- insert the content of the file 
 */

function insertJSFileIn($content) {
	
	// if (preg_match ('<script\s+type=\"text\/javascript\"\s+src=\"')) {
	if (preg_match ('/<script\s+type=\"text\/javascript\"\s+src=\"/ms', $content)) {
		if (preg_match ('/^(.*?)<script\s+type=\"text\/javascript\"\s+src=\"(.+?)\"\s*>\s*<\/script>(.*)$/ms', $content,$matches)) {
			$front = $matches[1];
			$js = $matches[2];
			$tail = $matches[3];
			$jsContent = "<!--DOWNLOAD-INSERT-FILE:\"$js\"--><script type=\"text/javascript\">" . 
				file_get_contents ($js) . 
				"\n</script>";
			$tail = insertJSFileIn($tail);
			return($front.$jsContent.$tail);
		}
	}
	return $content;
}

/*
 * Main
 */

// help command
if (array_key_exists('help',$_GET)) {
	display('');
	exit;
}
// file command
$filename = $_GET['file'];
if ($filename == "") {
	$filename='index.html';
}
if (!preg_match('/\.html$/',$filename )) {
	display("The file $filename could not be downloaded. Only .html file are allowed.");
	exit;
}if (!is_file($filename)) {
	display("The file $filename could not be found.");
	exit;
}
$content = insertJSFileIn(file_get_contents ($filename));	

//return the file
header('Pragma: private');
header('Cache-control: private, must-revalidate');
header('Content-type: text/html');
header('Content-Disposition: attachment; filename='.$filename);
echo($content);	
//}}}
?>