/***
|''Name:''|filterTiddlersTestingPlugin|
|''Description:''|Plugin to test the core filterTiddlers method|
|''Author''|Jon Lister|
|''CodeRepository:''|n/a |
|''Version:''|0.1|
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

function filterTiddlersTesting() {
	testCaseTiddler:"test cases"
}

filterTiddlersTesting.getTestCases = function() {
	var tcSlices = store.calcAllSlices(testCaseTiddler);
	var testCases = [];
	for (var tc in tcSlices) {
		testCases.push({test:tc,expected:tcSlices[tc]});
	}
	return testCases;
};

filterTiddlersTesting.defineTest = function() {
	return function(testCase) {
		var testTiddlers = store.filterTiddlers(testCase.test);
		var testTiddlersString = "";
		for (var i=0; i<testTiddlers; i++) {
			testTiddlersString += testTiddlers[i].title;
		}
		var expectedTiddlers = testCase.expected.readBracketedList();
		var expectedTiddlersString = "";
		for(i=0; i<expectedTiddlers; i++) {
			expectedTiddlerString += expectedTiddlers[i].title;
		}
		if(testTiddlerString == expectedTiddlerString)
			return true;
		else
			return false;
	}
};

filterTiddlersTesting.run = function(place) {
	var test = filterTiddlersTesting.defineTest();
	var testCases = filterTiddlersTesting.getTestCases();
	var testResults = [];
	for(var testCase in testCases) {
		testResults.push(testCase.test);
		testResults.push(test(testCase).toString());
	}
	for(var i=0; i<testResults.length; i+2) {
		wikify(testResults[i]+":"+testResults[i+1],place);
	}
}


} //# end of 'install only once'
//}}}