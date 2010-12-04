/***
|''Name:''|DeletePlugin |
|''Description:''|Helper to DELETE tiddlers from TiddlySpace, etc |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/DeletePlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/DeletePlugin/ |
|''Version:''|0.1 |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4 |
!!Documentation
A macro which should be used with caution as there is no recovery for deleted tiddler. 
Only works from the same space, or a file URI:

<<deleteTiddler>>
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config httpReq confirm */
(function ($) {
	version.extensions.DeletePlugin = {installed: true};
	config.macros.deleteTiddler = {
		handler: function (place) {
			var e = $(place).append('<form>' +
				'<div><label>server:</label> <input type="text" name="server" value="tiddlyspace.com"/></div>' +
				'<div><label>spacename:</label> <input type="text" name="spacename"/></div>' +
				'<div><label>suffix:</label> <input type="text" name="suffix" value="public"/><div>' +
				'<div><label>tiddler:</label> <input type="text" name="tiddler"/></div> ' +
				'<div><input type="submit" value="DELETE"/></div>' +
				'</form>').submit(function () {
					var server = $(this).find('input[name="server"]').val();
					var spacename = $(this).find('input[name="spacename"]').val();
					var suffix = $(this).find('input[name="suffix"]').val();
					var tiddler = $(this).find('input[name="tiddler"]').val();
					var uri = 'http://' + spacename + "." + server + '/bags/' + spacename + '_' + suffix + '/tiddlers/' + tiddler;
					if (confirm("DELETE: '" + uri + "' ?")) {
						httpReq("DELETE", uri, config.macros.deleteTiddler.callback, {}, {}, null, null, null, null, true);
					}
				    return false;
				});
		},
		callback: function (status, context, responseText, uri, xhr) {
			displayMessage(xhr.status == 204 ? "deleted" : "not deleted");
		}
	};
}(jQuery));
//}}}
