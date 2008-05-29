<?php 
include_once($cct_base."includes/ccVariables.php");

$dir = $cct_base."ccPlugins/";

// Open a known directory, and proceed to read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
       while (($file = readdir($dh)) !== false) {
			$ext = substr($file, strrpos($file, '.') + 1); 
			if ($ext == "js")
			{
				$tiddler_name = str_replace('.js', '', $file);
				echo "<div title=\"".$tiddler_name."\" modifier=\"ccTiddly\" tags=\"systemConfig excludeLists excludeSearch ccTiddly\">\n<pre>";
            	include_once($cct_base."ccPlugins/".$file);
				echo "</pre>\n</div>\n";
    		}else if ($ext == "tiddler")
			{		
					htmlentities(include_once($cct_base."ccPlugins/".$file));
			}
    	}
        closedir($dh);
    }
}

///////  START DEBUG TIDDLER 

recordTime_float("before print tiddly");
if( sizeof($tiddlers)>0 )
{
	foreach( $tiddlers as $t )
	{
		tiddler_outputDIV($t);
	}
}
recordTime_float("after print tiddly");

//print time tiddly in debug mode
if( $tiddlyCfg['developing']>0 )
{
	recordTime_float("end of script");
	//$time[] = microtime_float("end of script");

	print "<div tiddler=\"ccTiddly_debug_time\" modified=\"000000000000\" modifier=\"ccTiddly\" created=\"000000000000\" temp.ccTrevision=\"1\" tags=\"debug\">";
	for( $i=1; $i<sizeof($time); $i++ )
	{
		print $time[$i]["name"]." = ".(round($time[$i]["time"]-$time[0]["time"],3))."s\\n";
	}
	print "</div>";
}
///// END DEBUG TIDDLER
?>