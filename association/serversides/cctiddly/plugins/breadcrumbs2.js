/***
BreadcrumbsPlugin
author: Alan Hecht (with 2.0 update from 'jack' and revisions by Bram Chen)
source: http://groups.google.com/group/TiddlyWikiDev/msg/c23edb5f3c0d8b7e
''Revision History:''
v1.2.0(Feb 07, 2006)
* change globle array breadCrumbs to config.breadCrumbs by Eric's suggestion
v1.1.0 (Feb 04, 2006)
* JSLint checked
v1.0.0 (Feb 01, 2006)
* TW2 ready and code Cleaned-up
***/
//{{{
version.extensions.breadCrumbs = {major: 1, minor: 2, revision: 0,date: new Date("Feb 07, 2006")};
config.breadCrumbs = [];

window.onClickTiddlerLink_orig_breadCrumbs = window.onClickTiddlerLink;
window.onClickTiddlerLink = function(e){
        window.onClickTiddlerLink_orig_breadCrumbs(e);
        addCrumb(e);
};

function addCrumb(e){
        if (!e) {e = window.event;}
        var thisCrumb = "[[" + resolveTarget(e).getAttribute("tiddlyLink") + "]]";
        var ind = config.breadCrumbs.find(thisCrumb);
        if(ind === null){
			config.breadCrumbs.push(thisCrumb);
			}
        else{
			config.breadCrumbs.length = ind++;
			}
        refreshCrumbs();
}

function refreshCrumbs(){
        var crumbArea = document.getElementById("breadCrumbs");
        if (!crumbArea) {
			crumbArea = document.createElement("div");
			crumbArea.id = "breadCrumbs";
			crumbArea.style.visibility= "hidden";
			var targetArea = document.getElementById("tiddlerDisplay");
				targetArea.parentNode.insertBefore(crumbArea,targetArea);
        }
        crumbArea.style.visibility = "visible";
        removeChildren(crumbArea);
        createTiddlyButton(crumbArea,"Home",null,restartHome);
        wikify(" || " + config.breadCrumbs.join(' > '),crumbArea);
}

function restartHome(){
        story.closeAllTiddlers();
        restart();
        config.breadCrumbs = [];
        var crumbArea = document.getElementById("breadCrumbs");
        crumbArea.style.visibility = "hidden";
}
//}}}