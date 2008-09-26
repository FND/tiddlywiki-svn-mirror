<?php


$data['username'] = $_POST['username'];
$data['password'] = $_POST['password'];


$cct_base = "../";
include_once($cct_base."includes/header.php");

sendHeader(304);
exit;
if ($tiddlyCfg['can_create_account'] !=1)
{
	sendHeader("403");
	echo 'This is not allowed on this server. ';
}

// if the user is checking if the username is available.
if($_POST['free'] ==1 )
{
	debug("username is available ".$data['username'], "params");
	debug("count is ".count(db_record_select($tiddlyCfg['table']['user'],$data)), "params");
	echo count(db_record_select($tiddlyCfg['table']['user'],$data));
	exit;
}


$res = db_record_insert($tiddlyCfg['table']['user'],$data);

if ($res !=1)
	sendHeader(304);
else
	user_login(formatParametersPOST($data['username']),formatParametersPOST($data['password']));

?> 
