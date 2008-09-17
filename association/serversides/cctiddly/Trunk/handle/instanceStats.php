<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");

function chart_data($values) {
	$maxValue = max($values);
	$simpleEncoding = 
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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



function displayGraphFull($chartTitle, $values, $xLabels, $yValues)
{
	echo "http://chart.apis.google.com/chart?chtt=".urlencode($chartTitle)."&cht=lc&chs=800x375&chd=".chart_data($values)."&chxt=x,y&chxl=0:|". $yLabels."1:|".$xValues."&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";	
}


function displayGraphThumb($values)
{
	echo "\r\n\rhttp://chart.apis.google.com/chart?cht=lc&chs=100x75&chd=".chart_data($values)."&chxt=x,y&chxl=0:||1:|";
	
}


function displayGraph($SQL, $title)
{	$results = mysql_query($SQL);
	$count = 0;
	while($result=mysql_fetch_assoc($results)){
		$labelValues[$count]=$result['numRows'];	
		$values[$count++] .=$result['numRows'];
		$labels .= $result['Date']."|";
	}
	$labelValues = array_unique($labelValues);
	sort($labelValues);
	foreach($labelValues as $label)
		$lv .=$label.'|';
	$lv = substr($lv,0,strlen($lv)-1);
	$r2 = round(max($values), -2)/2;
	if ($_REQUEST['full']==1)
		displayGraphFull("blah ", $values, $labels, $lv);
	else
		displayGraphThumb($values);
}




if ($_REQUEST['graph']==1){
	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%Y-%k:%i') AS Date,  COUNT(*) AS 
numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 1 day 
AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by time";
displayGraph($SQL, "Views of workspace ".$_REQUEST['workspace']." over 
the past day by minutes");
}
if ($_REQUEST['graph']==2){
	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%Y-%k') AS Date,  COUNT(*) AS 
numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 1 day 
AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by time";
displayGraph($SQL, "Views of workspace ".$_REQUEST['workspace']." over 
the past day by hour");
}
if ($_REQUEST['graph']==3){
	$SQL ="SELECT DATE_FORMAT(time, '%m/%Y') AS Date,  COUNT(*) AS 
numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 2 
YEAR AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by 
time";
	displayGraph($SQL, "Instance views by month over the past two 
years.");
}
if ($_REQUEST['graph']==4){

	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%y') AS Date,  COUNT(*) 
AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 10 
DAY AND workspace='".$_REQUEST['workspace']."'  GROUP BY Date order by 
time";
	displayGraph($SQL, "Instance views in the last 10 days.");
}



?>
