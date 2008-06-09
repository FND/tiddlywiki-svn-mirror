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

depends on the GenerateRssPlugin and RSSAdaptor plugins

!!!Options
|<<option txtSharedNotesUserName>>|<<message config.optionsDesc.txtSharedNotesUserName>>|
|<<option chkSharedNotesPutEnabled>>|<<message config.optionsDesc.txtSharedNotesPutEnabled>>|
|<<option chkSharedNotesGetEnabled>>|<<message config.optionsDesc.txtSharedNotesGetEnabled>>|

!!!Source Code
***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SharedNotesPlugin){
version.extensions.SharedNotesPlugin = {installed:true};

config.options.txtSharedNotesUserName = "YourName";
config.optionsDesc.txtSharedNotesUserName = "UserName used on the server for shared notes";
config.options.chkSharedNotesPutEnabled = true;
config.optionsDesc.chkSharedNotesPutEnabled = "send shared note tiddlers to a server enabled";
config.options.chkSharedNotesGetEnabled = true;
config.optionsDesc.chkSharedNotesGetEnabled = "get other people's SharedNotes";

config.macros.SharedNotes = {

	tag: { 
		note: "notes",
		discovered: "discovered_notes"
	},
	busy: false,
	messages: {
		savingNotes: "saving notes on the server ..",
		savingFailed: "unable to save notes on the server",
		savedOK: "notes saved on the server"
	},
	help: {
		missingUserName: 'SharedNotesUserName'
	},
	thistime: 0,
	lasttime: 0,
	serialize: GenerateRss.serialize,
	adaptor: '',

	putNotes: function(){
		var me = config.macros.SharedNotes;
		if(!config.options.chkSharedNotesPutEnabled){
			return;
		}
		if(config.options.txtSharedNotesUserName=='YourName'){
			if (me.help.missingUsername){
				story.displayTiddler("top",me.help.missingUserName);
			}
			return;
		}
		if(me.busy){
			log("putNotes: busy");
			return;
		}
		me.busy = true;
		me.thistime = Date();
		if (!me.putNotesCall()){
			me.busy = false;
			return;
		}
		return;
	},

	putNotesCall: function(){
		log("putNotesCall");
		var me = config.macros.SharedNotes;
		var tiddlers = me.getSharedNoteTiddlers();
		if (!tiddlers){
			log("putNotesCall: no tiddlers to put");
			return false;
		}
		var adaptor = config.adaptors[me.adaptor];
		if (!adaptor){
			log("putNotesCall: no adaptor for putting notes");
			return false;
		}
		var callback = function(status,params,responseText,uri,xhr){
			me.busy = false;
			if(!status){
				displayMessage(me.messages.savedFailed);
				return;
			} 
			displayMessage(me.messages.savedOK);
			me.lasttime = me.thistime;
		};
		var rss = me.serialize(tiddlers,{modifier:config.options.txtSharedNotesUserName});
		if (!adaptor.putRss(rss,callback,me)){
			return false;
		}
		displayMessage(me.messages.savingNotes);
		return true;
	},

	getSharedNoteTiddlers: function(){
		var me = config.macros.SharedNotes;
		var putRequired = false;
		var tiddlers = [];
		store.forEachTiddler(function(title,t){
			if(t.isTagged(me.tag.note)){
				tiddlers.push(t);
				if(t.modified > me.lasttime){
					putRequired = true;
				}
			}
		});
		if (!putRequired){
			log("no tiddlers modified since last put ", t.lasttime);
			return null;
		}
		log("tiddlers to put: " + tiddlers.length);
		return tiddlers;
	},

	getNotes: function(uri,userName){
		if(!config.options.chkSharedNotesGetEnabled){
			return;
		}
		log("getNotes:",uri,userName);
                config.macros.importWorkspace.getTiddlers(uri,"rss",null,null,config.macros.SharedNotes.tagNoteAdaptorCallback,userName);
	},

	tagNoteAdaptorCallback: function(context,userParams){
		log("tagNoteAdaptorCallback",context,userParams);

		var me = config.macros.SharedNotes;
		var tiddler = context.tiddler;

		log("context.userParams:", userParams);

		if (context.userParams){
			tiddler.modifier = context.userParams;
		}

		displayMessage("importing notes from " + tiddler.modifier);
		if(tiddler.modifier != config.options.txtSharedNotesUserName){
			tiddler.tags.remove(me.tag.note);
			tiddler.tags.pushUnique(me.tag.discovered);
		}
		tiddler.fields.rr_session_id = tiddler.title.replace(/ from.*$/,"");
	}

};

config.macros.SharedNotes.PutNotesButton = {};
config.macros.SharedNotes.PutNotesButton.handler = function (place,macroName,params,wikifier,paramString,tiddler){
	var me = config.macros.SharedNotes;
	var button = createTiddlyButton(place,'PUT NOTES','Click here to put your shared notes',this.putNotes);
	me.putNotes();
	return false;
};

config.macros.SharedNotes.GetNotesButton = {};
config.macros.SharedNotes.GetNotesButton.handler = function (place,macroName,params,wikifier,paramString,tiddler){
	var me = config.macros.SharedNotes;
	var button = createTiddlyButton(place,'GET NOTES','Click here to get your shared notes',this.putNotes);
	me.putNotes();
	return false;
};

} //# end of 'install only once'
//}}}
