/***
!Metadata:
|''Name:''|Slider2Plugin|
|''Description:''||
|''Version:''|1.0.1|
|''Date:''|Mar 20, 2007|
|''Source:''|http://www.sourceforge.net/projects/ptw/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.5+ (the firefox extension, XTML Ruby support, is required)|
!Syntax:
{{{
	<<slider2 tiddlerTitle sliderTitle toolsip>>
	or {{custClass{<<slider2 tiddlerTitle sliderTitle toolsip>><<slider2 ...>>...<slider2...>>}}}
}}}
<<<
tiddlerTitle: the title of tiddler to include in the slider
sliderTitletitle: text of the slider
toolsip: tooltip text of the slider
custClass: optional, for grouping the sliders and/or assigning a group style.
<<<
!Revision History:
|''Version''|''Date''|''Note''|
|1.0.1|Mar 20, 2007|Added animation collapse|
|1.0.0|Mar 18, 2007|Initial release|
!Code section:
***/
//{{{
config.slider2 = {};
config.macros.slider2 = {
	onClickSlider: function(e){
		if (!e) var e = window.event;
		var n = this.nextSibling;
		var isOpen = n.style.display != "none";
		var nodes = this.parentNode.childNodes;
		for(var i=0; i<nodes.length; i++){
			if(nodes[i].title && nodes[i].title != this.title){
				if(nodes[i].nextSibling.className = "sliderPanel"){
					if(config.slider2[this.parentNode.className] == nodes[i].title){
						if(config.options.chkAnimate)
							anim.startAnimating(new Slider(nodes[i].nextSibling, false,e.shiftKey || e.altKey,"none"));
						else 
							nodes[i].nextSibling.style.display = "none";
					}
				}
			}
		}
		if (config.options.chkAnimate)
			setTimeout(function(){anim.startAnimating(new Slider(n,!
isOpen,null,"none"));},300);
//			anim.startAnimating(new Slider(n,!isOpen,e.shiftKey || e.altKey,"none"));
		else
			n.style.display = isOpen ? "none" : "block";
		config.slider2[this.parentNode.className] = isOpen ? "" : this.title;
		return false;
	},

	createSlider: function(place,title,tooltip){
		var btn = createTiddlyButton(place,title,tooltip,this.onClickSlider);
		btn.className = "accordionButton";
		var panel = createTiddlyElement(place,"div",null,"sliderPanel",null);
		panel.style.display = "none";
		return panel;
	},

	handler: function(place,macroName,params){
		params[2] = params[2]?params[2]:params[0];
		var panel = this.createSlider(place,params[1],params[2]);
		var text = store.getTiddlerText(params[0]);
		if(text)
			wikify(text,panel,null,store.getTiddler(params[0]));
	}
};
//}}}

