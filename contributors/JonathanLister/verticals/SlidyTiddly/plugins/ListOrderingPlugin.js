ListOrdering = {
	init : function(place,list,cb){
		var ol = createTiddlyElement(place,'ol');
		for (var i=0; i<list.length; i++){
			var child = createTiddlyElement(ol,'li',null,null,null,{'tiddler':list[i]});
			wikify(list[i],child);
			this.initDrag(child,cb);
		}
	},
	
	initDrag : function (child,cb){
		Drag.init(child,null,0,0,null,null);
		child.style.cursor="move";
		child.title="drag to re-arrange";
		child.style.position="relative";
		child.onDrag = function(x,y,myElem) {
			if (this.style.position!="relative"){
	            this.savedstyle=this.style.position; this.style.position="relative";
	        }
	        y = myElem.offsetTop;
	        var next = myElem.nextSibling;
	        var prev = myElem.previousSibling;
	        if (next && y + myElem.offsetHeight > next.offsetTop + next.offsetHeight/2) {
	        myElem.parentNode.removeChild(myElem);
	        next.parentNode.insertBefore(myElem, next.nextSibling);//elems[pos+1]);
	        myElem.style["top"] = -next.offsetHeight/2+"px";
	        }
	        if (prev && y < prev.offsetTop + prev.offsetHeight/2) {
	            myElem.parentNode.removeChild(myElem);
	            prev.parentNode.insertBefore(myElem, prev);
	            myElem.style["top"] = prev.offsetHeight/2+"px";
	        }
	    };
	    child.onDragEnd = function(x,y,myElem) {
	        myElem.style["top"] = "0px"; if (this.savedstyle!=undefined)
	            this.style.position=this.savedstyle;
	        var parent = child.parentNode;
	        var lis = parent.getElementsByTagName('li');
	        var newlist = [];
	        for (var i=0;i<lis.length;i++){
	             newlist.push(lis[i].getAttribute('tiddler'));
	        }
	        if (cb && typeof cb == 'function'){
	             cb(newlist);	   	
	        }
	    };
	}
};

config.macros.reorderTiddlerList = {
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		if(params && params[0]) {
			createTiddlyElement(place,"span");
			span.setAttribute("refresh","tiddler");
			span.setAttribute("tiddler",params[0]);
			var list = store.getTiddlerText(params[0]).split('\n');
			ListOrdering.init(place,list,function(newlist){config.macros.reorderTiddlerList.cb(newlist,params[0]);});
		} else {
			return;
		}
	},
	
	cb : function(newlist,tiddler){
		store.setValue(tiddler,'text',newlist.join('\n'));
	}
};
