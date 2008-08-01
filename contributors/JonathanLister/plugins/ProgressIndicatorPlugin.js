/***
|''Name:''|ProgressIndicatorPlugin|
|''Description:''|Adds a download/upload HTTP progress indicator. Only works in Firefox and Safari|
|''Author''|JonathanLister|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/JonathanLister/plugins/ProgressIndicatorPlugin.js |
|''Version:''|0.4|
|''Dependencies:''|ExtendableHttpRequestPlugin|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|

***/

//{{{
if(!version.extensions.ProgressIndicatorPlugin) {
version.extensions.ProgressIndicatorPlugin = {installed:true};

window.httpReq.extend({
	updateProgressIndicator: function(position,totalSize,direction) {
		if(!direction) {
			direction = "downloading";
		}
		var percentComplete = 0;
		var goodData = true;
		if(totalSize===4294967295) { // bug in event reporting totalSize
			goodData = false;
		} else if(totalSize!==0) {
			percentComplete = Math.floor((position / totalSize)*100);
			percentComplete = percentComplete > 100 ? 100 : percentComplete;
		}
		clearMessage();
		displayMessage(url);
		if(goodData) {
			displayMessage(direction+"... "+percentComplete+"%");
		}
		displayMessage('('+position+' of '+(goodData ? totalSize : 'unknown')+' bytes)');
		if(percentComplete=='100') {
			window.setTimeout(function(){
				clearMessage();
			},2000);
		}
	},
	
	onprogress: function(e) {
		var local = url.indexOf('file://')!=-1;
		var direction = (type=='GET') ? "downloading" : "uploading";
		var position = e.position;
		var totalSize = e.totalSize;
		if(local) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				totalSize = x.channel.contentLength;
			} catch(ex) {
				// do nothing
			}
		}
		x.updateProgressIndicator(position,totalSize,direction);
	},

	onreadystatechange: function() {
		//# add Safari progress indicator
		if(x.readyState >= 3 && config.browser.isSafari && type=='GET') {
			var local = url.indexOf('file://')!=-1;
			if(!local) { // haven't figured out how to make this work for local files yet - no response headers!
				var totalSize = x.getResponseHeader('Content-Length');
				var responseText = x.responseText;
				var position = responseText ? responseText.length : 0;
				x.updateProgressIndicator(position,totalSize);
			} else {
				clearMessage();
				displayMessage('no support yet for local file progress indicator in Safari');
				if(x.readyState == 4){
					window.setTimeout(function(){
						clearMessage();
					},2000);
				}
			}
		}
		try {
			var status = x.status;
		} catch(ex) {
			status = false;
		}
		if(x.readyState == 4 && callback && (status !== undefined)) {
			if([0, 200, 201, 204, 207].contains(status))
				callback(true,params,x.responseText,url,x);
			else
				callback(false,params,null,url,x);
			x.onreadystatechange = function(){};
			x = null;
		}
	}
});

} //# end of 'install only once'
//}}}