<?php
$dir = dirname(dirname(dirname($tiddlyCfg['pref']['upload_dir'])))."/uploads/workspace/".$tiddlyCfg['workspace_name']."/tiddlers";
	mkdir($dir, 0700, true);
	$myFile = $dir."/".$ntiddler['title'].".html";
	$fh = fopen($myFile, 'w+') or die("can't open file");
	$doc = "<html>\r\n<head>\r\n<script language='javascript'><!-- \r\nlocation.replace('".dirname(getUrl())."/".$tiddlyCfg['workspace_name']."#".$ntiddler['title']."') \r\n //--></script>\r\n</head>\r\n<body>\r\n";
	$doc .= $_POST['wikifiedBody']."\r\n</body>\r\n</html>";
	if(fwrite($fh, formatParametersPOST($doc))){
	}
	fclose($fh);		



?>