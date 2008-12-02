<?php
sendHeader(200);
header('Content-type: application/xml; charset="utf-8"',true);
include_once($cct_base."includes/header.php");
//force anonymous due to security concerns
$user['verified']=0;
$tiddlyCfg['workspace_name'] = '';

$data = db_tiddlers_mainSelectSiteConfig();
$tmp=array();
while( $d=db_fetch_assoc($data) ) {	$tmp[$d['title']] = $d;
}
$data = $tmp;
//$siteUrl = isset($data['SiteUrl'])?htmlspecialchars($data['SiteUrl']['body']):"http://www.tiddlywiki.com/";
$siteUrl ="http://".$_SERVER['SERVER_NAME'];
$result = '<?xml version="1.0"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<atom:link href="http://latest.simonmcmanus.com/index.xml" rel="self" type="application/rss+xml" />
<title>'.(isset($data['SiteTitle'])?htmlspecialchars($data['SiteTitle']['body']):"My TiddlyWiki").'</title>
<link>http://simonmcmanus.com</link>
<description>'.(isset($data['SiteSubtitle'])?htmlspecialchars($data['SiteSubtitle']['body']):"a reusable non-linear personal web notebook").'</description>
<pubDate>'.date("r").'</pubDate>
<lastBuildDate>'.date("r").'</lastBuildDate>
<generator>ccTiddly '.$tiddlyCfg['version'].'</generator>';

//get required data from database
$data = db_tiddlers_mainSelect4RSS();
$count=0;
while( $d=db_fetch_assoc($data) ) 
{
	//check privilege
	if( user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$d['tags'])) )
	{
		$result .= '<item>
		<title>'.htmlspecialchars($d['title']).'</title>
		<description><![CDATA['.htmlspecialchars($d['body']).']]></description>';
		$tags = tiddler_breakTag($d['tags']);
		foreach( $tags as $t ) {
			$result .= '
			<category>'.$t.'</category>';
		}
		$result .= '
		<link>'.$siteUrl.'#</link> 
		<pubDate>'.date("r",TiddlyTimeToEpoch($d['modified'])).'</pubDate>
		<guid isPermaLink="false">'.$siteUrl.rand().'</guid>
		</item>';
		$count++;
	}
}
$result .= '</channel>
</rss>';
echo $result;
//print str_replace("\n","<br>\n",htmlspecialchars($result));
exit;
?>
