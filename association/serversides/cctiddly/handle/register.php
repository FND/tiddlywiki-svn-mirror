<?php


$cct_base = "../";
include_once($cct_base."includes/header.php");

if ($tiddlyCfg['can_create_account'] !=1)
{
	sendHeader("403");
	echo 'This is not allowed on this server. ';
}

$data['username'] = $_POST['username'];
$data['password'] = $_POST['password'];

$res = db_record_insert($tiddlyCfg['table']['user'],$data);


if ($res !=1)
{
	echo 'User not crated, please try again with a different username.';
}else
{
	sendHeader("201");
	echo "created";
}
?> 
