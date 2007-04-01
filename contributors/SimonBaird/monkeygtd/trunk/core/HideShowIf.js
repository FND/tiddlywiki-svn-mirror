/***
| Name:|hideIfshowIf|
| Description:|Allows conditional inclusion/exclusion|
| Date:|17-Mar-2007|
| Home:|http://rgplugins.tiddlyspot.com/|
| Author:|Riccardo Gherardi <riccardo.gherardi@gmail.com>|
| Portions from:|HideWhenPlugin (Simon Baird), Silently macro (Gimcrack'd) and WebView (AlanHecht)|
***/
//{{{
version.extensions.hideIf = { major: 1, minor: 0, revision: 0};
//}}}
//{{{
function rgReadOnly()
{
        return document.location.toString().substring(0,document.location.toString().indexOf(":")) != "file";
}
//}}}
//{{{
function rgVisibility(params,tiddler)
{
        var hideContent = false;

        switch(params[0])
        {
                case 'readOnly':

                        hideContent = !rgReadOnly;
                        break;

                case 'readWrite':

                        hideContent = rgReadOnly;
                        break;

                case 'taggedAny':

                        params.shift();
                        hideContent = tiddler.tags.containsAny(params);
                        break;

                case 'taggedAll':
                case 'tagged':

                        params.shift();
                        hideContent = tiddler.tags.containsAll(params);
                        break;

                case 'eval':

                        hideContent = eval(params[1]);
        }

        return hideContent;
};
//}}}
//{{{
function rgHideContent(parser)
{
        var srcOffset = parser.source.indexOf('>>', parser.matchStart) + 2;
        var src = parser.source.slice(srcOffset);
        var closeTag = '<<endIf>>';
        var endPos = -1;

        for (var i = 0; i < src.length; i++)
        if (src.substr(i, closeTag.length) == closeTag)
        {
                endPos = srcOffset + i + closeTag.length;
                break;
        }

        if (endPos != -1) parser.nextMatch = endPos;
}
//}}}
//{{{
config.macros.showIf =
{
        handler: function (place,macroName,params,parser,paramString,tiddler)
        {
                if (!rgVisibility(params,tiddler)) rgHideContent(parser);
        }
};

config.macros.hideIf =
{
        handler: function (place,macroName,params,parser,paramString,tiddler)
        {
                if (rgVisibility(params,tiddler)) rgHideContent(parser);
        }
};

config.macros.endIf =
{
        handler: function() {}
};
//}}}

