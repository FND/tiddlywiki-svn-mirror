
config.macros.commentSlider = {};
config.macros.commentSlider.handler = function(place,macroName,params)
{
	var commentCount = wikifyStatic("<<commentsCount "+arguments[5].title+">>")
	var holder = createTiddlyElement(place, "div", "", "", " ");
	var slider = config.macros.slider.createSlider(holder, "chkSlider"+arguments[5].title, "comments("+commentCount+")");
	wikify("<<comments>>", slider);


}
/*
//"comments('<<commentsCount '+tiddlers[t].title+'>>')+")");
	var context = {};
	context.callback = function() {
		config.macros.commentSlider.display(place, params);
	};
	removeChildren(place);
	setStylesheet(".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;  margin:1px; float:none}"+
	".tiddler .button:hover,.tiddler .button	 {background-repeat:no-repeat; float:none;  }"+
	".textSpace {padding-top:1px}"+
	".tiddler .button, .tiddler .button:hover {padding:5px; margin:5px}"+
	".noFloat {float:none; background-color:red;}"+
	".stream { display: block; padding:1px; margin:1px ; min-height:20px; }"+
	".imgClass {float:left; display:block;padding-right:10px}");
	var tiddlers = store.reverseLookup("tags","excludeLists",false,"modified");
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div", "", "announcementSlider");
	lastDay ="";
	var today = new Date;
	var yesterday= new Date()
	yesterday.setDate(yesterday.getDate()-1);
	for(var t=tiddlers.length-1; t>=last; t--) {
		if(tiddlers[t].isTagged("announcement")){
			var img = createTiddlyElement(null, "img", null, "imgClass");
			img.src = "http://www.iconspedia.com/uploads/578075880.png";
			img.width = "20";
			img.height = "20";
			var slider = config.macros.slider.createSlider(place, "chkSlider"+tiddlers[t].title, "");
			addClass(slider,"slider");
			var sliderButton = findRelated(slider,"button","className","previousSibling");
			sliderButton.appendChild(img);
			createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
			addClass(sliderButton,"stream deliciousStream");
			wikify(tiddlers[t].text+"\n\r"+tiddlers[t].created+"\n\n",slider,null,tiddlers[t]);
			var commentSlider = config.macros.slider.createSlider(slider, "chkSlider"+tiddlers[t].title, 
			addClass(commentSlider,"slider");
			addClass(commentSlider,"commentSlider");
			wikify("<<comments loginCheck:'isLoggedIn' loginPrompt:'ccLogin reload:false' tiddler:'"+tiddlers[t].title+"'>>", commentSlider,null,tiddlers[t]);
		}	
	}
};

config.macros.commentSlider.display = function (place, params)
{

};

*/
