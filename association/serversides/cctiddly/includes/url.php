<?php 
// confirm instance name 
if ($_REQUEST['instance']) 
	$tiddlyCfg['pref']['instance_name'] = $_REQUEST['instance'];
else 	
 	$tiddlyCfg['pref']['instance_name'] = str_replace('/', '', str_replace('/index.php', '', $_SERVER["REDIRECT_URL"])); 

// build up the string for the base folder. 
//echo $tiddlyCfg['pref']['base_folder'] =$url[$tiddlyCfg['pref']['instance_pos']-1]; 
$tiddlyCfg['pref']['base_folder'] = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
// build up the string for the uploads directory 
$tiddlyCfg['pref']['upload_dir'] = $_SERVER['DOCUMENT_ROOT'].'/'.$tiddlyCfg['pref']['base_folder'].'/uploads/';  // location of the file upload directory - assumes is it under the root folder 

if (stristr($_SERVER['REDIRECT_URL'], 'msghandle.php'))
{
	include('./msghandle.php');
	exit;
}

$_SERVER['PHP_SELF']=    $_SERVER['SERVER_NAME'] .'/'.$tiddlyCfg['pref']['base_folder'].'/'.$instance.'/';

$file_location  =  $tiddlyCfg['pref']['upload_dir'].str_replace('/'.$tiddlyCfg['pref']['folder'].'/', '', $_SERVER['REDIRECT_URL']);   // create url to file 
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