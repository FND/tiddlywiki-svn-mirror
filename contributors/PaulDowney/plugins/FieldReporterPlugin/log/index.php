<?php 

/*
 *  simple UsageLog form
 */
require_once("params.php");
mysql_connect($db["host"], $db["username"], $db["password"]) or die(mysql_error()); 
mysql_select_db($db["name"]) or die(mysql_error()); 

if($_SERVER[REQUEST_METHOD] == "POST"){
	mysql_query("INSERT INTO log (dateused, ip, product, version, action, description) 
	VALUES (NOW(), '$_SERVER[REMOTE_ADDR]', '$_POST[product]', '$_POST[version]', '$_POST[action]', '$_POST[description]')") 
	or die(mysql_error()); 

	print $version."|"."http://TiddlyWiki.com";
}

if($_SERVER[REQUEST_METHOD] == "GET"){
	$r = mysql_query("SELECT * from log") or die(mysql_error()); 

	print mysql_num_rows($r) . " requests";

	// thought needed ..
	echo "<table>";
	while($row = mysql_fetch_array($r, MYSQL_ASSOC))
	{
	    echo "<tr>"
		."<td>{$row['dateused']} </td>"
		."<td>{$row['product']} </td>"
		."<td>{$row['version']} </td>"
		."<td>{$row['action']} </td>"
		."<td>{$row['description']} </td>"
		."</tr>";
	} 
	echo "</table>";
}

?>
