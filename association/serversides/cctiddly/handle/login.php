<?php 
require_once("../includes/url.php");
require_once("../config/default.php");

require_once("../includes/user.php");
require_once("../includes/functions.php");
require_once("../includes/db.mysql.php");
	if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )		//set cookie for login
	{	
		echo user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']));
			//	$user = user_create();
		//error_log('login', 0);
	//	header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
	}
	
	

?>