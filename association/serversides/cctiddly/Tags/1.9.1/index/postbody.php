<?php
	if( isset( $tiddlers['MarkupPostBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostBody']['body']);
	}
?>
