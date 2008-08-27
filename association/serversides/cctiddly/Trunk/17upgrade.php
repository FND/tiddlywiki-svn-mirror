<?php 


$cct_base = "";
include_once($cct_base."includes/header.php");

//$result =  db_workspace_selectAllPublic(); 
	$q = "SELECT * FROM ".$tiddlyCfg['table']['workspace'];
	$result = mysql_query($q);

while ($row = db_fetch_assoc($result)) { 
	if ($row['name']!=""){
		
//		echo $row['name'];
		echo $SQL = "insert into tiddler (title, body, workspace_name, tags) values ('cct17_upgrade_settings', 'config.options.txtTheme = &quot;simpleTheme&quot;', '".$row['name']."', 'systemConfig')</br>";
		echo mysql_query($SQL);
	} 	
}
?>