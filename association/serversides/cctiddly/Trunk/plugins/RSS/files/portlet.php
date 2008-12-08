<?php
$cct_base = "../../../";
include_once($cct_base."includes/header.php");
$tasks =  getTiddlersWithTags(array('task'), array());
foreach($tasks as $task)
{
	if(!stristr($task['fields'], "tt_status='Complete"))
	{
		$links .= "<a href='".dirname(dirname(dirname(getURL())))."/".$tiddlyCfg['workspace_name']."#[[".$task['title']."]]' target=".rand().">".$task['title']."</a><br />";
		$count++;
	}
}

echo "<h1>".$count." Tasks </h1>";
echo $links;
echo "<br /><a href='".dirname(dirname(dirname(getURL())))."/".$tiddlyCfg['workspace_name']."#newTiddler:NewTask'  target=".rand().">new task</a>";
?>
