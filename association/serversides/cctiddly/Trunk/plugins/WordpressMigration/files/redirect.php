<?php
function csv_explode($str, $delim = ',', $qual = "\"") {
  $len = strlen($str);
  $inside = false;
  $word = '';
  for ($i = 0; $i < $len; ++$i) {
    if ($str[$i]==$delim && !$inside) {
			
	if($pos = strpos($word, 'http'))
	    $out[] = substr($word, $pos, strlen($word));
      $word = '';
    } else if ($inside && $str[$i]==$qual && ($i<$len && $str[$i+1]==$qual)) {
      $word .= $qual;
      ++$i;
    } else if ($str[$i] == $qual) {
      $inside = !$inside;
    } else {
      $word .= $str[$i];
    }
  }
  $out[] = $word;

  return $out;
}

$a = file_get_contents(getcwd().'/plugins/WordpressMigration/files/redirect.csv');
$array = csv_explode($a);
$uri = "http://".$_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];

if(in_array($uri, $array)) 
{
	header("HTTP/1.1 301 Moved Permanently");
	header("Location: ".$p->wordpressInstance.$_SERVER['REQUEST_URI']);
	exit();
}

?>