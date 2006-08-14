// Calculate the SHA-1 hash of an array of blen bytes of big-endian 32-bit words
Crypto.sha1 = function(x,blen)
{
	if(blen==null)
		return null;

	// Add 32-bit integers, wrapping at 32 bits
	//# Uses 16-bit operations internally to work around bugs in some JavaScript interpreters.
	add32 = function(a,b)
	{
		var lsw = (a&0xFFFF)+(b&0xFFFF);
		var msw = (a>>16)+(b>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	};
	// Add five 32-bit integers, wrapping at 32 bits
	//# Uses 16-bit operations internally to work around bugs in some JavaScript interpreters.
	add32x5 = function(a,b,c,d,e)
	{
		var lsw = (a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF)+(e&0xFFFF);
		var msw = (a>>16)+(b>>16)+(c>>16)+(d>>16)+(e>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	};
	// Bitwise rotate left a 32-bit integer by 1 bit
	rol32 = function(n)
	{
		return (n>>>31)|(n<<1);
	};

	var len = blen*8;
	// Append padding so length in bits is 448 mod 512
	x[len>>5] |= 0x80 << (24-len%32);
	// Append length
	x[((len+64>>9)<<4)+15] = len;

	var k1 = 0x5A827999;
	var k2 = 0x6ED9EBA1;
	var k3 = 0x8F1BBCDC;
	var k4 = 0xCA62C1D6;

	var h0 = 0x67452301;
	var h1 = 0xEFCDAB89;
	var h2 = 0x98BADCFE;
	var h3 = 0x10325476;
	var h4 = 0xC3D2E1F0;

	var w = Array(80);
	for(var i=0;i<x.length;i+=16)
		{
		var j,t;
		var a = h0;
		var b = h1;
		var c = h2;
		var d = h3;
		var e = h4;
		for(j = 0;j<16;j++)
			{
			w[j] = x[i+j];
			t = add32x5(e,(a>>>27)|(a<<5),d^(b&(c^d)),w[j],k1);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=16;j<20;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),d^(b&(c^d)),w[j],k1);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=20;j<40;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),b^c^d,w[j],k2);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=40;j<60;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),(b&c)|(d&(b|c)),w[j],k3);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}
		for(j=60;j<80;j++)
			{
			w[j] = rol32(w[j-3]^w[j-8]^w[j-14]^w[j-16]);
			t = add32x5(e,(a>>>27)|(a<<5),b^c^d,w[j],k4);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a = t;
			}

		h0 = add32(h0,a);
		h1 = add32(h1,b);
		h2 = add32(h2,c);
		h3 = add32(h3,d);
		h4 = add32(h4,e);
		}
	return Array(h0,h1,h2,h3,h4);
}

