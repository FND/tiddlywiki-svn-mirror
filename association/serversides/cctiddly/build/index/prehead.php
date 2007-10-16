<?php
	if( isset( $tiddlers['MarkupPreHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPreHead']['body']);
	}else{
		print "<link rel='alternate' type='application/rss+xml' title='RSS' href='$config.xml'>";
	}
?>
