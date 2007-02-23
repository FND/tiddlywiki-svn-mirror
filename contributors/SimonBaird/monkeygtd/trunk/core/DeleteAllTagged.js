/***
|Name|DeleteAllTaggedPlugin|
|Source|http://ido-xp.tiddlyspot.com/#DeleteAllTaggedPlugin|
|Version|1.0|

An adaptation of DeleteDoneTasks (Simon Baird) by Ido Magal
To use this insert {{{<<deleteAllTagged>>}}} into the desired tiddler.

Example usage:
{{{<<deleteAllTagged>>}}}
<<deleteAllTagged>>
***/
//{{{

config.macros.deleteAllTagged = {
	handler: function ( place,macroName,params,wikifier,paramString,tiddler ) {
		var buttonTitle = params[0] ? params[0] : "Delete Tagged w/ '"+tiddler.title+"'"; // simon's tweak
		var alsoDeleteThisTiddler = params[1] ? params[1] : "";
		createTiddlyButton( place, buttonTitle, "Delete every tiddler tagged with '"+tiddler.title+"'", this.deleteAllTagged( tiddler.title, alsoDeleteThisTiddler == "delete" ));
	},

	deleteAllTagged: function(tag,deleteMe) {
		return function() {
			var collected = [];
			store.forEachTiddler( function ( title,tiddler ) {
				if ( tiddler.tags.contains( tag ))
				{
					collected.push( title );
				}
			});
			if ( collected.length == 0 )
			{
				alert( "No tiddlers found tagged with '"+tag+"'." );
			}
			else
			{
				if ( confirm( "These tiddlers are tagged with '"+tag+"'\n'"
						+ collected.join( "', '" ) + "'\n\n\n"
						+ "Are you sure you want to delete these?" ))
				{
					for ( var i=0;i<collected.length;i++ )
					{
						store.deleteTiddler( collected[i] );
						story.closeTiddler( collected[i], true );
						displayMessage( "Deleted '"+collected[i]+"'" );
					}
				}
			}
			if (deleteMe)
			{
				if ( confirm( "Also delete this tiddler ('"+tag+"')?" ) )
				{
					store.deleteTiddler( tag );
					story.closeTiddler( tag, true );
					displayMessage( "Deleted '"+tag+"'" );
				}
			}
		}
	}
};

//}}}


/***
Example usage:
{{{<<deleteDone>>}}}
<<deleteDone>>
{{{<<deleteDone daysOld:20 title:'delete old'>>}}}
<<deleteDone daysOld:30 title:'delete old'>>

TODO merge these two

***/
//{{{




config.macros.deleteDone = {
	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		var namedParams = (paramString.parseParams('daysOld'))[0];
		var daysOld = namedParams['daysOld'] ? namedParams['daysOld'][0] : 30; // default
		var buttonTitle = namedParams['title'] ? namedParams['title'][0] : "Delete Done Actions";
		createTiddlyButton(place,buttonTitle,"Delete done actions older than "+daysOld+" days old",this.deleteDone(daysOld));
	},

	deleteDone: function(daysOld) {
		return function() {
			var collected = [];
			var compareDate = new Date();
			compareDate.setDate(compareDate.getDate() - daysOld);
			store.forEachTiddler(function (title,tiddler) {
				if (tiddler.tags.containsAll(["Action","Done"])
							&& tiddler.modified < compareDate) {
					collected.push(title);
				}
			});
			if (collected.length == 0) {
				alert("No done actions found older than "+daysOld+" days");
			}
			else {
				if (confirm("Done actions older than "+daysOld+" days:\n'"
						+ collected.join("', '") + "'\n\n\n"
						+ "Are you sure you want to delete these actions?")) {
					for (var i=0;i<collected.length;i++) {
						store.removeTiddler(collected[i]);
						displayMessage("Deleted '"+collected[i]+"'");
						story.closeTiddler( collected[i], true );
					}
				}
			}
		}
	}
};

//}}}

