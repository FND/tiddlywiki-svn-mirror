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



$a = file_get_contents('redirect.csv');
$b = csv_explode($a);

print_r($b);
?>