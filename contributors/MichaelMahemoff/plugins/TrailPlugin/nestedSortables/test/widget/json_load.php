<?php
require('JSON.php');

function countItems($item) {
	$count = 0;
	
	if($item['children']) {
		foreach ($item['children'] as $i) {
			$count++;
			$count += countItems($i);
		}
	}
	
	return $count;
}

$json = new Services_JSON(SERVICES_JSON_LOOSE_TYPE);

$str = <<<ETO
{
	"requestFirstIndex" : 0,
	"firstIndex" : 0,
	"count": 22,
	"totalCount" : 22,
	"columns":["Title(ID)", "Owner", "Updated"],
	"items": 
	[
		{
			"id":1, 
			"info":["Page Title(1)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":2, 
			"info":["Page Title(2)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
			"children": 
				[
					{
						"id":3, 
						"info":["Page Title(3)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
						"children": [
							{
								"id":4, 
								"info":["Page Title(4)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
							}
						]
					}
				]
		},
		{
			"id":5, 
			"info":["Page Title(5)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
			"children": 
				[
					{
						"id":6, 
						"info":["Page Title(6)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
						"children": [
							{
								"id":7, 
								"info":["Page Title(7)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
							}
						]
					}
				]
		},
		{
			"id":8, 
			"info":["Page Title(8)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
			"children": 
				[
					{
						"id":9, 
						"info":["Page Title(9)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
						"children": [
							{
								"id":10, 
								"info":["Page Title(10)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
							}
						]
					}
				]
		},
		{
			"id":11, 
			"info":["Page Title(11)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":12, 
			"info":["Page Title(12)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":13, 
			"info":["Page Title(13)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":14, 
			"info":["Page Title(14)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":15, 
			"info":["Page Title(15)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":16, 
			"info":["Page Title(16)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
		},
		{
			"id":17, 
			"info":["Page Title(17)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
			"children": 
				[
					{
						"id":18, 
						"info":["Page Title(18)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
						"children": [
							{
								"id":19, 
								"info":["Page Title(19)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
							}
						]
					}
				]
		},
		{
			"id":20, 
			"info":["Page Title(20)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
			"children": 
				[
					{
						"id":21, 
						"info":["Page Title(21)", "Bernardo Pádua", "2007-06-09 2:44 pm"],
						"children": [
							{
								"id":22, 
								"info":["Page Title(22)", "Bernardo Pádua", "2007-06-09 2:44 pm"]
							}
						]
					}
				]
		}
	]
}
ETO;

$info = $json->decode($str);

$firstReq = $_GET['firstIndex'];

$count = $_GET['count'];

if($firstReq===null || $count===null) {
	echo $str;
} else {
	$firstReq = (int)$firstReq;
	$count = (int)$count;
	$return = array(
			"requestFirstIndex"=> $firstReq,
			"columns"=> $info['columns'],
			"totalCount" => $info['totalCount']
		);
	
		
	$first = null;
	$last = null;	
	$curPos = 0;
	foreach ($info['items'] as $key => $value) {
		$nextPos = countItems($value) + 1 + $curPos;
		if($first === null && $firstReq === $curPos) {
			$newFirstIndex = $curPos;
			$first = $key;
		}
		if ($first === null && $nextPos > $firstReq) {
			$first = $key + 1; 
			$newFirstIndex = $nextPos;
		}
		if(	$last === null &&
			$newFirstIndex!==null &&
			($nextPos >= $newFirstIndex + $count || $nextPos === $info['totalCount'] ) ) 	
		{
			$last = $key; //the root element where the item with the last index is
			$newCount = $nextPos - $newFirstIndex;
			break; //we are done if we got here
		}
		$curPos = $nextPos;
	}
	
	$return['firstIndex'] = $newFirstIndex;
	$return['count'] = $newCount;
	$return['items'] = array_slice($info['items'], $first, $last - $first + 1);
	
	$retJson = $json->encode($return);
	
	echo $retJson;
}
?>