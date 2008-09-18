<?php

echo "{ date:'17/09/2008-10:41', hits:1 },{ date:'17/09/2008-10:42', hits:2 },{ date:'17/09/2008-10:46', hits:3 }";
exit;
$cct_base = "../";
include_once($cct_base."includes/header.php");

	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%Y-%k:%i') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 1 day AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by time limit 3";
	$results = mysql_query($SQL);
	$count = 0;
	while($result=mysql_fetch_assoc($results)){
		$str .= "{ date:'".$result['Date']."', hits:".$result['numRows']." },";	
	}
	
echo $str = substr($str,0,strlen($str)-1);

exit;











































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



function displayGraphData($chartTitle, $values, $xLabels, $yValues)
{	
	echo "[ {'thumb':'http://chart.apis.google.com/chart?cht=lc&chs=100x75&chd=".chart_data($values)."&chxt=x,y&chxl=0:||1:|', 'full':
	'http://chart.apis.google.com/chart?chtt=".urlencode($chartTitle)."&cht=lc&chs=800x375&chd=".chart_data($values)."&chxt=x,y&chxl=0:1:|".$yValues."&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&', 'a':'aaa' } ]";

	// echo "http://chart.apis.google.com/chart?chtt=".urlencode($chartTitle)."&cht=lc&chs=800x375&chd=".chart_data($values)."&chxt=x,y&chxl=0:1:|".$yValues."&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";
	//echo "http://chart.apis.google.com/chart?chtt=".urlencode($chartTitle)."&cht=lc&chs=800x375&chd=".chart_data($values)."&chxt=x,y&chxl=0:|". $yLabels."1:|".$xValues."&chf=c,lg,90,EEEEEE,0.5,ffffff,20|bg,s,FFFFFF&&chg=10.0,10.0&";	
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
	displayGraphData($_REQUEST['desc'], $values, "$label", $lv);
}







if ($_REQUEST['graph']=="minute"){
	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%Y-%k:%i') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 1 day AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by time";
displayGraph($SQL, "Views of workspace ".$_REQUEST['workspace']." over the past day by minutes");
}
if ($_REQUEST['graph']=="hour"){
	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%Y-%k') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 1 day AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by time";
displayGraph($SQL, "Views of workspace ".$_REQUEST['workspace']." over the past day by hour");
}
if ($_REQUEST['graph']=="day"){
	$SQL ="SELECT DATE_FORMAT(time, '%m/%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 7 DAY GROUP BY Date order by time";
	displayGraph($SQL, "Instance views by month over the past seven Days.");
}
if ($_REQUEST['graph']=="month"){
	$SQL ="SELECT DATE_FORMAT(time, '%d/%m/%y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 12 MONTH AND workspace='".$_REQUEST['workspace']."'  GROUP BY Date order by time";
	displayGraph($SQL, "Instance views by month over the past year.");
}
if ($_REQUEST['graph']=="year"){
	$SQL ="SELECT DATE_FORMAT(time, '%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 5 YEAR AND workspace='".$_REQUEST['workspace']."' GROUP BY Date order by time";
displayGraph($SQL, "Views of workspace ".$_REQUEST['workspace']." over the past 5 years.");
}
?>