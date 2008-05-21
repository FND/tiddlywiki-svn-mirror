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

	config.macros.AgendaTrackSessions = {};
	config.macros.AgendaTrackSessions.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		var track = store.getValue(tiddler,'rr_session_tag');
		var text = "<<listRelated tag:" + track 
			+ " filter:[tag[" + track + "]][sort[+rr_session_starttime]]"
			+ " hrel:raps template:AgendaItemsTemplate"
			+ " subtemplate:AgendaSubItemsTemplate>>";

		wikify(text,place);
	};

	config.macros.Speaker = {};
	config.macros.Speaker.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		var co = store.getValue(tiddler,'speaker_co');
		var text = "[img["+ store.getValue(tiddler,'speaker_img') + "]]"
			+ "<html><a class='fn url' href='" + store.getValue(tiddler,'speaker_uri') + "'>" 
			    +  tiddler.title 
			    + "</a></html>" 
			+ " " + (co?co:"");
		wikify(text,place);
	};

	config.macros.SpeakerSessions = {};
	config.macros.SpeakerSessions.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

		var tagged = store.getTaggedTiddlers("session");

		// search for sessions where speaker list contains speaker
		var sess = [];
		for(var t=0; t<tagged.length; t++) {
		    var speakers = store.getValue(tagged[t],'rr_session_speakers');
		    if (speakers) {
			var slist = speakers.split(/\s*,\s*/);
			for(var s=0; s<slist.length; s++) {
			    if (slist[s].trim() == tiddler.title) {
				sess.push("[[" + store.getValue(tagged[t],'rr_session_title') + "|" + tagged[t].title + "]]");
			    }
			}
		    }
		}

		var text = sess.length ? "*" + sess.join("\n*") + "" : "";

		var bio = store.getValue(tiddler,'speaker_bio', '');
		if (bio) {
			text = text + "\n//Taken from: "+ bio + "//";
		}
		wikify(text,place);
	};

} //# end of 'install only once'
//}}}
