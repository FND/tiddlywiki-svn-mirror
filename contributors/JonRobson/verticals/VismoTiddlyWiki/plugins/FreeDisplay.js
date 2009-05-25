store.addNotification("VismoStyleSheet", refreshStyles);
setStylesheet("",'freedisplay');
var lastclick = {x:0, y:0};
config.curZindex = 100;
story.beforedisplaytiddler = story.displayTiddler;
story.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,visualisationID)
{
        
        story.beforedisplaytiddler(srcElement,tiddler,template,animate,unused,customFields,toggle);
        
        jQuery("div").mousedown(function(e){      
                 if(e.target.className.indexOf('button')== -1)
                        lastclick = {x: e.pageX, y: e.pageY,right:false};  
                else{
                        lastclick = {x:0,y:0};
                }    

        });
        jQuery("a").mousedown(function(e){      
                 lastclick = {x: e.pageX, y: e.pageY,right:false};  
 
        });
        
        var el = document.getElementById('tiddler'+tiddler);
        config.curZindex +=1;
        if(el) el.style.zIndex = config.curZindex;
        
        jQuery(el).css({position:'absolute', top:lastclick.y+"px", left: lastclick.x+"px"});
        
        var myX = lastclick.x; 
        var maxX = jQuery("#sidebar").offset().top + jQuery("#sidebar").width();

        if(myX > maxX){
             jQuery(el).css({right: 720,left:null});   
        }

  
        
}

