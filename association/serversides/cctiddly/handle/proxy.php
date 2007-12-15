<?php
	$feed = $_REQUEST['feed'];
	if($feed != '' && strpos($feed, 'http') === 0)
	{
		
		readfile($feed);
		return;
	}
?>