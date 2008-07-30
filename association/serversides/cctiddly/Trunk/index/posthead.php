<?php
$tw = $tiddlyCfg['tiddlywiki_type'];
echo "<script type='text/javascript' >".file_get_contents($tw)."</script>";
?>
<!--set vars for cctiddly-->
	<script type='text/javascript' >
		config.options.chkHttpReadOnly = false;		//make it HTTP writable by default
		config.options.chkSaveBackups = false;		//disable save backup
		config.options.chkAutoSave = false;			//disable autosave
		config.options.chkUsePreForStorage = false;
	</script>
<!--End of ccT vars-->

<?php
	if( isset( $tiddlers['MarkupPostHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostHead']['body']);
	}
?>
