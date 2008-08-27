<?php 
// This script should be deleted after is has been run. 

// This script removes changecount from the fields in the database replacing it with old_changecount
// This script also adds a tiddler to each workspace which sets it to use the simpleTheme

// ensures that the request is being made by the server and not through the proxy.php file

include_once("includes/header.php");

echo "<h1>Upgrade.php</h1>";
$form = "<form method='get'><input name='adminPassword' /><input type='submit' value='upgrade'/></form>";

if($tiddlyCfg['adminPassword']==""){
	echo "an Admin password is required in the file <b>includes/config.php</b> file. Please set the variable at line 13 of <b>includes/config.php</b> and then refresh this page.";
	exit;
}elseif(!$_REQUEST['adminPassword']){
	echo "Please enter your admin password to confirm that you wish to upgrade from ccTiddly 1.6 to 1.7.</p><p>Please ensure that you have a full database backup in place before upgrading.</p>".$form;
	exit;
}elseif($_REQUEST['adminPassword']!=$tiddlyCfg['adminPassword']) {
	echo "incorrect password entered.".$form;
	exit;
}
echo "upgrading";
exit;

$cct_base = "";
include_once($cct_base."includes/header.php");


// automatically back up the database. 
//echo $command = "mysqldump --opt -h ".$tiddlyCfg['db']['host']."  -u ".$tiddlyCfg['db']['login']." -p '".$tiddlyCfg['db']['pass']."'   //".$tiddlyCfg['db']['name']." > backup_".$tiddlyCfg['db']['name'];
//echo system($command);
//echo mysql_error();
//exit;




$q = "SELECT * FROM ".$tiddlyCfg['table']['workspace'];
$result = mysql_query($q);

while ($row = db_fetch_assoc($result)) { 
	if ($row['name']!=""){
		// insert settings tiddler 
		echo $SQL = "insert into tiddler (title, body, workspace_name, tags) values ('UpgradeConfig17', '// This tiddler has been automatically generated to configure your upgraded instance of ccTiddly to use the new theme mechanism\nconfig.options.txtTheme = &quot;simpleTheme&quot;', '".$row['name']."', 'systemConfig')";
		mysql_query($SQL);
		echo mysql_error();
		
	} 	
}

$SQL2 = "UPDATE ".$tiddlyCfg['table']['main']." SET fields=(REPLACE (fields,'changecount=','old_changecount='))";
mysql_query($SQL2);


echo "Your database has been upgraded. To start using this ccTiddly instance please delete the upgrade.php file.";

?>