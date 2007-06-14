/***
!Metadata:
|''Name:''|Slider2Plugin|
|''Description:''||
|''Version:''|1.5.2|
|''Date:''|Mar 27, 2007|
|''Source:''|http://www.sourceforge.net/projects/ptw/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|
!Usage:
Manually add ''[[AccordionEffectStyle2]]'' or customized {{{[[YourSliderStyles]]}}} to StyleSheet if it's necessary.
{{{
<<slider2 sliderClass1
 tiddlerTitle1 sliderTitle1 tooltip1
 tiddlerTitle2 sliderTitle2 tooltip2
 ....>>
and/ or
<<slider2 sliderClass2
 tiddlerTitle11 sliderTitle11 tooltip11
 tiddlerTitle12 sliderTitle12 tooltip12
 ...
 buttonClass:'buttonClassName'>>
}}}
*Parameters descriptions:
<<<
#''sliderClasses'' - the name of slider set and also the className of the set, it could be assigned different styles for each slider set.<br>The param ''buttonClass: //buttonClassName//'' need to be used together.
#''tiddlerTitles'' - the title of tiddler to include in the slider
#''sliderTitletitles ''- text of the slider
#''tooltips'' - tooltip text of the slider
#''buttonClass:''//'buttonClassName'// - a named param, default is //sliderButton// if it's omitted assigning a class name to slider button, for example, <br>as the first param is 'accordionEffect'<br>and 'the last param value is ''buttonClass:'''button'<br>then the original oc's AccordionEffectStyle is used.
<<<
!Revision History:
|''Version''|''Date''|''Note''|
|1.5.2|Mar 27, 2007|Fixed bugs under IE|
|1.5.1|Mar 24, 2007|Fixed bugs of customized buttonClass, and typos in AccordionEffectStyle2 and Usgaes section|
|1.5.0|Mar 22, 2007|<html><ol><li>Added feature: ''slider set'' (like 'tab' macro) by using the first param as grouping className but thus it's ''not compatible with previous verions''.</li><li>Included oc's ''AccordionEffect'' but a small bug fixed.</li><li>Added a extra named param: buttonClass</li></ol></html>|
|1.0.1|Mar 20, 2007|Added animation collapse suggested by oc|
|1.0.0|Mar 18, 2007|Initial release|
!Code section:
***/
//{{{

config.macros.slider2 = {
	buttonClass: "sliderButton",
	lastOpenedSlider: {},
	expandTimeout: null
};

config.macros.slider2.onClickSlider = function(e){
	if (!e) var e = window.event;
	var n = this.nextSibling;
	var isOpen = n.style.display != "none";
	var nodes = this.parentNode.childNodes;
	for(var i=0; i<nodes.length; i++){
		if(nodes[i].title && nodes[i].title != this.title){
			if(nodes[i].nextSibling.className = "sliderPanel"){
				if(config.macros.slider2.lastOpenedSlider[this.parentNode.className] == nodes[i].title){
					if(config.options.chkAnimate)
						anim.startAnimating(new Slider(nodes[i].nextSibling,false,null,"none"));
					else 
						nodes[i].nextSibling.style.display = "none";
				}
			}
		}
	}
	if (config.options.chkAnimate){
		if (config.macros.slider2.expandTimeout)
			clearTimeout(config.macros.slider2.expandTimeout);
		config.macros.slider2.expandTimeout = setTimeout(function(){anim.startAnimating(new Slider(n,!isOpen,null,"none"));},250);
//		anim.startAnimating(new Slider(n,!isOpen,null,"none"));
	} 
	else
		n.style.display = isOpen ? "none" : "block";
	config.macros.slider2.lastOpenedSlider[this.parentNode.className] = isOpen ? "" : this.title;
	return false;
};

config.macros.slider2.createSlider = function(place,title,tooltip,buttonClass){
	var btn = createTiddlyButton(place,title,tooltip,this.onClickSlider,buttonClass);
	var panel = createTiddlyElement(place,"div",null,"sliderPanel",null);
	panel.style.display = "none";
	return panel;
};

config.macros.slider2.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	params = paramString.parseParams("anon",null,true,false,true);
	var buttonClass =  (typeof params[0]['buttonClass'] == 'undefined')? this.buttonClass : params[0]['buttonClass'];
	if (params[1] && params[1].name == "anon"){
		if (params[1].name.length < 4){
			wikify('@@Slider2 params error!@@',place);
			return false;
		}
	}

	var p = params[0]['anon'];

	var sliderset =  createTiddlyElement(place,"div",null,p[0],null);
	var numSliders = (params.length-1)/3-1;
	for (var t=0;t<numSliders;t++){
		var content = p[t*3+1];
		var label = p[t*3+2];
		var prompt = p[t*3+3];
		var panel = this.createSlider(sliderset,label,prompt,buttonClass);
		panel.setAttribute("refresh","content");
		panel.setAttribute("tiddler",content);
		panel.style.display = "none";
		var text = store.getTiddlerText(content);
		if(text)
			wikify(text,panel,null,store.getTiddler(content));
	}
};
config.shadowTiddlers["AccordionEffectStyle2"] = "/*{{{*/\n.accordionEffect2 .sliderButton {display:block; color:#fff; text-align:left; font-weight:bold; line-height:140%; border-top:solid 1px #bbb; border-left:solid 1px #bbb; border-right:solid 1px #888; border-bottom:solid 1px #888; background:#999; margin-left:-0.3em; padding:0 1px 1px 20px;}\n.accordionEffect2 .sliderButton:hover {border-top:solid 1px #777; border-left:solid 1px #777; border-right:solid 1px #bbb; border-bottom:solid 1px #bbb; background:#888; padding:1px 0 0 21px;}\n/*}}}*/\n/*{{{*/\n/*Modified from AccordionEffect, CSS by oc ( http://b-oo-k.net/blog/ )*/\n/*}}}*/";
config.shadowTiddlers["StyleSheet"] += "\n[[AccordionEffectStyle2]]";
//}}}