<?php 

$tiddlyCfg['pref']['base_folder'] = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);



// confirm instance name 
if (isset($_REQUEST['instance'])) 
{
		$tiddlyCfg['pref']['instance_name'] = $_REQUEST['instance'];
}
else 	
{
	 	 $temp = str_replace('/', '', str_replace('/index.php', '', $_SERVER["REDIRECT_URL"])); 
		$tiddlyCfg['pref']['instance_name'] = str_replace(str_replace("/", "", $tiddlyCfg['pref']['base_folder']), "", $temp);
}

// build up the string for the uploads directory 
$tiddlyCfg['pref']['upload_dir'] = $_SERVER['DOCUMENT_ROOT'].'/'.$tiddlyCfg['pref']['base_folder'].'/uploads/';  // location of the file upload directory - assumes is it under the root folder 

if (isset($_SERVER['REDIRECT_URL']) )
{
	if (stristr($_SERVER['REDIRECT_URL'], 'msghandle.php')) {
		include('./msghandle.php');
		exit;
	}
	$redirect_url = $_SERVER['REDIRECT_URL'];
}	

//$_SERVER['PHP_SELF']=    $_SERVER['SERVER_NAME'] .'/'.$tiddlyCfg['pref']['base_folder'].'/'.$instance.'/';

$file_location  =  $tiddlyCfg['pref']['upload_dir'].str_replace('/'.$tiddlyCfg['pref']['folder'].'/', '', $redirect_url);   // create url to file 
//$file_url = '/'.$tiddlyCfg['pref']['folder'].'/upload/'.$instance.''.$_SERVER['SCRIPT_NAME'];

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