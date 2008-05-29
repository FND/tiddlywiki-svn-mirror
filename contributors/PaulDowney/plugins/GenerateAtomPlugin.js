/***
|''Name:''|GenerateAtomPlugin|
|''Description:''|HTML||
|''Version:''|0.0.1|
|''Date:''|April 14, 2008|
|''Source:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/GenerateAtomPlugin|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|

Plug replacement for builtin generator of RSS 2.0.
TBD: refactor to use TiddlyTemplating

***/

//{{{
/*
 <title>Example Feed</title>
 <subtitle>A subtitle.</subtitle>
 <link href="http://example.org/feed/" rel="self"/>
 <link href="http://example.org/"/>
 <updated>2003-12-13T18:30:02Z</updated>

 <author>
   <name>John Doe</name>
   <email>johndoe@example.com</email>
 </author>

 <id>urn:uuid:60a76c80-d399-11d9-b91C-0003939e0af6</id>
 
</feed>
*/

function generateRss()
{
	return generateAtom();	// make optional?
}

function generateAtom()
{
        var s = [];
        s.push("<" + "?xml version=\'1.0\'?" + ">");
	s.push('<feed xmlns="http://www.w3.org/2005/Atom">');

/*
        var d = new Date();
        var u = store.getTiddlerText("SiteUrl");

        s.push("<title" + ">" + wikifyPlain("SiteTitle").htmlEncode() + "</title" + ">");
        s.push("<subtitle>" + wikifyPlain("SiteSubtitle").htmlEncode() + "</subtitle>");

        if(u)
                s.push("<link>" + u.htmlEncode() + "</link>");

        s.push("<language>en-us</language>");
        s.push("<copyright>Copyright " + d.getFullYear() + " " + config.options.txtUserName.htmlEncode() + "</copyright>");
        s.push("<pubDate>" + d.toGMTString() + "</pubDate>");
        s.push("<lastBuildDate>" + d.toGMTString() + "</lastBuildDate>");
        s.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
        s.push("<generator>TiddlyWiki " + version.major + "." + version.minor + "." + version.revision + "</generator>");
        // The body
        var tiddlers = store.getTiddlers("modified","excludeLists");
        var n = config.numAtomEntries > tiddlers.length ? 0 : tiddlers.length-config.numAtomEntries;
        for(var t=tiddlers.length-1; t>=n; t--) {
                s.push("<entry>\n" + tiddlers[t].toAtomEntry(u) + "\n</entry>");
        }
*/
        s.push("</feed>");
        return s.join("\n");
}

 

/*

 <entry>
   <title>Atom-Powered Robots Run Amok</title>
   <link href="http://example.org/2003/12/13/atom03"/>
   <id>urn:uuid:1225c695-cfb8-4ebb-aaaa-80da344efa6a</id>
   <updated>2003-12-13T18:30:02Z</updated>
   <summary>Some text.</summary>
 </entry>
 
// Return the tiddler as an RSS item
Tiddler.prototype.toAtomEntry= function(uri)
{       
        var s = [];
        s.push("<title" + ">" + this.title.htmlEncode() + "</title" + ">");
        s.push("<description>" + wikifyStatic(this.text,null,this).htmlEncode() + "</description>");
        for(var t=0; t<this.tags.length; t++)
                s.push("<category>" + this.tags[t] + "</category>");
        s.push("<link>" + uri + "#" + encodeURIComponent(String.encodeTiddlyLink(this.title)) + "</link>");
        s.push("<pubDate>" + this.modified.toGMTString() + "</pubDate>");
        return s.join("\n");
};      
                
// Format the text for storage in an RSS item
Tiddler.prototype.saveToAtom= function(uri)
{       
        return "<item>\n" + this.toAtomEntry(uri) + "\n</item>";
};
*/

//}}}
