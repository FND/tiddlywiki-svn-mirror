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
			 	$tiddler = file_get_contents($cct_base."ccPlugins/".$file);
			// now we have to pull out the tiddler content and encode it. 
				if ($pos1 = stripos($tiddler, "<pre>"))
				{
					// find the first pre tag and remove everything before it. 
					$top = substr($tiddler,  0, $pos1+5);
					$content = substr($tiddler,  $pos1+5); 

					// get the last </pre> tag
					$pos2 = strrpos($content, "</pre>");
					$bottom = substr($content,  $pos2); 
					$content = substr($content,0,$pos2);
				}else
				{
					// look for first closing tag
					$pos1 = stripos($tiddler, ">");
					$top = substr($tiddler,  0, $pos1+1);
					$content = substr($tiddler,  $pos1+1); 
					// look for the final closing div tag
					$pos2 = strrpos($content, "</div>");
					$bottom = substr($content,  $pos2); 
					$content = substr($content,0,$pos2);
				}

				echo "\n\r".$top;
				echo htmlspecialchars($content);
				echo $bottom;	
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