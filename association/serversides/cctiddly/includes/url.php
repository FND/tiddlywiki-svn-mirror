<?php 
$tiddlyCfg['pref']['base_folder'] = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
debug("base folder: ".$tiddlyCfg['pref']['base_folder']);
debug("request-workspace: ".$_REQUEST['workspace']);
debug("QUERY_STRING: ".$_SERVER['QUERY_STRING']);
// confirm workspace name 
if (isset($_REQUEST['workspace'])) 
{
		$tiddlyCfg['workspace_name'] = $_REQUEST['workspace'];
		$workspace = $_REQUEST['workspace'];  /// TODO : THESE SHOULD BE REDUCED TO ONE VAR
		
}
else 	
{
	 	$temp = str_replace('/', '', str_replace('/index.php', '', $_SERVER["REDIRECT_URL"])); 
		$tiddlyCfg['workspace_name'] = str_replace(str_replace("/", "", $tiddlyCfg['pref']['base_folder']), "", $temp);
		$workspace= $tiddlyCfg['workspace_name']; // TODO : THESE SHOULD BE REDUCED TO ONE VAR
		debug("workspace name IS : ".$tiddlyCfg['workspace_name']);
}

// build up the string for the uploads directory 
	$tiddlyCfg['pref']['upload_dir'] = $_SERVER['DOCUMENT_ROOT'].$tiddlyCfg['pref']['base_folder'].'/uploads/';  // location of the file upload directory - assumes is it under the root folder 
//header("HTTP/1.0 404 Not Found");
debug('REDIRECT_URL: '.$_SERVER['REDIRECT_URL']);
//exit("see");
if (isset($_SERVER['REDIRECT_URL']) )
{
	if (stristr($_SERVER['REDIRECT_URL'], 'msghandle.php')) {
		include('./msghandle.php');
		exit;
	}
	$redirect_url = $_SERVER['REDIRECT_URL'];
}	

//$_SERVER['PHP_SELF']=    $_SERVER['SERVER_NAME'] .'/'.$tiddlyCfg['pref']['base_folder'].'/'.$workspace.'/';
$file_location  =  $tiddlyCfg['pref']['upload_dir'].str_replace('/'.$tiddlyCfg['pref']['folder'].'/', '', $redirect_url);   // create url to file 
//$file_url = '/'.$tiddlyCfg['pref']['folder'].'/upload/'.$workspace.''.$_SERVER['SCRIPT_NAME'];

if(@file($file_location))
{
	readfile($file_location);
	exit;
}
else
{
	//	echo 'file not found';
} 

?>