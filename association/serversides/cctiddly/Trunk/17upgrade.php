<?php 
$cct_base = "";
include_once($cct_base."includes/header.php");

$q = "SELECT * FROM ".$tiddlyCfg['table']['workspace'];
$result = mysql_query($q);

while ($row = db_fetch_assoc($result)) { 
	if ($row['name']!=""){
		// insert settings tiddler 
		echo $SQL = "insert into tiddler (title, body, workspace_name, tags) values ('cct17_upgrade_settings', 'config.options.txtTheme = &quot;simpleTheme&quot;', '".$row['name']."', 'systemConfig')";
		mysql_query($SQL);
		echo mysql_error();
		
	} 	
}

$SQL2 = "UPDATE tiddler SET fields=(REPLACE (fields,'changecount=','old_changecount='))";
mysql_query($SQL2);

?>