/***
|!Name|TestParamifier|
|!Created by|JeremyRuston|
|!Location|http://www.tiddlywiki.com/dev/#TestParamifier|
|!Version|1.0|
|!Requires|~TW2.x|
!Description
This plugin provides a custom paramifier that simply uses JavaScript {{{alert()}}} to display each paramifier callback. Once it's installed you can use the test paramifier like this:

http://www.tiddlywiki.com/#test:something test:[[something else]] 

!Code
***/
//{{{
config.paramifiers.test = {
	onconfig: function(v) {
		alert("onconfig - test:" + v);
		},
	onstart: function(v) {
		alert("onstart - test:" + v);
		}
};
//}}}
