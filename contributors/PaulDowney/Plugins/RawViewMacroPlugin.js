/***
|''Name:''|RawViewMacroPlugin|
|''Description:''|Add extra view to the view macro for raw HTML||
|''Version:''|0.0.1|
|''Date:''|Mar 2, 2008|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/Plugins/RawViewMacroPlugin|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|

Include raw HTML in a template, etc:
<<view text raw>>

***/

//{{{

config.macros.view.views.raw = function(value,place,params,wikifier,paramString,tiddler) {
                createTiddlyElement(place,"span",null,null).innerHTML = value;
        };


//}}}
