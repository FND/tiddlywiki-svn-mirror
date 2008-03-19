{{{
/*** 16/10 - Patch not accepted, being revised ***/

ListView.getCommandHandler = function(callback,name,allowEmptySelection)
{	
	return function(e) {
		var that = this;
		var view = findRelated(this,"TABLE",null,"previousSibling");
		var tiddlers = [];
		ListView.forEachSelector(view,function(e,rowName) {
					if(e.checked)
						tiddlers.push(rowName);
					});
		if(tiddlers.length == 0 && !allowEmptySelection) {
			alert(config.messages.nothingSelected);
		} else {
			if(this.nodeName.toLowerCase() == "select") {
				callback.call(that,view,this.value,tiddlers);
				this.selectedIndex = 0;
			} else {
				callback.call(that,view,name,tiddlers);
			}
		}
		return false;
	};
};

/*** 16/10 - Patch not submitted yet ***/

// Returns the number of days since the Date
Date.prototype.relativeDays = function() {
	var now = new Date();
	var interval = now.getTime() - this.getTime();
	interval = Math.floor(interval / (1000 * 60 * 60 * 24));
	return interval;
};
}}}