config.macros.notesPlugin = {};
config.macros.notesPlugin.handler = function(place,macroName,params)
{
	var context = {};
	context.callback = function() {
		config.macros.notesPlugin.display(place, params);
	};
	removeChildren(place);
	setStylesheet(".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;  margin:1px; float:none}"+
	".tiddler .button:hover,.tiddler .button	 {background-repeat:no-repeat; float:none;  }"+
	".textSpace {padding-top:1px}"+
	".tiddler .button, .tiddler .button:hover {padding:5px; margin:5px}"+
	".noFloat {float:none; background-color:red;}"+
	".stream { display: block; padding:1px; margin:1px ; max-width:500px;  min-height:20px; }"+
	".imgClass {float:left; display:block;padding-right:10px}");
	var tiddlers = store.reverseLookup("tags","excludeLists",false,"modified");
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	lastDay ="";
	var today = new Date;
	var yesterday= new Date()
	yesterday.setDate(yesterday.getDate()-1);
	for(var t=tiddlers.length-1; t>=last; t--) {
		if(tiddlers[t].isTagged("note")) {
			if(typeof(tiddlers[t]['modified'])!='undefined'){
				var theDay = tiddlers[t]['modified'].convertToLocalYYYYMMDDHHMM().substr(0,8);
			if(theDay != lastDay) {
				if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==today.formatString("DD/MM/YYYY"))
					createTiddlyElement(place, "h3", null, null,  "Today");
				else if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==yesterday.formatString("DD/MM/YYYY"))
					createTiddlyElement(place, "h3", null, null,  "Yesterday");
				else
					createTiddlyElement(place, "h3", null, null, tiddlers[t]['modified'].formatString("DD/MM/YYYY"));
				lastDay = theDay;
			}		
		}
	}	
		if(tiddlers[t].isTagged("note")){
			var img = createTiddlyElement(null, "img", null, "imgClass");
			img.src = "http://www.iconspedia.com/uploads/578075880.png";
			img.width = "20";
			img.height = "20";
			var slider = config.macros.slider.createSlider(place, "", "");
			addClass(slider,"slider");
			var sliderButton = findRelated(slider,"button","className","previousSibling");
			sliderButton.appendChild(img);
			createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
			addClass(sliderButton,"stream deliciousStream");
			wikify(tiddlers[t].text+"\n\r"+tiddlers[t].created,slider);
		}	
	}
};

config.macros.notesPlugin.display = function (place, params)
{

};
