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
	install: function(me, uri) {
		this.installAgenda(me, uri);
		this.installSharedNotes(me, uri);
		this.installEnjoyedNotes(me, uri);
	},
	installAgenda: function(me, uri) {
		var agendauri = config.options.txtRippleRapAgendaURI;
		if (!agendauri) {
			agendauri = uri + "sessionlist";
		}
		me.agenda.adaptor = "confabbagenda";
		me.agenda.uri = agendauri;
	},
	installSharedNotes: function(me, uri) {
		var notesuri = config.options.txtRippleRapSharedNotesURI;
		if (!notesuri) {
			notesuri = uri + "notes/shared";
		}
		me.adaptor = "confabbnotes";
		ConfabbNotesAdaptor.uri = notesuri;
	},
	installEnjoyedNotes: function(me, uri) {
		var notesuri = config.options.txtRippleRapEnjoyedNotesURI;
		if (!notesuri) {
			notesuri = uri + "notes/opml";
		}
    //me.feedListManager.add(notesuri,'confabb notes','opml');
	}
};

}
//}}}
