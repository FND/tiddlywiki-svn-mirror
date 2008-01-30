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
	
	//check authorization
	/*if( !tiddler_privilegeMiscCheck($user, "rss") )
	{
		returnResult("020");
	}*/

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
	/*
<item>
<title>Tyndall</title>
<description>&lt;a target=&quot;_blank&quot; title=&quot;External link to http://www.tyndall.ie/&quot; href=&quot;http://www.tyndall.ie/&quot; class=&quot;externalLink&quot;&gt;http://www.tyndall.ie/&lt;/a&gt;&lt;br&gt;got my email whitelisted but havent applied yet&lt;br&gt;&lt;br&gt;vacancy list&lt;br&gt;&lt;a target=&quot;_blank&quot; title=&quot;External link to http://www.tyndall.ie/careers/research.html&quot; href=&quot;http://www.tyndall.ie/careers/research.html&quot; class=&quot;externalLink&quot;&gt;http://www.tyndall.ie/careers/research.html&lt;/a&gt;&lt;br&gt;&lt;br&gt;photonic group&lt;br&gt;&lt;a target=&quot;_blank&quot; title=&quot;External link to http://www.tyndall.ie/research/photonics-systems-group/index.htm&quot; href=&quot;http://www.tyndall.ie/research/photonics-systems-group/index.htm&quot; class=&quot;externalLink&quot;&gt;http://www.tyndall.ie/research/photonics-systems-group/index.htm&lt;/a&gt;&lt;br&gt;telecommunication like WDM&lt;br&gt;vacancy!&lt;br&gt;&lt;br&gt;photonic source group&lt;br&gt;&lt;a target=&quot;_blank&quot; title=&quot;External link to http://www.tyndall.ie/research/photonics-sources-group/index.html&quot; href=&quot;http://www.tyndall.ie/research/photonics-sources-group/index.html&quot; class=&quot;externalLink&quot;&gt;http://www.tyndall.ie/research/photonics-sources-group/index.html&lt;/a&gt;&lt;br&gt;VCSEL&lt;br&gt;semiconductor&lt;br&gt;&lt;br&gt;optoelectronics&lt;br&gt;&lt;a target=&quot;_blank&quot; title=&quot;External link to http://www.tyndall.ie/research/optoelectronics/index.html&quot; href=&quot;http://www.tyndall.ie/research/optoelectronics/index.html&quot; class=&quot;externalLink&quot;&gt;http://www.tyndall.ie/research/optoelectronics/index.html&lt;/a&gt;&lt;br&gt;semiconductor laser</description>
<category>can_apply</category>
<link>http://www.tiddlywiki.com/#Tyndall</link>
<pubDate>Thu, 17 Jan 2008 10:53:00 GMT</pubDate>
</item>*/

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
