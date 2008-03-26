/***
|''Name:''|SpeedGeekingPlugin|
|''Description:''|Shuffle, pair-up, and ring numbers found in contact tiddlers|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/SpeedGeekingPlugin.js |
|''Version:''|1.0.0|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''CoreVersion:''|2.2|

a contact tiddler matches the given tagged and has the slice 'Mobile', eg.:


- uses SimpleMojoPlugin to place phone calls

***/

//{{{
// Ensure that this Plugin is only installed once.
if(!version.extensions.SpeedGeekingPlugin) {
version.extensions.SpeedGeekingPlugin = {installed:true};

config.macros.speedGeekDial = {

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		params = paramString.parseParams('tag',null,true,false,false);
		var tag = getParam(params,'tag',null);
	        var button = createTiddlyButton(place,'RING!','Click here to make these calls!',this.onClickDail);
		button.setAttribute("tiddlerName",tiddler.title);
	},

	onClickDail: function (e) {
		var macro = config.macros.speedGeekDial;
		var pairs = macro.getPairs(this);

		for(var n=0;n<pairs.length;n++) {
			var callingParty = store.getTiddlerSlice(pairs[n][0],"Mobile");
			var calledParty = store.getTiddlerSlice(pairs[n][1],"Mobile");
			config.macros.mojo.makeCall(callingParty, calledParty);
		}
        },

	getPairs: function (button) {
		title = button.getAttribute('tiddlerName');
		text = store.getTiddlerText(title);
		lines = text.split("|\n");
		pairs = [];
		for(var n=0;n<lines.length;n++) {
			var parts = lines[n].split("|");
			if (parts[2]) {
				pairs.push([parts[1],parts[2]]);
			}
		}
		return pairs;
	}
},

config.macros.speedGeek = {

	round: 0,
	tag: 'geek',

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		params = paramString.parseParams('tag',null,true,false,false);
		var tag = getParam(params,'tag',null);
		var limit = params[2].value;

	        var button = createTiddlyButton(place,'ROUND!','Click here to pair up tiddlers tagged with \''+tag+'\'',this.onClickDeal);
		button.setAttribute("limit",limit);
	},

	onClickDeal: function (e) {
	        var macro = config.macros.speedGeek;
		macro.round++;

		var tag = config.macros.speedGeek.tag;
		var title = "SpeedGeekRound" + macro.round;
		var tiddlers = macro.shuffle(store.getTaggedTiddlers(tag));

		var body = '<<speedGeekDial '+tag+'>>\n';

		var limit = this.getAttribute('limit')*2;
		if (limit > tiddlers.length) { limit = tiddlers.length; }

		for(var n=0;n<limit;n+=2) {
			body = body + '|' + tiddlers[n].title + '|' + (tiddlers[n+1]?tiddlers[n+1].title : "") + '|\n'
		}

		tiddler = store.saveTiddler(title,title,body,config.options.txtUserName);
		story.displayTiddlers(this,[title]);
	},

	shuffle: function(list) {
		var i = list.length;
		if (i == 0) return false;
		while (--i) {
			var j = Math.floor(Math.random() * (i + 1));
			var ti = list[i];
			var tj = list[j];
			list[i] = tj;
			list[j] = ti;
		}
		return list;
	}

}
} //# end of "install only once"
//}}}
