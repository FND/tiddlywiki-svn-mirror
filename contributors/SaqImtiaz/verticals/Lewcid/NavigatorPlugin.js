//{{{
// Resolves a Tiddler reference or tiddler title into a tiddler title string, or null if it doesn't exist
TiddlyWiki.prototype.resolveTitle = function(t)
{
    if (t instanceof Tiddler) t = t.title;
    return store.tiddlerExists(t) ? t : null;
}

config.macros.navigator = {};
config.macros.navigator.defaults = 
{
    labels: "[[<< Previous]] [[Next >>]]",
    tooltips: "[[previous]] [[next]]",
    nosource: "No source tiddlers defined"
}
config.macros.navigator.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
    var params = paramString.parseParams("tiddlers",null,true);
    var labels = getParam(params,"labels",this.defaults.labels).readBracketedList();
    var tooltips = getParam(params,"tooltips",this.defaults.tooltips).readBracketedList();
    var tiddlers = getParam(params,"tiddlers",undefined)||getParam(params,"array",undefined);
    if (typeof tiddlers == 'string')
        tiddlers = tiddlers.readBracketedList();
    if (tiddlers == undefined)
        alert(this.defaults.nosource);
    var theDiv = createTiddlyElement(place,"div",null,"navigator");
    this.makePage(tiddlers, 0, theDiv,labels[0],labels[1],tooltips[0],tooltips[1]);
}

config.macros.navigator.makePage = function (tiddlers, curIndex, place,prevLabel,nextLabel,prevTooltip,nextTooltip)
{
    var onclick = function(e)
        {
    config.macros.navigator.makePage(tiddlers,parseInt(this.getAttribute("nr")),place,prevLabel,nextLabel,prevTooltip,nextTooltip);
        }

    removeChildren(place);
    window.scrollTo(0,0);
    wikify("<<tiddler [[" + store.resolveTitle(tiddlers[curIndex]) + "]]>>",place);
    wikify("{{right{<<top>>}}}\n",place);

    var navbar = createTiddlyElement(place,"div",null,"navigatorBar");
    var createButton = function(label,tooltip,theClass,nr)
        {
        var btn = createTiddlyButton(navbar,label,tooltip,onclick,theClass);
        btn.setAttribute("nr",nr);
        }

    if (tiddlers[curIndex-1])
        createButton(prevLabel,prevTooltip,"navPrevious button",curIndex-1);
    if (tiddlers[curIndex+1])
        createButton(nextLabel,nextTooltip,"navNext button",curIndex+1);
   
    var theTable = createTiddlyElement(navbar,"table",null,"nav");
    var theBody = createTiddlyElement(theTable,"tbody");
    var theRow = createTiddlyElement(theBody,"tr");
    for (var i=0; i<tiddlers.length; i++)
        {
        var box = createTiddlyElement(theRow,"td",null,"navlinkcell"," ");
        box.onclick = onclick;
        box.setAttribute("nr",i);
       // box.title = store.resolveTitle(tiddlers[i]);
        if (tiddlers[i] ==tiddlers[curIndex])
           box.className += " activenav";
        }
}
//}}}