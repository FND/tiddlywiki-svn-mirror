
merge(Date.prototype,{
	addDay:   function(n) { this.setDate(  this.getDate()      + n   ); },
	addWeek:  function(n) { this.setDate(  this.getDate()      + n*7 ); },
	addMonth: function(n) { this.setMonth( this.getMonth()     + n   ); },
	addYear:  function(n) { this.setYear(  this.getFullYear()  + n   ); }
});


