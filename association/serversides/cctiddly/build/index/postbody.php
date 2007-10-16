<?php /*print cct_print_form($standalone);/*cct*/ ?>

<?php 
	if( isset( $tiddlers['MarkupPostBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostBody']['body']);
	}
?>
