//{{{
ExternalTheme = {

	tiddlers : ['StyleSheet.css','PageTemplate.html'],
	
	refreshFlag : false,
	
	refresh : function(){
		var originalPath = document.location.toString();
		var localPath = getLocalPath(originalPath);
		var basePath,p;
		var changed = false;
		if((p = localPath.lastIndexOf("/")) != -1)
			basePath = localPath.substr(0,p) + "/";
		else if((p = localPath.lastIndexOf("\\")) != -1)
			basePath = localPath.substr(0,p) + "\\";
		else
			basePath = localPath + ".";
				
		for (var i=0; i<ExternalTheme.tiddlers.length; i++){
			var f = ExternalTheme.tiddlers[i];
			var text = loadFile(basePath + f);
			var shadow = config.shadowTiddlers[f.split('.')[0]];
			if(text && shadow!=text){
				config.shadowTiddlers[f.split('.')[0]] = text;
				changed = true;
			}
		}				
		if(!startingUp && changed)
			refreshAll();
	},
	
	refreshEv : function(){
		var me = ExternalTheme;
		me.refresh();
		me.refreshFlag = !me.refreshFlag;
		if (me.refreshFlag){
			displayMessage('started periodic theme refresh');
			me.refreshExternalThemePeriodic();
		}
		else{
			clearInterval(me.periodicRefresher);
			displayMessage('stopped periodic theme refresh');	
		}
	},	
	
	refreshExternalThemePeriodic : function(){
		ExternalTheme.periodicRefresher = window.setInterval('ExternalTheme.refresh()',5000);
	},

	restart : window.restart,
	
	init : function(){
		ExternalTheme.refresh();
		window.restart = function(){
			ExternalTheme.restart.apply(this,arguments);	
			ExternalTheme.refreshEv();
		}
	}
	
}

ExternalTheme.init();
//}}}