<?php


$cct_base = "../";
include_once($cct_base."includes/header.php");


$data['username'] = $_REQUEST['user'];


$res =  db_record_select($tiddlyCfg['table']['user'],$data);

foreach( $res as $r) {
echo $r['username'];
echo "<br />";
echo $r['short_name'];
}
		


?> 
