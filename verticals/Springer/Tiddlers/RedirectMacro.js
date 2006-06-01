/***
|Macro|redirect (alias)|
|Author|Clint Checketts and Paul Petterson|
|Version|0.9 Oct 25, 2005|
|Description|This macro tells TW to find all instances of a word and makes it point to a different link.  For example, whenever I put the word 'Clint' in a tiddler I want TiddlyWiki to turn it into a link that points to a tiddler titled 'Clint Checketts' Or the word 'TW' could point to a tiddler called 'TiddlyWiki'|
|Usage|<////<redirect TW TiddlyWiki>////>   |
|Example|<<redirect TW "TiddlyWiki">>  <<redirect Clint "Clint Checketts">> (Nothing should appear, its just setting it all up)|
***/
//{{{
version.extensions.redirect = {major: 0, minor: 5, revision: 0, date: new Date(2005,10,24)};
config.macros.redirect = {label: "Pickles Rock!"};

config.macros.redirect.handler = function(place,macroName,params)
{
var redirectExists = false
// Check to see if the wikifier exists
for (var i=0;i<config.formatters.length;i++)
  if (config.formatters[i].name == "redirect"+params[0])
     redirectExists = true;

//If it doesn't exist, add it!
if (!redirectExists){

for( var i=0; i<config.formatters.length; i++ )
 if ( config.formatters[i].name=='wikiLink') break ;

if ( i >= config.formatters.length ) {
 var e = "Can't find formatter for wikiLink!" ;
 displayMessage( e ) ;
 throw( e ) ;
}


config.formatters.splice( i, 0, {
	name: "redirect"+params[0],
	match: "(?:\s\sb)"+params[0]+"(?:\s\sb)",
        subst: params[1], 
	handler:  function(w) {
         var link = createTiddlyLink(w.output,this.subst,false);
	 w.outputText(link,w.matchStart,w.nextMatch);
        }
  });
formatter = new Formatter(config.formatters);
} // End if
}
//}}}