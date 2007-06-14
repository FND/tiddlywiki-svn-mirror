/***
!Metadata:
|''Name:''|PopupTipsPlugin|
|''Description:''|Display tips and alias from a pre-defineded tiddler|
|''Version:''|1.0.3|
|''Date:''|May 15, 2007|
|''Source:''|http://sourceforge.net/project/showfiles.php?group_id=150646|
|''Author:''|Bram Chen|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License]]|
|''~CoreVersion:''|2.2.0|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|
!Examples
|>|!<<tips Settings>>|
|!<<tips Plugin>> |<<tips PopupTipsPlugin Info>>|
|!<<tips Config>> |<<tips TipsConfig Info>>.<<tips locale>>|
|!<<tips Definitions>>|<<tips TipsDefs Info>>.<<tips locale>>|
|>|!<<tips 'Locale_driven' Alias>>|
|!<<tips Locale>> |<<option txtLocale>> <<tiddler RefreshLocale>>|
|!<<tips Examples>> |<<tips Using_Alias>>|
|~|<<tips Notation>>: <<tips 1 Note>>|
|~|<<tips GettingStarted Info>>|
!Revision History:
|''Version''|''Date''|''Note''|
|1.0.3|May 15, 2007|Improved config.macros.tips.refreshLocale for refreshing backstage|
|1.0.2|Apr 20, 2007|<html>minor changes:<ol><li>change 'TipsLocale' to 'Locale'</li><li>change popup panel width '0.75em' to '0.5em', and left offset '4' to '8'</li></ol></html>|
|1.0.1|Mar 27, 2007|Fixed bug under IE|
|1.0.0|Mar 14, 2007|<html>Initial release:<ol><li>Modified from SaqImtiaz's InfoPlugin,<br/>merged macros def, info and note into one macro named tips.</li><li>Added features, drop-down menu and muti-definitions for locales</li></ol></html>|
!Code section:
***/
//{{{
if (!config.options.txtLocale) {
	config.options.txtLocale = config.locale ? config.locale : 'en';
	saveOptionCookie('txtLocale');
}

Popup.showTips = function(unused,slowly){
	var curr = Popup.stack[Popup.stack.length-1];
	var rootLeft = findPosX(curr.root);
	var rootTop = findPosY(curr.root);
	var rootHeight = curr.root.offsetHeight;
	var popupLeft = rootLeft + 8;
	var popupTop = rootTop + rootHeight + 4;

	var winWidth = findWindowWidth();
	var w=winWidth*0.5;
	if(curr.popup.offsetWidth > w)
		curr.popup.style.width = w + "px";
	var popupWidth = curr.popup.offsetWidth;
	if(popupLeft + popupWidth > winWidth){
		popupLeft = rootLeft - popupWidth - 8;
		popupLeft = popupLeft<0?0:popupLeft;
	}

	var winHeight = findWindowHeight();
	var h = winHeight*0.5;
	if(curr.popup.offsetHeight > h)
		curr.popup.style.height = h + "px";
	var popupHeight = curr.popup.offsetHeight;
	if(popupTop + popupHeight > winHeight){
		popupTop = rootTop - popupHeight - 4 ;
		popupTop = popupTop<0?0:popupTop;
	}

	curr.popup.style.left = popupLeft + "px";
	curr.popup.style.top = popupTop + "px";
	curr.popup.style.visibility = "visible";
	curr.popup.style.display = "block";
	curr.popup.style.overflow = "auto";
	addClass(curr.root,"highlight");
};

config.macros.tips = {
	configTiddler: "TipsConfig.",
	defTips: "TipsDefs",
	defTypes: ["Info","Note"],
	defFormats: {Info:'%0', Note:'{{help{^^%0^^}}}', Menu:'%0'},
	defStyle: "TipsStyle"
};

config.macros.tips.refreshLocale = function(){
	refreshPageTemplate('PageTemplate');
	if(!readOnly){
		removeChildren(document.getElementById("backstageButton"));
		removeChildren(document.getElementById("backstageToolbar"));
		backstage.init();
	}
	story.forEachTiddler(function(title,e){story.refreshTiddler(title,DEFAULT_VIEW_TEMPLATE,true);});
};

config.macros.tips.showTips = function(e){
	if(!e) var e = window.event;
	if(!this.tipsName) return false;
	var popup = Popup.create(this,"span","popupTips");
//	var popup = Popup.create(this,"span","tips"+this.tipsClass );
	if(this.tips) wikify(this.tips,popup);
	Popup.showTips(popup,false);
	if(e) e.cancelBubble = true;
	if(e && e.stopPropagation) e.stopPropagation();
	return false;
};

//	removeTips: Popup.remove,

config.macros.tips.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	var configTiddler = this.configTiddler + (config.options.txtLocale?config.options.txtLocale:config.locale);
	if (!store.tiddlerExists(configTiddler)) configTiddler = this.configTiddler+'en';
	var tipsDefs =  store.getTiddlerSlice(configTiddler,this.defTips);
	tipsDefs = tipsDefs?tipsDefs:this.defTips;
	var tipsStyle = store.getTiddlerSlice(configTiddler,this.defStyle);
	tipsStyle = tipsStyle?tipsStyle:this.defStyle;

	var tipsFormats = store.getTiddlerSlices(configTiddler,this.defTypes);
	tipsFormats = tipsFormats?tipsFormats:this.defFormats;
	var tipsName = params[0]?params[0]:null;

	var tips = store.getTiddlerSlice(tipsDefs,tipsName);
	if (!tips){
		wikify(tipsName,place);
		return false;
	}
	var theType = params[1]?params[1]:'Alias';
	var tipsNameLocale = store.getTiddlerSlice(tipsDefs,tipsName + '_label');
	var theClass = params[2]?params[2]:theType;
	var wrapper = createTiddlyElement(place,"span",null,"tips"+theClass);
	wrapper.tips = tips;
	wrapper.tipsName = tipsNameLocale ? tipsNameLocale : tipsFormats[theType];
//	wrapper.tipsName = (params[2] == /Menu|Info/ && tipsNameLocale)?tipsNameLocale:tipsFormats[theType];
	wrapper.tipsClass = theClass;
	wrapper.onmouseover= this.showTips;
//	wrapper.onmouseout= this.removeTips;

	if (wrapper.tipsName){
		wikify(wrapper.tipsName.format([tipsName]),wrapper);
	} else{
		var aliasWrapper = createTiddlyElement(wrapper,"span",null,null);
		wikify(tips, aliasWrapper);
	}
};

config.macros.refreshLocale = {
	template: '[[%0.%1]]',
	tiddlers: ['DateFormat','GettingStarted','SideBarOptions','OptionsPanel','SideBarTabs','TabMore']
};

config.macros.refreshLocale.onClickRefresh = function(e){
	if (!e) var e = window.event;
	var locale = this.title;
	config.options.txtLocale = locale;
	saveOptionCookie('txtLocale');
	var locale_ui = 'locale.'+locale;
	locale_ui =  store.getTiddlerText(locale_ui);
	if (locale_ui)
		window.eval(locale_ui);
	config.macros.refreshLocale.tiddler(locale);
	config.macros.tips.refreshLocale();
	return false;
}

config.macros.refreshLocale.tiddler = function(locale){
	var t = 'ViewTemplate.' + locale;
	if (store.tiddlerExists(t) || store.isShadowTiddler(t))
		config.shadowTiddlers[t] = this.template.format([t,locale]);
	for (var i=0; i<this.tiddlers.length; i++){
		t = this.tiddlers[i];
		var text = store.getTiddlerText(t+'.'+locale);
		if (text)
			config.shadowTiddlers[t] = text;
	}
};

config.macros.refreshLocale.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	if (params[0]) {
		for (var i=0; i<params.length ; i++){
			var tooltip = params[i]; var defTips = config.macros.tips.defTips + '.' + tooltip;
			if (store.tiddlerExists(defTips) || store.isShadowTiddler(defTips)) {
				var label = store.getTiddlerSlice(defTips,params[i].replace("-","_") + '_label');
				label = label ? label : params[i];
				var btn = createTiddlyButton(place,label,tooltip,this.onClickRefresh);
			}
		}
	} else {
		config.macros.tips.refreshLocale();
	}
};
config.shadowTiddlers[config.macros.tips.configTiddler+'en'] = "|{{bigblue{__Setting__}}}|c\n|!Name|!Tips|\n|TipsDefs:|TipsDefs.en|\n|TipsStyle:|TipsStyle|\n|Note:|{{help{^^%0^^}}}|\n|Info:|%0|\n";
config.shadowTiddlers[config.macros.tips.defTips+'.en'] = "{{{\nlocale: en\nPopupTipsPlugin: <<tiddler PopupTipsPlugin>>\nTipsConfig: <<tiddler TipsConfig.en>>\nTipsDefs: [[TipsDefs.en]] contains all of the tips definitions and it's specified in [[TipsConfig.en]].\nUsing_Alias: @@Alias@@:__Uses the tiddler slice form to define the tips__.\n1: {{bigblue{''Show a popup tips as mouse hovers.''}}}\nGettingStarted: <<tiddler GettingStarted>>\n}}}";
config.shadowTiddlers[config.macros.tips.defStyle] = '/*{{{*/\n.popupTips {position:absolute; visibility:hidden; padding:0.5em; border:2px solid [[ColorPalette::PrimaryPale]]; background:#cff; color:[[ColorPalette::Foreground]]; z-index:300; filter:alpha(opacity=90);-moz-opacity:0.9;opacity: 0.9;}\n\n.tipsNote {position:relative; border:none; background:[[ColorPalette::Background]]; color:[[ColorPalette::Error]]; cursor:help;}\n\n.tipsInfo {position:relative; background:#cff; color:[[ColorPalette::Foreground]];}\n\n.tipsMenu {position:relative; padding:0 0.1em 0 0.1em; border:1px solid [[ColorPalette::PrimaryPale]]; background:[[ColorPalette::PrimaryMid]];\n color:[[ColorPalette::Background]]; font-size: 1.2em;}\n.tipsMenu:hover {background:[[ColorPalette::PrimaryPale]]; color:[[ColorPalette::Background]]; font-weight: bold;}\n\n.bigblue {font-size: 1.2em;color:darkblue}\n.help {cursor:help;}\n/*}}}*/';
config.shadowTiddlers.StyleSheet += '\n[['+config.macros.tips.defStyle+']]';
config.shadowTiddlers["RefreshLocale"] = "<<refreshLocale en zh-Hant zh-Hans>>";
//}}}