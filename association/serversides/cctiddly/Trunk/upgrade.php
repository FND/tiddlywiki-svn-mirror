<?php 
// This script should be deleted after is has been run. 

// This script removes changecount from the fields in the database replacing it with old_changecount
// This script also adds a tiddler to each workspace which sets it to use the simpleTheme

// ensures that the request is being made by the server and not through the proxy.php file

include_once("includes/header.php");

echo "<h1>Upgrade.php</h1>";
$form = "<form method='get'><input name='adminPassword' /><input type='submit' value='upgrade'/></form>";

if($tiddlyCfg['adminPassword']==""){
	echo "<b>If you are seeing this message unexpectedly please contact your system administrator. </b><hr />An upgrade password is required in the <b>includes/config.php</b> file. Please set the variable at line 13 of <b>includes/config.php</b> and then refresh this page.";
	exit;
}elseif(!$_REQUEST['adminPassword']){
	echo "<b>If you are seeing this message unexpectedly please contact your system administrator. </b><hr /><b>Please ensure that you have a full database backup in place before upgrading.</b><br /></br />Please enter your admin password to confirm that you wish to upgrade from ccTiddly 1.6 to 1.7.</p>".$form;
	exit;
}elseif($_REQUEST['adminPassword']!=$tiddlyCfg['adminPassword']){
	echo "incorrect password entered.".$form;
	exit;
}

$cct_base = "";
include_once($cct_base."includes/header.php");

// automatically back up the database. 
//echo $command = "mysqldump --opt -h ".$tiddlyCfg['db']['host']."  -u ".$tiddlyCfg['db']['login']." -p '".$tiddlyCfg['db']['pass']."'   //".$tiddlyCfg['db']['name']." > backup_".$tiddlyCfg['db']['name'];
//echo system($command);
//echo mysql_error();
//exit

$q = "SELECT * FROM ".$tiddlyCfg['table']['workspace'];
$result = mysql_query($q);

while ($row = db_fetch_assoc($result)){ 
	if ($row['name']!=""){
		$SQL_CHECK = "SELECT * FROM tiddler where workspace_name='".$row['name']."' and title='UpgradeConfig17'";
		$res = mysql_query($SQL_CHECK);
		if (mysql_num_rows($res) > 0)
		{
			echo "Tiddler already exists in the workspace ".$row['name'];
		}else{
			$SQL = "insert into tiddler (title, modifier, creator, modified, created, body, workspace_name, tags, revision) values ('UpgradeConfig17', 'ccTiddly', 'ccTiddly', '200809000000', '200809000000',  '// This tiddler has been automatically generated to configure your upgraded instance of ccTiddly to use the new theme mechanism\nconfig.options.txtTheme = &quot;simpleTheme&quot;', '".$row['name']."', 'systemConfig', 1)";
			$rs = mysql_query($SQL);

			echo 		mysql_affected_rows();
			if(!rs || mysql_error()){
		//		echo "FAILED TO EXECUTE : ".$SQL;
				echo mysql_error();	
			}else{
				echo "update tiddler created for workspace ".$row['name'];
			}		
		}		
		
	 
		echo "<hr />";
	} 	
}

$SQL2 = "UPDATE ".$tiddlyCfg['table']['main']." SET fields=(REPLACE (fields,'changecount=','old_change_count='))";
mysql_query($SQL2);

echo "<h1> Your database has been upgraded. To start using this ccTiddly instance please delete the upgrade.php file from your server.</h1>";

?>