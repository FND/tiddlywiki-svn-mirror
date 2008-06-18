/***
|''Name:''|GetFirstElementValuePlugin|
|''Description:''|DOM helper functions to return node value with default |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/GetFirstElementValuePlugin |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

***/

//{{{
if(!version.extensions.GetFirstElementValuePlugin) {
version.extensions.GetFirstElementValuePlugin = {installed:true};

getFirstElementByTagNameValue = function (node,tag,def,ns) {
        if (node){
                var e = node.getElementsByTagName(tag);

                //var e = ns?node.getElementsByTagNameNS(ns,tag)
			//:node.getElementsByTagName(tag);

                if (e && e.length){
                        def = e[0].textContent || e[0].text || def;
                }
        }
        return def;
};

} //# end of 'install only once'
//}}}
