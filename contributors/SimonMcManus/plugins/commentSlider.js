config.macros.commentSlider = {
	commentLabel: "comments"
};
config.macros.commentSlider.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(paramString!='noCount')
		var label = config.macros.commentSlider.commentLabel+"("+wikifyStatic("<<commentsCount "+arguments[5].title+">>")+")";
	else
		var label = config.macros.commentSlider.commentLabel;
	var holder = createTiddlyElement(place, "div", "", "commentStretch", " ");
	
	var slider = config.macros.slider.createSlider(holder, "chkSlider"+arguments[5].title, label);
	wikify("<<comments tiddler:'"+arguments[5].title+"'>>\n", slider);
}
