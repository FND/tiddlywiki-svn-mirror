<?php 
	if( isset( $tiddlers['MarkupPostHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostHead']['body']);
	}
?>

<?php print cct_print_includes($standalone);/*cct*/ ?>
<!--script below are ccT plugins-->
<?php print cct_print_plugins($standalone);/*cct*/ ?>
<!--End of ccT plugins-->
