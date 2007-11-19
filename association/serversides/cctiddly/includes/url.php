<?php 


/// CODE ADDED BY SIMONMCMANUS /////////////////////////////////////

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



$tiddlyCfg['pref']['instance_name'] = $instance;  
$_SERVER['PHP_SELF']= '/svn/'.$instance.'/';



// MAPPING FOR THE UPLOAD DIRECTORY   //////?




//if (is_file($file_location))
//{
//	readfile($file_location);
//	exit;
//}


$file_location  =  $tiddlyCfg['pref']['upload_dir'].str_replace('/'.$tiddlyCfg['pref']['folder'].'/', '', $_SERVER['REDIRECT_URL']);   // create url to file 
//$file_url = '/'.$tiddlyCfg['pref']['folder'].'/upload/'.$instance.''.$_SERVER['SCRIPT_NAME'];

if(file($file_location))
{
	readfile($file_location);
	exit;
}

//  END OF MAPPING FOR FILE UPLOADS  

?>