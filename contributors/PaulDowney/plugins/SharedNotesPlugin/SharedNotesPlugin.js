/***
|''Name:''|SharedNotesPlugin|
|''Description:''|Share Tiddlers as a RSS feed|
|''Author:''|Osmosoft|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SharedNotesPlugin/ |
|''Version:''|0.0.16|
|''Date:''|Nov 27, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.2.6|
!!Documentation
This plugin was developed for [[RippleRap|http://ripplerap.com]], and designed to be used in conjunction with the [[SharedNotesAdaptor]] and the [[SharedNotesFeedPlugin]] to share and exchange tiddlers across [[TiddlyWiki|TiddlyWikis]] using RSS.

!!Options
|<<option txtSharedNotesUserName>>|<<message config.optionsDesc.txtSharedNotesUserName>>|
|<<option chkSharedNotesPutEnabled>>|<<message config.optionsDesc.chkSharedNotesPutEnabled>>|
|<<option chkSharedNotesGetEnabled>>|<<message config.optionsDesc.chkSharedNotesGetEnabled>>|

!!Macros
&lt;&lt;PutNotes&gt;&gt;
<<PutNotes>>

&lt;&lt;GetNotes&gt;&gt;
<<GetNotes>>

&lt;&lt;PopulateNotes&gt;&gt;
<<PopulateNotes>>

&lt;&lt;KillMyNotes&gt;&gt;
<<KillMyNotes>>

!!Code
***/
//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.SharedNotesPlugin){
version.extensions.SharedNotesPlugin = {installed:true};

config.optionsDesc.txtSharedNotesUserName = "UserName used on the server for shared notes";
config.options.txtSharedNotesUserName = "YourName";

config.optionsDesc.chkSharedNotesPutEnabled = "put shared note tiddlers to a server";
config.options.chkSharedNotesPutEnabled = true;

config.optionsDesc.chkSharedNotesGetEnabled = "get other people's shared note tiddlers";
config.options.chkSharedNotesGetEnabled = true;

config.macros.SharedNotes = {

	tag: { 
		note: "notes",			// notes made by this user
		privated: "private",		// notes made by this user not to be shared
		discovered: "discovered_notes"	// notes obtained from other users
	},
	busy: false,
	messages: {
		savingNotes: "saving notes on the server ..",
		savingFailed: "unable to save notes on the server",
		savedOK: "notes saved on the server",
		putNotes: { button: "PUT NOTES", tip: 'Click here to post your shared notes' },
		getNotes: { button: "GET NOTES", tip: 'Click here to download other people\'s shared notes' },
		populateNotes: { button: "POPULATE NOTES", tip: 'Click here to find other people\'s notes' },
		killMyNotes: { button: "KILL MY NOTES", 
                tip: 'Click here to delete all your notes from the file and on the server' }
	},
	help: {
		missingUserName: 'SharedNotesUserName'
	},
	thistime: 0,
	lasttime: 0,
	adaptor: '',
	session_prefix: '',

	putNotes: function(){
		var me = config.macros.SharedNotes;
		if(!config.options.chkSharedNotesPutEnabled){
			return false;
		}
		if(config.options.txtSharedNotesUserName=='YourName'){
			if (me.help.missingUsername){
				story.displayTiddler("top",me.help.missingUserName);
			}
			return false;
		}
		if(me.busy){
			log("putNotes: busy");
			return false;
		}
		me.busy = true;
		me.thistime = new Date();
		if (!me.putNotesCall()){
			me.busy = false;
			return false;
		}
		return false;
	},

	putNotesCall: function(){
		log("putNotesCall");
		var me = config.macros.SharedNotes;
		var tiddlers = me.listSharedNoteTiddlers();
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
		var text = config.macros.SharedNotesFeed.serialize(tiddlers,
			{modifier:config.options.txtSharedNotesUserName,
				session_prefix:me.session_prefix});
		if (!adaptor.putRss(text,callback,me)){
			return false;
		}
		displayMessage(me.messages.savingNotes);
		return true;
	},

	listSharedNoteTiddlers: function(){
		var me = config.macros.SharedNotes;
		var putRequired = false;
		var tiddlers = [];
		store.forEachTiddler(function(title,t){
			if((!t.isTagged(me.tag.privated))&&t.isTagged(me.tag.note)){
				tiddlers.push(t);
				log("testing:",t.title,t.created,t.modified,me.lasttime);
				if(t.modified > me.lasttime){
					putRequired = true;
				}
			}
		});
		if (!putRequired){
			log("no tiddlers modified since last put ", me.lasttime);
			return null;
		}
		log("tiddlers to put: " + tiddlers.length);
		return tiddlers;
	},

	install: function(){
		var me = config.macros.SharedNotes;
		if(!me.feedListManager){
			log('Installing feedlistmanager');
			me.feedListManager = new FeedListManager();
		}
	},

	populateNotes: function(){
		log("config.macros.RippleRap.populateNotes");
		var me = config.macros.SharedNotes;
		if(!me.feedListManager) {
			me.install();
		}
		me.feedListManager.populate(me.populateNotesCallback,me);
		return false;
	},

	populateNotesCallback: function(me){
		me.feedListManager.prioritise(config.options.txtSharedNotesUserName);
		me.getNotes();
		me.getNotes();
		me.getNotes();
		me.getNotes();
		me.getNotes();
	},

	getNotes: function(){
		log("config.macros.RippleRap.getNotes");
		var me = config.macros.SharedNotes;
		if(!me.feedListManager){
			me.populateNotes();
			return false;
		}
		var feed = me.feedListManager.nextUriObj();
		if (feed){
			me.getNotesByUri(feed.uri,feed.name);
		}
		return false;
	},

	getNotesByUri: function(uri,userName){
		if(!config.options.chkSharedNotesGetEnabled){
			return;
		}
		log("getNotesByUri:",uri,userName);
		config.macros.importWorkspace.getTiddlers(uri,"sharednotes",null,null,
            config.macros.SharedNotes.tagNoteAdaptorCallback,userName);
	},

	tagNoteAdaptorCallback: function(context,userParams){
		log("tagNoteAdaptorCallback",context,userParams);
	},

	killMyNotes: function(){
		var me = config.macros.SharedNotes;
		me.busy = true;
		var callback = function(status,params,responseText,uri,xhr){
			me.busy = false;
			if(!status){
				displayMessage("unable to put empty feed");
				return;
			} 
			displayMessage("put empty feed");
			me.lasttime = me.thistime;
		};
		var rss = me.serialize([],{});
		var adaptor = config.adaptors[me.adaptor];
		adaptor.putRss(rss,callback,me);
		store.forEachTiddler(function(title,t){
			if(t.isTagged(me.tag.note)){
				store.deleteTiddler(t.title);
				displayMessage("deleted "+t.title);
			}
		});
		store.notifyAll();
		refreshDisplay();
		return false;
	}
};

config.macros.PutNotes = {};
config.macros.PutNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.SharedNotes;
                createTiddlyButton(place,me.messages.putNotes.button,me.messages.putNotes.tip,me.putNotes);
};

config.macros.GetNotes = {};
config.macros.GetNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.SharedNotes;
                createTiddlyButton(place,me.messages.getNotes.button,me.messages.getNotes.tip,me.getNotes);
};

config.macros.PopulateNotes = {};
config.macros.PopulateNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.SharedNotes;
                createTiddlyButton(place,me.messages.populateNotes.button,me.messages.populateNotes.tip,me.populateNotes);
};

config.macros.KillMyNotes = {};
config.macros.KillMyNotes.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
                var me = config.macros.SharedNotes;
                createTiddlyButton(place,me.messages.killMyNotes.button,me.messages.killMyNotes.tip,me.killMyNotes);
};

} //# end of 'install only once'
//}}}
