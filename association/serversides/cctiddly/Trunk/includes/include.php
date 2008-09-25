<?php 
include_once($cct_base."includes/ccAssignments.php");

if (isset($_REQUEST["standalone"]) && $_REQUEST["standalone"]==1)
	tiddler_outputOffline();
else
	echo tiddler_outputFolder("tiddlers", $cct_base);

///////  START DEBUG TIDDLER 

recordTime_float("before print tiddly");
if( sizeof($tiddlers)>0 ){
	foreach($tiddlers as $t)
	{
		tiddler_outputDIV($t);
	}
}
recordTime_float("after print tiddly");

//print time tiddly in debug mode
if($tiddlyCfg['developing']>0){
	$t["body"] = "";
	recordTime_float("end of script");
	for($i=1; $i<sizeof($time); $i++)
		$t["body"] =+ $time[$i]["name"]." = ".(round($time[$i]["time"]-$time[0]["time"],3))."s\\n";
	$t["title"] = 'ccTiddly Debug';
	$t["modifier"] = 'ccTiddly';
	$t["tags"] = 'ccTiddly debug';
	echo tiddler_outputDIV($t);
}
///// END DEBUG TIDDLER

if (isset($_REQUEST["standalone"]) && $_REQUEST["standalone"]==1)
{
?>

// OFF LINE TIDDLERS 
<div title='ccAdaptorSaveLocal' modifier='ccTiddly' tags='systemConfig excludeLists excludeSearch ccTiddly'>
<pre>
config.backstageTasks.remove("upgrade");
	
if (config.options.txtTheme == "")
config.options.txtTheme = '<?php echo $tiddlyCfg['txtTheme'];?>';

config.options.chkUsePreForStorage=true;
if (config.options.txtTheme == "")
config.options.txtTheme = '<?php echo $tiddlyCfg['txtTheme'];?>';
config.options.chkAutoSave = true;
window.offline = true;
config.defaultCustomFields = {"server.host":"<?php echo dirname(getUrl());?>", "server.type":"cctiddly", "server.workspace":"<?php echo $_REQUEST['workspace']?>"};
config.macros.ccOptions={};	
config.macros.ccOptions.handler=function(place,macroName,params,wikifier,paramString,tiddler){};
</pre>
</div>
<div title="LoginStatus">
<pre>
You are viewing the file on offline mode.

To update your changes please log into ccTiddly in a seperate window and then press the sync button.

[[sync]] 
</pre>
</div>

<div title="sync" tags='wizard'>
<pre>
&lt;&lt;sync&gt;&gt;
</pre>
</div>
<?php
}
?>



