
jw.stopwatch = {};
jw.stopwatch.elapsed = 0;
jw.stopwatch.starttime = null;
jw.stopwatch.stopttime = null;

jw.stopwatch.start = function() {
	jw.stopwatch.starttime = new Date();
};

jw.stopwatch.stop = function() {
	jw.stopwatch.stoptime = new Date();
	jw.stopwatch.elapsed =  jw.stopwatch.stoptime - jw.stopwatch.starttime + " ms";
};

jw.stopwatch.time = function() {
	return jw.stopwatch.elapsed;
};


function test_getAllTiddlers() {
	jw.stopwatch.start();
	var ts = jw.getAllTiddlers('store');
	jw.stopwatch.stop();
	console.log('jw.getAllTiddlers - Found ' + ts.length + " tiddlers in the store in " + jw.stopwatch.time());
}


function test_getTiddlersByTag() {
	jw.stopwatch.start();
	var ts = jw.getTiddlersByTag('foo', 'store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByTag - Found ' + ts.length + " tiddlers tagged with \'foo\' in " + jw.stopwatch.time());
	
	jw.stopwatch.start();
	var ts = jw.getTiddlersByTag('help', 'store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByTag - Found ' + ts.length + " tiddlers tagged with \'help\' in " + jw.stopwatch.time());
}


function test_getTiddlersByModifier() {
	jw.stopwatch.start();
	var ts = jw.getTiddlersByModifier('PhilHawksworth','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByModifier- Found ' + ts.length + " tiddlers in the store modified by PhilHawksworth in " + jw.stopwatch.time());
	
	jw.stopwatch.start();
	var ts = jw.getTiddlersByModifier('AnnOther','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByModifier - Found ' + ts.length + " tiddlers in the store modified by AnnOther in " + jw.stopwatch.time());
}


function test_getTiddlersByText() {
	jw.stopwatch.start();
	var ts = jw.getTiddlersByText('you should still be able to use tiddlerlinks','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByText - Found ' + ts.length + " tiddlers in the store which contained \'you should still be able to use tiddlerlinks\' in " + jw.stopwatch.time());
	
	jw.stopwatch.start();
	var ts = jw.getTiddlersByText('Lorem','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByText - Found ' + ts.length + " tiddlers in the store which contained \'Lorem\' in " + jw.stopwatch.time());
}


function test_getTiddlersByField() {
	jw.stopwatch.start();
	var ts = jw.getTiddlersByField('modifier','BillyBob','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByField - Found ' + ts.length + " tiddlers in the store modified by BillyBob in " + jw.stopwatch.time());

	jw.stopwatch.start();
	var ts = jw.getTiddlersByField('modifier','JimboJones','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlersByField - Found ' + ts.length + " tiddlers in the store modified by JimboJones in " + jw.stopwatch.time());

}


function test_getTiddlerData() {
	jw.stopwatch.start();
	var ts = jw.getTiddlerData('PhilHawksworth','store');
	jw.stopwatch.stop();
	console.log('jw.getTiddlerData - Got data for PhilHawksworth tiddler in ' + jw.stopwatch.time());


}





function runSpeedTests() {
	test_getAllTiddlers();
	test_getTiddlersByTag();
	test_getTiddlersByModifier();
	test_getTiddlersByText();
	test_getTiddlersByField();
	test_getTiddlerData();
	
}

