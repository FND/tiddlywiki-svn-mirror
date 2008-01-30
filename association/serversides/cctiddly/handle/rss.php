<?php
	//$cct_base = "../";
	//include_once($cct_base."includes/header.php");
	
	//return result/message
	function returnResult($str)
	{
		global $ccT_msg;
		db_close();

		switch($str) {
			case "005":
				exit("\n".$ccT_msg['notice']['RSScreated']);
				break;
			case "015":		//file create error
				exit("\n".$ccT_msg['error']['rss_file_create'].". ".$ccT_msg['warning']['tiddler_overwritten']);
				break;
			case "016":		//file write error
				exit("\n".$ccT_msg['error']['rss_file_write']);		//return error to display in displayMessage and make iframe idle
				break;
			case "020":
				//logerror($ccT_msg['warning']['not_authorized'],0);			//alert user of error and stop script
				exit("\n".$ccT_msg['warning']['not_authorized']);		//return error to display in displayMessage and make iframe idle
				break;
			default:
				logerror($ccT_msg['warning']['save_error']);
				exit("\n".$ccT_msg['warning']['save_error']);
		}
	}
	
//////////////////////////////////////////////////////////preformat tiddler data//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////preliminary data check and action//////////////////////////////////////////////////////////////
	

//////////////////////////////////////////////////////////parameters//////////////////////////////////////////////////////////////
	//user and code for logging in users
	if( isset($_GET['user']) && isset($_GET['code']) ) {
		if( strcmp($_GET['code'],sha1($_GET['user'].$tiddlyCfg['hashseed']))==0 ) {
			$user = user_create($_GET['user'], "", 1);
		}
	}
	
	//force anonymous due to security concerns
	$user['verified']=0;
//////////////////////////////////////////////////////////rss save//////////////////////////////////////////////////////////////

		//check if cache expired
	//get required data from database
	//check user login/privilege
	//format output into string
		//if anonymous, save to cache

//////////////////////////////////////////////////////////initial heading//////////////////////////////////////////////////////////////
	//get required data from database
	$data = db_tiddlers_mainSelectSiteConfig();
	$tmp=array();
	while( $d=db_fetch_assoc($data) ) {

		$tmp[$d['title']] = $d;
	}
	$data = $tmp;
	$siteUrl = isset($data['SiteUrl'])?htmlspecialchars($data['SiteUrl']['body']):"http://www.tiddlywiki.com/";
	
	//format default headings
	//****use date for local time, gmdate for GMT/UTC
	$result = '<?xml version="1.0"?>
<rss version="2.0">
<channel>
<title>'.(isset($data['SiteTitle'])?htmlspecialchars($data['SiteTitle']['body']):"My TiddlyWiki").'</title>
<link>'.$siteUrl.'</link>
<description>'.(isset($data['SiteSubtitle'])?htmlspecialchars($data['SiteSubtitle']['body']):"a reusable non-linear personal web notebook").'</description>
<language>en-us</language>
<copyright>Copyright '.date("Y")." ".($user['verified']?htmlspecialchars($user['username']):"Anonymous").'</copyright>
<pubDate>'.gmdate("D, j M Y h:i:s e").'</pubDate>
<lastBuildDate>'.gmdate("D, j M Y h:i:s e").'</lastBuildDate>
<docs>http://blogs.law.harvard.edu/tech/rss</docs>
<generator>ccTiddly '.$tiddlyCfg['version'].'</generator>';
//////////////////////////////////////////////////////////individual items//////////////////////////////////////////////////////////////
	//get required data from database
	$data = db_tiddlers_mainSelect4RSS();
	$count=0;
	while( $d=db_fetch_assoc($data) ) {
		//check privilege
		if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$d['tags'])) )
		{
			//output item
			$result .= '
	<item>
	<title>'.htmlspecialchars($d['title']).'</title>
	<description>'.htmlspecialchars($d['body']).'</description>';
			
			//category
			$tags = tiddler_breakTag($d['tags']);
			foreach( $tags as $t ) {
				$result .= '
	<category>'.$t.'</category>';
			}
			
			//remaining list
			$result .= '
	<link>'.$siteUrl.'#'.htmlspecialchars($d['title']).'</link>
	<pubDate>'.gmdate("D, j M Y h:i:s e",$d['modified']).'</pubDate>
	</item>';
			$count++;
		}
	}

//////////////////////////////////////////////////////////close heading//////////////////////////////////////////////////////////////
	//close headings
	$result .= '</channel>
</rss>';

	print str_replace("\n","<br>\n",htmlspecialchars($result));
	exit();
	
	
	//save to file
	//$fhandle = fopen("./$config.xml",'w');
	$fhandle = fopen($cct_base.$tiddlyCfg['workspace_name'].".xml",'w');
	if( $fhandle===FALSE ) {		//create file error
		returnResult("015");
	}
	var_dump(fwrite($fhandle,$body));exit;
	if( fwrite($fhandle,$body)===FALSE ) {		//file write error
		returnResult("016");
	}
	
	returnResult("005");

?>
