/***
!Iframe class

|Summary: |adds an iframe to the page body and sets its doc property to allow appendChild operations |
|Author: |JonLister |

!Usage:
new Iframe([parentElem]);

where "parentElem" is an optional DOM element to add the iframe as a child to; parentElem defaults to document.body

NB: appending the iframe to document.body leaves the iframe without a provided way to close it

***/
function Iframe(parentElem) {

	var f = document.createElement("iframe");
	f.style.border = "0px";
	f.style.width = "0px";
	f.style.height = "0px";
	// have to append the iframe before the content document gets loaded
	if(parentElem)
		parentElem.appendChild(f);
	else
		document.body.appendChild(f);
	Iframe.addDoc(f);
	// opening and closing the document allows appendChild operations
	f.doc.open();
	f.doc.close();
	return f;
}

Iframe.addDoc = function(f) {
	if (f.contentDocument)
		f.doc = f.contentDocument; // For NS6
	else if (f.contentWindow)
		f.doc = f.contentWindow.document; // For IE5.5 and IE6
};

/***
!IframeTiddler macro

|Summary: |adds an iframe in place and sets the content to the HTML content of a tiddler |
|Author: |JonLister |
|Dependencies: |Iframe |

!Usage:
<<IframeTiddler tiddler:tiddlerName [width:iframeWidth] [height:iframeHeight]>>

where "tiddlerName" is a string and "iframeWidth" and "iframeHeight" are both valid CSS size strings. iframeWidth defaults to "100%"; iframeHeight defaults to the height of the content

!Developments: the content could be set by setting the iframe's "href" property to a remote URL, although this neccessitates allowing the browser to retrieve the page and load the DOM. See this discussion for a suggested approach: http://groups.google.com/group/TiddlyWikiDev/browse_thread/thread/597728cad3d46d76/e5bc32e236c914c7?lnk=gst&q=iframe#e5bc32e236c914c7

!

***/

config.macros.IframeTiddler = {
	containerId: "TiddlyIframe",
	idPrefix: "iframe",
	tiddlerError: "error in iframeTiddler macro: please supply a tiddler argument"
};

config.macros.IframeTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {

	params = paramString.parseParams("anon",null,true,false,false);
	var t = getParam(params,"tiddler",null);
	if(t) {
		t = store.getTiddler(t);
		if(!t instanceof Tiddler) {
			displayMessage(this.tiddlerError);
			return false;
		}
	}
	var width = getParam(params,"width",null);
	width = width ? width : "100%";
	var height = getParam(params,"height",null);
	// open up the tiddler in a brand new Story
	var tempStory = createTiddlyElement(null,"div",this.containerId);
	var tempStoryElem = document.body.appendChild(tempStory);
	var st = new Story(this.containerId,this.idPrefix);
	var container = st.getContainer();
	var tiddlerElem = st.createTiddler(container,null,t.title);
	// grab the innerHTML
	var divs = tiddlerElem.getElementsByTagName("div");
	var html = "";
	for(var i=0; i<divs.length; i++) {
		if(hasClass(divs[i],"viewer"))
			html = divs[i].innerHTML;
	}
	// remove the new Story
	removeNode(tempStory);
	// get an iframe
	var ifr = new Iframe(place);
	ifr.doc.open();
	ifr.writeln(html);
	ifr.close();
	ifr.style.width = width;
	ifr.style.height = height ? height : ifr.doc.body.offsetHeight+"px";
	return ifr;
};

config.macros.HTMLTemplatePreview = {
	syntaxError: "error in HTMLTemplatePreview macro: usage: <<HTMLTemplatePreview template>>"
};

config.macros.HTMLTemplatePreview.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(params[0])
		var template = params[0];
	else {
		displayMessage(this.syntaxError);
	}
	var html = expandTemplate(template,null,null,tiddler);
	html = html.replace(/'/g,"\""); // hasn't solved it
	var lines = html.split("\n");
	var ifr = new Iframe(place);
	// html = lines.join(""); // hasn't solved it
	//console.log(html);
	// html = html.substring(html.indexOf("<html"));
	// html = '<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en"><head profile="http://gmpg.org/xfn/11"><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title> Jay by Jay Fresh</title> <meta name="generator" content="WordPress.com" /> <!-- leave this for stats please --> <style type="text/css" media="screen"> @import url( http://s.wordpress.com/wp-content/themes/pub/pool/style.css?m=1193810787 ); </style> <link rel="alternate" type="application/rss+xml" title="RSS 2.0" href="http://jaybyjayfresh.com/feed/" /> <link rel="pingback" href="http://jaybyjayfresh.com/xmlrpc.php" /> <script src="http://dfw.wordpress.com/remote-login.php?action=js&host=jaybyjayfresh.com&id=786754&back=jaybyjayfresh.com%2F" type="text/javascript"></script> <script type="text/javascript">/* <![CDATA[ */function addLoadEvent(func) { var oldonload = window.onload; if (typeof window.onload != "function") { window.onload = func; } else { window.onload = function() { oldonload(); func(); } }}/* ]]> */</script><link rel="stylesheet" href="http://s.wordpress.com/wp-content/themes/h4/global.css?m=1195152580" type="text/css" /><link rel="EditURI" type="application/rsd+xml" title="RSD" href="http://jaybyjayfresh.com/xmlrpc.php?rsd" /><link rel="wlwmanifest" type="application/wlwmanifest+xml" href="http://jaybyjayfresh.com/wp-includes/wlwmanifest.xml" /> <meta name="generator" content="WordPress/MU" /><script src="http://www.google-analytics.com/urchin.js" type="text/javascript"></script><script type="text/javascript">_uacct = "UA-52447-2";_udn = "none";_ulink = 1;urchinTracker();</script> <link rel="introspection" type="application/atomserv+xml" title="Atom API" href="http://jaybyjayfresh.com/wp-app.php" /><link rel="openid.server" href="http://jaybyjayfresh.com/?openidserver=1" /><style type="text/css">#header { background: #8EBAFD url(http://jayfresh.files.wordpress.com/2008/03/jbyj.jpg) left repeat-y;}#header h1 a, #header #desc { display: none;}</style><script type="text/javascript">/*<![CDATA[*/if(typeof(addLoadEvent)!="undefined"){addLoadEvent(function(){if(top==self){i=document.createElement("img");i.src="http://botd.wordpress.com/botd.gif?blogid=786754&postid=0&lang=1&date=1204904940&ip=83.244.203.202&url=http://jaybyjayfresh.com/&loc="+document.location;i.style.width="0px";i.style.height="0px";i.style.overflow="hidden";document.body.appendChild(i);}});}/*]]>*/</script> <link rel="stylesheet" type="text/css" href="http://jaybyjayfresh.com/?css=css&rev=0" /></head><body><div id="content"> <div id="header" onclick="location.href="http://jaybyjayfresh.com";" style="cursor: pointer;"> <h1><a href="http://jaybyjayfresh.com">Jay by Jay Fresh</a></h1> </div> <div id="pagesnav"> <div class="alignleft"> <ul> <li><a href="http://jaybyjayfresh.com">Blog</a></li> <li class="page_item page-item-2"><a href="http://jaybyjayfresh.com/about/" title="About">About</a></li> </ul> </div> <div id="search"> <form id="searchform" method="get" action="http://jaybyjayfresh.com/"> <input type="text" name="s" id="s" size="20" value="search in blog..." /> </form> </div> </div> <!-- end header --> <div id="bloque"> <div id="noticias"> <div class="entrada"> <h2 id="post-114"><a tiddlylink="TestPost1" refresh="link" class="tiddlyLink tiddlyLinkExisting" title="TestPost1 - NickWebb, Thu Mar 6 12:37:00 2008" href="javascript:;">TestPost1</a></h2> <small>March 7, 2008 at 3:49 pm | In <a href="http://wordpress.com/tag/open-source/" title="View all posts in open source" rel="category tag">open source</a>, <a href="http://wordpress.com/tag/opensource/" title="View all posts in opensource" rel="category tag">opensource</a> | <a href="http://jaybyjayfresh.com/2008/03/07/reflections-on-9-months-in-osmosoft/#respond" title="Comment on Reflections on 9 months in&nbsp;Osmosoft">No Comments</a> <br>Tags: <a href="http://wordpress.com/tag/bt/" rel="tag">bt</a>, <a href="http://wordpress.com/tag/osmosoft/" rel="tag">osmosoft</a>, <a href="http://wordpress.com/tag/tiddlywiki/" rel="tag">tiddlywiki</a><br></small> <div class="snap_preview">Hello hello people of the world!</div> <div class="feedback"></div> </div><div class="entrada"> <h2 id="post-114"><a tiddlylink="Tomorrow" refresh="link" class="tiddlyLink tiddlyLinkExisting" title="Tomorrow - YourName, Wed Mar 12 17:39:00 2008" href="javascript:;">Tomorrow</a></h2> <small>March 7, 2008 at 3:49 pm | In <a href="http://wordpress.com/tag/open-source/" title="View all posts in open source" rel="category tag">open source</a>, <a href="http://wordpress.com/tag/opensource/" title="View all posts in opensource" rel="category tag">opensource</a> | <a href="http://jaybyjayfresh.com/2008/03/07/reflections-on-9-months-in-osmosoft/#respond" title="Comment on Reflections on 9 months in&nbsp;Osmosoft">No Comments</a> <br>Tags: <a href="http://wordpress.com/tag/bt/" rel="tag">bt</a>, <a href="http://wordpress.com/tag/osmosoft/" rel="tag">osmosoft</a>, <a href="http://wordpress.com/tag/tiddlywiki/" rel="tag">tiddlywiki</a><br></small> <div class="snap_preview">Tomorrow tomorrow</div> <div class="feedback"></div> </div> </div><!-- begin footer --><!-- begin sidebar --> <div id="sidebar"> <ul> <li id="text-1" class="widget widget_text"> <h2 class="widgettitle">Feed</h2> <div class="textwidget"><a href="http://feeds.feedburner.com/JayFresh"><img src="http://faq.files.wordpress.com/2006/11/j64.png" /></a><p><a href="http://feeds.feedburner.com/JayFresh"><img src="http://feeds.feedburner.com/~fc/JayFresh?bg=0099FF&fg=FFFFFF&anim=0" height="26" width="88" style="border:0;" alt="" /></a></p></div> </li> <li id="text-2" class="widget widget_text"> <div class="textwidget"><a href="http://technorati.com/faves?sub=addfavbtn&add=http://jaybyjayfresh.com"><img src="http://static.technorati.com/pix/fave/btn-fave2.png" alt="Add to Technorati Favorites" /></a></div> </li> <li id="text-3" class="widget widget_text"> <div class="textwidget"><a href="http://twitter.com/jayfresh"><img src="http://img.skitch.com/20080130-rqdk3s9617sd6f14iahs232np2.jpg" alt="follow me on Twitter!"></a></div> </li> <li id="delicious" class="widget widget_delicious"> <h2 class="widgettitle"><a href="http://del.icio.us/jonathanlisterbtcom">del.icio.us</a></h2><div id="delicious-box" style="margin:0;padding:0;border:none;"> </div> <script type="text/javascript" src="http://del.icio.us/feeds/json/jonathanlisterbtcom/?count=10;"></script> <script type="text/javascript"> function showImage(img){ return (function(){ img.style.display="inline"; }) } var ul = document.createElement("ul"); for (var i=0, post; post = Delicious.posts[i]; i++) { var li = document.createElement("li"); var a = document.createElement("a"); a.setAttribute("href", post.u); a.appendChild(document.createTextNode(post.d)); li.appendChild(a); ul.appendChild(li); } ul.setAttribute("id", "delicious-list"); document.getElementById("delicious-box").appendChild(ul); </script> </li><li id="categories-1" class="widget widget_categories"><h2 class="widgettitle">Tags</h2><select name="cat" id="cat" class="postform"> <option value="-1"> Select Category</option> <option value="29691">adobe&nbsp;&nbsp;(1)</option> <option value="1376398">antechinus&nbsp;&nbsp;(1)</option> <option value="281988">aptana&nbsp;&nbsp;(1)</option> <option value="445398">atlassian&nbsp;&nbsp;(1)</option> <option value="4229">barcamp&nbsp;&nbsp;(1)</option> <option value="1768851">barcamp brighton&nbsp;&nbsp;(1)</option> <option value="1386804">barcampbrighton&nbsp;&nbsp;(2)</option> <option value="1768722">barcampbrighton07&nbsp;&nbsp;(1)</option> <option value="738772">BarCampLondon2&nbsp;&nbsp;(7)</option> <option value="1521794">benmarvell&nbsp;&nbsp;(1)</option> <option value="7977">berlin&nbsp;&nbsp;(1)</option> <option value="786754">blidget&nbsp;&nbsp;(1)</option> <option value="91">blogging&nbsp;&nbsp;(2)</option> <option value="2208100">boycook&nbsp;&nbsp;(1)</option> <option value="57212">bt&nbsp;&nbsp;(2)</option> <option value="1521527">btosmosoft&nbsp;&nbsp;(22)</option> <option value="179">business&nbsp;&nbsp;(2)</option> <option value="7375">cartoons&nbsp;&nbsp;(9)</option> <option value="1912628">cefn hoile&nbsp;&nbsp;(1)</option> <option value="1521771">cefnhoile&nbsp;&nbsp;(3)</option> <option value="19471">cio&nbsp;&nbsp;(1)</option> <option value="626">cluetrain&nbsp;&nbsp;(2)</option> <option value="832622">cluetrainmanifesto&nbsp;&nbsp;(1)</option> <option value="592018">coda&nbsp;&nbsp;(1)</option> <option value="15888">collaboration&nbsp;&nbsp;(5)</option> <option value="675368">confluence&nbsp;&nbsp;(1)</option> <option value="10003">contractors&nbsp;&nbsp;(1)</option> <option value="1802689">cross domain scripting&nbsp;&nbsp;(1)</option> <option value="222507">cross site scripting&nbsp;&nbsp;(1)</option> <option value="1802690">crossdomainscripting&nbsp;&nbsp;(1)</option> <option value="1802688">crosssitescripting&nbsp;&nbsp;(1)</option> <option value="169">css&nbsp;&nbsp;(1)</option> <option value="1521772">curiositycollective&nbsp;&nbsp;(1)</option> <option value="16446">dapper&nbsp;&nbsp;(1)</option> <option value="22379">data&nbsp;&nbsp;(2)</option> <option value="284712">decentralization&nbsp;&nbsp;(3)</option> <option value="148">design&nbsp;&nbsp;(1)</option> <option value="4315">diy&nbsp;&nbsp;(1)</option> <option value="10882">docs&nbsp;&nbsp;(1)</option> <option value="8076">DOM&nbsp;&nbsp;(1)</option> <option value="553186">edward tufte&nbsp;&nbsp;(1)</option> <option value="2094614">edwardtufte&nbsp;&nbsp;(1)</option> <option value="15328">enterprise&nbsp;&nbsp;(1)</option> <option value="1410203">ericraymond&nbsp;&nbsp;(1)</option> <option value="46804">EUP&nbsp;&nbsp;(8)</option> <option value="81819">facebook&nbsp;&nbsp;(4)</option> <option value="1912632">film can zoetrope&nbsp;&nbsp;(1)</option> <option value="760226">fowa&nbsp;&nbsp;(3)</option> <option value="762264">fowa2007&nbsp;&nbsp;(2)</option> <option value="750670">fowalondon07&nbsp;&nbsp;(3)</option> <option value="823316">freebase&nbsp;&nbsp;(1)</option> <option value="684">funny&nbsp;&nbsp;(1)</option> <option value="762262">futureofwebapps&nbsp;&nbsp;(1)</option> <option value="1256">gaming&nbsp;&nbsp;(2)</option> <option value="279006">generation-y&nbsp;&nbsp;(1)</option> <option value="1521770">glennjones&nbsp;&nbsp;(1)</option> <option value="81">google&nbsp;&nbsp;(5)</option> <option value="1202199">google mashup editor&nbsp;&nbsp;(1)</option> <option value="2000219">googlemashupeditor&nbsp;&nbsp;(1)</option> <option value="1273311">googlenotebook&nbsp;&nbsp;(1)</option> <option value="782299">googlereader&nbsp;&nbsp;(1)</option> <option value="658">graphics&nbsp;&nbsp;(1)</option> <option value="782722">hapispace&nbsp;&nbsp;(2)</option> <option value="647">html&nbsp;&nbsp;(2)</option> <option value="32744">IBM&nbsp;&nbsp;(1)</option> <option value="374">ideas&nbsp;&nbsp;(1)</option> <option value="1530213">innerHTML&nbsp;&nbsp;(1)</option> <option value="1731618">innerText&nbsp;&nbsp;(1)</option> <option value="493912">instructables&nbsp;&nbsp;(1)</option> <option value="22">internet&nbsp;&nbsp;(2)</option> <option value="1299908">jamcracker&nbsp;&nbsp;(1)</option> <option value="457">javascript&nbsp;&nbsp;(4)</option> <option value="3097280">jayfreshineasterneurope&nbsp;&nbsp;(1)</option> <option value="1273917">jeremyruston&nbsp;&nbsp;(1)</option> <option value="1774755">jim gettys&nbsp;&nbsp;(1)</option> <option value="1774754">jimgettys&nbsp;&nbsp;(1)</option> <option value="1633834">jonathan lister&nbsp;&nbsp;(17)</option> <option value="1521528">jonathanlister&nbsp;&nbsp;(56)</option> <option value="57823">jotspot&nbsp;&nbsp;(1)</option> <option value="10027">jp&nbsp;&nbsp;(2)</option> <option value="1883903">jp rangaswami&nbsp;&nbsp;(1)</option> <option value="1883904">jprangaswami&nbsp;&nbsp;(1)</option> <option value="2198529">kengirard&nbsp;&nbsp;(1)</option> <option value="653554">knowledgemanagement&nbsp;&nbsp;(1)</option> <option value="86462">lbs&nbsp;&nbsp;(1)</option> <option value="6418">location&nbsp;&nbsp;(1)</option> <option value="1618">london&nbsp;&nbsp;(1)</option> <option value="1625">macro&nbsp;&nbsp;(1)</option> <option value="4236">management&nbsp;&nbsp;(2)</option> <option value="1617681">mashmaker&nbsp;&nbsp;(1)</option> <option value="60330">mashup&nbsp;&nbsp;(7)</option> <option value="1307309">mashupevent&nbsp;&nbsp;(1)</option> <option value="22044">mashups&nbsp;&nbsp;(1)</option> <option value="1768937">matthew somerville&nbsp;&nbsp;(1)</option> <option value="1768936">matthewsomerville&nbsp;&nbsp;(1)</option> <option value="637">microsoft&nbsp;&nbsp;(3)</option> <option value="43886">MIT&nbsp;&nbsp;(1)</option> <option value="120">mobile&nbsp;&nbsp;(2)</option> <option value="126918">momo&nbsp;&nbsp;(2)</option> <option value="1113575">momolondon&nbsp;&nbsp;(2)</option> <option value="27029">nerves&nbsp;&nbsp;(1)</option> <option value="34110">netvibes&nbsp;&nbsp;(1)</option> <option value="1650738">neue nationalgalerie&nbsp;&nbsp;(1)</option> <option value="1650739">neuenationalgalerie&nbsp;&nbsp;(1)</option> <option value="103">news&nbsp;&nbsp;(1)</option> <option value="1768939">nice paul&nbsp;&nbsp;(1)</option> <option value="1768938">nicepaul&nbsp;&nbsp;(1)</option> <option value="1928148">nick webb&nbsp;&nbsp;(1)</option> <option value="1410202">nickcarr&nbsp;&nbsp;(1)</option> <option value="1928146">nickwebb&nbsp;&nbsp;(1)</option> <option value="1729788">nodevalue&nbsp;&nbsp;(1)</option> <option value="41697">notepad++&nbsp;&nbsp;(1)</option> <option value="245315">olpc&nbsp;&nbsp;(2)</option> <option value="261444">one laptop per child&nbsp;&nbsp;(1)</option> <option value="614902">onelaptopperchild&nbsp;&nbsp;(1)</option> <option value="25">open source&nbsp;&nbsp;(1)</option> <option value="537714">openkapow&nbsp;&nbsp;(1)</option> <option value="44">opensource&nbsp;&nbsp;(1)</option> <option value="1365898">osmosoft&nbsp;&nbsp;(34)</option> <option value="1521764">otuekanem&nbsp;&nbsp;(1)</option> <option value="1768711">paul silver&nbsp;&nbsp;(2)</option> <option value="1768710">paulsilver&nbsp;&nbsp;(2)</option> <option value="2000217">phil whitehouse&nbsp;&nbsp;(1)</option> <option value="1614122">philhawksworth&nbsp;&nbsp;(1)</option> <option value="2000216">philwhitehouse&nbsp;&nbsp;(1)</option> <option value="79812">pipes&nbsp;&nbsp;(1)</option> <option value="3965">plugin&nbsp;&nbsp;(1)</option> <option value="841">plugins&nbsp;&nbsp;(1)</option> <option value="1129832">popfly&nbsp;&nbsp;(1)</option> <option value="40296">powerpoint&nbsp;&nbsp;(1)</option> <option value="205043">presentation skills&nbsp;&nbsp;(1)</option> <option value="17903">presentations&nbsp;&nbsp;(1)</option> <option value="962182">presentationskills&nbsp;&nbsp;(1)</option> <option value="196">programming&nbsp;&nbsp;(17)</option> <option value="558353">proto&nbsp;&nbsp;(1)</option> <option value="713987">qedwiki&nbsp;&nbsp;(1)</option> <option value="1731778">quirksmode&nbsp;&nbsp;(1)</option> <option value="39175">readwriteweb&nbsp;&nbsp;(1)</option> <option value="39653">recruitment&nbsp;&nbsp;(1)</option> <option value="15314">REST&nbsp;&nbsp;(1)</option> <option value="1180280">ricardo semler&nbsp;&nbsp;(1)</option> <option value="1928134">ricardosemler&nbsp;&nbsp;(1)</option> <option value="3156584">ripplerap&nbsp;&nbsp;(1)</option> <option value="650122">ROC&nbsp;&nbsp;(1)</option> <option value="1299907">ryangahl&nbsp;&nbsp;(1)</option> <option value="17927">saas&nbsp;&nbsp;(1)</option> <option value="1958">seo&nbsp;&nbsp;(1)</option> <option value="37382">sharepoint&nbsp;&nbsp;(1)</option> <option value="1297353">simonmcmanus&nbsp;&nbsp;(3)</option> <option value="7579">sms&nbsp;&nbsp;(1)</option> <option value="652">spam&nbsp;&nbsp;(1)</option> <option value="845328">synthasite&nbsp;&nbsp;(1)</option> <option value="6">technology&nbsp;&nbsp;(1)</option> <option value="1072995">Teqlo&nbsp;&nbsp;(3)</option> <option value="1731284">textcontent&nbsp;&nbsp;(1)</option> <option value="14344">thermo&nbsp;&nbsp;(1)</option> <option value="2031392">tiddlyblogger&nbsp;&nbsp;(2)</option> <option value="1867346">tiddlychatter&nbsp;&nbsp;(6)</option> <option value="1632961">tiddlyspot&nbsp;&nbsp;(1)</option> <option value="1103">tiddlywiki&nbsp;&nbsp;(15)</option> <option value="1521791">tommorris&nbsp;&nbsp;(1)</option> <option value="46772">top 5&nbsp;&nbsp;(1)</option> <option value="125475">top5&nbsp;&nbsp;(1)</option> <option value="498566">tufte&nbsp;&nbsp;(1)</option> <option value="599182">twitter&nbsp;&nbsp;(5)</option> <option value="27940">ui&nbsp;&nbsp;(1)</option> <option value="1">Uncategorized&nbsp;&nbsp;(7)</option> <option value="9280">user experience&nbsp;&nbsp;(1)</option> <option value="6171">user interface&nbsp;&nbsp;(1)</option> <option value="86713">user interface design&nbsp;&nbsp;(1)</option> <option value="2000218">userinterfacedesign&nbsp;&nbsp;(1)</option> <option value="6636">value&nbsp;&nbsp;(1)</option> <option value="1768940">vicky lamburn&nbsp;&nbsp;(1)</option> <option value="1768941">vickylamburn&nbsp;&nbsp;(1)</option> <option value="1376399">visualwebdeveloper&nbsp;&nbsp;(1)</option> <option value="44433">vodafone&nbsp;&nbsp;(1)</option> <option value="2872">W3C&nbsp;&nbsp;(1)</option> <option value="151">web&nbsp;&nbsp;(1)</option> <option value="1175">web2.0&nbsp;&nbsp;(4)</option> <option value="820">webdev&nbsp;&nbsp;(1)</option> <option value="1617682">webwidgetry&nbsp;&nbsp;(1)</option> <option value="335550">widgetbox&nbsp;&nbsp;(1)</option> <option value="28020">widgets&nbsp;&nbsp;(4)</option> <option value="1359">wiki&nbsp;&nbsp;(3)</option> <option value="608">wikis&nbsp;&nbsp;(2)</option> <option value="482312">wiley&nbsp;&nbsp;(1)</option> <option value="597692">wisdomofcrowds&nbsp;&nbsp;(1)</option> <option value="298463">xmlhttprequest&nbsp;&nbsp;(1)</option> <option value="1761833">XO-1&nbsp;&nbsp;(2)</option> <option value="363132">xss&nbsp;&nbsp;(1)</option> <option value="444">yahoo&nbsp;&nbsp;(2)</option> <option value="703840">yahoo pipes&nbsp;&nbsp;(1)</option> <option value="715020">yahoopipes&nbsp;&nbsp;(3)</option> <option value="121556">zero&nbsp;&nbsp;(1)</option> <option value="1521759">zeroprogramming&nbsp;&nbsp;(1)</option> <option value="696125">zoetrope&nbsp;&nbsp;(1)</option></select><script type="text/javascript"><!-- var dropdown = document.getElementById("cat"); function onCatChange() { if ( dropdown.options[dropdown.selectedIndex].value > 0 ) { location.href = "http://jaybyjayfresh.com/?cat="+dropdown.options[dropdown.selectedIndex].value; } } dropdown.onchange = onCatChange;--></script></li><li id="archives" class="widget widget_archives"><h2 class="widgettitle">Archive</h2> <select name="archive-dropdown" onchange="document.location.href=this.options[this.selectedIndex].value;"> <option value="">Select Month</option> <option value="http://jaybyjayfresh.com/2008/03/"> March 2008 </option> <option value="http://jaybyjayfresh.com/2008/02/"> February 2008 </option> <option value="http://jaybyjayfresh.com/2008/01/"> January 2008 </option> <option value="http://jaybyjayfresh.com/2007/12/"> December 2007 </option> <option value="http://jaybyjayfresh.com/2007/11/"> November 2007 </option> <option value="http://jaybyjayfresh.com/2007/10/"> October 2007 </option> <option value="http://jaybyjayfresh.com/2007/09/"> September 2007 </option> <option value="http://jaybyjayfresh.com/2007/08/"> August 2007 </option> <option value="http://jaybyjayfresh.com/2007/07/"> July 2007 </option> <option value="http://jaybyjayfresh.com/2007/06/"> June 2007 </option> <option value="http://jaybyjayfresh.com/2007/05/"> May 2007 </option> <option value="http://jaybyjayfresh.com/2007/04/"> April 2007 </option> <option value="http://jaybyjayfresh.com/2007/02/"> February 2007 </option> </select></li> <li id="blog-stats" class="widget widget_statscounter"> <h2 class="widgettitle">You and what army?</h2> <ul> <li>8,291 people</li> </ul> </li> </ul> </div> <div class="both"></div> </div><!-- end sidebar --><p id="credits"><a href="http://wordpress.com/" rel="generator">Blog at WordPress.com</a>. | Theme: Pool by <a href="http://www.lamateporunyogur.net/" rel="designer">Borja Fernandez</a>.<br /><a href="http://jaybyjayfresh.com/feed/">Entries</a> and <a href="http://jaybyjayfresh.com/comments/feed/">comments</a> feeds. <!-- 0 queries. 0.226 seconds. --></p></div><script type="text/javascript" src="http://edge.quantserve.com/quant.js"></script><script type="text/javascript">_qmeta="qc:adt=0;bti=Jay+by+Jay+Fresh;lan=en";_qacct="p-18-mFEk4J448M";quantserve();</script><noscript><p><img src="http://pixel.quantserve.com/pixel/p-18-mFEk4J448M.gif" style="display: none" height="1" width="1" alt="" /></p></noscript><script src="http://s.stats.wordpress.com/w.js?8" type="text/javascript"></script></body></html>';
	ifr.doc.open();
	/* for(var i=0;i<lines.length;i++){
		ifr.doc.write(lines[i]);
	} */
	//ifr.doc.write(html);
	ifr.doc.close();
	//ifr.doc.documentElement.innerHTML = html;
	var htmlHead = html.substring(html.indexOf("<head>"),html.indexOf("</head>"));
	var htmlBody = html.substring(html.indexOf("<body>"),html.indexOf("</body>"));
	ifr.doc.documentElement.getElementsByTagName("head")[0].innerHTML = htmlHead;
	ifr.doc.documentElement.getElementsByTagName("body")[0].innerHTML = htmlBody;
	ifr.style.width = "100%";
	ifr.style.height = "800px";
	//ifr.doc.body.offsetHeight+"px";
};