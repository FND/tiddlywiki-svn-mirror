<?php
if(!isset($cct_base)) {
	$cct_base= "../";
}

include_once($cct_base."includes/header.php");
include_once($cct_base."includes/config.php");
	$feed = $_REQUEST['feed'];
 function readExternalFile($feed) {
    //    $host = parse_url($feed, PHP_URL_HOST);
    //  echo   $file = substr(parse_url($feed, PHP_URL_PATH), 1);


	$url = parse_url($feed);
		$host = $url[host];

        $fp = fsockopen($host, 80, $errno, $errstr, 30);
        if (!$fp) {
           $result = "$errstr ($errno)<br />\n";
        } else {
      $out = "GET /".$file." HTTP/1.1\r\n";
           $out .= "Host: ".$host."\r\n";
           $out .= "Connection: Close\r\n\r\n";

           fwrite($fp, $out);
           while (!feof($fp)) {
                   $result .= fgets($fp);
           }
           fclose($fp);
        }

        ob_start();
       print ("$result");
}

$feed = $_REQUEST['feed'];
$url = parse_url($feed);
if(!in_array($url[host], $tiddlyCfg['allowed_proxy_list']))
{
	error_log("");
	exit;
}
if($feed != '' && strpos($feed, 'http') === 0)
{
	readExternalFile($feed);
	return;
}
?>