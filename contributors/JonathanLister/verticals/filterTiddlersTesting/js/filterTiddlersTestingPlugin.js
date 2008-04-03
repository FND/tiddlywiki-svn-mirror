/***
|''Name:''|filterTiddlersTestingPlugin|
|''Description:''|Plugin to test the core filterTiddlers method|
|''Author''|Jon Lister|
|''CodeRepository:''|n/a |
|''Version:''|0.2|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''~CoreVersion:''|2.3|

!Pseudo-code:
{{{
filterTiddlersTesting.getTestCases:
	convert slices of [[test cases]] to array
filterTiddlersTesting.defineTest:
	assert that this is true
		filterTiddlers(testCase.test) == testCase.expected
filterTiddlersTesting.run:
	for testCase in testCases
		run test on testCase
}}}

***/

//{{{
if(!version.extensions.filterTiddlersTestingPlugin) {
version.extensions.filterTiddlersTestingPlugin = {installed:true};

filterTiddlersTesting = {
	testCaseTag:"testcase",
	testCaseTestLabel:"test",
	testCaseExpectedLabel:"expected"
};

filterTiddlersTesting.getTestCases = function() {
	var testCases = [];
	var testCaseTiddlers = store.getTaggedTiddlers(filterTiddlersTesting.testCaseTag);
	for (var i=0; i<testCaseTiddlers.length; i++) {
		var tcSlices = store.calcAllSlices(testCaseTiddlers[i].title);
		var tcSliceName = testCaseTiddlers[i].title;
		var tcSliceTest = tcSlices[filterTiddlersTesting.testCaseTestLabel];
		var tcSliceExpected = tcSlices[filterTiddlersTesting.testCaseExpectedLabel];
		testCases.push({name:tcSliceName,test:tcSliceTest,expected:tcSliceExpected});
	}
	return testCases;
};

filterTiddlersTesting.defineTest = function(place) {
	return function(testCase) {
		var testResults = [];
		var expectedTiddlers = [];
		var filteredTiddlers = store.filterTiddlers(testCase.test);
		for (var i=0; i<filteredTiddlers.length; i++) {
			testResults.push(filteredTiddlers[i].title);
		}
		// special case for wildcard filter
		if(testCase.test=="*") {
			store.forEachTiddler(function(title,tiddler){
				expectedTiddlers.pushUnique(tiddler.title);
			});
		} else {
			expectedTiddlers = testCase.expected.readBracketedList();
		}
		// if you're going to extend this to collect debug information, now's the time to do it
		if(testResults.toString() == expectedTiddlers.toString())
			return true;
		else {
			return false;
		}
	}
};

filterTiddlersTesting.run = function(place) {
	var test = filterTiddlersTesting.defineTest(place);
	var testCases = filterTiddlersTesting.getTestCases(filterTiddlersTesting.testCaseTag);
	var testResults = [];
	for(var i=0; i<testCases.length; i++) {
		var testResult = test(testCases[i]);
		testResults.push(testCases[i].name);
		testResults.push(testCases[i].test);
		testResults.push(testResult ? "pass" : "fail");
	}
	var output = "";
	for(i=0; i<testResults.length; i=i+3) {
		output += "|"+testResults[i]+": |"+testResults[i+1]+" |"+" ''"+testResults[i+2]+"'' |\n";
	}
	wikify(output,place);
}

config.macros.filterTiddlersTesting = {};

config.macros.filterTiddlersTesting.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	filterTiddlersTesting.run(place);
};


} //# end of 'install only once'
//}}}