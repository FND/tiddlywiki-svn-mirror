<?php

$URI = explode('/', $_SERVER['REQUEST_URI']);

if($URI[1] == 'static'){
	array_shift($URI);// remove first item from array
	array_shift($URI); // remove second item from the array
	$path = getcwd().'/plugins/static/static/'.implode("/", $URI);
	if(file_exists($path))
	{	
		header("Content-type: ".mime_content_type($path));
		echo file_get_contents($path);
		exit;
	}
}

?>
