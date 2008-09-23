<?php 

/* 
 *  create logging table
 */
require_once("params.php");

mysql_connect($db["host"], $db["username"], $db["password"]) or die(mysql_error()); 
mysql_select_db($db["name"]) or die(mysql_error()); 

mysql_query("CREATE TABLE log ( 
	dateused DATETIME,
	ip VARCHAR(16),
	product VARCHAR(30),
	version VARCHAR(30),
	action VARCHAR(30),
	description VARCHAR(256)
	)")
	or die(mysql_error()); 

?>
