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

	tag: { 
		note: "notes",
		discovered: "discovered_notes"
	},
	busy: false,
	messages: {
		userNameNotSet: 'to share notes you should set your UserName'
	},
	thistime: 0,
	lasttime: 0,
	serialize: GenerateRss.serialize,
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
			return;
		}
		me.busy = true;
		me.thistime = Date();
		if (!me.doPut()) {
			me.busy = false;
		}
		return;
	},

	doPut: function() {
		var me = config.macros.SharedNotes;
		var tiddlers = me.getSharedNoteTiddlers();
		if (!tiddlers) {
			return false;
		}

		var callback = function(status,me,responseText,uri,xhr) {
			me.busy = false;
			if(status) {
				me.lasttime = me.thistime;
			}
		};
		var adaptor = config.adaptors[me.adaptor];
		if (!adaptor) {
			return false;
		}

		var rss = me.serialize(tiddlers);
		if (!adaptor.putRss(rss,callback,me)) {
			return false;
		}
		return true;
	},

	getSharedNoteTiddlers: function() {
		var me = config.macros.SharedNotes;
		var putRequired = false;
		var tiddlers = [];
		store.forEachTiddler(function(title,t) {
			if(t.isTagged(me.tag.note)) {
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
	},

	tagNoteAdaptorCallback: function(context,userParams) {
		var me = config.macros.SharedNotes;
		var tiddler = context.tiddler;
		if(tiddler.modifier != config.options.txtUserName){
			tiddler.tags.remove(me.tag.note);
			tiddler.tags.pushUnique(me.tag.discovered);
		}
		tiddler.fields.rr_session_id = tiddler.title.replace(/ from.*$/,"");
	}

};

} //# end of 'install only once'
//}}}
