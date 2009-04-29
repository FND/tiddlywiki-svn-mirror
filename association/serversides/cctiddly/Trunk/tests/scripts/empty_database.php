<?php

$cct_base = "../../";
include_once($cct_base."includes/header.php");

mysql_query("delete from ".$tiddlyCfg['table']['backup']);
mysql_query("delete from ".$tiddlyCfg['table']['main']);



?>
