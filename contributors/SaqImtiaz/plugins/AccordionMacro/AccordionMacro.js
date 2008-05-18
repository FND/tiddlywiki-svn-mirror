/***
|''Name:''|AccordionMacro|
|''Description:''|Create an accordion effect for menus|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#AccordionMacro|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.2|
|''Requires:''|InlineSlidersPlugin (http://tw.lewcid.org/#InlineSlidersPlugin)|

!!Usage
* designed to work with the InlineSlidersPlugin.
* when one slider is opened, all other sliders in that tiddler are closed.
* just put {{{<<accordion>>}}} in the tiddler.
* useful for menus.
* [[Demo|AccordionDemo]]
***/
// /%
//!BEGIN-PLUGIN-CODE
config.macros.accordion={};
config.macros.accordion.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
    var tiddler = story.findContainingTiddler(place);
    var btns = tiddler.getElementsByTagName("a");
    for (var i=0; i<btns.length; i++){
        var btn=btns[i];
        if (hasClass(btn,"sliderButton")){
           btn.old_onclick = btn.onclick;
           btn.onclick = function(e){
               this.old_onclick.apply(this,arguments);
               divs = tiddler.getElementsByTagName("div");
               for (var i=0; i<divs.length; i++){
                   if(hasClass(divs[i],"sliderPanel")){
                       if(divs[i]!=this.nextSibling){
                          divs[i].style.display = "none";
                          if (divs[i].nextSibling.tagName.toLowerCase()=="br"){
                             divs[i].nextSibling.style.display="";
                          }
                       }
                       else if(divs[i].nextSibling.tagName.toLowerCase()=="br"){
                             divs[i].nextSibling.style.display = divs[i].style.display =="none"? "": "none";
                       }
                   }
               }
           };
        }
    }
};
//!END-PLUGIN-CODE
// %/