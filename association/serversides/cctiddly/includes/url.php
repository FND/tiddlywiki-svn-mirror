<?php 

// confirm instance name 
if ($_REQUEST['instance'])
{	
	$instance = $_REQUEST['instance'];
}
else
{	$url = split('/', $_SERVER['REDIRECT_URL']);
	$instance =  $url[$tiddlyCfg['pref']['instance_pos']];
}

if ($instance == '')  
{
	$instance = 'home';
}





// build up the string for the base folder. 
//echo $tiddlyCfg['pref']['base_folder'] =$url[$tiddlyCfg['pref']['instance_pos']-1]; 
$tiddlyCfg['pref']['base_folder'] = str_replace('/index.php', '', $_SERVER["SCRIPT_NAME"]);
// build up the string for the uploads directory 
$tiddlyCfg['pref']['upload_dir'] = $_SERVER['DOCUMENT_ROOT'].'/'.$tiddlyCfg['pref']['base_folder'].'/uploads/';  // location of the file upload directory - assumes is it under the root folder 
$tiddlyCfg['pref']['instance_name'] = $instance;  

if (stristr($_SERVER['REDIRECT_URL'], 'msghandle.php'))
{
	include('./msghandle.php');
	exit;
}

$_SERVER['PHP_SELF']= '/'.$tiddlyCfg['pref']['base_folder'].'/'.$instance.'/';

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