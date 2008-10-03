<?php
$dir = dirname(dirname(dirname($tiddlyCfg['pref']['upload_dir'])))."/uploads/tiddlers/".$tiddlyCfg['workspace_name']."";

mkdir($dir, 0777, true);
$myFile = $dir."/".$ntiddler['title'].".html";
$fh = fopen($myFile, 'w+') or die("can't open file");
$doc = "<html>\r\n<head>\r\n<script language='javascript'><!-- \r\n//location.replace('".dirname(getUrl())."/".$tiddlyCfg['workspace_name']."#".$ntiddler['title']."') \r\n //--></script>\r\n</head>\r\n<body>\r\n";

$str = str_replace(dirname(getUrl()), dirname(getUrl())."/", formatParametersPOST($_POST['wikifiedBody']));
$str = str_replace("#", "", $str);

$doc .= $str."\r\n</body>\r\n</html>";

if(fwrite($fh, $doc)){
}
fclose($fh);		

?>