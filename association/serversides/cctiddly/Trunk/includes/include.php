<?php 
include_once($cct_base."includes/ccAssignments.php");

$dir = $cct_base."ccPlugins/";
// Open plugins directory, and read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
       while (($file = readdir($dh)) !== false) {
			$ext = substr($file, strrpos($file, '.') + 1); 
			if ($ext == "js")			
				echo tiddler_outputJsFile("ccPlugins/".$file, $cct_base);
    		else if ($ext == "tiddler")
				echo tiddler_outputTiddlerFile("ccPlugins/".$file, $cct_base);
    	}
        closedir($dh);
    }
}

///////  START DEBUG TIDDLER 

recordTime_float("before print tiddly");
if( sizeof($tiddlers)>0 ){
	foreach($tiddlers as $t)
	{
		tiddler_outputDIV($t);
	}
}
recordTime_float("after print tiddly");

//print time tiddly in debug mode
if($tiddlyCfg['developing']>0){
	recordTime_float("end of script");
	print "<div tiddler=\"ccTiddly_debug_time\" modified=\"000000000000\" modifier=\"ccTiddly\" created=\"000000000000\" temp.ccTrevision=\"1\" tags=\"debug\">";
	for($i=1; $i<sizeof($time); $i++)
	{
		print $time[$i]["name"]." = ".(round($time[$i]["time"]-$time[0]["time"],3))."s\\n";
	}
	print "</div>";
}
///// END DEBUG TIDDLER
?>