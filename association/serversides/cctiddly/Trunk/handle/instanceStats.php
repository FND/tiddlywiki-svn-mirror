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
	echo "\r\n\r<img src=http://chart.apis.google.com/chart?chtt=".urlencode($title)."&cht=lc&chs=800x375&chd=".chart_data($values)."&chxt=x,y&chxl=0:|".$labels."|1:|0|".$r2."|".round(max($values))."&chf=c,lg,90,76A4FB,0.5,ffffff,20|bg,s,EFEFEF>";

	print_r($values);

}

$SQL ="SELECT DATE_FORMAT(time, '%m/%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >'2008-01-01 00:00:00'  GROUP BY Date order by time";
displayGraph($SQL, "Instance views by month.");

echo "<br /><br /><br />";

$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >'2008-08-20 00:00:00'  GROUP BY Date order by time";
displayGraph($SQL, "Instance views by recent days.");

exit;



?>