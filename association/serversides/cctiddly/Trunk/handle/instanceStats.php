<?php

$cct_base = "../";
include_once($cct_base."includes/header.php");


// format : "19-02-2006" or any other format strtotime can handle.
function getMaxDate($dates){
	foreach($dates as $date){
	if(gmdate("Y-m-d", strtotime($temp)) < gmdate("Y-m-d", strtotime($date)))
			 $temp = $date;
	}
	return $temp;
}


function GetDays($sStartDate, $sEndDate, $interval){
  // Firstly, format the provided dates.
  // This function works best with YYYY-MM-DD
  // but other date formats will work thanks
  // to strtotime().
  $sStartDate = gmdate("Y-m-d H", strtotime($sStartDate));
  $sEndDate = gmdate("Y-m-d H", strtotime($sEndDate));

  // Start the variable off with the start date
  $aDays[] = $sStartDate;

  // Set a 'temp' variable, sCurrentDate, with
  // the start date - before beginning the loop
  $sCurrentDate = $sStartDate;

  // While the current date is less than the end date
  while($sCurrentDate < $sEndDate){
    // Add a day to the current date
    	$sCurrentDate = gmdate("Y-m-d H", mktime()+3600);
    // Add this new day to the aDays array
    $aDays[] = $sCurrentDate;
  }

  // Once the loop has finished, return the
  // array of days.
//print_r($aDays);
  return $aDays;
}



function handleSQL($SQL, $format, $goBack, $interval){
	$results = mysql_query($SQL);
	$count = 0;
	while($result=mysql_fetch_assoc($results)){
		$dates[] .= strtotime($result['Date']);
		$hits[strtotime($result['Date'])] = $result['numRows'];
	}
	$to = date($format, mktime());
	$from = date($format, mktime()-$goBack);
	$timeBetween = GetDays("$from", "$to", $interval);
	foreach($timeBetween as $time){
		if(!in_array(strtotime($time), $dates)){
			$hits[strtotime($time)] = 0;
			$dates[] .= strtotime($time);
		}
	}
	
	//$data = SortByDate($data);
	sort($dates);
	
	foreach($dates as $date)
	{
		//echo "<b>".date("y-m-d", $date)."</b> Time : ".$hits[$date]."<br />";
		$str .= "{ date:'".date($format, $date)."', hits:".$hits[$date]." },";	
		
	}
	return $str = substr($str,0,strlen($str)-1);	
}



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



if ($_REQUEST['graph']=="minute")
	echo handleSQL("SELECT DATE_FORMAT(time, '%k:%i') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >SUBDATE(now() , INTERVAL 20 MINUTE) AND workspace='".$w."' GROUP BY Date order by time asc limit 20", "Y-m-d");

if ($_REQUEST['graph']=="hour"){
	$SQL = "SELECT DATE_FORMAT(time, '%k:00') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 1 day AND workspace='".$w."' GROUP BY Date order by time limit 24";
	echo handleSQL($SQL, "Y-m-d h:i", 86400, "+2 minute");
	// second in a day.
	
}
if ($_REQUEST['graph']=="day"){
	$SQL = "SELECT DATE_FORMAT(time, '%Y-%m-%d') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 7 DAY GROUP BY Date order by time limit 15";
	echo handleSQL($SQL, "Y-m-d", "-5 day", "+2 day");
}
if ($_REQUEST['graph']=="month")
	echo handleSQL("SELECT DATE_FORMAT(time, '%m/%y') AS Date,  COUNT(*) AS numRows FROM workspace_view  where time >CURRENT_DATE() - INTERVAL 12 MONTH AND workspace='".$w."'  GROUP BY Date order by time limit 200", "Y-m-d");

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