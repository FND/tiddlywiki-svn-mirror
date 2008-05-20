describe('SlidyTiddly: slidyToTiddlers(slidy)', {

	'it should return an empty array if "slidy" is an empty string': function() {
		var actual = SlidyAdaptor.slidyToTiddlers(null);
		var expected = [];
		value_of(actual).should_be(expected);
	},
	
	'it should convert div\'s with a class of "slide" into tiddlers tagged "slide" unless the div also has a class of "cover"': function() {
		var actual = 0;
		for(var i=0;i<tiddlers.length;i++) {
			if(tiddlers[i].tags.contains("slide") && tiddlers[i].tags.contains("cover")!=true) {
				actual++;
			}
		}
		var expected = 2;
		value_of(actual).should_be(expected);
	},
	
	'it should convert a div with the classes "slide" and "cover" into a tiddler tagged "coverslide"': function() {
		var actual = 0;
		for(var i=0;i<tiddlers.length;i++) {
			if(tiddlers[i].tags.contains("slide") && tiddlers[i].tags.contains("cover")) {
				actual++;
			}
		}
		var expected = 1;
		value_of(actual).should_be(expected);
	},
	
	'it should use the first h1 inside the slide div for a tiddler title': function() {
		var expected = [
			"HTML Slidy: Slide Shows in XHTML",
			"Slide Shows in XHTML",
			"What you need to do"
		];
		var actual;
		value_of(tiddlers.length === 0).should_be_false();
		for(var i=0;i<tiddlers.length;i++) {
			if(tiddlers[i].tags.contains("slide")) {
				actual = tiddlers[i].title;
				value_of(actual).should_be(expected[i]);
			}
		}
	},
	
	'it should use the rest of the slide div content as the text of the tiddler': function() {
		var expected = [];
		var slide = document.createElement("div");
		slide.innerHTML = "<p><a href=\"http://www.w3.org/People/Raggett/\">Dave Raggett</a>, &lt;<a href=\"mailto:dsr@w3.org\">dsr@w3.org</a>&gt;<br /><br /><br /><br /><br /><em>Hit the space bar for next slide</em></p>";
		expected.push(slide.innerHTML);
		slide.innerHTML = "<ul><li>You can now create accessible slide shows with ease</li><li>Works across browsers and is operated like PowerPoint  <ul><li>Advance to next slide with mouse click or space bar</li><li>Move forward/backward between slides with Cursor Left, Cursor Right, <strong>Pg Up</strong> and <strong>Pg Dn</strong> keys</li><li><strong>Home</strong> key for first slide, <strong>End</strong>   key for last slide</li><li>The \"<strong>C</strong>\" key for an automatically generated table of contents (or click on \"contents\" on the toolbar)</li><li>Function <strong>F11</strong> to go full screen and back</li><li>The \"<strong>F</strong>\" key toggles the display of the footer</li><li>The \"<strong>A</strong>\" key toggles display of current vs all slides  <ul><li>Use the \"A\" key when you want to view or print all slides</li><li>Try it now to see how to include notes for handouts (this is explained in the notes following this slide)</li></ul></li><li>Font sizes automatically adapt to browser window size  <ul><li>use <strong>S</strong> and <strong>B</strong> keys for manual control (or &lt; and &gt;, or the <strong>-</strong> and  <strong>+</strong> keys on the number pad</li><li>See also the <a href=\"#(13)\">use of the meta element for adjusting the default Slidy behavior</a></li></ul></li><li>Switching off JavaScript reveals all slides</li></ul></li><li><em>Now move to next slide to see how it works</em></li></ul><p class=\"copyright\"><a rel=\"Copyright\" href= \"http://www.w3.org/Consortium/Legal/ipr-notice#Copyright\" shape= \"rect\">Copyright</a> &copy; 2005-2006 <a href=\"/\"><acronym title= \"World Wide Web Consortium\">W3C</acronym></a><sup>&reg;</sup>  (<a href=\"http://www.csail.mit.edu/\"><acronym title= \"Massachusetts Institute of Technology\">MIT</acronym></a>, <a href= \"http://www.ercim.org/\"><acronym title= \"European Research Consortium for Informatics and Mathematics\">ERCIM</acronym></a>, <a href=\"http://www.keio.ac.jp/\">Keio</a>), All Rights Reserved.</p>";
		expected.push(slide.innerHTML);
		slide.innerHTML = "<ul><li>Each presentation is a single XHTML file</li><li>Each slide is enclosed in <em>&lt;div class=\"slide\"&gt; ...  &lt;/div&gt;</em><ul><li>The div element will be created automatically for h1 elements that are direct children of the body element.</li></ul></li><li>Use regular markup within each slide</li><li>The document head includes two links: <ul><li>The slide show style sheet: <a href= \"http://www.w3.org/Talks/Tools/Slidy/slidy.css\">http://www.w3.org/Talks/Tools/Slidy/slidy.css</a></li><li>The slide show script: <a href= \"http://www.w3.org/Talks/Tools/Slidy/slidy.js\">http://www.w3.org/Talks/Tools/Slidy/slidy.js</a></li><li>Or you can link to the compressed version of the script which is about one seventh the size, see <a href= \"http://www.w3.org/Talks/Tools/Slidy/slidy.js.gz\">http://www.w3.org/Talks/Tools/Slidy/slidy.js.gz</a></li><li>If you are using XHTML, remember to use &lt;/script&gt; and &lt;/style&gt; as per <a href=\"http://www.w3.org/TR/xhtml1/#C_3\">Appendix C.3</a></li></ul></li></ul><pre> &lt;?xml version=\"1.0\" encoding=\"utf-8\"?&gt;  &lt;!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"  \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\"&gt; &lt;html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\" xml:lang=\"en\"&gt;  &lt;head&gt;    &lt;title&gt;Slide Shows in XHTML&lt;/title&gt;    &lt;meta name=\"copyright\"     content=\"Copyright &amp;#169; 2005 your copyright notice\" /&gt;    &lt;link rel=\"stylesheet\" type=\"text/css\" media=\"screen, projection, print\"     href=\"http://www.w3.org/Talks/Tools/Slidy/slidy.css\" /&gt;    &lt;script src=\"http://www.w3.org/Talks/Tools/Slidy/slidy.js\"     charset=\"utf-8\" type=\"text/javascript\"&gt;&lt;/script&gt;    &lt;style type=\"text/css\"&gt;      &lt;!-- your custom style rules --&gt;    &lt;/style&gt;    &lt;/head&gt; &lt;body&gt;    ... your slides marked up in XHTML ... &lt;/body&gt; &lt;/html&gt; </pre>";
		expected.push(slide.innerHTML);
		delete slide;
		var actual;
		value_of(tiddlers.length === 0).should_be_false();
		for(var i=0;i<tiddlers.length;i++) {
			if(tiddlers[i].tags.contains("slide")) {
				actual = tiddlers[i].text;
				value_of(actual).should_be(expected[i]);
			}
		}
	},
	
	'it should use a meta tag named "copyright" to create a copyright tiddler': function() {
		var copyright = document.createElement("div");
		copyright.innerHTML = "Copyright &#169; 2005 W3C (MIT, ERCIM, Keio)";
		var expected = copyright.innerHTML;
		var actual = "";
			for(var i=0;i<tiddlers.length;i++) {
				if(tiddlers[i].title == "copyright") {
					actual = tiddlers[i].text;
				}
			}
		value_of(actual).should_be(expected);
	},
	
	'it should use a meta tag named "font-size-adjustment" to create a font-size-adjustment tiddler': function() {
		var expected = "-2";
		var actual = "";
		for(var i=0;i<tiddlers.length;i++) {
			if(tiddlers[i].title == "font-size-adjustment") {
				actual = tiddlers[i].text;
			}
		}
		value_of(actual).should_be(expected);
	},
	
	'it should use the first link tag with rel="stylesheet" that doesn\'t have a href of "slidy.css" to create a stylesheet tiddler': function() {
		var expected = "w3c-blue.css";
		var count = 0;
		var actual = "";
		for(var i=0;i<tiddlers.length;i++) {
			if(tiddlers[i].tags.contains("stylesheet")) {
				actual = tiddlers[i].text;
				count++;
			}
		}
		value_of(count).should_be(1);
		value_of(actual).should_be(expected);
	},
	
	'it should return an array of tiddlers': function() {
		var actual = tiddlers instanceof Array;
		value_of(actual).should_be_true();
	},
	
	before_each: function() {
		slidy = "<?xml version=\"1.0\" encoding=\"utf-8\"?><!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\"     \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\"><html xmlns=\"http://www.w3.org/1999/xhtml\" xml:lang=\"en\" lang=\"en-US\"><head><meta name=\"generator\" content= \"HTML Tidy for Linux/x86 (vers 1st November 2003), see www.w3.org\" /><title>HTML Slidy</title><meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" /><meta name=\"copyright\" content= \"Copyright &#169; 2005 W3C (MIT, ERCIM, Keio)\" /><meta name=\"font-size-adjustment\" content=\"-2\" /><link rel=\"stylesheet\" href=\"slidy.css\" type=\"text/css\" media=\"screen, projection, print\" /><link rel=\"stylesheet\" href=\"w3c-blue.css\" type=\"text/css\" media=\"screen, projection, print\" /><script src=\"slidy.js\" charset=\"utf-8\" type=\"text/javascript\"></script></head><body><div class=\"background\"><img alt=\"\" id=\"head-icon\" src=\"icon-blue.png\" /><object id=\"head-logo\" data=\"w3c-logo-blue.svg\" type=\"image/svg+xml\" title=\"W3C logo\"><a href=\"http://www.w3.org/\"><img alt=\"W3C logo\" id=\"head-logo-fallback\" src=\"w3c-logo-blue.gif\" /></a></object></div><div class=\"background slanty\"><img src=\"w3c-logo-slanted.jpg\" alt=\"slanted W3C logo\" /></div><div class=\"slide cover title\"><!-- hidden style graphics to ensure they are saved with other content --><img class=\"hidden\" src=\"../Slidy/bullet.png\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/fold.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/unfold.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/fold-dim.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/nofold-dim.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/unfold-dim.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/bullet-fold.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/bullet-unfold.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/bullet-fold-dim.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/bullet-nofold-dim.gif\" alt=\"\" /><img class=\"hidden\" src=\"../Slidy/bullet-unfold-dim.gif\" alt=\"\" /><img src=\"keys.jpg\" alt= \"Cover page images (keys)\" class=\"cover\" /><br clear=\"all\" /><h1>HTML Slidy: Slide Shows in XHTML</h1><p><a href=\"http://www.w3.org/People/Raggett/\">Dave Raggett</a>, &lt;<a href=\"mailto:dsr@w3.org\">dsr@w3.org</a>&gt;<br /><br /><br /><br /><br /><em>Hit the space bar for next slide</em></p></div><div class=\"slide\"><h1>Slide Shows in XHTML</h1><ul><li>You can now create accessible slide shows with ease</li><li>Works across browsers and is operated like PowerPoint  <ul><li>Advance to next slide with mouse click or space bar</li><li>Move forward/backward between slides with Cursor Left, Cursor Right, <strong>Pg Up</strong> and <strong>Pg Dn</strong> keys</li><li><strong>Home</strong> key for first slide, <strong>End</strong>   key for last slide</li><li>The \"<strong>C</strong>\" key for an automatically generated table of contents (or click on \"contents\" on the toolbar)</li><li>Function <strong>F11</strong> to go full screen and back</li><li>The \"<strong>F</strong>\" key toggles the display of the footer</li><li>The \"<strong>A</strong>\" key toggles display of current vs all slides  <ul><li>Use the \"A\" key when you want to view or print all slides</li><li>Try it now to see how to include notes for handouts (this is explained in the notes following this slide)</li></ul></li><li>Font sizes automatically adapt to browser window size  <ul><li>use <strong>S</strong> and <strong>B</strong> keys for manual control (or &lt; and &gt;, or the <strong>-</strong> and  <strong>+</strong> keys on the number pad</li><li>See also the <a href=\"#(13)\">use of the meta element for adjusting the default Slidy behavior</a></li></ul></li><li>Switching off JavaScript reveals all slides</li></ul></li><li><em>Now move to next slide to see how it works</em></li></ul><p class=\"copyright\"><a rel=\"Copyright\" href= \"http://www.w3.org/Consortium/Legal/ipr-notice#Copyright\" shape= \"rect\">Copyright</a> &copy; 2005-2006 <a href=\"/\"><acronym title= \"World Wide Web Consortium\">W3C</acronym></a><sup>&reg;</sup>  (<a href=\"http://www.csail.mit.edu/\"><acronym title= \"Massachusetts Institute of Technology\">MIT</acronym></a>, <a href= \"http://www.ercim.org/\"><acronym title= \"European Research Consortium for Informatics and Mathematics\">ERCIM</acronym></a>, <a href=\"http://www.keio.ac.jp/\">Keio</a>), All Rights Reserved.</p></div><div class=\"handout\"><p>For handouts, its often useful to include extra notes using a div element with class=\"handout\" following each slide, as in:</p><pre> &lt;div class=\"slide\"&gt;   <em>... your slide content ...</em>  &lt;/div&gt;  &lt;div class=\"handout\"&gt;  <em>... stuff that only appears in the handouts ...</em>  &lt;/div&gt; </pre></div><div class=\"slide\"><h1>What you need to do</h1><ul><li>Each presentation is a single XHTML file</li><li>Each slide is enclosed in <em>&lt;div class=\"slide\"&gt; ...  &lt;/div&gt;</em><ul><li>The div element will be created automatically for h1 elements that are direct children of the body element.</li></ul></li><li>Use regular markup within each slide</li><li>The document head includes two links: <ul><li>The slide show style sheet: <a href= \"http://www.w3.org/Talks/Tools/Slidy/slidy.css\">http://www.w3.org/Talks/Tools/Slidy/slidy.css</a></li><li>The slide show script: <a href= \"http://www.w3.org/Talks/Tools/Slidy/slidy.js\">http://www.w3.org/Talks/Tools/Slidy/slidy.js</a></li><li>Or you can link to the compressed version of the script which is about one seventh the size, see <a href= \"http://www.w3.org/Talks/Tools/Slidy/slidy.js.gz\">http://www.w3.org/Talks/Tools/Slidy/slidy.js.gz</a></li><li>If you are using XHTML, remember to use &lt;/script&gt; and &lt;/style&gt; as per <a href=\"http://www.w3.org/TR/xhtml1/#C_3\">Appendix C.3</a></li></ul></li></ul><pre> &lt;?xml version=\"1.0\" encoding=\"utf-8\"?&gt;  &lt;!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\"  \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\"&gt; &lt;html xmlns=\"http://www.w3.org/1999/xhtml\" lang=\"en\" xml:lang=\"en\"&gt;  &lt;head&gt;    &lt;title&gt;Slide Shows in XHTML&lt;/title&gt;    &lt;meta name=\"copyright\"     content=\"Copyright &amp;#169; 2005 your copyright notice\" /&gt;    &lt;link rel=\"stylesheet\" type=\"text/css\" media=\"screen, projection, print\"     href=\"http://www.w3.org/Talks/Tools/Slidy/slidy.css\" /&gt;    &lt;script src=\"http://www.w3.org/Talks/Tools/Slidy/slidy.js\"     charset=\"utf-8\" type=\"text/javascript\"&gt;&lt;/script&gt;    &lt;style type=\"text/css\"&gt;      &lt;!-- your custom style rules --&gt;    &lt;/style&gt;    &lt;/head&gt; &lt;body&gt;    ... your slides marked up in XHTML ... &lt;/body&gt; &lt;/html&gt; </pre></div></body></html>";
		adaptor = new SlidyAdaptor();
		tiddlers = SlidyAdaptor.slidyToTiddlers(slidy);
	},
	
	after_each: function() {
		delete slidy;
		delete adaptor;
		delete tiddlers;
	}
});