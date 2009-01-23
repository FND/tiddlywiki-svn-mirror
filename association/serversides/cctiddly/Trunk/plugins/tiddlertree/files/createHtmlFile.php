<?php
echo "dfd";
$cct_base = "../../../";
include_once($cct_base."includes/header.php");
echo $dir = dirname(dirname(dirname($tiddlyCfg['pref']['upload_dir']))).'/uploads/documents';
mkdir($dir, 0777, true);
formatParametersPOST($_POST['html']);

$myFile = $dir."/".$_REQUEST['compositionTiddler'].".html";
$fh = @fopen($myFile, 'w+');

if(@fwrite($fh, $_POST['html'])){
}
@fclose($fh);
?>
