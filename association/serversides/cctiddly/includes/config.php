<?php
/**
	@file
		
	@brief This holds and sort out configuration files and default configurations
*/
	//////////////////////////////////////////////////////// config file ////////////////////////////////////////////////////////
	//include default config file first before the desired config based either on config variable or URL
	//used for seamless upgrade as possible
	include_once($cct_base."config/default.php");
	//override if config variable defined
	$config="default";
	if( isset($_GET['config']) )	{
		//format (?config=) url string removing slashes
		$tmp_config = (get_magic_quotes_gpc()?stripslashes($_GET['config']):$_GET['config']);
		//remove [/,\\\\,?,*,\",',`] from string and limit string to 255 char - (,) is also removed???
		$tmp_config = substr(preg_replace("![/,\\\\,?,*,\",',`]!","",$tmp_config ),0,255);
		//use config file if exist
		if( file_exists($cct_base."config/".$tmp_config.".php") )	{
			$config = $tmp_config;
		}
	}
	
	//if config variable not defined, include config file according to hostname
	//start looking with the shortest form from the end, e.g. for "address.com", it will check "com" before checking "address.com"
	// will use the last config it found (better match)
	if( strcmp($config,"default")==0 )	{
		$host = explode(".",trim($_SERVER['HTTP_HOST']));
		$i = sizeof($host)-1;
		$tmp=$host[$i];
		while( $i>-1 )	{
			if( file_exists($cct_base."config/".$tmp.".php") )	{
				$config = $tmp;
			}
			$i--;
			if( $i>-1 )	{
				$tmp = $host[$i].".$tmp";
			}
		}
	}

	//include config if it is not default
	if( strcmp($config,"default") != 0 )
	{
		include($cct_base."config/".$config.".php");
	}

	//make sure a config files is used
	if( !isset($tiddlyCfg) )
	{
		exit("error in getting config");
	}
////////////////////////////////////////////////////////////////////////set default values////////////////////////////////////////////////////.

//$tiddlyCfg['pref']['cookies'] = $tiddlyCfg['pref']['cookies']*1000*60;		//convert time to minutes
$tiddlyCfg['table']['name'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['name'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['backup'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['backup'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['config'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['config'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['user'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['user'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['group'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['group'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['table']['privilege'] = $tiddlyCfg['table']['prefix'].$tiddlyCfg['table']['privilege'].$tiddlyCfg['table']['suffix'];
$tiddlyCfg['pref']['twFile'] = $cct_base."tiddlywiki/".$tiddlyCfg['pref']['twFile'].".js"; // plain TW file, $cct_base defined in config.php

$tiddlyCfg['version']="1.3";	
?>