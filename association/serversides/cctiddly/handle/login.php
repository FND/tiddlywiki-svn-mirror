<?php 

$cct_base = "../";
include_once($cct_base."includes/header.php");

if( isset($_REQUEST['cctuser']) && isset($_REQUEST['cctpass']) )		//set cookie for login
{	
	user_login(formatParametersPOST($_REQUEST['cctuser']),formatParametersPOST($_REQUEST['cctpass']));
	//	$user = user_create();
}



if (isset($_POST['logout']) || isset($_REQUEST['logoout']))
	user_logout('You have logged out.');
	
	
?>