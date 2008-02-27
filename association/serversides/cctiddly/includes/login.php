<?php


if ($_POST['logout'] || $_REQUEST['logout'])
{
	user_logout('You have logged out.');
	header("Location: ".str_replace("index.php", "", $_SERVER['PHP_SELF']));
}



///////////////////////////////CC: user variable defined in header and $user['verified'] can be used directly to check user validation
 // check to see if user is logged in or not and then assign permissions accordingly. 
//if ($user['verified'] = user_session_validate())
$user['verified'] = user_session_validate();

if ($user['verified'])
{
$workspace_permissions = $tiddlyCfg['default_user_perm'];
	
} else {
	$workspace_permissions = $tiddlyCfg['default_anonymous_perm'];
}

if ($workspace_permissions == "")
{
	$workspace_permissions = "DDDD";
}



//////////////
//  Can this use an existing function ?!?!?!

//  SET WORKSPACE CREATE PERMISSION FLAG
if (substr($workspace_permissions, 1, 1) == "U")
{
	$workspace_create = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_create = substr($workspace_permissions, 1, 1);
}
//echo $workspace_create;

//  SET WORKSPACE READ PERMISSION FLAG
if (substr($workspace_permissions, 0, 1) == "U")
{
	$workspace_read = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_read = substr($workspace_permissions, 0, 1);
}

//  SET WORKSPACE UDATE PERMISSION FLAG
if (substr($workspace_permissions, 2, 1) == "U")
{
	$workspace_udate = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_udate = substr($workspace_permissions, 2, 1);
}


//  SET WORKSPACE DELETE PERMISSION FLAG
if (substr($workspace_permissions, 2, 1) == "U")
{
	$workspace_delete = $tiddlyCfg['privilege_misc']['undefined_privilege'];
}else{
	$workspace_delete = substr($workspace_permissions, 2, 1);
}

//
////////////////////////////////////////////

$workspace_settings_count= count($workspace_settings);
//echo $user['verified'];
//echo $workspace_permissions;

// display open id bits if it is enabled. 
if ($tiddlyCfg['pref']['openid_enabled'] ==1)
{
		require_once "includes/openid/common.php";
		
	
}





?>