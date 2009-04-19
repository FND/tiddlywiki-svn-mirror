var VismoGraphNode = function(json){
	/*recognised/reserved properties are:
	fill, label, position,shape,width,height
	*/

	var id = json.id;
	var properties = json.properties;
	this.id = id;		
	properties = this.completeProperties(properties);
	
	var pos = properties.position;
	var x = pos.x;
	var y = pos.y;
	var w = properties.width / 2;
	var h = properties.height /2;
	
	this.properties = properties;
	return false;
};

VismoGraphNode.prototype = {
        getID: function(){
                return this.id;
        }
	,setDimensions: function(width,height){
		this.setProperty("width",width);
		this.setProperty("height",height);
		var p = this.getPosition();
		this.setPosition(p.x,p.y);
	}
	,burntojson: function(){
		var json = {};
		json.id = this.id;
		json.properties = this.properties;
		var i;
		for(i in json.properties){
			if(i.indexOf("_") == 0){
				delete json.properties[i];
			}
		}
		return json;
	}
	,completeProperties: function(properties){
		if(!properties){
			properties = {};
		}
		if(!properties.width) properties.width = 100;
		if(!properties.height) properties.height = 30;
		if(!properties.shape)properties.shape = "polygon";
		if(!properties.id) properties.id= this.id;
		if(!properties.fill) properties.fill = "#ff0000";
		if(!properties.position) properties.position = {x:0,y:0};
		
		return properties;
	}
	,getVismoShape: function(){
		return this.vismoShape;
	}
	,getProperty: function(name){
		return this.properties[name];
	}
	,getProperties: function(){
	        return this.properties;
	}
	,setProperty: function(name,value){
		this.properties[name] =value;
	}
	,getPosition: function(){
		return this.getProperty("position");
	}
	,setPosition: function(x,y){
		this.setProperty("position",{x:x,y:y});
	}
};
