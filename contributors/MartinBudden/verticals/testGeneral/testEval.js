/***
|''Name:''|tesUtf|
|''Description:''|Test utf conversion|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals\test/testUtf.js |
|''Version:''|0.0.2|
|''Date:''|Mar 21, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2|

<<testMacro testEval>>
***/

//{{{
function testEval(params)
{
testLog('testEval');
	var ret = true;
	try {
testLog('a1');
		var v = restrictedEval("tiddler.title + 'xxx'");
testLog('a2');
		testLog(v);
testLog('a3');
	} catch (ex) {
		ret = false;
	}
	return ret;
}
//}}}
