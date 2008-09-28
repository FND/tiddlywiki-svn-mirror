<?php


error_log("SEO PLUGGIN OUTPUT PLUGIn");


$dir = dirname(dirname(dirname($tiddlyCfg['pref']['upload_dir'])))."/uploads/workspace/".$tiddlyCfg['workspace_name']."/tiddlers";
	
error_log("UPLOAD DIR : ".$dir);

	mkdir($dir, 0700, true);

	$myFile = $dir."/".$ntiddler['title'].".html";
	$fh = fopen($myFile, 'w+') or die("can't open file");

	if(fwrite($fh, formatParametersPOST($_POST['wikifiedBody']))){
	}
	fclose($fh);		



?>