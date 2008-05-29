/***
|''Name:''|SharedNotesPlugin|
|''Description:''|Share Tiddlers as a RSS feed|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/SharedNotesPlugin.js |
|''Version:''|0.0.16|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|

***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SharedNotesPlugin) {
version.extensions.SharedNotesPlugin = {installed:true};

config.macros.SharedNotes = {

	noteTag: "notes",
	sharedTag: "shared",
	busy: false,
	messages: {
		userNameNotSet: 'to share notes you should set your [[Username]]'
	},
	starttime: 0,
	lasttime: 0,
	serialize: GenerateRss.serialize,
	uri: '',
	adaptor: '',

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		var me = config.macros.SharedNotes;
	        var button = createTiddlyButton(place,'PUT NOTES','Click here to put your shared notes',this.putNotes);
		me.putNotes();
	},

	putNotes: function() {
		var me = config.macros.SharedNotes;
		if(!config.options.chkRippleRapShare) {
			return;
		}
		if(config.options.txtUserName=='YourName') {
			clearMessage();
			displayMessage(me.messages.userNameNotSet);
			return;
		}
		if(me.busy) {
console.log("busy!");
			return;
		}
		me.busy = true;
		var now = Date();
		var tiddlers = me.getSharedNoteTiddlers();
		if (!tiddlers) {
console.log("no tiddlers!");
			me.busy = false;
			return;
		}

console.log("putting!");
		var callback = function(status,params,responseText,uri,xhr) {
			var me = params[0];
			me.busy = false;
			if(status) {
				me.lasttime = me.starttime;
			}
		};
		var rss = me.serialize(tiddlers);
		var adaptor = config.adaptors[me.adaptor];
		if (adaptor) {
		    if (!config.adaptors[me.adaptor].putRss(rss,callback,me,uri)) {
		    }
		}
console.log("clearing busy!");
		me.busy = false;
		return;
	},

	getSharedNoteTiddlers: function() {
		var me = config.macros.SharedNotes;
		var putRequired = false;
		var tiddlers = [];
		store.forEachTiddler(function(title,t) {
			if(t.isTagged(me.noteTag) && t.isTagged(me.sharedTag)) {
				tiddlers.push(t);
				if(t.modified > me.lasttime) {
					putRequired = true;
				}
			}
		});
		if (!putRequired) {
			return null;
		}
		return tiddlers;
	}
};

} //# end of 'install only once'
//}}}
