/***
Example usage:
{{{<<deleteDone>>}}}
<<deleteDone>>
{{{<<deleteDone daysOld:20 title:'delete done'>>}}}
<<deleteDone daysOld:30 title:'delete done'>>
***/
//{{{

config.macros.deleteDone = {
	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		var namedParams = (paramString.parseParams(daysOld))[0];
		var daysOld = namedParams['daysOld'] ? namedParams['daysOld'][0] : 30; // default
		var buttonTitle = namedParams['title'] ? namedParams['title'][0] : "Delete Done Tasks";
		createTiddlyButton(place,buttonTitle,"Delete done tasks older than "+daysOld+" days old",this.deleteDone(daysOld));
	},

	deleteDone: function(daysOld) {
		return function() {
			var collected = [];
			var compareDate = new Date();
			compareDate.setDate(compareDate.getDate() - daysOld);
			store.forEachTiddler(function (title,tiddler) {
				if (tiddler.tags.containsAll(["Task","Done"])
							&& tiddler.modified < compareDate) {
					collected.push(title);
				}
			});
			if (collected.length == 0) {
				alert("No done tasks found older than "+daysOld+" days");
			}
			else {
				if (confirm("Done tasks older than "+daysOld+" days:\n'"
						+ collected.join("', '") + "'\n\n\n"
						+ "Are you sure you want to delete these tasks?")) {
					for (var i=0;i<collected.length;i++) {
						store.removeTiddler(collected[i]);
						displayMessage("Deleted '"+collected[i]+"'");
					}
				}
			}
		}
	}
};

//}}}