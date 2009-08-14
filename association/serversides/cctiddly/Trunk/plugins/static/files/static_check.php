<?php

$URI = explode('/', $_SERVER['REQUEST_URI']);

if($URI[1] == 'static'){
	array_shift($URI);// remove first item from array
	array_shift($URI); // remove second item from the array
//	echo var_dump($URI);
	$path = getcwd().'/plugins/static/static/'.implode("/", $URI);
	echo file_get_contents($path);
	exit;
}

?>
