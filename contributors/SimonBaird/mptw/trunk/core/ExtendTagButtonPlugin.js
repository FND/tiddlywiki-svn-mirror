/***
| Name:|ExtentTagButtonPlugin|
| Description:|Adds a New tiddler button in the tag drop down|
| Version:|3.0.1 ($Rev$)|
| Date:|$Date$|
| Source:|http://mptw.tiddlyspot.com/#ExtendTagButtonPlugin|
| Author:|Simon Baird <simon.baird@gmail.com>|
| License|http://mptw.tiddlyspot.com/#TheBSDLicense|
***/
//{{{

// can't hijack a click handler. must redefine this entirely.
// would be good to refactor in the core...
// this version copied from 2.1.3 core

// Event handler for clicking on a tiddler tag
function onClickTag(e)
{
	if (!e) var e = window.event;
	var theTarget = resolveTarget(e);
	var popup = Popup.create(this);
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

		wikify("<<newTiddler label:'New tiddler' tag:'"+tag+"'>>",createTiddlyElement(popup,"li")); // <---- the only modification

		if(titles.length > 0)
			{
			var openAll = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.openAllText.format([tag]),lingo.openAllTooltip,onClickTagOpenAll);
			openAll.setAttribute("tag",tag);
			createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
			for(r=0; r<titles.length; r++)
				{
				createTiddlyLink(createTiddlyElement(popup,"li"),titles[r],true);
				}
			}
		else
			createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),lingo.popupNone.format([tag]));
		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
		var h = createTiddlyLink(createTiddlyElement(popup,"li"),tag,false);
		createTiddlyText(h,lingo.openTag.format([tag]));
		}
	Popup.show(popup,false);
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
	return(false);
}

//}}}

