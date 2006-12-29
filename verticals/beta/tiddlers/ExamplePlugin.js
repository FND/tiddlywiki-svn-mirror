/***
|''Name:''|ExamplePlugin|
|''Description:''|To demonstrate how to write TiddlyWiki plugins|
|''Version:''|2.0.2|
|''Date:''|Jul 12, 2006|
|''Source:''|http://www.tiddlywiki.com/#ExamplePlugin|
|''Author:''|JeremyRuston (jeremy (at) osmosoft (dot) com)|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|
***/

//{{{
// Don't do anything very much, this is just an example
//}}}

// deliberateError();
// Log a message
pluginInfo.log.push("This is a test message from " + tiddler.title);
