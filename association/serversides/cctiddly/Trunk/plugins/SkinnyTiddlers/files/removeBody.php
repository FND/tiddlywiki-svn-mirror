<?php

echo $t['title'];
echo "auto load title is : ".$autoLoad[$t['title']]."\n";

if(!isset($autoLoad[$t['title']])) // using isset instead of in_array to speed things up.
	$t['body'] = "";

?>
