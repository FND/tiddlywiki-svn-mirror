/***
|''Name:''|InlineTabsPlugin|
|''Description:''|Create tabs from inline tiddler text|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#InlineTabsPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.2|

!!Examples:
[[Demo|InlineTabsDemo]]
***/
// /%
//!BEGIN-PLUGIN-CODE
config.formatters.unshift( {
	name: "inlinetabs",
	match: "\\<tabs",
        lookaheadRegExp: /(?:<tabs (.*)>\n)((?:.|\n)*?)(?:\n<\/tabs>)/mg,
	handler: function(w)
	{
	    this.lookaheadRegExp.lastIndex = w.matchStart;
	    var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
	    if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			{
             var cookie = lookaheadMatch[1];
  	         var wrapper = createTiddlyElement(null,"div",null,cookie);
	         var tabset = createTiddlyElement(wrapper,"div",null,"tabset");
             tabset.setAttribute("cookie",cookie);
             var validTab = false;
             var firstTab = '';
             var tabregexp = /(?:<tab (.*)>)(?:(?:\n)?)((?:.|\n)*?)(?:<\/tab>)/mg;
             while((m = tabregexp.exec(lookaheadMatch[2])) != null)
                 {
		         if (firstTab == '') firstTab = m[1];
		         var tab = createTiddlyButton(tabset,m[1],m[1],story.onClickInlineTab,"tab tabUnselected");
		         tab.setAttribute("tab",m[1]);
		         tab.setAttribute("content",m[2]);
		         tab.title = m[1];
		         if(config.options[cookie] == m[1])
                     validTab = true;
                 }
             if(!validTab)
                 config.options[cookie] = firstTab;
	         w.output.appendChild(wrapper);
	         story.switchInlineTab(tabset,config.options[cookie]);
             w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
	}
});

Story.prototype.switchInlineTab = function(tabset,tab)
{
    var cookie = tabset.getAttribute("cookie");
    var theTab = null;
    var nodes = tabset.childNodes;
    for(var t=0; t<nodes.length; t++){
	    if(nodes[t].getAttribute && nodes[t].getAttribute("tab") == tab)
	        {
	        theTab = nodes[t];
	        theTab.className = "tab tabSelected";
	        }
	    else
	        nodes[t].className = "tab tabUnselected";
	}
	if(theTab)
		{
		if(tabset.nextSibling && tabset.nextSibling.className == "tabContents"){
			tabset.parentNode.removeChild(tabset.nextSibling);
		}
		var tabContent = createTiddlyElement(null,"div",null,"tabContents");
		tabset.parentNode.insertBefore(tabContent,tabset.nextSibling);
		wikify(theTab.getAttribute("content"),tabContent);
		if(cookie)
			{
			config.options[cookie] = tab;
			saveOptionCookie(cookie);
			}
		}
};
    
Story.prototype.onClickInlineTab = function(e)
{
    story.switchInlineTab(this.parentNode,this.getAttribute("tab"));
    return false;
};
//!END-PLUGIN-CODE
// %/