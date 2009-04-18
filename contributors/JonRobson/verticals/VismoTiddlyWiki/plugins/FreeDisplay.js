setStylesheet("",'freedisplay');
var globalZindex = 300;
var lastclick = {x:0, y:0};
story.beforedisplaytiddler = story.displayTiddler;
story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID)
{
        
        story.beforedisplaytiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);
        
        jQuery("div").mousedown(function(e){      
                 if(e.target.className.indexOf('button')== -1)
                        lastclick = {x: e.pageX, y: e.pageY};  
                else{
                        lastclick = {x:0,y:0};
                }    
        });
        jQuery("a").mousedown(function(e){      
                 lastclick = {x: e.pageX, y: e.pageY};      
        });
        
        var el = document.getElementById('tiddler'+tiddler);

        if(el) el.style.zIndex = globalZindex;
        jQuery(el).css({position:'absolute', top:lastclick.y+"px", left: lastclick.x+"px"});
        globalZindex +=1;
        
}

