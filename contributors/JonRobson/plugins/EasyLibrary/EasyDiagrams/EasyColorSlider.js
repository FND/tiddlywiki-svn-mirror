document.styleSheets['easyColorSlider'] = {cssText: ".easyColorSliderMixBox {border:solid 1px black;}"};

var EasyColorSlider = function(wrapper,width,height,changefunction){	
	wrapper.style.position = "absolute";
	if(!changefunction){
		changefunction = function(newcolor){
			alert(newcolor + "is the new color. Please define a change function to replace this default function.");
		}
		this.setChangeFunction(changefunction);
	}
	
	//wrapper.style.position = "absolute";
	var sliderheight = height / 3;
	
	this.sliders = {};
	this.bar = {};
	this.sliders.red = this._createSlider(wrapper,width,sliderheight,"red");
	this.sliders.green =this._createSlider(wrapper,width,sliderheight,"green");
	this.sliders.blue = this._createSlider(wrapper,width,sliderheight,"blue");
	this.sliders.width = width;
	
	this.mixbox =this._createMixBox(wrapper,height,height);
	this.mixbox.style.left = parseInt(width + 5) + "px";
	this.rgb= {'red':0,'green':0,'blue':0};
	
};

EasyColorSlider.prototype = {
	setChangeFunction:function(change){
		this.changefunction = change;
	}
	/* thank you http://www.javascripter.net/faq/hextorgb.htm*/
	,_cutHex: function(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
	,_hexToR:function(h){return parseInt((this._cutHex(h)).substring(0,2),16)}
	,_hexToG: function (h) {return parseInt((this._cutHex(h)).substring(2,4),16)}
	,_hexToB:function(h) {return parseInt((this._cutHex(h)).substring(4,6),16)}
	
	
	,setColor: function(rgb){
		if(rgb.indexOf("#") == 0 && rgb.indexOf(",") == -1){ //hex code argument
			var hexcode = rgb.substring(1);
			this.rgb.red = this._hexToR(hexcode);
			this.rgb.blue = this._hexToB(hexcode);
			this.rgb.green = this._hexToG(hexcode);
		}
		else if(rgb.indexOf("rgb(") == 0){ //rgb argument
			var rgbstring = rgb.substring(4,rgb.length - 1);
			rgbstring = rgbstring.split(",");
			this.rgb.red = rgbstring[0];
			this.rgb.green = rgbstring[1];
			this.rgb.blue = rgbstring[2];
			
		}
		else{
			return false;
		}
	
		var redleft = parseFloat(this.rgb.red /255) * parseInt(this.sliders.width);
		var greenleft =  parseFloat(this.rgb.green /255) * parseInt(this.sliders.width);
		var blueleft = parseFloat(this.rgb.blue /255) * parseInt(this.sliders.width);
		//console.log(this.sliders.width,redleft,greenleft,blueleft,this.rgb,rgb);
		this.bar.red.style.left =  redleft + "px";
		this.bar.green.style.left = greenleft + "px";
		this.bar.blue.style.left =  blueleft  + "px";
		this.mixColors();
		
	}
	,getColor: function(){
		this.mixColors();
		return this.currentColor;
	}
	,mixColors: function(){
		var rgb  = "rgb("+this.rgb.red+","+ this.rgb.green+","+this.rgb.blue+")";
		this.currentColor = rgb;
		this.mixbox.style.background = rgb;
		if(this.changefunction)this.changefunction(rgb);
	}
	,_createMixBox: function(wrapper,width,height){
		var s = document.createElement("div");
		s.className = "easyColorSliderMixBox";
		s.style.position = "absolute";
		s.style.width = width + "px";
		s.style.height = height + "px";	
		wrapper.appendChild(s);
		return s;
				
	}
	,_createSlider: function(wrapper,width,height,color){
		var slidebar = document.createElement("div");
		slidebar.style.position = "absolute";
		slidebar.style.height = parseInt(height/2) + "px";
		slidebar.style.width = "2px";
		slidebar.style.background = "black";
		slidebar.style.border = "solid 1px black";
		var s = document.createElement("div");
		//s.innerHTML = color;
		s.style.position = "absolute";
		s.style.width = width + "px";
		s.style.height = height + "px";	
		s.style.background = color;
		s.className = "easyColorSlider";
		var easycolorslider = this;
		s.onmousedown = function(e){
			var pos =EasyClickingUtils.getMouseFromEventRelativeToTarget(e,this);
			var newleft =pos.x + this.style.left;
			slidebar.style.left = newleft + "px";
			var percentage = (pos.x / width)
			easycolorslider.rgb[color] = parseInt(percentage * 255);		
			easycolorslider.mixColors();	
		}
		wrapper.appendChild(s);
		wrapper.appendChild(slidebar);
		
		var top = 0;
		if(color =='red'){
			top = "0px";
			slidebar.style.top = top;
			s.style.top = top;
			this.bar.red = slidebar;
		}
		else if(color =='blue'){
			top =height * 2;
			slidebar.style.top = top+"px";
			s.style.top = top+"px";
			this.bar.blue = slidebar;
		}
		else if(color = 'green'){
			top =height +"px";
			slidebar.style.top = top;
			s.style.top = top;
			this.bar.green = slidebar;
		}
		return s;
	}
	
};