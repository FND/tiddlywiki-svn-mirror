/***
|''Name:''|AgendaTrackPlugin|
|''Description:''|Helpers for RippleRap Agenda Track Items|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/verticals/ripplerap/plugins/AgendaTrackPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

List related sessions for a track:
<<agendaTrackSessions>>

List tracks as tabs:
<<agendaTrackTabs>>

***/

//{{{
if(!version.extensions.AgendaTrack) {
version.extensions.AgendaTrack = {installed:true};

	config.macros.AgendaTrackTabs = {};
	config.macros.AgendaTrackTabs.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		var text = '<<tabs txtMainTab ';
		var tracks = store.filterTiddlers("[tag[track]]");
		for (var i=0;i<tracks.length;i++) {
			s = ' "' + tracks[i].title + '"';
			text = text  + s + s + s;
		}
			
		text = text + '>>';

		wikify(text,place);
	};

	config.macros.AgendaTrackSessions= {};
	config.macros.AgendaTrackSessions.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		var track = store.getValue(tiddler,'rr_session_tag');
		var text = "<<listRelated tag:" + track 
			+ " filter:[tag[" + track + "]][sort[+rr_session_starttime]]"
			+ " hrel:raps template:AgendaItemsTemplate"
			+ " subtemplate:AgendaSubItemsTemplate>>";

		wikify(text,place);
	};

	config.macros.AgendaTrackText= {};
	config.macros.AgendaTrackText.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		tiddler.text = "<<AgendaTrackSession>>";
		story.setDirty(tiddler.title,true);

	};


} //# end of 'install only once'
//}}}
