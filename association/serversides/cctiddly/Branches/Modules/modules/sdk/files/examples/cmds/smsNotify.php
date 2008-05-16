<?php

//This server side search has been implemented so the search functionality still exists when the entire Tiddlywiki content is not downloaded.

//  This code is not currently  being used by the core

$cct_base = "../../../../../";
include_once($cct_base."includes/header.php");
require_once('../../web21c.php');
require_once('../../config.php');


$yesTags = array('notifyUser');
$noTags = array('systemConfig');
$tiddlers = getTiddlersWithTags($yesTags, $noTags);

if(!$tiddlers)
{
	echo "No users have requested updates";
	exit;
}

$count = 1;
$web21c = new Web21c($applicationName, $environment);
$sms = $web21c->MessagingInbound();

foreach($tiddlers as $t)
{
	$recipientUris[] = $t['title'];
	$count++;
}
if($_REQUEST['msg'])
{
	$r = $sms->sendMessage($recipientUris, $_REQUEST['msg']);
}else{
	echo 'Please enter message text';
}
?>