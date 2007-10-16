/***
|''Name:''|~TaggerPlugin|
|''Version:''|1.0.1 (2006-06-01)|
|''Source:''|http://lewcid.googlepages.com/lewcid.html/#TaggerPlugin|
|''Author:''|SaqImtiaz|
|''Description:''|Provides a drop down listing current tiddler tags, and allowing toggling of tags.|
|''Documentation:''|[[TaggerPluginDocumentation]]|
|''Source Code:''|[[TaggerPluginSource]]|
|''~TiddlyWiki:''|Version 2.0.8 or better|
***/
//{{{

config.tagger={
       defaults:{
              label: 'Tags: ',
              tooltip: 'Manage tiddler tags',
              taglist: 'true',
              excludeTags: '',
              notags: 'tiddler has no tags',
              aretags: 'current tiddler tags:',
              toggletext: 'add tags:'
       }
};

config.macros.tagger={};
config.macros.tagger.arrow = (document.all?"▼":"▾"); // the fat one is the only one that works in IE
config.macros.tagger.handler =  function(place,macroName,params,wikifier,paramString,tiddler) {
       var defaults = config.tagger.defaults;
       var nAV = paramString.parseParams('tagman', null, true);
       var label = ((nAV[0].label)&&(nAV[0].label[0])!='.')?nAV[0].label[0]+this.arrow: defaults.label+this.arrow;
       var tooltip = ((nAV[0].tooltip)&&(nAV[0].tooltip[0])!='.')?nAV[0].tooltip[0]: defaults.tooltip;
       var taglist = ((nAV[0].taglist)&&(nAV[0].taglist[0])!='.')?nAV[0].taglist[0]: defaults.taglist;
       var exclude = ((nAV[0].exclude)&&(nAV[0].exclude[0])!='.')?(nAV[0].exclude[0]).readBracketedList(): defaults.excludeTags.readBracketedList();
       if ((nAV[0].source)&&(nAV[0].source[0])!='.')var source = nAV[0].source[0];
       if (source&&!store.getTiddler(source)) return false;

       var onclick = function(e) {
                   if (!e) var e = window.event;
                   var popup = Popup.create(this);
                   var tagsarray = store.getTags();
                   var tags=new Array();

                   for (var i=0; i<tagsarray.length; i++){
                       tags.push(tagsarray[i][0]);}

                   if (source)
                      {var sourcetiddler=store.getTiddler(source);
                       tags=sourcetiddler.tags.sort();}

                   var currentTags = tiddler.tags.sort();

                   var createButtons=function(text,theTag,tooltipPrefix){
                       var sp = createTiddlyElement(createTiddlyElement(popup,"li"),"span",null,"tagger");
                       var theToggle = createTiddlyButton(sp,text,tooltipPrefix+" '"+theTag+"'",taggerOnToggle,"button","toggleButton");
                       theToggle.setAttribute("tiddler",tiddler.title);
                       theToggle.setAttribute("tag",theTag);
                       insertSpacer(sp);
                       if (window.createTagButton_orig_mptw)
                           createTagButton_orig_mptw(sp,theTag);
                       else
                           createTagButton(sp,theTag);
                       }

                   createTiddlyElement(popup,"li",null,"listTitle",(tiddler.tags.length == 0 ? defaults.notags : defaults.aretags));

                   for (var t=0; t<currentTags.length; t++){
                      createButtons("[x]",currentTags[t],"remove tag ");
                       }

                   createTiddlyElement(createTiddlyElement(popup,"li"),"hr");

                   if (taglist!='false')
                      { createTiddlyElement(popup,"li",null,"listTitle",defaults.toggletext);
                        for (var i=0; i<tags.length; i++){
                          if (!tiddler.tags.contains(tags[i])&&!exclude.contains(tags[i]))
                                  {createButtons("[ ]",tags[i],"add tag ");
                                  }
                          }
                          createTiddlyElement(createTiddlyElement(popup,"li"),"hr");
                      }

                   var newTagButton = createTiddlyButton(createTiddlyElement(popup,"li"),("Create new tag"),null,taggerOnToggle);
                   newTagButton.setAttribute("tiddler",tiddler.title);
                   if (source) newTagButton.setAttribute("source",source);

                   Popup.show(popup,false);
                   e.cancelBubble = true;
                   if (e.stopPropagation) e.stopPropagation();
                   return(false);
                   };

       createTiddlyButton(place,label,tooltip,onclick,"button","taggerDrpBtn");
};

window.taggerOnToggle = function(e) {
              var tag = this.getAttribute("tag");
              var title = this.getAttribute("tiddler");
              var tiddler = store.getTiddler(title);
              if (!tag)
                 {
                 var newtag=prompt("Enter new tag:","");
                 if (newtag!=''&&newtag!=null)
                    {
                    var tag=newtag;
                    if (this.getAttribute("source"))
                    {var sourcetiddler =  store.getTiddler(this.getAttribute("source"));
                    sourcetiddler.tags.pushUnique(newtag);}
                    }
                 else
                     {return false;};
                 }
              if (!tiddler || !tiddler.tags)
                 {store.saveTiddler(title,title,'',config.options.txtUserName,new Date(),tag);}
              else
                  {if (tiddler.tags.find(tag)==null)
                     {tiddler.tags.push(tag)}
                  else if(!newtag)
                      {tiddler.tags.splice(tiddler.tags.find(tag),1)};
                  store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,config.options.txtUserName,tiddler.modified,tiddler.tags);};
              story.refreshTiddler(title,null,true);
              if(config.options.chkAutoSave)
                  saveChanges();
              return false;
};

setStylesheet(
 ".tagger a.button {font-weight: bold;display:inline; padding:0px;}\n"+
 ".tagger #toggleButton {padding-left:2px; padding-right:2px; margin-right:1px; font-size:110%;}\n"+
 "#nestedtagger {background:#2E5ADF; border: 1px solid #0331BF;}\n"+
 ".popup .listTitle {color:#000;}\n"+
 "",
"TaggerStyles");

window.lewcidTiddlerSwapTag =  function (tiddler, oldTag, newTag){
                    for (var i = 0; i < tiddler.tags.length; i++)
			  if (tiddler.tags[i] == oldTag) {
				  tiddler.tags[i] = newTag;
				  return true;}
                         return false;
}

window.lewcidRenameTag = function(e) {
                    var tag=this.getAttribute("tag");
                    var newtag=prompt("Rename tag '"+tag+"' to:",tag);

                    if ((newtag==tag)||(newtag==null)) {return false;}

                    if(store.tiddlerExists(newtag))
                               {if(confirm(config.messages.overwriteWarning.format([newtag.toString()])))
                                             story.closeTiddler(newtag,false,false);
                               else
                                             return null;}

                    tagged=store.getTaggedTiddlers(tag);
                    if (tagged.length!=0){
                          for (var j = 0; j < tagged.length; j++)
                              lewcidTiddlerSwapTag(tagged[j],tag,newtag);}

                    if (store.tiddlerExists(tag))
                       {store.saveTiddler(tag,newtag);}
                    if (document.getElementById("tiddler"+tag))
                       {var oldTagTiddler =  document.getElementById(story.idPrefix + tag);
                       var before= story.positionTiddler(oldTagTiddler);
                       var place = document.getElementById(story.container);
                       story.closeTiddler(tag,false,false);
                       story.createTiddler(place,before,newtag,null);
                       story.saveTiddler(newtag);}
                    if(config.options.chkAutoSave)
                                                      saveChanges();
                    return false;
}


window.onClickTag=function(e)
{
	if (!e) var e = window.event;
	var theTarget = resolveTarget(e);

        var nested = (!isNested(theTarget));
        if ((Popup.stack.length > 1)&&(nested==true)) {Popup.removeFrom(1);}
        else if(Popup.stack.length > 0 && nested==false) {Popup.removeFrom(0);};

        var theId = (nested==false)? "popup" : "nestedtagger";
        var popup = createTiddlyElement(document.body,"ol",theId,"popup",null);
        Popup.stack.push({root: this, popup: popup});

	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(popup && tag)
		{
		var tagged = store.getTaggedTiddlers(tag);
		var titles = [];
		var li,r;
		for(r=0;r<tagged.length;r++)
			if(tagged[r].title != title)
				titles.push(tagged[r].title);
		var lingo = config.views.wikified.tag;
		if(titles.length > 0)
			{
			var openAll = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.openAllText.format([tag]),lingo.openAllTooltip,onClickTagOpenAll);
			openAll.setAttribute("tag",tag);
			createTiddlyElement(createTiddlyElement(popup,"li"),"hr");
			for(r=0; r<titles.length; r++)
				{
				createTiddlyLink(createTiddlyElement(popup,"li"),titles[r],true);
				}
			}
		else
			createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),lingo.popupNone.format([tag]));
		createTiddlyElement(createTiddlyElement(popup,"li"),"hr");
		var h = createTiddlyLink(createTiddlyElement(popup,"li"),tag,false);
		createTiddlyText(h,lingo.openTag.format([tag]));

		createTiddlyElement(createTiddlyElement(popup,"li"),"hr");

		var renameTagButton = createTiddlyButton(createTiddlyElement(popup,"li"),("Rename tag '"+tag+"'"),null,lewcidRenameTag);
		renameTagButton.setAttribute("tag",tag)
		}
	Popup.show(popup,false);
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return(false);
}

if (!window.isNested)
   window.isNested = function(e) {
        while (e != null) {
                var contentWrapper = document.getElementById("contentWrapper");
                if (contentWrapper == e) return true;
                e = e.parentNode;
                }
        return false;
   };

config.shadowTiddlers.TaggerPluginDocumentation="The documentation is available [[here.|http://lewcid.googlepages.com/lewcid.html#TaggerPluginDocumentation]]";

config.shadowTiddlers.TaggerPluginSource="The uncompressed source code is available [[here.|http://lewcid.googlepages.com/lewcid.html#TaggerPluginSource]]";
//}}}