/***
|''Name:''|FlexiWidthPlugin|
|''Description:''|Dynamically build a fixed width container for centering floating tiddlers|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/FlexiWidthPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FlexiWidthPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.5|
!!Documentation

!!Options
|<<option txtFlexiWidthContainer>>|<<message config.optionsDesc.txtFlexiWidthContainer>>|
|<<option txtFlexiWidthBox>>|<<message config.optionsDesc.txtFlexiWidthBox>>|
|<<option txtFlexiWidthMinBoxes>>|<<message config.optionsDesc.txtFlexiWidthMinBoxes>>|
|<<option txtFlexiWidthMaxBoxes>>|<<message config.optionsDesc.txtFlexiWidthMaxBoxes>>|

!!Code
***/
//{{{
if(!version.extensions.FlexiWidthPlugin) {
version.extensions.FlexiWidthPlugin = {installed:true};

	config.optionsDesc.txtFlexiWidthContainer = 'selector for div containing tiddlers';
	config.options.txtFlexiWidthContainer = '#displayArea';

	config.optionsDesc.txtFlexiWidthBox = 'selector for contained boxes, to be centered inside the containg div';
	config.options.txtFlexiWidthBox = '#displayArea > .page';

	config.optionsDesc.txtFlexiWidthMinBoxes = 'minimum number of tiddlers on a row';
	config.options.txtFlexiWidthMinBoxes = '1';

	config.optionsDesc.txtFlexiWidthMaxBoxes = 'maximum number of tiddlers on a row';
	config.options.txtFlexiWidthMaxBoxes = '4';
	config.extensions.FlexiWidth = {};

	config.extensions.FlexiWidth.setWidth = function() {
		var container = jQuery(config.options.txtFlexiWidthContainer);
		var box = jQuery(config.options.txtFlexiWidthBox);
		var minBoxes = config.options.txtFlexiWidthMinBoxes;
		var maxBoxes = config.options.txtFlexiWidthMaxBoxes;

		// may be simplified with outerWidth when provided by TiddlyWiki jQuery core
		var boxWidth = box.width()
			+ parseInt(box.css("padding-left"),10) 
			+ parseInt(box.css("padding-right"),10)
			+ parseInt(box.css("margin-left"),10)
			+ parseInt(box.css("margin-right"),10)
			+ parseInt(box.css("borderLeftWidth"),10)
			+ parseInt(box.css("borderRightWidth"),10);
		var nBoxes = parseInt(jQuery(window).width()/boxWidth,10);
		nBoxes = (nBoxes > maxBoxes) ? maxBoxes : 
			(nBoxes < minBoxes) ? minBoxes : 
			nBoxes;

		return container.width(nBoxes*boxWidth + 1);
	};

	/*
	 *  on TiddlyWiki ready
	 */
	config.extensions.FlexiWidth.__restart = window.restart;
	window.restart = function(){
		window.config.extensions.FlexiWidth.__restart();
		config.extensions.FlexiWidth.setWidth();
		jQuery(window).resize(config.extensions.FlexiWidth.setWidth);
	}

	/*
	 * on TiddlyWiki refresh
	 */
	config.extensions.FlexiWidth.__refreshAll = refreshAll;
	refreshAll = function(){
		config.extensions.FlexiWidth.__refreshAll();
		config.extensions.FlexiWidth.setWidth();
	}
}
//}}}
