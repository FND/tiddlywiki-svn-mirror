<?php 

require_once("../includes/user.php");


	if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )		//set cookie for login
	{	
			$user['verified'] = user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']));
				$user = user_create();
		//error_log('login', 0);
	//	header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
	}
	
	

?>