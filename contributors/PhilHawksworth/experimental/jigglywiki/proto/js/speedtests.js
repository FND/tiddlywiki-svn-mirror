
jigglywiki.stopwatch = {};
jigglywiki.stopwatch.elapsed = 0;
jigglywiki.stopwatch.starttime = null;
jigglywiki.stopwatch.stopttime = null;

jigglywiki.stopwatch.start = function() {
	jigglywiki.stopwatch.starttime = new Date();
};

jigglywiki.stopwatch.stop = function() {
	jigglywiki.stopwatch.stoptime = new Date();
	jigglywiki.stopwatch.elapsed =  jigglywiki.stopwatch.stoptime - jigglywiki.stopwatch.starttime + " ms";
};

jigglywiki.stopwatch.time = function() {
	return jigglywiki.stopwatch.elapsed;
};


function test_getAllTiddlers() {
	jigglywiki.stopwatch.start();
	var ts = getAllTiddlers('store');
	jigglywiki.stopwatch.stop();
	console.log('getAllTiddlers - Found ' + ts.length + " tiddlers in the store in " + jigglywiki.stopwatch.time());
}


function test_getTiddlersByTag() {
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByTag('foo', 'store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByTag - Found ' + ts.length + " tiddlers tagged with \'foo\' in " + jigglywiki.stopwatch.time());
	
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByTag('help', 'store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByTag - Found ' + ts.length + " tiddlers tagged with \'help\' in " + jigglywiki.stopwatch.time());
}


function test_getTiddlersByModifier() {
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByModifier('PhilHawksworth','store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByModifier- Found ' + ts.length + " tiddlers in the store modified by PhilHawksworth in " + jigglywiki.stopwatch.time());
	
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByModifier('AnnOther','store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByModifier - Found ' + ts.length + " tiddlers in the store modified by AnnOther in " + jigglywiki.stopwatch.time());
}


function test_getTiddlersByText() {
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByText('you should still be able to use tiddlerlinks','store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByText - Found ' + ts.length + " tiddlers in the store which contained \'you should still be able to use tiddlerlinks\' in " + jigglywiki.stopwatch.time());
	
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByText('Lorem','store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByText - Found ' + ts.length + " tiddlers in the store which contained \'Lorem\' in " + jigglywiki.stopwatch.time());
}


function test_getTiddlersByField() {
	jigglywiki.stopwatch.start();
	var ts = getTiddlersByField('modifier','BillyBob','store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByField - Found ' + ts.length + " tiddlers in the store modified by BillyBob in " + jigglywiki.stopwatch.time());

	jigglywiki.stopwatch.start();
	var ts = getTiddlersByField('modifier','JimboJones','store');
	jigglywiki.stopwatch.stop();
	console.log('getTiddlersByField - Found ' + ts.length + " tiddlers in the store modified by JimboJones in " + jigglywiki.stopwatch.time());

}



function runSpeedTests() {
	test_getAllTiddlers();
	test_getTiddlersByTag();
	test_getTiddlersByModifier();
	test_getTiddlersByText();
	test_getTiddlersByField();
	
}

