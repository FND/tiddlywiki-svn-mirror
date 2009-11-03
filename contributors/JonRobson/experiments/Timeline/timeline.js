/* css classes per time span
use t1 
*/
var TimeLineUtils = {
    YYMMDD_toDay: function(){
        
    }
    ,dayinyear: function(day,leapyear){
        var dayofyear = parseInt(day);
        var days_in_months = [31,28,31,30,31,30,31,31,30,31,31,31];
        if(leapyear) days_in_months[1] = 29;
        //console.log("work out",day);
        
        for(var i=0; i < days_in_months.length;i++){
            var days_in_month= days_in_months[i];
            //console.log("in month",i);
            //console.log("Daysinmonth",days_in_month);
            if(dayofyear >=0){
                dayofyear -= days_in_month;
            }
            else {
                //console.log("below 0",dayofyear,days_in_month);
                var date = dayofyear +1+days_in_month;
                return dayofyear+days_in_months[i-1] +1;
            }
        }
        return dayofyear+days_in_months[i-1] +1;
      
    },
    monthinyear: function(day){
        var days_in_months = [31,28,31,30,31,30,31,31,30,31,31,31];
        var month = 0;
        var d = TimeLineUtils.dayinyear(day);
        for(var i=0; i < days_in_months.length;i++){
            day -= days_in_months[i];
            if(day < 0) return month;
            month +=1;
        }
        return month;
    }
};
var MONTHAXIS =function(day){
    var m = TimeLineUtils.monthinyear(day);
    var d = TimeLineUtils.dayinyear(day);
    
    var months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
    var mid =m%12;
     
    if(d==1)return months[mid];
    else return "&nbsp;";
};
var QUARTERAXIS =function(day){
    var d = TimeLineUtils.dayinyear(day);
    var m = TimeLineUtils.monthinyear(day);
    var quarters = ["Q1","Q2","Q3","Q4"];
    var q;
    if(d !=1) return "&nbsp;";
    else if(m ==3) q = 0;
    else if(m==6)q=1;
    else if(m==9)q=2;
    else if(m==0)q=3;
    else return "&nbsp;";
    
    return quarters[q];
    
};
var DAYAXIS= function(i){
    var date= TimeLineUtils.dayinyear(i);
    if(date%3 == 0) return date;
    else return "!";
};

var CSSTimeline = function(place,options){
    var place = jQuery(place);
    this.holder = place;
    this.options = options;
    if(!this.options.unitWidth)this.options.unitWidth = 5;
    //this.doAxis(options.range,DAYAXIS);
    this.doAxis(options.range,MONTHAXIS);
    this.doAxis(options.range,QUARTERAXIS);
    
    
    var def = options.definition;
    jQuery(place).append("<div class='nowPoint'></div><div class='timelineContainer' style='position:relative;'></div>");

    this.place = jQuery(".timelineContainer",place);

    this.arrow_head_width = this.arrow_height /2;
    var ahw = this.arrow_head_width;
    this.arrow_tail_margintop = ahw/2;
    this.arrow_tail_height = ahw ;
    for(var i=0; i < def.length; i++){
        var d = def[i];
        jQuery(this.place).append("<h1>"+d.heading+"</h1>");
        var arrows = d.arrows;
        for(var j=0; j < arrows.length;j++){
            this.line(arrows[j]);
        }
    }
    
    jQuery(".arrow",this.place).css({position:"absolute"});
    
    jQuery(".arrow_head").css({"border-width":ahw+"px 0px "+ahw+"px "+ahw+"px"})
    jQuery(".arrow_tail").css({"height":this.arrow_tail_height,"margin-top": this.arrow_tail_margintop});
    jQuery(".clear_arrow").css({height:50});
    jQuery(".nowPoint").css({left:this.date_to_pixel(options.now)-1});
    
    var that = this;
    var scrollHandler= function(e){
        var sx = e.currentTarget.scrollLeft;
        jQuery(".axis").css({left:-sx});
        var newleft = that.date_to_pixel(options.now) - sx;
        jQuery(".nowPoint").css({left:newleft});
    };
    jQuery(".timelineContainer").scroll(scrollHandler);
};
CSSTimeline.prototype = {
    arrow_height: 30,
    _range:{}

    ,label_to_unit: function(){
        
    }
    ,doAxis: function(range,unit_to_label){
        if(!this.axisID) this.axisID = 0;
        this.axisID +=1;
        var start,end;
        var defs = this.options.definition;
        for(var i=0 ; i <defs.length;i++){
            var def = defs[i];
            for(var k=0; k < def.arrows.length;k++){
                var arrow = def.arrows[k];
                var j = 0;

                while(arrow["t"+j] || (j < 2)){
                    var t = arrow["t"+j];

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

        }
        this._range = {start:start,end:end};
  
        if(range){
            this._range.start = range[0];
            if(range[1]) this._range.end = range[1];
        }
   
        this.perunit = this.options.unitWidth;
        jQuery(this.holder).prepend("<div class='axis axis"+this.axisID+"'></div><div class='clear_arrow'></div>");
        var axis = jQuery(".axis",this.holder);
        var axi = axis[0];
        var w = jQuery(".axis",this.holder).width();
        //console.log(this._range);
        for(var u = this._range.start; u < this._range.end; u++){
            var label = unit_to_label(u);
            jQuery(axi).append("<div class='unit'>"+label+"</div>");
        }
        
        jQuery(".unit").css({"width":this.perunit-1});
    }
    ,date_to_pixel: function(time){
        return (parseInt(time) - parseInt(this._range.start)) * this.perunit;
    }
    ,make_arrow: function(start,end,properties){
        //console.log("from",start,end,this.arrow_head_width);

              
        start = this.date_to_pixel(start);
        end = this.date_to_pixel(end);
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
        return this_arrow;
        
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
      
                    var arrow = this.make_arrow(start_t,end_t,properties);
                    var arrowColor;
                    if(properties.arrowColor){
                        arrowColor = properties.arrowColor;
                    }
                    else{
                        arrowColor = this.options.arrowColor;
                    }
                    if(arrowColor){
                        var color = arrowColor["t"+t];
                        if(typeof(arrowColor) == 'string'){
                            color = arrowColor;
                        }
                        
                        if(color){
                            jQuery(".arrow_tail",arrow).css({"background-color":color});
                            jQuery(".arrow_head",arrow).css({"border-color":"white white white "+color});
                        }
                    }
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