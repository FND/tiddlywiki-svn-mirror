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

<<testMacro testUtf>>
***/

//{{{
function testUtf(params)
{
testLog('testutf');
	var ret = true;
	var tv = ['\u007f','\u0080','\u0081','\u07ff','\u0800','\u0801','\u7fff','\u8000','\u8001','\ufff0','\uffff','\u10000','\u10001'];
	for(var i=0;i<tv.length;i++) {
		var v = manualConvertUnicodeToUTF8(tv[i]); // value
		var e = mozConvertUnicodeToUTF8(tv[i]); // expected value
		testLog('i:'+i+' exp:"'+e+'" val:"'+v+'"');
		testLog('i:'+i+' act:"'+tv[i].charCodeAt(0)+' exp:"'+e.charCodeAt(0)+' '+e.charCodeAt(1)+' '+e.charCodeAt(2)+'" val:"'+v.charCodeAt(0)+' '+v.charCodeAt(1)+' '+v.charCodeAt(2)+'"');
		if(v!=e) {
			displayMessage('Error:'+tv[i].charCodeAt(0));
			ret = false;
		}
	}
	return ret;
}
//}}}
