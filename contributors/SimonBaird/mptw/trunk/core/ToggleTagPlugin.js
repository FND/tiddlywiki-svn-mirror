/***
| Name:|ToggleTagMacro|
| Description:|Makes a checkbox which toggles a tag in a tiddler|
| Version:|$$version$$|
| Date:|$$date$$|
| Source:|http://tiddlyspot.com/mptw/#ToggleTagMacro|
| Author:|SimonBaird|
| License:|[[BSD open source license]]|
| CoreVersion:|2.1|
!Usage
{{{<<toggleTag }}}//{{{TagName TiddlerName LabelText}}}//{{{>>}}}
* TagName - the tag to be toggled, default value "checked"
* TiddlerName - the tiddler to toggle the tag in, default value the current tiddler
* LabelText - the text (gets wikified) to put next to the check box, default value is '{{{[[TagName]]}}}' or '{{{[[TagName]] [[TiddlerName]]}}}'
(If a parameter is '.' then the default will be used)

Examples:

|Code|Description|Example|h
|{{{<<toggleTag>>}}}|Toggles the default tag (checked) in this tiddler|<<toggleTag>>|
|{{{<<toggleTag TagName>>}}}|Toggles the TagName tag in this tiddler|<<toggleTag TagName>>|
|{{{<<toggleTag TagName TiddlerName>>}}}|Toggles the TagName tag in the TiddlerName tiddler|<<toggleTag TagName TiddlerName>>|
|{{{<<toggleTag TagName TiddlerName 'click me'>>}}}|Same but with custom label|<<toggleTag TagName TiddlerName 'click me'>>|
|{{{<<toggleTag . . 'click me'>>}}}|dot means use default value|<<toggleTag . . 'click me'>>|
(Note if TiddlerName doesn't exist it will be silently created)

!Known issues
* Doesn't smoothly handle the case where you toggle a tag in a tiddler that is current open for editing. Should it stick the tag in the edit box?

***/
//{{{

merge(config.macros,{

	toggleTag: {

		doRefreshAll: true,
		createIfRequired: true,
		shortLabel: "[[%0]]",
		longLabel: "[[%0]] [[%1]]",

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var tag = (params[0] && params[0] != '.') ? params[0] : "checked";
			var title = (params[1] && params[1] != '.') ? params[1] : tiddler.title;
			var defaultLabel = (title == tiddler.title ? this.shortLabel : this.longLabel);
			var label = (params[2] && params[2] != '.') ? params[2] : defaultLabel;
			label = (label == '-' ? '' : label);
			var theTiddler =  title == tiddler.title ? tiddler : store.getTiddler(title);
			var cb = createTiddlyCheckbox(place, label.format([tag,title]), theTiddler && theTiddler.isTagged(tag), function(e) {
				if (!store.tiddlerExists(title)) {
					if (config.macros.toggleTag.createIfRequired) {
						var content = store.getTiddlerText(title); // just in case it's a shadow
						store.saveTiddler(title,title,content?content:"",config.options.txtUserName,new Date(),null);
					}
					else 
						return false;
				}
				//store.suspendNotifications(); 
				store.setTiddlerTag(title,this.checked,tag);
				//refreshDisplay(); 
				//store.resumeNotifications();
				return true;
			});
		}
	}
});

//}}}

