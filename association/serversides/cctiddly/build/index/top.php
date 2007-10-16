<?php
	//timing
	function recordTime_float($name="unnamed")
	{
		global $time;

		if( !isset($time) )		//stop if time var not exist
		{
			return FALSE;
		}

		list($usec, $sec) = explode(" ", microtime());
		$time[] = array("name"=>$name, "time"=>((float)$usec + (float)$sec));
		return TRUE;
	}

	$time=array();
	recordTime_float("Start");

	//includes
	include_once("includes/header.php");
	include_once("includes/print.php");
	recordTime_float("includes");

	//logout
	if( isset($_GET['logout']) && $_GET['logout']==1 )
	{
		user_logout();
		//redirect to itself to refresh and clear out "logout=1" string
		header("Location: ".$_SERVER['PHP_SELF'].'?'.str_replace("logout=1&","",$_SERVER['QUERY_STRING']));
	}
	//reqLogin
	if( $tiddlyCfg['pref']['reqLogin'] == 1 )
	{
		if( isset($_POST['cctuser']) && isset($_POST['cctpass']) )		//set cookie for login
		{
			user_login(formatParametersPOST($_POST['cctuser']),formatParametersPOST($_POST['cctpass']),1);
			header("Location: ".$_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']);		//redirect to itself to refresh
		}
		//////////////////////////////////////////print login box if not logged in or not in the right group////////////////////////////////
		$user = user_create();
		if( !$user['verified'] )		//if not logged on, display login screen
		{
?>
<html><head></head>
<body>
<form method="post" action="<?php print $_SERVER['PHP_SELF'].'?'.$_SERVER['QUERY_STRING']?>">
<?php print $ccT_msg['loginpanel']['username']?><input type="text" name="cctuser"><br>
<?php print $ccT_msg['loginpanel']['password']?><input type="password" name="cctpass"><br>
<input type="submit" value="<?php print $ccT_msg['loginpanel']['login'] ?>" name="ok">
</form>
</body></html>
<?php
			exit("");
		}
	}

	//check if getting revision
	if( isset($_GET['title']) )
	{
		$tiddlers = getAllVersionTiddly($title);
		$t = array();
		foreach( $tiddlers as $tid )
		{
			$tid['title'] .= " version ".$tid['version'];
			$t[] = $tid;
		}
		$tiddlers = $t;
	}elseif( isset($_GET['tags']) )
	{
		$tiddlers = getTiddlersWithTags($yesTags, $noTags);
	}else{
		$tiddlers = getAllTiddlers();
	}
	recordTime_float("get all tiddlers");
?>
