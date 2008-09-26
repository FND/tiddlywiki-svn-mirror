<?php 

$u = (isset($_REQUEST['cctuser'])?$_REQUEST['cctuser']:$_POST['cctuser']); 
$p = (isset($_REQUEST['cctpass'])?$_REQUEST['cctpass']:$_POST['cctpass']);

$cct_base = "../";
include_once($cct_base."includes/header.php");

if(isset($u) && isset($p))	
{	
	debug("login request u:".$u." & p : ".$p, "login");
	user_login(formatParametersPOST($u),formatParametersPOST($p));
}

if (isset($_POST['logout']) || isset($_REQUEST['logout']))
{
	debug("logout request received", "login");
	user_logout();
}

?>