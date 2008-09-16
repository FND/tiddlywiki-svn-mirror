<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");

function chart_data($values) {
	$maxValue = max($values);
	$simpleEncoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	$chartData = "s:";
  	for ($i = 0; $i < count($values); $i++) {
    	$currentValue = $values[$i];
    	if ($currentValue > -1) {
    		$chartData.=substr($simpleEncoding,61*($currentValue/$maxValue),1);
    	}
      	else {
      		$chartData.='_';
      	}
  	}
	return $chartData."&chxt=y&chxl=0:|0|".$maxValue;
}


function displayGraph($SQL, $title)
{	$results = mysql_query($SQL);
	$count = 0;
	while($result=mysql_fetch_assoc($results)){	
		$values[$count++] .=$result['numRows'];
		$labels .= $result['Date']."|";
	}
	$r2 = round(max($values), -2)/2;
	echo "\r\n\r<img src=http://chart.apis.google.com/chart?chtt=".urlencode($title)."&cht=lc&chs=800x375&chd=".chart_data($values)."&chxt=x,y&chxl=0:|".$labels."|1:|0|".$r2."|".round(max($values))."&chf=c,lg,90,DDDDDD,0.5,ffffff,20|bg,s,FFFFFF>";
}

	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 10 DAY  AND workspace='".$_REQUEST['workspace']."'  GROUP BY Date order by time";

// $SQL ="SELECT DATE_FORMAT(time, '%m/%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 2 YEAR GROUP BY Date order by time";
displayGraph($SQL, "Instance views by month over the past two years.");


exit;
if($_REQUEST['graph']==1){
	$SQL ="SELECT DATE_FORMAT(time, '%m/%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 2 YEAR  GROUP BY Date order by time";
	displayGraph($SQL, "Instance views by month over the past two years.");
}
if($_REQUEST['graph']==2){
	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 10 DAY  GROUP BY Date order by time";
	displayGraph($SQL, "Instance views in the last 10 days.");
}
exit;



?>