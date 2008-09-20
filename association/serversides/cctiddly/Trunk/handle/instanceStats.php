<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");


if(!user_session_validate())
{
	sendHeader("403");
}


$w=$_REQUEST['workspace'];

if (!user_isAdmin(user_getUsername(), $w))
{
	sendHeader("401");
	exit;
}




// returns an array of all the timestamps between the start timestamp and current date. 
function gaps($start, $interval){
	$gaps[] = $start;
	$temp=$start;
	while($temp < mktime()){
		$temp = $temp + $interval;
		$gaps[] = $temp;
  	}
	return $gaps;
}

function handleSQL($SQL, $format, $goBack, $interval){
	$results = mysql_query($SQL);
	$count = 0;
	while($result=mysql_fetch_assoc($results)){
			$dates[] .= $result['Date'];
			$hits[$result['Date']] = $result['numRows'];
	}
	$a = gaps(mktime()-$goBack, $interval);
	foreach ($a as $time){
		if(!@in_array(date($format, $time), $dates)){
			$hits[date($format, $time)] = 0;
 			$dates[] = date($format, $time);
		}
	}
	sort($dates);
	foreach($dates as $date){
		if($date!="")
			$str .= "{ date:'".$date."', hits:".$hits[$date]." },";	
	}
	return substr($str,0,strlen($str)-1);	
}



if ($_REQUEST['graph']=="hour"){
	// last 24 hours
	$SQL = "SELECT DATE_FORMAT(time, '%d-%k') AS Date, COUNT(*) AS numRows FROM workspace_view  where time >SUBDATE(now() , INTERVAL 10 HOUR) AND workspace='".$w."' GROUP BY Date order by time limit 10";
	echo handleSQL($SQL, "d-H", 86400, 3600);
	// 3600 second in an hour.
	// 86400 second in a day.
}


if ($_REQUEST['graph']=="minute"){
	// last 20 min
 	$SQL = "SELECT DATE_FORMAT(time, '%k:%i') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >SUBDATE(now() , INTERVAL 20 minute) AND workspace='".$w."' GROUP BY Date order by time asc limit 20";
	echo handleSQL($SQL, "H:i", 1200, 60);
	// 3600 second in an hour.
	// 86400 second in a day.
}



if ($_REQUEST['graph']=="day"){
	// last 7 days
	$SQL = "SELECT DATE_FORMAT(time, '%Y-%m-%d') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 7 DAY AND workspace='".$w."'  GROUP BY Date order by time limit 15";
	echo handleSQL($SQL, "Y-m-d", 604800, 3600);
}
if ($_REQUEST['graph']=="month"){
	// last 5 months
	$SQL = "SELECT DATE_FORMAT(time, '%m/%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 12 MONTH AND workspace='".$w."'  GROUP BY Date order by time limit 200";
	echo handleSQL($SQL, "m/Y", 9592000, 3600);

}
if ($_REQUEST['graph']=="year")
	echo handleSQL("SELECT DATE_FORMAT(time, '%Y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 5 YEAR AND workspace='".$w."' GROUP BY Date order by time limit 5");










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