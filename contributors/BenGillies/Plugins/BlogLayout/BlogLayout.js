/***
|''Name:''|BlogLayout|
|''Description:''|adds a blog like view and tiddler summary view to TiddlyWiki|
|''Author''|BenGillies (adapted/extended from code by Anshul Nigham/Clint Checketts)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/plugins/BlogLayout.js |
|''Version:''|0.2|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.5|

! Usage
Set POST_TAG_NAME to the tag that you want to load by default. This will then automatically order all tags most recent first.
All posts longer than MAX_HEIGHT will be shortened and a "Read More..." link appended to the bottom.

You can additionally call

    &lt;&lt;collapseThisTiddler&gt;&gt;

At the end of any tiddler to provide a similarly shortened view with a "Read More..." link at the bottom.

You can link to a blog-like page/layout (as per the page ouy get on first load) by putting:

    &lt;&lt;recentByTagLink link_name tag_name max_posts collapse_posts&gt;&gt;

in place of any link, where:

link_name = the text you want the link to read
tag_name = the name of the tag you want to filter by (aka POST_TAG_NAME)
max_posts = the maximum number of posts to display
collapse_posts = this can be true or false. If true it will shorten posts, adding the Read More link. Default is true.

!Code
***/
//{{{
if(!version.extensions.BlogLayout)
{ //# ensure that the plugin is only installed once
    version.extensions.BlogLayout = { installed: true }
};


(function($) { //set up alias for jQuery

config.BlogLayout = 
{
	//*******collapseTiddlers variables********//
	AUTO_SUMMARISE_FRONT_PAGE: true,	//collapse all default tiddlers on first load (other tiddlers are unaffected)
	MAX_HEIGHT: 200, //max height of tiddler content in pixels
	
	//*******recentPosts variables*************//
	POST_DISPLAY_COUNT: 7, //maximum number of posts to display
	POST_TAG_NAME: "blog" //all posts that you want displayed in date order need to be tagged with this.
}

config.BlogLayout.collapseMe = function(tiddlerRoot)
//collapse tiddlerRoot
{
    //if the post is too big
    if ($(tiddlerRoot).children('.viewer').height() > this.MAX_HEIGHT)
    {
        //limit height of tiddler
        $(tiddlerRoot).children('.viewer').css('overflow','hidden').css('height',this.MAX_HEIGHT)

        //create a link
           var tiddlerID = $(tiddlerRoot).attr('id');
           myLink = document.createElement("a");
           myLink.href = "javascript:;";
           myLink.onclick = function() {return config.BlogLayout.expandClick(tiddlerID);};
           myLink.innerHTML = "Read More...";
           myLink.className = "button";
           $("<div />").attr('id',tiddlerID+'shortener').append(myLink).css("margin-top","3px").appendTo($(tiddlerRoot));
       }
}

config.BlogLayout.collapseTiddlers = function()
//collapse all currently open tiddlers
{
    $(".tiddler").each(
        function() {
            return config.BlogLayout.collapseMe($(this))
        }
    )
}

config.BlogLayout.expandClick = function(tiddlerToExpand)
{
    $('[id='+tiddlerToExpand+'shortener]').css('display','none');
    $('[id='+tiddlerToExpand+']').children('.viewer').css('overflow','visible').css('height','');
}


config.BlogLayout.recentTiddlersByTag = function(tagName,maxPosts)
//view all tiddlers with tagName by date order
//this function taken and modified from the original "BlogWiki" plugin (by Anshul Nigham/Clint Checketts http://www.anshul.info/blogwiki.html)
{
    story.closeAllTiddlers(); //clear screen ready for display
    var tiddlerNames;
	if (tagName)
	{
		tiddlerNames = store.reverseLookup("tags",tagName,true,"created");
	}
	else
	{
		tiddlerNames = store.reverseLookup("tags","systemTiddlers",false,"created");
	}
    if ((tiddlerNames.length < maxPosts)||(maxPosts == 0))
    {
		maxPosts = tiddlerNames.length;
    }
    for(var t = tiddlerNames.length-maxPosts;t<=tiddlerNames.length-1;t++)
    {
        story.displayTiddler("top",tiddlerNames[t].title,DEFAULT_VIEW_TEMPLATE,false,false);
    }
}


config.BlogLayout.autoRecentTiddlers = function()
{
    if(!window.location.hash)
    {
        this.recentTiddlersByTag(this.POST_TAG_NAME,this.POST_DISPLAY_COUNT);
    }
}

window.original_restart = window.restart;
window.restart = function()
{
    window.original_restart();
    config.BlogLayout.autoRecentTiddlers();
    if (config.BlogLayout.AUTO_SUMMARISE_FRONT_PAGE)
    {
        config.BlogLayout.collapseTiddlers();
    }
}

config.macros.collapseThisTiddler ={
    handler: function(place,macroName,params,wikifier,paramString,tiddler)
    {
        config.BlogLayout.collapseMe($("[id=tiddler"+tiddler.title+"]"));
    }
}


config.BlogLayout.collapseRecentByTag = function(tagName,maxPosts,collapsePosts)
{
    this.recentTiddlersByTag(tagName,maxPosts)
    if (collapsePosts)
    {
        this.collapseTiddlers();
    }
}

//params[0] = name of link
//params[1] = tagName
//params[2] = maxPosts
//params[3] = collapse posts. Values are true/false. default is true.
config.macros.recentByTagLink ={
    handler: function(place,macroName,params,wikifier,paramString,tiddler)
    {
        //check parameters supplied
        var tagName, maxPosts, collapsePosts, linkName;
        tagName = params[1] || config.BlogLayout.POST_TAG_NAME;
        maxPosts = params[2] || config.BlogLayout.POST_DISPLAY_COUNT;
        collapsePosts = params[3] || "true";
        
        linkName = params[0] || tagName;
        
        var tagLink = document.createElement("a");
        tagLink.href = "javascript:;";
        tagLink.onclick = function() {return config.BlogLayout.collapseRecentByTag(tagName,maxPosts,collapsePosts);};
        tagLink.innerHTML = linkName;

        $(place).append(tagLink);
    }
}

})(jQuery)
//}}} 