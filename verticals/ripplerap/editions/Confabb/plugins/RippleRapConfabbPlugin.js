/***
|''Name:''|RippleRapConfabbPlugin|
|''Description:''|Integrate RippleRap with the Confabb site|
|''Author:''|Paul Downey|
|''Version:''|0.0.3|
|''Date:''|Mon May 19 14:47:44 BST 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.4|
***/

//{{{
	
if(!version.extensions.RippleRapConfabbPlugin) {
version.extensions.RippleRapConfabbPlugin = {installed:true};

config.macros.RippleRapEdition = {
	install: function(uri) {
		this.installAgenda(uri);
		this.installSharedNotes(uri);
		this.installEnjoyedNotes(uri);
		this.installLogin(uri);
	},

	installAgenda: function(uri) {
		var agendauri = config.options.txtRippleRapAgendaURI;
		if (!agendauri) {
			agendauri = uri + "sessionlist";
		}
		config.macros.AgendaTrack.adaptor = "confabbagenda";
		config.macros.AgendaTrack.uri = agendauri;
                config.macros.ConfabbLogin.callback = config.macros.AgendaTrack.getAgenda;
	},

	installSharedNotes: function(uri) {
		var notesuri = config.options.txtRippleRapSharedNotesURI;
		if (!notesuri) {
			notesuri = uri + "notes/save";
		}
		config.macros.SharedNotes.adaptor = "confabbnotes";
		config.macros.SharedNotes.session_prefix = "confabb:session=";
		ConfabbNotesAdaptor.uri = notesuri;
	},

	installEnjoyedNotes: function(uri) {
		var notesuri = config.options.txtRippleRapEnjoyedNotesURI;
		if (!notesuri) {
			notesuri = uri + "notes/opml";
		}
		config.macros.SharedNotes.feedListManager.add(notesuri,'confabb notes','opml');
	},

	installLogin: function(uri) {
		if(0==uri.indexOf("http://staging")){
			config.macros.ConfabbLogin.uri = "http://staging.confabb.com/login";
		} else {
			config.macros.ConfabbLogin.uri = "http://confabb.com/login";
		}
	}
};

}
//}}}
