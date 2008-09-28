<?php


error_log("SEO PLUGGIN OUTPUT PLUGIn");





//makeFolder($local_root.$folder);

	
//error_log("UPLOAD DIR : ".$tiddlyCfg['pref']['upload_dir']."workspace/".$tiddlyCfg['workspace_name']."/tiddlers");
exit;

	$myFile = $local_root.$folder.$file;
	$fh = fopen($myFile, 'w') or die("can't open file");

	if(fwrite($fh, $_POST['ccHTML'])){
		sendHeader("201");
		$url = $remote_root.$folder.$_POST['ccHTMLName'];
		echo "click here to view it <a href='".$url."'>".$url."</a>";
		exit;
	}
	fclose($fh);		
}


?>