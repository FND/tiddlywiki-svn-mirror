/***
|''Name''|SparklinePlugin|
|''Description''|provides support for [[sparklines|http://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0001OR&topic_id=1]]|
|''Version''|1.0.0|
|''Status''|stable|
|''Source''|http://www.tiddlywiki.com/plugins.html#SparklinePlugin|
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MyDirectory/plugins/SparklinePlugin.js |
|''License''|[[BSD open source license]]|
|''~CoreVersion''|2.3.0|
|''Feedback''|[[TiddlyWiki community|http://groups.google.com/group/TiddlyWiki]]|
|''Keywords''|visualization|
!Usage
{{{
<<sparkline numbers>>
}}}
The macro accepts space-separated numeric values as parameter.
!!Examples
Activity on http://www.tiddlywiki.com during the month of April 2005:
{{{<<sparkline 163 218 231 236 232 266 176 249 289 1041 1835 2285 3098 2101 1755 3283 3353 3335 2898 2224 1404 1354 1825 1839 2142 1942 1784 1145 979 1328 1611>>}}}
<<sparkline 163 218 231 236 232 266 176 249 289 1041 1835 2285 3098 2101 1755 3283 3353 3335 2898 2224 1404 1354 1825 1839 2142 1942 1784 1145 979 1328 1611>>
!Code
***/
//{{{
if(!version.extensions.SparklinePlugin) {
version.extensions.SparklinePlugin = {installed:true};

//--
//-- Sparklines
//--

config.macros.sparkline = {};
config.macros.sparkline.handler = function(place,macroName,params)
{
	var data = [];
	var min = 0;
	var max = 0;
	var v;
	for(var t=0; t<params.length; t++) {
		v = parseInt(params[t]);
		if(v < min)
			min = v;
		if(v > max)
			max = v;
		data.push(v);
	}
	if(data.length < 1)
		return;
	var box = createTiddlyElement(place,"span",null,"sparkline",String.fromCharCode(160));
	box.title = data.join(",");
	var w = box.offsetWidth;
	var h = box.offsetHeight;
	box.style.paddingRight = (data.length * 2 - w) + "px";
	box.style.position = "relative";
	for(var d=0; d<data.length; d++) {
		var tick = document.createElement("img");
		tick.border = 0;
		tick.className = "sparktick";
		tick.style.position = "absolute";
		tick.src = "data:image/gif,GIF89a%01%00%01%00%91%FF%00%FF%FF%FF%00%00%00%C0%C0%C0%00%00%00!%F9%04%01%00%00%02%00%2C%00%00%00%00%01%00%01%00%40%02%02T%01%00%3B";
		tick.style.left = d*2 + "px";
		tick.style.width = "2px";
		v = Math.floor(((data[d] - min)/(max-min)) * h);
		tick.style.top = (h-v) + "px";
		tick.style.height = v + "px";
		box.appendChild(tick);
	}
};


}
//}}}
