/***
|''Name:''|testSHA1|
|''Description:''|macro to use for general testing|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/verticals/testGeneral/testSHA1.js |
|''Version:''|0.0.1|
|''Date:''|Feb 15, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

***/

/*{{{*/
function displayTest(vector,hash)
{
	displayMessage(vector.length<40 ? vector : vector.substr(0,40)+'..');
	if(hash!=Crypto.hexSha1Str(vector))
		displayMessage("Error!!!");
	displayMessage('..'+hash);
	displayMessage('..'+Crypto.hexSha1Str(vector));
}

function testVectors1()
{
	var m1 = "The quick brown fox jumps over the lazy dog";
	var m1h = "2fd4e1c67a2d28fced849ee1bb76e7391b93eb12".toUpperCase();
	displayTest(m1,m1h);

	var v5="abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq";
	var v5h="84983E441C3BD26EBAAE4AA1F95129E5E54670F1";
	displayTest(v5,v5h);

	var v7="12345678901234567890123456789012345678901234567890123456789012345678901234567890";
	var v7h="50ABF5706A150990A08B2C5EA40FA0E585554732";
	displayTest(v7,v7h);

	var m3= "1ef3ed12081ab55049b969eb3e70caaa958bdfa1";
	displayMessage("x1:"+m3);
	displayMessage("x2:"+Crypto.hexSha1Str(m3));
	displayMessage("x3:"+Crypto.be32sToHex(Crypto.sha1Str(m3)));
	//displayMessage("x4:"+Crypto.be32sToStr(Crypto.sha1Str(m3)));
	displayMessage("x5:"+Crypto.base64encode(Crypto.be32sToStr(Crypto.sha1Str(m3))));
	return false;
}

function testVectors2()
{
	//1 million times "a"
	//34172ms
	//33922ms
	//R30
	//37516ms
	//37172ms
	displayMessage("starting");
	var v = [];
	for(var i=0;i<10000;i++)
		v[i] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
	var v8 = v.join("");
	var v8h= "34AA973CD4C4DAA4F61EEB2BDBAD27316534016F";
	var t1, t0 = new Date();
	var v8c = Crypto.hexSha1Str(v8);
	var t1 = new Date();
	displayMessage("time="+(t1-t0)+"ms");
	displayMessage(v8h);
	displayMessage(v8c);
	//t.assertEqual(v8h.toLowerCase(), ded.SHA1(v8, ded.outputTypes.Hex)); 
}

config.macros.testMacro.test = function(title,params)
{
	clearMessage();
	displayMessage("hello");
	testVectors1();
	return;
};

/*}}}*/
