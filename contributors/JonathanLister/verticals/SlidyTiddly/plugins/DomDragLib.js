//{{{
/**************************************************
 * dom-drag.js
 * 09.25.2001
 * www.youngpup.net
 **************************************************
 * 10.28.2001 - fixed minor bug where events
 * sometimes fired off the handle, not the root.
 **************************************************/

window.Drag = {
	obj:null,

	init:
	function(o, oRoot, minX, maxX, minY, maxY) {
		o.onmousedown = Drag.start;
		o.root = oRoot && oRoot != null ? oRoot : o ;
		if (isNaN(parseInt(o.root.style.left))) o.root.style.left="0px";
		if (isNaN(parseInt(o.root.style.top))) o.root.style.top="0px";
		o.minX = typeof minX != 'undefined' ? minX : null;
		o.minY = typeof minY != 'undefined' ? minY : null;
		o.maxX = typeof maxX != 'undefined' ? maxX : null;
		o.maxY = typeof maxY != 'undefined' ? maxY : null;
		o.root.onDragStart = new Function();
		o.root.onDragEnd = new Function();
		o.root.onDrag = new Function();
	},

	start:
	function(e) {
		var o = Drag.obj = this;
		e = Drag.fixE(e);
		var y = parseInt(o.root.style.top);
		var x = parseInt(o.root.style.left);
		o.root.onDragStart(x, y, Drag.obj.root);
		o.lastMouseX = e.clientX;
		o.lastMouseY = e.clientY;
		if (o.minX != null) o.minMouseX = e.clientX - x + o.minX;
		if (o.maxX != null) o.maxMouseX = o.minMouseX + o.maxX - o.minX;
		if (o.minY != null) o.minMouseY = e.clientY - y + o.minY;
		if (o.maxY != null) o.maxMouseY = o.minMouseY + o.maxY - o.minY;
		document.onmousemove = Drag.drag;
		document.onmouseup = Drag.end;
		Drag.obj.root.style["z-index"] = "10";
		return false;
	},

	drag:
	function(e) {
		e = Drag.fixE(e);
		var o = Drag.obj;
		var ey = e.clientY;
		var ex = e.clientX;
		var y = parseInt(o.root.style.top);
		var x = parseInt(o.root.style.left);
		var nx, ny;
		if (o.minX != null) ex = Math.max(ex, o.minMouseX);
		if (o.maxX != null) ex = Math.min(ex, o.maxMouseX);
		if (o.minY != null) ey = Math.max(ey, o.minMouseY);
		if (o.maxY != null) ey = Math.min(ey, o.maxMouseY);
		nx = x + (ex - o.lastMouseX);
		ny = y + (ey - o.lastMouseY);
		Drag.obj.root.style["left"] = nx + "px";
		Drag.obj.root.style["top"] = ny + "px";
		Drag.obj.lastMouseX = ex;
		Drag.obj.lastMouseY = ey;
		Drag.obj.root.onDrag(nx, ny, Drag.obj.root);
		return false;
	},

	end:
	function() {
		document.onmousemove = null;
		document.onmouseup = null;
		Drag.obj.root.style["z-index"] = "0";
		Drag.obj.root.onDragEnd(parseInt(Drag.obj.root.style["left"]), parseInt(Drag.obj.root.style["top"]), Drag.obj.root);
		Drag.obj = null;
	},

	fixE:
	function(e) {
		if (typeof e == 'undefined') e = window.event;
		if (typeof e.layerX == 'undefined') e.layerX = e.offsetX;
		if (typeof e.layerY == 'undefined') e.layerY = e.offsetY;
		return e;
	}
};
//}}}