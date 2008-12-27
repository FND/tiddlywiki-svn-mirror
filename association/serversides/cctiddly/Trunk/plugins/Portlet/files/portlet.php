<?php
$cct_base = "../../../";
include_once($cct_base."includes/header.php");


function getTiddlersWithTagsNoPerm($yesTags,$noTags)
{
	global $tiddlyCfg;
	$tiddlers = tiddler_selectAll();
	if(strlen($user)==0)
		$user = user_create();
	if(sizeof($tiddlers)>0)
	{
		$return_tiddlers = array();
		foreach($tiddlers as $t)
		{
			if(user_readPrivilege(user_tiddlerPrivilegeOfUser($user,$t['tags'])))
			{
				$tag = tiddler_breakTag($t['tags']);
				$tmp = array_merge($tag,$noTags);			
				if(sizeof($tmp) == sizeof(array_flip(array_flip($tmp))))		//ifno $noTags, continue
				{
					$tmp = array_merge($tag,$yesTags);
						$return_tiddlers[$t['title']] = $t;
				}
			}
		}
		return $return_tiddlers;		//tiddlers would be in the form array("<title>"=>array("title"=>"<title>", .....
	}
	return array();
}



$tasks =  getTiddlersWithTagsNoPerm(array('task'), array());

$loc = dirname(dirname(dirname(getURL())));
foreach($tasks as $task)
{
	if(!stristr($task['fields'], "tt_status='Complete"))
	{
		$links .= "<a href='".$loc."/".$tiddlyCfg['workspace_name']."#[[".$task['title']."]]' target=".rand().">".$task['title']."</a><br />";
		$count++;
	}
}

echo "<h1>".$count." Tasks </h1>";
echo $links;
echo "<br /><a href='".$loc."/".$tiddlyCfg['workspace_name']."#newTiddler:NewTask'  target=".rand().">new task</a>";
?>
