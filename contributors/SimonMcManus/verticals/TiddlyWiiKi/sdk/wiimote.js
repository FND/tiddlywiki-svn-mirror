function Wiimote(){

	this.mousex = .5;
	this.mousey = .5;

	this.BUTTON_A = 13;
	this.BUTTON_B = 171;
	this.BUTTON_C = 201;
	this.BUTTON_Z = 200;
	this.BUTTON_1 = 172;
	this.BUTTON_2 = 173;
	this.BUTTON_MINUS = 170;
	this.BUTTON_PLUS = 174;
	this.BUTTON_LEFT = 178;
	this.BUTTON_UP = 175;
	this.BUTTON_RIGHT = 177;
	this.BUTTON_DOWN = 176;

	this.Status = {"b":false, "left":false, "up":false, "right":false, "down":false, "plus":false, "1":false, "a":false, "2":false, "minus":false, "c":false, "z":false};

	this.Present = false;
	if(window.opera)
		if(window.opera.wiiremote)
			this.Present = true;

	this.GetDistance = funcGetDistance;
	this.GetEnabled = funcGetEnabled;
	this.GetKeyStatus = funcGetKeyStatus;
	this.GetRoll = funcGetRoll;
	this.GetX = funcGetX;
	this.GetY = funcGetY;
	this.SetActive = funcSetActive;
	this.SetKeyPress = funcSetKeyPress;
	this.SetKeyRelease = funcSetKeyRelease;

	function funcSetActive(remote){
		this.Current = null;
		if(window.opera)
			if(window.opera.wiiremote)
				this.Current = opera.wiiremote.update(Math.floor(remote)%4);
	}
	function funcSetKeyPress(key){
		switch(key){
			case this.BUTTON_1:     this.Status["1"] = true;     break;
			case this.BUTTON_2:     this.Status["2"] = true;     break;
			case this.BUTTON_A:     this.Status["a"] = true;     break;
			case this.BUTTON_B:     this.Status["b"] = true;     break;
			case this.BUTTON_MINUS: this.Status["minus"] = true; break;
			case this.BUTTON_PLUS:  this.Status["plus"] = true;  break;
			case this.BUTTON_LEFT:  this.Status["left"] = true;  break;
			case this.BUTTON_UP:    this.Status["up"] = true;    break;
			case this.BUTTON_RIGHT: this.Status["right"] = true; break;
			case this.BUTTON_DOWN:  this.Status["down"] = true;  break;
		}
	}
	function funcSetKeyRelease(key){
		switch(key){
			case this.BUTTON_1:     this.Status["1"] = false;     break;
			case this.BUTTON_2:     this.Status["2"] = false;     break;
			case this.BUTTON_A:     this.Status["a"] = false;     break;
			case this.BUTTON_B:     this.Status["b"] = false;     break;
			case this.BUTTON_MINUS: this.Status["minus"] = false; break;
			case this.BUTTON_PLUS:  this.Status["plus"] = false;  break;
			case this.BUTTON_LEFT:  this.Status["left"] = false;  break;
			case this.BUTTON_UP:    this.Status["up"] = false;    break;
			case this.BUTTON_RIGHT: this.Status["right"] = false; break;
			case this.BUTTON_DOWN:  this.Status["down"] = false;  break;
		}
	}
	function funcGetKeyStatus(key){
		if(this.Current.isBrowsing){
			switch(key){
				case this.BUTTON_1:     return this.Status["1"];    break;
				case this.BUTTON_2:     return this.Status["2"];    break;
				case this.BUTTON_A:     return this.Status["a"];    break;
				case this.BUTTON_B:     return this.Status["b"];    break;
				case this.BUTTON_MINUS: return this.Status["minus"];break;
				case this.BUTTON_PLUS:  return this.Status["plus"]; break;
				case this.BUTTON_LEFT:  return this.Status["left"]; break;
				case this.BUTTON_UP:    return this.Status["up"];   break;
				case this.BUTTON_RIGHT: return this.Status["right"];break;
				case this.BUTTON_DOWN:  return this.Status["down"]; break;
				case this.BUTTON_C:     return this.Status["c"];    break;
				case this.BUTTON_Z:     return this.Status["z"];    break;
			}
		}else{
			hold = this.Current.hold;
			switch(key){
				case this.BUTTON_1:     return hold & 512;  break;
				case this.BUTTON_2:     return hold & 256;  break;
				case this.BUTTON_A:     return hold & 2048; break;
				case this.BUTTON_B:     return hold & 1024; break;
				case this.BUTTON_MINUS: return hold & 4096; break;
				case this.BUTTON_PLUS:  return hold & 16;   break;
				case this.BUTTON_LEFT:  return hold & 1;    break;
				case this.BUTTON_UP:    return hold & 8;    break;
				case this.BUTTON_RIGHT: return hold & 2;    break;
				case this.BUTTON_DOWN:  return hold & 4;    break;
				case this.BUTTON_C:     return hold & 16384;break;
				case this.BUTTON_Z:     return hold & 8192; break;
			}
		}
	}
	function funcGetX(){
		return this.Current.dpdScreenX?this.Current.dpdScreenX:0;
	}
	function funcGetY(){
		return this.Current.dpdScreenY?this.Current.dpdScreenY:0;
	}
	function funcGetDistance(){
		return this.Current.dpdDistance?this.Current.dpdDistance:0;
	}
	function funcGetEnabled(){
		if(this.Current)
			return this.Current.isEnabled;
		else
			return false;
	}
	function funcGetRoll(){
		return this.Current.dpdRollY?Math.atan2(this.Current.dpdRollY, this.Current.dpdRollX)*180/Math.PI:0;
	}
}
Wiimote = new Wiimote();

document.onkeydown = function(e){ Wiimote.SetKeyPress(e.keyCode); }
document.onkeyup = function(e){ Wiimote.SetKeyRelease(e.keyCode); }