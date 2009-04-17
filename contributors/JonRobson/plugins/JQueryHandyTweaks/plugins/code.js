/*
allows an easy way using classes in PageTemplate,ViewTemplate,EditTemplate to make dom elements resizable,collapsable,moveable, jQueryTabs or jQueryTab

*/

/*
 * jqDnR - Minimalistic Drag'n'Resize for jQuery.
 *
 * Copyright (c) 2007 Brice Burgess <bhb@iceburg.net>, http://www.iceburg.net
 * Licensed under the MIT License:
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * $Version: 2007.08.19 +r2
 */

(function($){
$.fn.jqDrag=function(h){return i(this,h,'d');};
$.fn.jqResize=function(h){return i(this,h,'r');};
$.jqDnR={dnr:{},e:0,
drag:function(v){
 if(M.k == 'd')E.css({left:M.X+v.pageX-M.pX,top:M.Y+v.pageY-M.pY});
 else E.css({width:Math.max(v.pageX-M.pX+M.W,0),height:Math.max(v.pageY-M.pY+M.H,0)});
  return false;},
stop:function(){E.css('opacity',M.o);$().unbind('mousemove',J.drag).unbind('mouseup',J.stop);}
};
var J=$.jqDnR,M=J.dnr,E=J.e,
i=function(e,h,k){return e.each(function(){h=(h)?$(h,e):e;
 h.bind('mousedown',{e:e,k:k},function(v){var d=v.data,p={};E=d.e;
 // attempt utilization of dimensions plugin to fix IE issues
 if(E.css('position') != 'relative'){try{E.position(p);}catch(e){}}
 M={X:p.left||f('left')||0,Y:p.top||f('top')||0,W:f('width')||E[0].scrollWidth||0,H:f('height')||E[0].scrollHeight||0,pX:v.pageX,pY:v.pageY,k:d.k,o:E.css('opacity')};
 E.css({opacity:0.8});$().mousemove($.jqDnR.drag).mouseup($.jqDnR.stop);
 return false;
 });
});},
f=function(k){return parseInt(E.css(k))||false;};
})(jQuery);



config.shadowTiddlers.StyleSheetJQueryClassHacks = ".jqHandle{background:red;height:15px}.jqDrag{width:100%;cursor:move}.jqResize{width:15px;position:absolute;bottom:0;right:0;cursor:se-resize}.jqDnR{z-index:3;position:relative;width:180px;font-size:0.77em;color:#618d5e;margin:5px 10px 10px 10px;padding:8px;background-color:#EEE;border:1px solid#CCC}";
store.addNotification("StyleSheetJQueryClassHacks", refreshStyles);

config.macros.jquerytabs = {};
function makecollapsables(){
var collapsables = jQuery(".collapsable");

for(var i=0; i < collapsables.length; i++){
  var element = collapsables[i];
  if(!element.isCollapsable){
          var newplace=  document.createElement("div");
         jQuery(newplace).click(function(e){
                  if(!e) e = window.event;
                  var target  =jQuery(e.target);
                  var element = target.next().slideToggle();
                 });
          newplace.className = "toggler";
          element.parentNode.insertBefore(newplace,element);
          createTiddlyButton(newplace, "toggle", "toggle content", function(e){
                  if(!e) e = window.event;
          
                  var target  =jQuery(e.target);
                  var element = target.parent().next().slideToggle();
                 }
          );
          element.isCollapsable = true; 
          }

}
};

function  makeresizeables(){
        var els = jQuery(".resizable");
        for(var i=0; i < els.length; i++){
                var element = els[i];
                var newdiv = document.createElement("div");
                newdiv.className = "jqHandle jqResize";
                element.appendChild(newdiv);
                jQuery(element).jqResize('.jqResize');
        }
                
        
}
function makemoveables(){
        var els = jQuery(".moveable");
        for(var i=0; i < els.length; i++){
                var element = els[i];
                 jQuery(element).jqDrag(".handler");                      
        }    
        
};

function makejQueryTabs(){

var tabs = jQuery(".jQueryTabs");

        for(var i=0; i < tabs.length; i++){
                var element = tabs[i];
                if(!element.isTabs){
                        var newplace=  document.createElement("div");
                  
                          //get children
                  
                          var hideTabs = function(except){      
                                  var children = jQuery(".jQueryTab",element);
                                  for(var j= 0; j < children.length; j++){
                                         if(children[j] == except) jQuery(children[j]).css({display:""});
                                          else jQuery(children[j]).css({display:"none"});
                                  }
                          };
                          var children = jQuery(".jQueryTab",element);
                          for(var j= 0; j < children.length; j++){
                                  var child = children[j];
                                  if(!child.isTab){
                                          var tab = document.createElement("a");
                                          tab.className = "jQueryTabLink";
                                          var tabid  = i+"."+j;
                                          tab.tabID = tabid;
                                          var child = children[j];
                                          tab.appendChild(document.createTextNode(child.title));
                                          config.macros.jquerytabs[tabid] =  child;
                                          jQuery(tab).click(function(e){
                 
                                                   hideTabs(config.macros.jquerytabs[e.target.tabID]);
                                           });
                                           newplace.appendChild(tab);
                                           child.isTab = true;
                                   }
                          }
                          hideTabs(children[0]);
                          element.parentNode.insertBefore(newplace,element);
                        element.isTabs = true;
                }
        }
}
var oldrd = refreshDisplay;
var olddt = story.displayTiddler;
refreshDisplay=  function(hint){oldrd(hint); makecollapsables(); makemoveables(); makeresizeables();makejQueryTabs();};
story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID){
        olddt(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID);
        makecollapsables(); makemoveables(); makeresizeables();makejQueryTabs();
        }