<?php
	if( isset( $tiddlers['MarkupPreHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPreHead']['body']);
	}else{
		
		if(is_file($tiddlyCfg['pref']['upload_dir'] .$tiddlyCfg['workspace_name']."/$config.xml"))
			print "<link rel='alternate' type='application/rss+xml' title='RSS' href='".$tiddlyCfg['workspace_name']."/$config.xml'>";

	}
?>
