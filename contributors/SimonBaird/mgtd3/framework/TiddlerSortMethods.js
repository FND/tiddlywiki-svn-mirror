
// for sorting tiddlers

merge(Tiddler.prototype,{

	sort_tickleDate: function() { return this.fields['mgtd_date']; }, // todo 

	sort_orderSlice: function() {
		var orderSlice = store.getTiddlerSlice(this.title,"order");
		return orderSlice ? orderSlice : this.title; // so if there's no slice we get sorting by title
	}

});
