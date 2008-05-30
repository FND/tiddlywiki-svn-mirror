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

config.macros.RippleRapConfabb = {
	install: function(uri) {
		this.installAgenda(uri);
		this.installSharedNotes(uri);
		this.installEnjoyedNotes(uri);
	},
	installAgenda: function(uri) {
		var agendauri = config.options.txtRippleRapAgendaURI;
		if (!agendauri) {
			agendauri = uri + "sessionlist";
		}
		config.macros.RippleRap.agenda.adaptor = "confabbagenda";
		config.macros.RippleRap.agenda.uri = agendauri;
	},
	installSharedNotes: function(uri) {
		var notesuri = config.options.txtRippleRapSharedNotesURI;
		if (!notesuri) {
			notesuri = uri + "notes/shared";
		}
		config.macros.SharedNotes.adaptor = "confabbnotes";
		ConfabbNotesAdaptor.uri = notesuri;
	},
	installEnjoyedNotes: function(uri) {
		var notesuri = config.options.txtRippleRapEnjoyedNotesURI;
		if (!notesuri) {
			notesuri = uri + "notes/opml";
		}
		config.macros.RippleRap.feedListManager.add(notesuri,'confabb notes','opml');
	}
};

}
//}}}
