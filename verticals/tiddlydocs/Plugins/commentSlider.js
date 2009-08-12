
config.macros.commentSlider = {};
config.macros.commentSlider.handler = function(place,macroName,params)
{
	var commentCount = wikifyStatic("<<commentsCount "+arguments[5].title+">>")
	var holder = createTiddlyElement(place, "div", "", "commentStretch", " ");
	var slider = config.macros.slider.createSlider(holder, "chkSlider"+arguments[5].title, "comments("+commentCount+")");
	wikify("<<comments tiddler: "+arguments[5].title+">>", slider);
}
