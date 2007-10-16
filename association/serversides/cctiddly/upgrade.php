<?php
/**
	This upgrade does the following
ALTER TABLE `tiddly_wiki_entry`  DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci
change individual field to utf8
change tag length in backup table to 255
*/

	include_once("./includes/header.php");
	
?>
<html><title><?php print $ccT_msg['upgrade']['upgrade_script']?> (v1.0 -> v1.1 beta)</title><body>
<?php
//////////////////////////////////////////////////warning message/////////////////////////////////////
	if( !isset($_GET['ok']) )
	{
		print $ccT_msg['upgrade']['warning'];
?>
<form method="get" action="<?php print $_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']?> ">
<input type="submit" value="<?php print $ccT_msg['upgrade']['continue']?>" name="ok">
</form>
<?php
	}else{
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
			exit( $ccT_msg['db']['create'].": ".mysql_error() );
		}

		//construct query
		if( $tiddlyCfg['pref']['utf8']==1 )
		{
			//TW table
			$query[] = "ALTER TABLE ".$tiddlyCfg['table']['name']." ADD `fields` TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL";
			
			//backup table
			$query[] = "ALTER TABLE ".$tiddlyCfg['table']['backup']." ADD `fields` TEXT CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL";
		}else{
			//TW table
			$query[] = "ALTER TABLE ".$tiddlyCfg['table']['name']." ADD `fields` TEXT NOT NULL";
			
			//backup table
			$query[] = "ALTER TABLE ".$tiddlyCfg['table']['backup']." ADD `fields` TEXT NOT NULL";
		}
		
		//run query
		$error=0;
		foreach($query as $q)
		{
			if( mysql_query($q)===FALSE ) {
				print $ccT_msg['msg']['query'].$q.'<br>'.$ccT_msg['msg']['error'].mysql_error()."<br><br>";
				$error++;
			}
		}

		if( $error>0 )
			print $error.$ccT_msg['upgrade']['error'];
		else
			print '<br>'.$ccT_msg['upgrade']['success'].'('.$tiddlyCfg['table']['name'].' & '.$tiddlyCfg['table']['backup'].')';
		print '<br>'.$ccT_msg['upgrade']['back'];
	}
?>
</body></html>