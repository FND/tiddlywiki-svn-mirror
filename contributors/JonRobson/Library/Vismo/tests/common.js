config.extensions.VismoMocks= {
    div: function(){
        jQuery("#mockArea").append("<div style='width:200;height:200'></div>");
        var kids = jQuery("#mockArea").children();
        return kids[kids.length-1];
    },
    transformation: function(){
        return {scale:{x:1,y:1},translate:{x:0,y:0},origin:{x:100,y:100}};
    }
    ,canvas: function(options){
        var el = this.div();
        var cc = new VismoCanvas(el,options);
        return cc;
    },
    vector: function(shape,dom){
        if(!shape)shape= new VismoShape({coordinates:[0,0,0,100,100,100,100,0],fill:originalFill});
        if(!dom) dom = config.extensions.VismoMocks.div();
        var vector = new VismoVector(shape,dom);
        return vector;
    }
};

jQuery("body").append("<div id='mockArea' style='display:none;'></div>");