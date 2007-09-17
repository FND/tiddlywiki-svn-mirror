
// for sorting tiddlers

merge(Tiddler.prototype,{

	sort_tickleDate: function() { return this.modified; }, // todo 

	sort_orderSlice: function() { return store.getTiddlerSlice(this.title,"order"); }

});
