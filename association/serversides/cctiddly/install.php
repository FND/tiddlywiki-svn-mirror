<?php
/**
This is used to install the tables and database required for tiddly wiki.  Please edit the config files first though.
This file can be removed after installation
*/

	//check for forced config
	include_once("includes/header.php");
	$db_var['settings']['defaultStop'] = 0;
	$db_var['settings']['handleError'] = 0;
	$plugin_dir = "./plugins/";
	
	function install_plugin($plugin)
	{
		global $plugin_dir;
		global $ccT_msg;
		//check if title existed
		if( sizeof(tiddler_selectTitle($ccT_msg['install']['plugins'][$plugin]))==0)
		{
			//if not exist, insert into db
			$time = date("YmdHi");
			$t = tiddler_create($ccT_msg['install']['plugins'][$plugin],
				tiddler_bodyEncode(file_get_contents($plugin_dir.$plugin.".js")),
				"ccTiddly",$time,"systemConfig excludeSearch excludeLists","","ccTiddly",$time);
			//print_r($t);
			if( tiddler_insert($t,0) )
			{
				print $ccT_msg['install']['plugins'][$plugin].$ccT_msg['install']['plugins_msg']['successful'].'<br>';
			}else{
				print $ccT_msg['install']['plugins'][$plugin].$ccT_msg['install']['plugins_msg']['unsuccessful'].'<br>';
			}
		}else{
			print $ccT_msg['install']['plugins'][$plugin].$ccT_msg['install']['plugins_msg']['exist'].'<br>';
		}
	}
?>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8"/>
<title><?php print $ccT_msg['install']['cct_install']; ?></title>
</head>
<body>
<h1><?php print $ccT_msg['install']['cct_install']; ?></h1>
<?php
////////////////////////////////////////////////////////////////////////connect to db////////////////////////////////////////////////////.
	//connect to db
	$link = db_connectDB();
	if( !$link )
	{
		exit($ccT_msg['db']['connect'].": ".mysql_error());
	}
	print($ccT_msg['install']['db_connected']."<br>");

	//try use db, create if not exist
	if( db_selectDB($tiddlyCfg['db']['name'])===FALSE )
	{
		//if( mysql_create_db($tiddlyCfg['db']['name']) )
		//somehow mysql_create_db gives fatal error of function not exist
		//use mysql query instead
		print '<h3>'.$ccT_msg['install']['db_setup'].'</h3>';		//setup db
		if( db_createDB($tiddlyCfg['db']['name']) !== FALSE )
		{
	        print $ccT_msg['install']['db_created']."<br>";
			if( db_selectDB($tiddlyCfg['db']['name'])===FALSE )
			{
				exit($ccT_msg['db']['connect'].": ".mysql_error());
			}
	        //print "Tiddly database selected.<br>";
		}
		else
		{
			exit( $ccT_msg['db']['create'].": ".mysql_error() );
	    }
	}else{
		print $ccT_msg['install']['db_existed']."<br>";
	}
	
	//use UTF-8
	if( $tiddlyCfg['pref']['utf8']==1 )
	{
		if( db_query("SET NAMES 'utf8'")===FALSE )
		{
			exit($ccT_msg['word']['error'].$ccT_msg['msg']['query']."SET NAMES 'utf8'");
		}
	}
?>

<?php
////////////////////////////////////////////////////////////////////////create db////////////////////////////////////////////////////.
	//check if table exist, and create if not exist
	if( db_query("DESCRIBE ".$tiddlyCfg['table']['name'])===FALSE || db_query("DESCRIBE ".$tiddlyCfg['table']['backup'])===FALSE )
	{
		print '<h3>'.$ccT_msg['install']['table_setup'].'</h3>';
		//create tables
		$query = "CREATE TABLE ".$tiddlyCfg['table']['name']." (
		`id` int(11) NOT NULL auto_increment,
		`title` varchar(255) NOT NULL default '',
		`body` text NOT NULL,
		`fields` text NOT NULL,
		`modified` varchar(128) NOT NULL default '',
		`created` varchar(128) NOT NULL default '',
		`modifier` varchar(255) NOT NULL default '',
		`creator` varchar(255) NOT NULL default '',
		`version` int(11) NOT NULL default '0',
		`tags` varchar(255) NOT NULL default '',
		PRIMARY KEY (id)
		)
		TYPE=MyISAM";
		if( $tiddlyCfg['pref']['utf8']==1 )
		{
			$query .= "
		CHARACTER SET utf8
		COLLATE utf8_unicode_ci";
		}
		
		if( db_query($query)===FALSE )
		{
			exit($ccT_msg['msg']['error'].mysql_error());
		}
		print $tiddlyCfg['table']['name'].$ccT_msg['install']['table_created']."<br>";

		//$query = "CREATE TABLE ".$tiddlyCfg['table']['backup']." (  id int(11) NOT NULL auto_increment,  title varchar(255) NOT NULL default '',  body text NOT NULL,  modified varchar(128) NOT NULL default '',  modifier varchar(255) NOT NULL default '',  version int(11) NOT NULL default '0',  tags varchar(128) NOT NULL default '', oid INT(11) NOT NULL, PRIMARY KEY  (id)) TYPE=MyISAM;";
		$query = "CREATE TABLE ".$tiddlyCfg['table']['backup']." (
		`id` int(11) NOT NULL auto_increment,
		`title` varchar(255) NOT NULL default '',
		`body` text NOT NULL,
		`fields` text NOT NULL,
		`modified` varchar(128) NOT NULL default '',
		`modifier` varchar(255) NOT NULL default '',
		`version` int(11) NOT NULL default '0',
		`tags` varchar(255) NOT NULL default '',
		`oid` INT(11) NOT NULL,
		PRIMARY KEY (id)
		)
		TYPE=MyISAM";
		if( $tiddlyCfg['pref']['utf8']==1 )
		{
			$query .= "
		CHARACTER SET utf8
		COLLATE utf8_unicode_ci";
		}
		
		if( db_query($query)===FALSE )
		{
			exit($ccT_msg['msg']['error'].mysql_error());
		}
		print $tiddlyCfg['table']['backup'].$ccT_msg['install']['table_created']."<br>";
	}else{
		print $ccT_msg['install']['table_existed']."<br>";
	}
	
?>

<?php
////////////////////////////////////////////////////////////////////////install plugins////////////////////////////////////////////////////
	if( isset($_GET['plugins']) && isset($ccT_msg['install']['plugins'][$_GET['plugins']]) )
	{
		switch($_GET['plugins'])
		{
			case "blog":
				install_plugin("CommentPlugin");
//				install_plugin("CommentPlugin.".$tiddlyCfg['pref']['language']);
				install_plugin("CommentTabPlugin");
//				install_plugin("CommentTabPlugin.".$tiddlyCfg['pref']['language']);
				install_plugin("RecentTiddlersPlugin");
				break;
			default:
				install_plugin($_GET['plugins']);
				break;
		}
	}
?>

<h3><?php print $ccT_msg['install']['install_completed']; ?></h3>
<?php print $ccT_msg['install']['post_install'].'<br>'; ?>

<?php
///////////////////////////////////////////////////////////plugin list//////////////////////////////////////////
	print '<ul>';
	while( list($k,$v) = each($ccT_msg['install']['plugins']) )
	{
		print '<li>';
		print '<a href="'.$_SERVER['PHP_SELF'].'?config='.$config.'&plugins='.$k.'">'.$v.'</a>';
		print '</li>';
	}
	print '</ul>';
?>

<?php
	//finishes and close connection
	db_close();
?>
</body></html>

