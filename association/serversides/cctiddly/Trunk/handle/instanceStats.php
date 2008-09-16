<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");
$SQL = "SELECT DATE_FORMAT(time, '%M') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >'2008-01-01 11:57:18'  GROUP BY Date order by time";
$results = mysql_query($SQL);

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



$count = 0;
while($result=mysql_fetch_assoc($results)){	
	$values[$count++] .=$result['numRows'];
	$labels .= $result['Date']."|";
}
print_r($values);

echo "\r\n\r<img src=http://chart.apis.google.com/chart?chtt=".urlencode("It's an example!")."&cht=lc&chs=450x125&chd=".chart_data($values)."&chxt=x,y&chxl=0:|".$labels."|1:|0|500|1000|1500&chf=c,lg,90,76A4FB,0.5,ffffff,20|bg,s,EFEFEF>";
exit;


echo $values = substr($values,0,strlen($values)-1); 
$labels = substr($labels,0,strlen($labels)-1); 

//echo "<img src='http://chart.apis.google.com/chart?cht=p3&chd=t:".$values."&chs=250x100&chl=".$labels."' />";
//echo "<img src='http://chart.apis.google.com/chart?cht=lc&chs=200x100&chd=s:fohmnytenefohmnytene&chxt=x,y&chxl=0:|".$labels."1:||50+Kb' />";

echo $src = "http://chart.apis.google.com/chart?cht=lc&chd=".chart_data($values)."&chs=200x125&chxt=x,y&chxl=0:|".$labels."|1:|0|500|1000|1500&chf=c,lg,90,76A4FB,0.5,ffffff,20|bg,s,EFEFEF";
echo "<br />";
echo "\r\n\r<img src='".$src."' />";	
echo "<img src='http://chart.apis.google.com/chart?cht=lc&chd=t:".$values."&chco=676767&chls=4.0,3.0,0.0&chs=200x125&chxt=x,y&chxl=0:|1|2|3|4|5|1:|0|500|1000|1500&chf=c,lg,0,76A4FB,1,ffffff,0|bg,s,EFEFEF' />";



?>