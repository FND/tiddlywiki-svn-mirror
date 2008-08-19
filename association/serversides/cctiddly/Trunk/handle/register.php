<?php


$data['username'] = $_POST['username'];
$data['password'] = $_POST['password'];


$cct_base = "../";
include_once($cct_base."includes/header.php");

if ($tiddlyCfg['can_create_account'] !=1)
{
	sendHeader("403");
	echo 'This is not allowed on this server. ';
}

// if the user is checking if the username is available.
if($_POST['free'] ==1 )
{
	debug("username is available ".$data['username'], "params");
	echo count(db_record_select($tiddlyCfg['table']['user'],$data));
	exit;
} else {
	debug("username is not available", "params");
	exit;	
}

$res = db_record_insert($tiddlyCfg['table']['user'],$data);

if ($res !=1)
{
	echo 'User not created, please try again with a different username.';
}else
{
	user_login($data['username'],$data['password']);
}
?> 
