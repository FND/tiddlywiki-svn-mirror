<?php 


if (isset($_REQUEST["standalone"]) && $_REQUEST["standalone"]==1) {
       tiddler_outputOffline();
} else {
include_once($cct_base."includes/ccAssignments.php");
    echo tiddler_outputFolder("tiddlers", $cct_base);
    echo tiddler_outputFolder("lang/".$tiddlyCfg['pref']['language'], $cct_base);
}

if( sizeof($tiddlers)>0 ){
	foreach($tiddlers as $t)
	{
		tiddler_outputDIV($t);
	}
}
if (isset($_REQUEST["standalone"]) && $_REQUEST["standalone"]==1)
{
?>
// OFF LINE TIDDLERS 
<div title='ccAdaptorSaveLocal' modifier='ccTiddly' tags='systemConfig excludeLists excludeSearch ccTiddly'>
<pre>
	
config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){
//	if(isLoggedIn()){
	//	wikify("[[sync]]", place);
//	}
}	
		
config.backstageTasks.remove("upgrade");
config.macros.ccLogin={};
config.macros.ccLogin.handler = function() {};
window.readOnly = false;
window.saveChanges = function(){};
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
<div title="loginStatus">
<pre>
You are viewing the file on offline mode.

To update your changes please log into ccTiddly in a seperate window and then press the sync button.

[[sync]] 
</pre>
</div>
<div title="sync" tags='wizard'>
<pre>
&lt;&lt;sync>>
</pre>
</div>
<?php
}
?>