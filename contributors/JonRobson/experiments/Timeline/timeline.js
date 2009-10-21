/* css classes per time span
use t1 
*/
var CSSTimeline = function(place,options){
    var place = jQuery(place);
    this.holder = place;
    this.options = options;
    if(!this.options.unitWidth)this.options.unitWidth = 20;
    this.doTimeAxis(options.range);
    var def = options.definition;
    jQuery(place).append("<div class='nowPoint'></div><div class='timelineContainer' style='position:relative;'></div>");

    this.place = jQuery(".timelineContainer",place);

    this.arrow_head_width = this.arrow_height /2;
    var ahw = this.arrow_head_width;
    this.arrow_tail_margintop = ahw/2;
    this.arrow_tail_height = ahw ;
    for(var i=0; i < def.length; i++){
        this.line(def[i]);
    }
    
    jQuery(".arrow",this.place).css({position:"absolute"});
    
    jQuery(".arrow_head").css({"border-width":ahw+"px 0px "+ahw+"px "+ahw+"px"})
    jQuery(".arrow_tail").css({"height":this.arrow_tail_height,"margin-top": this.arrow_tail_margintop});
    jQuery(".clear_arrow").css({height:50});
    jQuery(".nowPoint").css({left:this.date_to_pixel(options.now)});
    
    var that = this;
    var scrollHandler= function(e){
        var sx = e.currentTarget.scrollLeft;
        jQuery(".timeSpanner").css({left:-sx});
        var newleft = that.date_to_pixel(options.now) - sx;
        jQuery(".nowPoint").css({left:newleft});
    };
    jQuery(".timelineContainer").scroll(scrollHandler);
};
CSSTimeline.prototype = {
    arrow_height: 30,
    _range:{}
    ,unit_to_label: function(i){
        return i;
    }
    ,label_to_unit: function(){
        
    }
    ,doTimeAxis: function(range){
        
        var start,end;
        var defs = this.options.definition;
        for(var i=0 ; i <defs.length;i++){
            var def = defs[i];
            var j = 0;
   
            while(def["t"+j] || (j < 2)){
                var t = def["t"+j];
              
                if(!start){
                    start = t;
                }
                else if(t < start){
                    start = t;
                }
                if(!end){
                    end = t;
                }
                else if(t > end){
                    end = t;
                }
                j+=1;
            }
        }
        this._range = {start:start,end:end};
  
        if(range){
            this._range.start = range[0];
            if(range[1]) this._range.end = range[1];
        }
        
        /*this._range.start = range[0];
        if(range[1]){
            this._range.end= range[1];
       }
       else {
           var def = this.options.definition;
           for(var i=0; i < def.length; i++){
                var endpoint = parseInt(def[i].delivery);
                var impact =def[i].impact;
                if(!this._range.end) {
                    if(impact){
                        this._range.end = impact;
                    }
                    else{
                        this._range.end = endpoint;
                    }
                }
                else if(impact > this._range.end){
                    this._range.end = impact;
                }
                else if(endpoint > this._range.end){
                    
                    this._range.end = endpoint;
                }
            }
       }
       this._range.start = parseInt(this._range.start);
       this._range.end = parseInt(this._range.end);*/
   
        this.perunit = this.options.unitWidth;
        jQuery(this.holder).prepend("<div class='timeSpanner'></div><div class='clear_arrow'></div>");
        
        var w = jQuery(".timSpanner",this.holder).width();
        //console.log(this._range);
        for(var u = this._range.start; u < this._range.end; u++){
            var label = this.unit_to_label(u);
            jQuery(".timeSpanner",this.holder).append("<div class='unit'>"+label+"</div>");
        }
        
        jQuery(".unit").css({"width":this.perunit-1});
    }
    ,date_to_pixel: function(time){
        return (parseInt(time) - parseInt(this._range.start)) * this.perunit;
    }
    ,make_arrow: function(start,end,properties){
        console.log("from",start,end,this.arrow_head_width);

              
        start = this.date_to_pixel(start);
        end = this.date_to_pixel(end);
        console.log("   ",start,end,this.perunit);
        var arrow_tail_width = (end-start) - this.arrow_head_width;
        var arrow_head_start = arrow_tail_width;
        if(arrow_tail_width < 0){
            arrow_tail_width = 0;
        }

        jQuery(this.place).append("<div class='arrow'><div class='arrow_tail'>"+properties.label+"</div><div class='arrow_head'></div></div>");
        
        var arrowheads =jQuery(".arrow_head",this.place);
        var arrows = jQuery(".arrow",this.place);
        
        var this_arrowhead =jQuery(arrowheads[arrowheads.length-1]); 
        var this_arrow = jQuery(arrows[arrows.length-1]);

        
        this_arrowhead.css({left:arrow_head_start,top:-this.arrow_height*3/4});
        //console.log(properties.label,start,end,arrow_tail_width,this.arrow_tail_height);
        this_arrow.css({left:start,width:arrow_tail_width});
        
        jQuery(this_arrowhead).click(function(e){options.click(e,properties);});
        jQuery(this_arrowhead).mousemove(function(e){options.move(e,properties);});
        jQuery(this_arrow).mousemove(function(e){options.move(e,properties);});
        
    }
    ,line: function(properties){
        var fullwidth = Math.random() * 500;
        var t = 1;
        var start_t=false;
        while(properties["t"+t] || (t < 2)){
            var end_t = properties["t"+(t+1)];
            
            if(!start_t) {
                start_t =properties["t"+t];
                
                
            }
            if(start_t && end_t){
                //console.log("make arrow from ", t,"to",t+1);
                //console.log("make arrow from",start_t,end_t,t)
      
                    this.make_arrow(start_t,end_t,properties);
            }
            else{
                //console.log("nothing to make from t",(t-1),t);
            }
            start_t = end_t;
            
            t += 1;
            //console.log("t now",t)
        }
        //console.log("exit loop");
     

        jQuery(this.place).append("<div class='clear_arrow'></div>");
    }
    
};