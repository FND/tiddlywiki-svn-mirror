/*

FILE: jquery.saveToFile.js
DATE: Oct 3rd 2008
AUTHORS: Phil Hawksworth. [http://hawksworx.com]
DESCRIPTION: Enable write access to the filesystem for local file saving.
NOTES: For a good breakdown of an excellent design pattern for jQuery plugins see http://www.learningjquery.com/2007/10/a-plugin-development-pattern

USAGE:

// Save changes to anything in the page body using the default settings.
$('body').saveToFile();

// Save changes to a div with an id of 'store', overriding any of the default settings.
$('#store').saveToFile({
	path: 'PATH',
	filename: 'FILENAME',
	backup: true|false,
	silent: true|false
});

// change a default setting for easier custom behavior.
$.fn.saveToFile.default.filename = 'fileName.html';

*/

	
(function($) {
	
	// plugin definition
	$.fn.saveToFile = function(options) {
		var opts = $.extend({}, $.fn.saveToFile.defaults, options);
		
		log("Saving ", this, opts);
		saveChanges();
	};
	
	// plugin defaults.
	$.fn.saveToFile.defaults = {
		path: '/how/far/can/we/reach?/',
		filename: 'fileName.html',
		backup: true,
		silent: false
	};	
	
	// Private functions.
	function log() {
		if (window.console && window.console.log)
			window.console.log(arguments);
	};

	// Save this tiddlywiki with the pending changes
	function saveChanges()
	{
		//# Get the URL of the document
		var originalPath = document.location.toString();
		var localPath = getLocalPath(originalPath);
		var save = false;
		try {
			//# Save new file
			var head = $('head').html();
			var body = $('body').html();
			var revised = head + body;
			save = saveFile(localPath,revised);
		} catch (ex) {
			console.log('exception ', ex);
		}
		if(save) {
			alert("Saved!");
		} else {
			alert("Save failed");
		}
	}
	
	function getLocalPath(origPath)
	{
		var originalPath = convertUriToUTF8(origPath,'UTF-8');
		// Remove any location or query part of the URL
		var argPos = originalPath.indexOf("?");
		if(argPos != -1)
			originalPath = originalPath.substr(0,argPos);
		var hashPos = originalPath.indexOf("#");
		if(hashPos != -1)
			originalPath = originalPath.substr(0,hashPos);
		// Convert file://localhost/ to file:///
		if(originalPath.indexOf("file://localhost/") == 0)
			originalPath = "file://" + originalPath.substr(16);
		// Convert to a native file format
		//# "file:///x:/path/path/path..." - pc local file --> "x:\path\path\path..."
		//# "file://///server/share/path/path/path..." - FireFox pc network file --> "\\server\share\path\path\path..."
		//# "file:///path/path/path..." - mac/unix local file --> "/path/path/path..."
		//# "file://server/share/path/path/path..." - pc network file --> "\\server\share\path\path\path..."
		var localPath;
		if(originalPath.charAt(9) == ":") // pc local file
			localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
			localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
		else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(7));
		else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
			localPath = unescape(originalPath.substr(5));
		else // pc network file
			localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
		return localPath;
	}

	function saveFile(fileUrl,content) {
		var r = mozillaSaveFile(fileUrl,content);
		if(!r)
			r = ieSaveFile(fileUrl,content);
		if(!r)
			r = javaSaveFile(fileUrl,content);
		return r;
	}

	// Returns null if it can't do it, false if there's an error, true if it saved OK
	function mozillaSaveFile(filePath,content) {
		if(window.Components) {
			try {
				netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
				var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(filePath);
				if(!file.exists())
					file.create(0,0664);
				var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
				out.init(file,0x22,4,null);
				out.write(content,content.length);
				out.flush();
				out.close();
				return true;
			} catch(ex) {
				//# alert("Exception while attempting to save\n\n" + ex);
				return false;
			}
		}
		return null;
	}
})(jQuery);