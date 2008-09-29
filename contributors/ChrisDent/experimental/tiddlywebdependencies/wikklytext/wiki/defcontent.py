"""
defcontent.py: Default content items.

Copyright (C) 2007,2008 Frank McIngvale

Contact: fmcingvale@boodebr.org

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.
"""

HelloWorld = u"""
Welcome to your new wiki! You can delete this item if you'd like.

<<warnbox "&#x200b;*** ''Fair Warning'' ***"
"{{tt{wik serve}}} has not been heavily tested for use on a public server.

Although I believe it to be reasonably secure, I'd recommend using caution
when deciding to place a wiki on a publically accessible site.">>

Links:
	* [[Markup Help Text|MarkupReference]]
"""

DefaultTiddlers = u"HelloWorld"

SiteTitle = u"WikklyText"

SiteSubtitle = u"A Wiki built with WikklyText"

DoServerCmd = u"""
You've clicked on a link that requires a WikklyText server in order
to perform some action. Since you are not viewing this wiki via a server,
no action will be performed.

(This is a default page to let you know what happened. Customize as needed for your setup.)"""

MarkupReference = u"<<help>>"

StyleSheet = u"""
/***
Define local styles here. Styles defined here will override those in
{{{css/wikklytext.css}}}

Remember to prefix all classnames with {{{wikkly-}}}

For example:
{{{
div.wikkly-mydiv { ... }
.wikkly-mystyle { ... }
}}}

These would be referenced in your wikitext like {{{{{mydiv{... }}} and {{{{{mystyle{... }}}
***/

/*{{{*/

/* Place your styles here as regular CSS */

/*}}}*/"""

MainMenu = u"""
/% Primary links, edit as desired %/
{{navmenu{
* [[Home|index]]
* [[Timeline|index-Timeline]]
* [[Names|index-Names]]
* [[Tags|index-Tags]]
* [[New Item|DoServerCmd?cmd=newItem]]
* [[Wiki Admin|DoServerCmd?cmd=admin]]
}}}
/% Add a search box %/
<html>
  <form action="DoServerCmd.html" method="get">
    <input class="wikkly-navmenu" type="text" name="words" />
    <br/>
    <input class="wikkly-navmenu" type="submit" value="Search" />
    <input type="hidden" name="cmd" value="search" />
  </form>
</html>"""

MarkupPreHead = u"""
<!--{{{-->
<!-- This markup is inserted at the start of the document HEAD -->
<!--}}}-->"""

MarkupPostHead = u"""
<!--{{{-->
<!-- This markup is inserted at the end of the document HEAD -->
<!--}}}-->"""

MarkupPreBody = u"""
<!--{{{-->
<!-- This markup is inserted at the start of the document BODY -->
<!--}}}-->"""

MarkupPostBody = u"""
<!--{{{-->
<!-- This markup is inserted at the end of the document BODY -->
<!--}}}-->"""

