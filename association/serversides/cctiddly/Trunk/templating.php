<?php

//extract tiddlers

$file = file_get_contents('tiddlywikis/empty.html');

$start = '<!--PRE-HEAD-START-->';
$end = '<!--PRE-HEAD-END-->';
$start_pos = strpos($file, $start);
$end_pos = strpos($file, $end);

echo substr($file, $start_pos+strlen($start), $end_pos - $start_pos - strlen($start));

?>

