/***
| Name:|NewHerePlugin|
| Description:|Creates the new here and new journal toolbar commands|
| Version:|$$version$$|
| Date:|$$date$$|
| Source:|http://mptw.tiddlyspot.com/#NewHerePlugin|
| Author:|Simon Baird <simon.baird@gmail.com>|
| CoreVersion:|2.1.x|
To use edit your ViewTemplate and add newHere to the toolbar div, eg
{{{<div class='toolbar' macro='toolbar ... newHere'></div>}}}
Note: would be good if we could do this instead some day
{{{<<newTiddler tag:{{tiddler.title}} label:'new here'>>}}}
***/
//{{{
merge(config.commands,{

	newHere: {
		text: 'new here',
		tooltip: 'Create a new tiddler tagged as this tiddler',
		hideReadOnly: true,
		handler: function(e,src,title) {
			if (!readOnly) {
				clearMessage();
				var t=document.getElementById('tiddler'+title);
				story.displayTiddler(t,config.macros.newTiddler.title,DEFAULT_EDIT_TEMPLATE);
				story.setTiddlerTag(config.macros.newTiddler.title, title, 0);
				story.focusTiddler(config.macros.newTiddler.title,"title"); // doesn't work??
				return false;
			}
		}
	},

	newJournalHere: {
		//text: 'new journal here',  // too long
		text: 'new journal',
		hideReadOnly: true,
		dataFormat: 'DD MMM YYYY', // adjust to your preference
		//dataFormat: 'YYYY-0MM-0DD', 
		tooltip: 'Create a new journal tiddler tagged as this tiddler',
		handler: function(e,src,title) {
			if (!readOnly) {
				clearMessage();
				var now = new Date();
				var t=document.getElementById('tiddler'+title);
				var newtitle = now.formatString(this.dataFormat)
				story.displayTiddler(t,newtitle,DEFAULT_EDIT_TEMPLATE);
				story.setTiddlerTag(newtitle, title, 0);
				story.focusTiddler(newtitle,"title");
				return false;
			}
		}
	}

});
//}}}
