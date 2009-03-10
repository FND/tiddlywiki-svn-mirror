var library = {examples:{},rules:{},geojsons:{},data:{}};
library.rules = {
	councilRule: function(p,params){
		var r=0,g=0,b=0,rgb;
		var data =library.data.councilTax[p.name];
		var year = params[0];
		if(data && data[year] && data[year].length > 0){
			var price = data[year][1];
			var lower = 500;
			var upper = 1000;
			var rel = (price-lower)/(upper -lower);
			
			r = parseInt((rel * 255));
			b = parseInt(((1-rel) * 255));
		}
		else{
			r = 125; g=125;b =125;
		}
		
		
		rgb = "rgb("+r+","+g+"," + b+")";
		return rgb;
		
	}
	,random: function(p,params){
		var rgb,r,g,b;
		r =parseInt(Math.random() * 255);
		g =parseInt(Math.random() * 255);
		b =parseInt(Math.random() * 255);	
		rgb = "rgb("+r+","+g+"," + b+")";
		return rgb;

	}
	,mono: function(p,params){
		return params;

	}
	,fieldenumerator: function(properties,params){
		var param = eval("("+params+")");
		var select = param.color;
		if(properties[select]){
			var value = properties[select];
			var choices = param.enumerator;
			
			if(choices[value]){
				return choices[value];
			}
		}
		return false;
	}
};