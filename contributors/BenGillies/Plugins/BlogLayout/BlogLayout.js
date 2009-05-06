/***
|''Name:''|BlogLayout|
|''Description:''|adds a blog like view and tiddler summary view to TiddlyWiki|
|''Author''|BenGillies|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/BenGillies/plugins/BlogLayout.js |
|''Version:''|1.0|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.5|
<<setCollapseHeightHere>>
! Usage
Set POST_TAG_NAME to the tag that you want to load by default. This will then automatically order all tags most recent first.
All posts longer than MAX_HEIGHT will be shortened and a "Read More..." link appended to the bottom. 

You can additionally call

{{{<<collapseThisTiddler default_height>>}}}

At the end of any tiddler to provide a similarly shortened view with a "Read More..." link at the bottom. default_height is optional and provides a default to set the height to if setCollapseHeightHere has not been called within the tiddler (see below). Set default_height to -1 to set a default of not shortening tiddlers. This can be placed in the ViewTemplate tiddler (AUTO_SUMMARISE_FRONT_PAGE should be turned off if you are doing this) right after the .viewer div, as follows:

{{{<div macro="collapseThisTiddler default_height"></div>;}}}	

You can also set a custom height from within the tiddler. If you do this, it will take precedent over all other default height settings and is the recommended method of setting height as it allows you to fine tune how short each tiddler can be. To use, call:


{{{<<setCollapseHeightHere turn_off>>}}}

This will set the height of the shortened tiddler to wherever you place the macro. turn_off should be -1 if you wish the tiddler to always appear in full. Otherwise, leave blank.

You can link to a blog-like page/layout (as per the page ouy get on first load) by putting:

{{{<<recentByTagLink link_name tag_name max_posts collapse_posts default_height>>}}} 

in place of any link, where:

link_name = the text you want the link to read
tag_name = the name of the tag you want to filter by (aka POST_TAG_NAME)
max_posts = the maximum number of posts to display
collapse_posts = this can be 1 or 0. If 1 it will shorten posts, adding the Read More link. Default is AUTO_SUMMARISE_FRONT_PAGE.
default_height = the default height of shortened posts. Set to -1 to turn off by default.

Note - It is assumed that when a user clicks on a link specifically, they want to read the whole tiddler. If you want tiddlers to appear shortened when they are clicked on, you will need to edit the ViewTemplate tiddler.
!Code
***/
//{{{
if(!version.extensions.BlogLayout)
{ //# ensure that the plugin is only installed once
    version.extensions.BlogLayout = { installed: true }
};


(function($) { //set up alias for jQuery

config.macros.BlogLayout = 
{
	//*******collapseTiddlers variables********//
	AUTO_SUMMARISE_FRONT_PAGE: true,	//collapse all default tiddlers on first load (other tiddlers are unaffected)
	MAX_HEIGHT: 200, //max height of tiddler content in pixels (default value)
	
	//*******recentPosts variables*************//
	POST_DISPLAY_COUNT: 2, //maximum number of posts to display (nb this does not work at present)
	POST_TAG_NAME: "blog" //all posts that you want displayed in date order need to be tagged with this.
}

config.macros.BlogLayout.collapseMe = function(tiddlerRoot,defaultHeight)
//collapse tiddlerRoot
{
	custHeight = store.getTiddler($(tiddlerRoot).attr("tiddler")).fields["collapseHeight"] || defaultHeight || this.MAX_HEIGHT;
	customHeight = parseInt(custHeight);
     
    //if the post is too big
    if (($(tiddlerRoot).children('.viewer').height() > customHeight)&&(customHeight != -1))
    {
        //limit height of tiddler
        $(tiddlerRoot).children('.viewer').css('overflow','hidden').css('height',customHeight);
        //create a link
        myLink = document.createElement("a");
        myLink.href = "javascript:;";
        myLink.onclick = function() {return config.macros.BlogLayout.expandClick(tiddlerRoot);};
        myLink.innerHTML = "Read More...";
        myLink.className = "button";
        $("<div />").addClass('readMore').append(myLink).css("margin-top","3px").appendTo($(tiddlerRoot));
    }
}

config.macros.BlogLayout.collapseTiddlers = function(defaultHeight)
//collapse all currently open tiddlers
{
    $(".tiddler").each(
        function() {
			if(this.style.display == "none")
			{
				$(this).attr("collapseMeLater",(defaultHeight)?(defaultHeight+""):"null");
			}
			else
			{
            	return config.macros.BlogLayout.collapseMe($(this),defaultHeight)
			}
        }
    )
}

config.macros.BlogLayout.expandClick = function(tiddlerToExpand)
{
    $(tiddlerToExpand).children(".readMore").css('display','none');
    $(tiddlerToExpand).children(".viewer").css('overflow','visible').css('height','');
}

config.macros.BlogLayout.showNextTiddlers = function(clickedLink)
{
	var divs = clickedLink.nextSibling;
	$(clickedLink).hide();
	$(clickedLink).remove();
	var stopping = false;
	while((!stopping)&&(divs))
	{
		$(divs).show();
		if (divs.className == "showMorePosts")
		{
			stopping = true;
			break;
		}
		else if ($(divs).attr("collapseMeLater"))
		{
			if ($(divs).attr("collapseMeLater") == "null")
			{
				this.collapseMe($(divs));
			}
			else
			{
				this.collapseMe($(divs),$(divs).attr("collapseMeLater"));
			}
			$(divs).removeAttr("collapseMeLater");
		}
		divs = divs.nextSibling;
	}
}

config.macros.BlogLayout.recentTiddlersByTag = function(tagName,maxPosts)
//view all tiddlers with tagName by date order
{
    story.closeAllTiddlers(); //clear screen ready for display
	$(".showMorePosts").remove();

	tiddlers = store.filterTiddlers("[tag["+tagName+"]][sort[-created]]");
	
	var count = 0;
	var currMax = maxPosts;
	var justChanged = false;
	
	while (count < tiddlers.length)
	{
		if (count == currMax)
		{
			$("<div />").addClass("showMorePosts").text("More Posts...").css("display","none").click(function(){return config.macros.BlogLayout.showNextTiddlers(this);}).appendTo("#tiddlerDisplay");
			currMax += maxPosts;
		}

		story.displayTiddler("bottom",tiddlers[count].title,DEFAULT_VIEW_TEMPLATE,false,false);
		if (count >= maxPosts)
		{
			//hide the tiddler
			$(story.getTiddler(tiddlers[count].title)).css("display","none");
		}
		count += 1;
	}
	
	//hide all but the first More Posts...
	if ($(".showMorePosts").length > 0)
	{
		$(".showMorePosts")[0].style.display = "block";
	}
}


config.macros.BlogLayout.autoRecentTiddlers = function()
{
    if(!window.location.hash)
    {
		
        this.recentTiddlersByTag(this.POST_TAG_NAME,this.POST_DISPLAY_COUNT);
    }
}

config.shadowTiddlers['DefaultTiddlers'] = "[tag["+config.macros.BlogLayout+"]][sort[-created]]";
window.original_restart = window.restart;
window.restart = function()
{
    window.original_restart();
	if (config.macros.BlogLayout.POST_DISPLAY_COUNT != -1)
	{
		config.macros.BlogLayout.autoRecentTiddlers(); //call this to ensure number of posts is limited
	}
    if ((config.macros.BlogLayout.AUTO_SUMMARISE_FRONT_PAGE)&&(!window.location.hash))
    {
        $(document).ready(function() {config.macros.BlogLayout.collapseTiddlers()});
    }
}

//$(document).ready(config.macros.BlogLayout.collapseTiddlers());
config.macros.setCollapseHeightHere ={
	handler: function(place,macroName,params,wikifier,paramString,tiddler)
	{
		dontCollapse = params[0];
		if (dontCollapse)
		{
			tiddler.fields['collapseHeight'] = -1;
		}
		else
		{
			tiddler.fields['collapseHeight'] = (place.clientHeight > 0)?(place.clientHeight - 4):(place.offsetHeight - 4);
                       tiddler.fields['collapseHeight'] += "";
		}
	}
}

config.macros.collapseThisTiddler ={
    handler: function(place,macroName,params,wikifier,paramString,tiddler)
    {
		if ((params[0])&&(!tiddler.fields['collapseHeight']))
		{
			tiddler.fields['collapseHeight'] = params[0];
		}
		config.macros.BlogLayout.collapseMe($(story.getTiddler(tiddler.title)));
    }
}


config.macros.BlogLayout.collapseRecentByTag = function(tagName,maxPosts,collapsePosts,defaultHeight)
{
    this.recentTiddlersByTag(tagName,maxPosts);
    if (collapsePosts)
    {
        this.collapseTiddlers(defaultHeight);
    }
}

//params[0] = name of link
//params[1] = tagName
//params[2] = maxPosts
//params[3] = collapse posts. Values are true/false. default is true.
//params[4] = default value for collapsing posts by
config.macros.recentByTagLink ={
    handler: function(place,macroName,params,wikifier,paramString,tiddler)
    {
        //check parameters supplied
        var tagName, maxPosts, collapsePosts, linkName,defaultHeight;
        tagName = params[1] || config.macros.BlogLayout.POST_TAG_NAME;
        maxPosts = params[2] || config.macros.BlogLayout.POST_DISPLAY_COUNT;
		collapsePosts = params[3] || (config.macros.BlogLayout.AUTO_SUMMARISE_FRONT_PAGE?1:0);
		defaultHeight = params[4] || config.macros.BlogLayout.MAX_HEIGHT;
        
        linkName = params[0] || tagName;
        collapse = (collapsePosts == 1)?true:false;
        var tagLink = document.createElement("a");
        tagLink.href = "javascript:;";
        tagLink.onclick = function() {return config.macros.BlogLayout.collapseRecentByTag(tagName,maxPosts,collapse,defaultHeight);};
        tagLink.innerHTML = linkName;
        $(place).append(tagLink);
    }
}

})(jQuery)

config.shadowTiddlers.StylesheetBlogLayout = ".showMorePosts {margin: 5px 5px 20px 5px; cursor: pointer; width: 100%; text-align: center; border: 1px solid #c0c0c0; }\n" +
".readMore {}\n" + 
".readMore .button {}";
store.addNotification("StylesheetBlogLayout",refreshStyles);
//}}}