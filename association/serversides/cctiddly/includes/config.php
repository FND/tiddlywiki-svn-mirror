<?php
/**
	@file
		
	@brief This holds and sort out configuration files and default configurations
*/
	//////////////////////////////////////////////////////// config file ////////////////////////////////////////////////////////
	//include default config file first before the desired config based either on config variable or URL
	//used for seamless upgrade as possible
	include_once("./config/default.php");
	
	//override if config variable defined
	if( isset($_GET['config']) )
	{
		//replace [\,/,?,*] from string and limit string to 255 char
		$tmp_config = substr(preg_replace("![/,\\\\,?,*]!","",$_GET['config']),0,255);
		if( file_exists("./config/".$tmp_config.".php") )
		{
			$config = $tmp_config;
		}else{
			$config="default";
		}
	}else{
		$config="default";
	}
	
	//if config variable not defined, include config file according to hostname
	//start looking with the shortest form from the end, e.g. for "address.com", it will check "com" before checking "address.com"
	// will use the last config it found (better match)
	if( strcmp($config,"default")==0 )
	{
		$host = explode(".",trim($_SERVER['HTTP_HOST']));
		$tmp="";
		for( $i=sizeof($host)-1; $i>-1; $i-- )
		{
			if( $i==sizeof($host)-1 ) {
				$tmp = $host[$i];
			}else{
				$tmp = $host[$i].".$tmp";
			}
			if( file_exists("./config/".$tmp.".php") )
			{
				$config = $tmp;
				//$i=-1;			//<----when enabled, this will use the first config (shortest matched name) it finds
			}
		}
	}

	//include config if it is not default
	if( strcmp($config,"default") != 0 )
	{
		include("./config/".$config.".php");
	}

	//make sure a config files is used
	if( !isset($tiddlyCfg) )
	{
		exit("error in getting config");
	}
////////////////////////////////////////////////////////////////////////set default values////////////////////////////////////////////////////.

$tiddlyCfg['table']['name'] = $tiddlyCfg['table']['pref'].$tiddlyCfg['table']['name'];
$tiddlyCfg['table']['backup'] = $tiddlyCfg['table']['pref'].$tiddlyCfg['table']['backup'];
$tiddlyCfg['version']="1.2";
	
?>