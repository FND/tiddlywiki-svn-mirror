<?php 

$cct_base = "../";
include_once($cct_base."includes/header.php");


if( isset($_REQUEST['cctuser']) && isset($_REQUEST['cctpass']) )		//set cookie for login
{	
	user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']));
}

if (isset($_POST['logout']) || isset($_REQUEST['logout']))
{
	user_logout('You have logged out.');
}


	
	
?>