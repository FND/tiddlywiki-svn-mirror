<?php
$cct_base = "../../../";
include_once($cct_base."includes/header.php");
$tasks =  getTiddlersWithTags(array('task'), array());

echo "<h1>".count($tasks)." Tasks </h1>";

foreach($tasks as $task)
	echo "<a href='".dirname(dirname(dirname(getURL())))."/".$tiddlyCfg['workspace_name']."#[[".$task['title']."]]' target=".rand().">".$task['title']."</a><br />";


?>
