<?php
$cct_base = "../../../";
include_once($cct_base."includes/header.php");

//////////////////////////////////////////////////////////parameters//////////////////////////////////////////////////////////////

/*
//user and code for logging in users
if( isset($_GET['user']) && isset($_GET['code']) ) {
	if( strcmp($_GET['code'],sha1($_GET['user'].$tiddlyCfg['hashseed']))==0 ) {
		$user = user_create($_GET['user'], "", 1);
	}
}
*/

//force anonymous due to security concerns
$user['verified']=0;

//////////////////////////////////////////////////////////initial heading//////////////////////////////////////////////////////////////
//get required data from database
$data = db_tiddlers_mainSelectSiteConfig();
$tmp=array();
while( $d=db_fetch_assoc($data) ) {
	$tmp[$d['title']] = $d;
}
$data = $tmp;

//$siteUrl = isset($data['SiteUrl'])?htmlspecialchars($data['SiteUrl']['body']):"http://www.tiddlywiki.com/";
$siteUrl = dirname(dirname(dirname(getUrl())))."/".$tiddlyCfg['workspace_name'];
//format default headings
//****use date for local time, gmdate for GMT/UTC
$result = '<?xml version="1.0"?>
<rss version="2.0">
<channel>
<title>'.(isset($data['SiteTitle'])?htmlspecialchars($data['SiteTitle']['body']):"My TiddlyWiki").'</title>
<link>'.$siteUrl.'</link>
<description>'.(isset($data['SiteSubtitle'])?htmlspecialchars($data['SiteSubtitle']['body']):"a reusable non-linear personal web notebook").'</description>
<pubDate>'.gmdate("D, j M Y h:i:s e").'</pubDate>
<lastBuildDate>'.gmdate("D, j M Y h:i:s e").'</lastBuildDate>
<generator>ccTiddly '.$tiddlyCfg['version'].'</generator>';


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
	<pubDate>'.gmdate("D, j M Y h:i:s",TiddlyTimeToEpoch($d['modified'])).'</pubDate>
	</item>';
			$count++;
		}
	}
	$result .= '</channel>
</rss>';

//echo $result;
print str_replace("\n","<br>\n",htmlspecialchars($result));
?>
