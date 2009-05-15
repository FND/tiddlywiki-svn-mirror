<?php
//timing
function recordTime_float($name="unnamed")
{
	global $time;
	if( !isset($time) )		//stop if time var not exist
	{
		return FALSE;
	}
	list($usec, $sec) = explode(" ", microtime());
	$time[] = array("name"=>$name, "time"=>((float)$usec + (float)$sec));
	return TRUE;
}

$time=array();
recordTime_float("Start");

//includes
if(!isset($cct_base))
	$cct_base = "";
 
include_once($cct_base."includes/header.php");

include_once($cct_base."includes/login.php");

if($pluginsLoader->events['afterIncludes'])
{
	foreach ($pluginsLoader->events['afterIncludes'] as $event)
	{
			if(is_file("plugins/".$event))
			include_once("plugins/".$event);	
	}
}


if($db_number < '17') {
	echo "<h1>ccTiddly Upgrade</h1>";
	echo "<p>Your instance of ccTiddly is being upgraded. Now you need to run <a href=upgrade.php >upgrade.php</a> to complete the upgrade.</p>";
	echo "If you do not have access to the server and this error message persists then please contact your system administrator.";
	exit;
}
recordTime_float("includes");


//check if getting revision
if( isset($_GET['title']) )
{
	$tiddlers = getAllVersionTiddly($title);
	$t = array();
	foreach($tiddlers as $tid)
	{
	$tid['title'] .= " revision ".$tid['revision'];
		$t[] = $tid;
	}
	$tiddlers = $t;
}elseif($_GET['tiddler'])
{
	$defeaultTiddlersTiddler['title'] = 'DefaultTiddlers';
	$defeaultTiddlersTiddler['body'] = $_GET['tiddler']; 
	$t[0] = $defeaultTiddlersTiddler;
	$t[1] = getTiddler($_GET['tiddler']);
	$tiddlers = $t;
}
elseif(isset($_GET['tags'])) 
{
	$tiddlers = getTiddlersWithTags($yesTags, $noTags);
}else{
	$tiddlers = getAllTiddlers();
	if (isset($_REQUEST['skin']))
	{
		echo $_REQUEST['skin'];
		$skin_tiddlers = getSkinTiddlers($_REQUEST['skin']); 
print_r($skin_tiddlers);
		$tiddlers = array_merge($skin_tiddlers, $tiddlers); 
	}
}
$tiddlers = array_merge($pluginsLoader->tiddlers, $tiddlers);
recordTime_float("get all tiddlers");
	
// log the workspace viewing : 
$data1['username'] = $user['username'];
$data1['workspace'] = $tiddlyCfg['workspace_name'];

$data1['time'] = date( 'Y-m-d H:i:s', mktime());
db_record_insert($tiddlyCfg['table']['workspace_view'],$data1);
?>



<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<script id="versionArea" type="text/javascript">
//<![CDATA[
var version = {title: "TiddlyWiki", major: 2, minor: 5, revision: 0, beta: 1, date: new Date("Jan 14, 2009"), extensions: {}};
//]]>
</script>
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
<meta name="copyright" content="
TiddlyWiki created by Jeremy Ruston, (jeremy [at] osmosoft [dot] com)

Copyright (c) UnaMesa Association 2004-2009

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

Neither the name of the UnaMesa Association nor the names of its contributors may be
used to endorse or promote products derived from this software without specific
prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
" />
<script id="jsheadArea" type="text/javascript">
//<![CDATA[
/*
 * jQuery 1.2.6 - New Wave Javascript
 *
 * Copyright (c) 2008 John Resig (jquery.com)
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 *
 * $Date: 2008-05-24 14:22:17 -0400 (Sat, 24 May 2008) $
 * $Rev: 5685 $
 */
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(H(){J w=1b.4M,3m$=1b.$;J D=1b.4M=1b.$=H(a,b){I 2B D.17.5j(a,b)};J u=/^[^<]*(<(.|\\s)+>)[^>]*$|^#(\\w+)$/,62=/^.[^:#\\[\\.]*$/,12;D.17=D.44={5j:H(d,b){d=d||S;G(d.16){7[0]=d;7.K=1;I 7}G(1j d=="23"){J c=u.2D(d);G(c&&(c[1]||!b)){G(c[1])d=D.4h([c[1]],b);N{J a=S.61(c[3]);G(a){G(a.2v!=c[3])I D().2q(d);I D(a)}d=[]}}N I D(b).2q(d)}N G(D.1D(d))I D(S)[D.17.27?"27":"43"](d);I 7.6Y(D.2d(d))},5w:"1.2.6",8G:H(){I 7.K},K:0,3p:H(a){I a==12?D.2d(7):7[a]},2I:H(b){J a=D(b);a.5n=7;I a},6Y:H(a){7.K=0;2p.44.1p.1w(7,a);I 7},P:H(a,b){I D.P(7,a,b)},5i:H(b){J a=-1;I D.2L(b&&b.5w?b[0]:b,7)},1K:H(c,a,b){J d=c;G(c.1q==56)G(a===12)I 7[0]&&D[b||"1K"](7[0],c);N{d={};d[c]=a}I 7.P(H(i){R(c 1n d)D.1K(b?7.V:7,c,D.1i(7,d[c],b,i,c))})},1g:H(b,a){G((b==\'2h\'||b==\'1Z\')&&3d(a)<0)a=12;I 7.1K(b,a,"2a")},1r:H(b){G(1j b!="49"&&b!=U)I 7.4E().3v((7[0]&&7[0].2z||S).5F(b));J a="";D.P(b||7,H(){D.P(7.3t,H(){G(7.16!=8)a+=7.16!=1?7.76:D.17.1r([7])})});I a},5z:H(b){G(7[0])D(b,7[0].2z).5y().39(7[0]).2l(H(){J a=7;1B(a.1x)a=a.1x;I a}).3v(7);I 7},8Y:H(a){I 7.P(H(){D(7).6Q().5z(a)})},8R:H(a){I 7.P(H(){D(7).5z(a)})},3v:H(){I 7.3W(19,M,Q,H(a){G(7.16==1)7.3U(a)})},6F:H(){I 7.3W(19,M,M,H(a){G(7.16==1)7.39(a,7.1x)})},6E:H(){I 7.3W(19,Q,Q,H(a){7.1d.39(a,7)})},5q:H(){I 7.3W(19,Q,M,H(a){7.1d.39(a,7.2H)})},3l:H(){I 7.5n||D([])},2q:H(b){J c=D.2l(7,H(a){I D.2q(b,a)});I 7.2I(/[^+>] [^+>]/.11(b)||b.1h("..")>-1?D.4r(c):c)},5y:H(e){J f=7.2l(H(){G(D.14.1f&&!D.4n(7)){J a=7.6o(M),5h=S.3h("1v");5h.3U(a);I D.4h([5h.4H])[0]}N I 7.6o(M)});J d=f.2q("*").5c().P(H(){G(7[E]!=12)7[E]=U});G(e===M)7.2q("*").5c().P(H(i){G(7.16==3)I;J c=D.L(7,"3w");R(J a 1n c)R(J b 1n c[a])D.W.1e(d[i],a,c[a][b],c[a][b].L)});I f},1E:H(b){I 7.2I(D.1D(b)&&D.3C(7,H(a,i){I b.1k(a,i)})||D.3g(b,7))},4Y:H(b){G(b.1q==56)G(62.11(b))I 7.2I(D.3g(b,7,M));N b=D.3g(b,7);J a=b.K&&b[b.K-1]!==12&&!b.16;I 7.1E(H(){I a?D.2L(7,b)<0:7!=b})},1e:H(a){I 7.2I(D.4r(D.2R(7.3p(),1j a==\'23\'?D(a):D.2d(a))))},3F:H(a){I!!a&&D.3g(a,7).K>0},7T:H(a){I 7.3F("."+a)},6e:H(b){G(b==12){G(7.K){J c=7[0];G(D.Y(c,"2A")){J e=c.64,63=[],15=c.15,2V=c.O=="2A-2V";G(e<0)I U;R(J i=2V?e:0,2f=2V?e+1:15.K;i<2f;i++){J d=15[i];G(d.2W){b=D.14.1f&&!d.at.2x.an?d.1r:d.2x;G(2V)I b;63.1p(b)}}I 63}N I(7[0].2x||"").1o(/\\r/g,"")}I 12}G(b.1q==4L)b+=\'\';I 7.P(H(){G(7.16!=1)I;G(b.1q==2p&&/5O|5L/.11(7.O))7.4J=(D.2L(7.2x,b)>=0||D.2L(7.34,b)>=0);N G(D.Y(7,"2A")){J a=D.2d(b);D("9R",7).P(H(){7.2W=(D.2L(7.2x,a)>=0||D.2L(7.1r,a)>=0)});G(!a.K)7.64=-1}N 7.2x=b})},2K:H(a){I a==12?(7[0]?7[0].4H:U):7.4E().3v(a)},7b:H(a){I 7.5q(a).21()},79:H(i){I 7.3s(i,i+1)},3s:H(){I 7.2I(2p.44.3s.1w(7,19))},2l:H(b){I 7.2I(D.2l(7,H(a,i){I b.1k(a,i,a)}))},5c:H(){I 7.1e(7.5n)},L:H(d,b){J a=d.1R(".");a[1]=a[1]?"."+a[1]:"";G(b===12){J c=7.5C("9z"+a[1]+"!",[a[0]]);G(c===12&&7.K)c=D.L(7[0],d);I c===12&&a[1]?7.L(a[0]):c}N I 7.1P("9u"+a[1]+"!",[a[0],b]).P(H(){D.L(7,d,b)})},3b:H(a){I 7.P(H(){D.3b(7,a)})},3W:H(g,f,h,d){J e=7.K>1,3x;I 7.P(H(){G(!3x){3x=D.4h(g,7.2z);G(h)3x.9o()}J b=7;G(f&&D.Y(7,"1T")&&D.Y(3x[0],"4F"))b=7.3H("22")[0]||7.3U(7.2z.3h("22"));J c=D([]);D.P(3x,H(){J a=e?D(7).5y(M)[0]:7;G(D.Y(a,"1m"))c=c.1e(a);N{G(a.16==1)c=c.1e(D("1m",a).21());d.1k(b,a)}});c.P(6T)})}};D.17.5j.44=D.17;H 6T(i,a){G(a.4d)D.3Y({1a:a.4d,31:Q,1O:"1m"});N D.5u(a.1r||a.6O||a.4H||"");G(a.1d)a.1d.37(a)}H 1z(){I+2B 8J}D.1l=D.17.1l=H(){J b=19[0]||{},i=1,K=19.K,4x=Q,15;G(b.1q==8I){4x=b;b=19[1]||{};i=2}G(1j b!="49"&&1j b!="H")b={};G(K==i){b=7;--i}R(;i<K;i++)G((15=19[i])!=U)R(J c 1n 15){J a=b[c],2w=15[c];G(b===2w)6M;G(4x&&2w&&1j 2w=="49"&&!2w.16)b[c]=D.1l(4x,a||(2w.K!=U?[]:{}),2w);N G(2w!==12)b[c]=2w}I b};J E="4M"+1z(),6K=0,5r={},6G=/z-?5i|8B-?8A|1y|6B|8v-?1Z/i,3P=S.3P||{};D.1l({8u:H(a){1b.$=3m$;G(a)1b.4M=w;I D},1D:H(a){I!!a&&1j a!="23"&&!a.Y&&a.1q!=2p&&/^[\\s[]?H/.11(a+"")},4n:H(a){I a.1C&&!a.1c||a.2j&&a.2z&&!a.2z.1c},5u:H(a){a=D.3k(a);G(a){J b=S.3H("6w")[0]||S.1C,1m=S.3h("1m");1m.O="1r/4t";G(D.14.1f)1m.1r=a;N 1m.3U(S.5F(a));b.39(1m,b.1x);b.37(1m)}},Y:H(b,a){I b.Y&&b.Y.2r()==a.2r()},1Y:{},L:H(c,d,b){c=c==1b?5r:c;J a=c[E];G(!a)a=c[E]=++6K;G(d&&!D.1Y[a])D.1Y[a]={};G(b!==12)D.1Y[a][d]=b;I d?D.1Y[a][d]:a},3b:H(c,b){c=c==1b?5r:c;J a=c[E];G(b){G(D.1Y[a]){2U D.1Y[a][b];b="";R(b 1n D.1Y[a])1X;G(!b)D.3b(c)}}N{1U{2U c[E]}1V(e){G(c.5l)c.5l(E)}2U D.1Y[a]}},P:H(d,a,c){J e,i=0,K=d.K;G(c){G(K==12){R(e 1n d)G(a.1w(d[e],c)===Q)1X}N R(;i<K;)G(a.1w(d[i++],c)===Q)1X}N{G(K==12){R(e 1n d)G(a.1k(d[e],e,d[e])===Q)1X}N R(J b=d[0];i<K&&a.1k(b,i,b)!==Q;b=d[++i]){}}I d},1i:H(b,a,c,i,d){G(D.1D(a))a=a.1k(b,i);I a&&a.1q==4L&&c=="2a"&&!6G.11(d)?a+"2X":a},1F:{1e:H(c,b){D.P((b||"").1R(/\\s+/),H(i,a){G(c.16==1&&!D.1F.3T(c.1F,a))c.1F+=(c.1F?" ":"")+a})},21:H(c,b){G(c.16==1)c.1F=b!=12?D.3C(c.1F.1R(/\\s+/),H(a){I!D.1F.3T(b,a)}).6s(" "):""},3T:H(b,a){I D.2L(a,(b.1F||b).6r().1R(/\\s+/))>-1}},6q:H(b,c,a){J e={};R(J d 1n c){e[d]=b.V[d];b.V[d]=c[d]}a.1k(b);R(J d 1n c)b.V[d]=e[d]},1g:H(d,e,c){G(e=="2h"||e=="1Z"){J b,3X={30:"5x",5g:"1G",18:"3I"},35=e=="2h"?["5e","6k"]:["5G","6i"];H 5b(){b=e=="2h"?d.8f:d.8c;J a=0,2C=0;D.P(35,H(){a+=3d(D.2a(d,"57"+7,M))||0;2C+=3d(D.2a(d,"2C"+7+"4b",M))||0});b-=29.83(a+2C)}G(D(d).3F(":4j"))5b();N D.6q(d,3X,5b);I 29.2f(0,b)}I D.2a(d,e,c)},2a:H(f,l,k){J e,V=f.V;H 3E(b){G(!D.14.2k)I Q;J a=3P.54(b,U);I!a||a.52("3E")==""}G(l=="1y"&&D.14.1f){e=D.1K(V,"1y");I e==""?"1":e}G(D.14.2G&&l=="18"){J d=V.50;V.50="0 7Y 7W";V.50=d}G(l.1I(/4i/i))l=y;G(!k&&V&&V[l])e=V[l];N G(3P.54){G(l.1I(/4i/i))l="4i";l=l.1o(/([A-Z])/g,"-$1").3y();J c=3P.54(f,U);G(c&&!3E(f))e=c.52(l);N{J g=[],2E=[],a=f,i=0;R(;a&&3E(a);a=a.1d)2E.6h(a);R(;i<2E.K;i++)G(3E(2E[i])){g[i]=2E[i].V.18;2E[i].V.18="3I"}e=l=="18"&&g[2E.K-1]!=U?"2F":(c&&c.52(l))||"";R(i=0;i<g.K;i++)G(g[i]!=U)2E[i].V.18=g[i]}G(l=="1y"&&e=="")e="1"}N G(f.4g){J h=l.1o(/\\-(\\w)/g,H(a,b){I b.2r()});e=f.4g[l]||f.4g[h];G(!/^\\d+(2X)?$/i.11(e)&&/^\\d/.11(e)){J j=V.1A,66=f.65.1A;f.65.1A=f.4g.1A;V.1A=e||0;e=V.aM+"2X";V.1A=j;f.65.1A=66}}I e},4h:H(l,h){J k=[];h=h||S;G(1j h.3h==\'12\')h=h.2z||h[0]&&h[0].2z||S;D.P(l,H(i,d){G(!d)I;G(d.1q==4L)d+=\'\';G(1j d=="23"){d=d.1o(/(<(\\w+)[^>]*?)\\/>/g,H(b,a,c){I c.1I(/^(aK|4f|7E|aG|4T|7A|aB|3n|az|ay|av)$/i)?b:a+"></"+c+">"});J f=D.3k(d).3y(),1v=h.3h("1v");J e=!f.1h("<au")&&[1,"<2A 7w=\'7w\'>","</2A>"]||!f.1h("<ar")&&[1,"<7v>","</7v>"]||f.1I(/^<(aq|22|am|ak|ai)/)&&[1,"<1T>","</1T>"]||!f.1h("<4F")&&[2,"<1T><22>","</22></1T>"]||(!f.1h("<af")||!f.1h("<ad"))&&[3,"<1T><22><4F>","</4F></22></1T>"]||!f.1h("<7E")&&[2,"<1T><22></22><7q>","</7q></1T>"]||D.14.1f&&[1,"1v<1v>","</1v>"]||[0,"",""];1v.4H=e[1]+d+e[2];1B(e[0]--)1v=1v.5T;G(D.14.1f){J g=!f.1h("<1T")&&f.1h("<22")<0?1v.1x&&1v.1x.3t:e[1]=="<1T>"&&f.1h("<22")<0?1v.3t:[];R(J j=g.K-1;j>=0;--j)G(D.Y(g[j],"22")&&!g[j].3t.K)g[j].1d.37(g[j]);G(/^\\s/.11(d))1v.39(h.5F(d.1I(/^\\s*/)[0]),1v.1x)}d=D.2d(1v.3t)}G(d.K===0&&(!D.Y(d,"3V")&&!D.Y(d,"2A")))I;G(d[0]==12||D.Y(d,"3V")||d.15)k.1p(d);N k=D.2R(k,d)});I k},1K:H(d,f,c){G(!d||d.16==3||d.16==8)I 12;J e=!D.4n(d),40=c!==12,1f=D.14.1f;f=e&&D.3X[f]||f;G(d.2j){J g=/5Q|4d|V/.11(f);G(f=="2W"&&D.14.2k)d.1d.64;G(f 1n d&&e&&!g){G(40){G(f=="O"&&D.Y(d,"4T")&&d.1d)7p"O a3 a1\'t 9V 9U";d[f]=c}G(D.Y(d,"3V")&&d.7i(f))I d.7i(f).76;I d[f]}G(1f&&e&&f=="V")I D.1K(d.V,"9T",c);G(40)d.9Q(f,""+c);J h=1f&&e&&g?d.4G(f,2):d.4G(f);I h===U?12:h}G(1f&&f=="1y"){G(40){d.6B=1;d.1E=(d.1E||"").1o(/7f\\([^)]*\\)/,"")+(3r(c)+\'\'=="9L"?"":"7f(1y="+c*7a+")")}I d.1E&&d.1E.1h("1y=")>=0?(3d(d.1E.1I(/1y=([^)]*)/)[1])/7a)+\'\':""}f=f.1o(/-([a-z])/9H,H(a,b){I b.2r()});G(40)d[f]=c;I d[f]},3k:H(a){I(a||"").1o(/^\\s+|\\s+$/g,"")},2d:H(b){J a=[];G(b!=U){J i=b.K;G(i==U||b.1R||b.4I||b.1k)a[0]=b;N 1B(i)a[--i]=b[i]}I a},2L:H(b,a){R(J i=0,K=a.K;i<K;i++)G(a[i]===b)I i;I-1},2R:H(a,b){J i=0,T,2S=a.K;G(D.14.1f){1B(T=b[i++])G(T.16!=8)a[2S++]=T}N 1B(T=b[i++])a[2S++]=T;I a},4r:H(a){J c=[],2o={};1U{R(J i=0,K=a.K;i<K;i++){J b=D.L(a[i]);G(!2o[b]){2o[b]=M;c.1p(a[i])}}}1V(e){c=a}I c},3C:H(c,a,d){J b=[];R(J i=0,K=c.K;i<K;i++)G(!d!=!a(c[i],i))b.1p(c[i]);I b},2l:H(d,a){J c=[];R(J i=0,K=d.K;i<K;i++){J b=a(d[i],i);G(b!=U)c[c.K]=b}I c.7d.1w([],c)}});J v=9B.9A.3y();D.14={5B:(v.1I(/.+(?:9y|9x|9w|9v)[\\/: ]([\\d.]+)/)||[])[1],2k:/75/.11(v),2G:/2G/.11(v),1f:/1f/.11(v)&&!/2G/.11(v),42:/42/.11(v)&&!/(9s|75)/.11(v)};J y=D.14.1f?"7o":"72";D.1l({71:!D.14.1f||S.70=="6Z",3X:{"R":"9n","9k":"1F","4i":y,72:y,7o:y,9h:"9f",9e:"9d",9b:"99"}});D.P({6W:H(a){I a.1d},97:H(a){I D.4S(a,"1d")},95:H(a){I D.3a(a,2,"2H")},91:H(a){I D.3a(a,2,"4l")},8Z:H(a){I D.4S(a,"2H")},8X:H(a){I D.4S(a,"4l")},8W:H(a){I D.5v(a.1d.1x,a)},8V:H(a){I D.5v(a.1x)},6Q:H(a){I D.Y(a,"8U")?a.8T||a.8S.S:D.2d(a.3t)}},H(c,d){D.17[c]=H(b){J a=D.2l(7,d);G(b&&1j b=="23")a=D.3g(b,a);I 7.2I(D.4r(a))}});D.P({6P:"3v",8Q:"6F",39:"6E",8P:"5q",8O:"7b"},H(c,b){D.17[c]=H(){J a=19;I 7.P(H(){R(J i=0,K=a.K;i<K;i++)D(a[i])[b](7)})}});D.P({8N:H(a){D.1K(7,a,"");G(7.16==1)7.5l(a)},8M:H(a){D.1F.1e(7,a)},8L:H(a){D.1F.21(7,a)},8K:H(a){D.1F[D.1F.3T(7,a)?"21":"1e"](7,a)},21:H(a){G(!a||D.1E(a,[7]).r.K){D("*",7).1e(7).P(H(){D.W.21(7);D.3b(7)});G(7.1d)7.1d.37(7)}},4E:H(){D(">*",7).21();1B(7.1x)7.37(7.1x)}},H(a,b){D.17[a]=H(){I 7.P(b,19)}});D.P(["6N","4b"],H(i,c){J b=c.3y();D.17[b]=H(a){I 7[0]==1b?D.14.2G&&S.1c["5t"+c]||D.14.2k&&1b["5s"+c]||S.70=="6Z"&&S.1C["5t"+c]||S.1c["5t"+c]:7[0]==S?29.2f(29.2f(S.1c["4y"+c],S.1C["4y"+c]),29.2f(S.1c["2i"+c],S.1C["2i"+c])):a==12?(7.K?D.1g(7[0],b):U):7.1g(b,a.1q==56?a:a+"2X")}});H 25(a,b){I a[0]&&3r(D.2a(a[0],b,M),10)||0}J C=D.14.2k&&3r(D.14.5B)<8H?"(?:[\\\\w*3m-]|\\\\\\\\.)":"(?:[\\\\w\\8F-\\8E*3m-]|\\\\\\\\.)",6L=2B 4v("^>\\\\s*("+C+"+)"),6J=2B 4v("^("+C+"+)(#)("+C+"+)"),6I=2B 4v("^([#.]?)("+C+"*)");D.1l({6H:{"":H(a,i,m){I m[2]=="*"||D.Y(a,m[2])},"#":H(a,i,m){I a.4G("2v")==m[2]},":":{8D:H(a,i,m){I i<m[3]-0},8C:H(a,i,m){I i>m[3]-0},3a:H(a,i,m){I m[3]-0==i},79:H(a,i,m){I m[3]-0==i},3o:H(a,i){I i==0},3S:H(a,i,m,r){I i==r.K-1},6D:H(a,i){I i%2==0},6C:H(a,i){I i%2},"3o-4u":H(a){I a.1d.3H("*")[0]==a},"3S-4u":H(a){I D.3a(a.1d.5T,1,"4l")==a},"8z-4u":H(a){I!D.3a(a.1d.5T,2,"4l")},6W:H(a){I a.1x},4E:H(a){I!a.1x},8y:H(a,i,m){I(a.6O||a.8x||D(a).1r()||"").1h(m[3])>=0},4j:H(a){I"1G"!=a.O&&D.1g(a,"18")!="2F"&&D.1g(a,"5g")!="1G"},1G:H(a){I"1G"==a.O||D.1g(a,"18")=="2F"||D.1g(a,"5g")=="1G"},8w:H(a){I!a.3R},3R:H(a){I a.3R},4J:H(a){I a.4J},2W:H(a){I a.2W||D.1K(a,"2W")},1r:H(a){I"1r"==a.O},5O:H(a){I"5O"==a.O},5L:H(a){I"5L"==a.O},5p:H(a){I"5p"==a.O},3Q:H(a){I"3Q"==a.O},5o:H(a){I"5o"==a.O},6A:H(a){I"6A"==a.O},6z:H(a){I"6z"==a.O},2s:H(a){I"2s"==a.O||D.Y(a,"2s")},4T:H(a){I/4T|2A|6y|2s/i.11(a.Y)},3T:H(a,i,m){I D.2q(m[3],a).K},8t:H(a){I/h\\d/i.11(a.Y)},8s:H(a){I D.3C(D.3O,H(b){I a==b.T}).K}}},6x:[/^(\\[) *@?([\\w-]+) *([!*$^~=]*) *(\'?"?)(.*?)\\4 *\\]/,/^(:)([\\w-]+)\\("?\'?(.*?(\\(.*?\\))?[^(]*?)"?\'?\\)/,2B 4v("^([:.#]*)("+C+"+)")],3g:H(a,c,b){J d,1t=[];1B(a&&a!=d){d=a;J f=D.1E(a,c,b);a=f.t.1o(/^\\s*,\\s*/,"");1t=b?c=f.r:D.2R(1t,f.r)}I 1t},2q:H(t,o){G(1j t!="23")I[t];G(o&&o.16!=1&&o.16!=9)I[];o=o||S;J d=[o],2o=[],3S,Y;1B(t&&3S!=t){J r=[];3S=t;t=D.3k(t);J l=Q,3j=6L,m=3j.2D(t);G(m){Y=m[1].2r();R(J i=0;d[i];i++)R(J c=d[i].1x;c;c=c.2H)G(c.16==1&&(Y=="*"||c.Y.2r()==Y))r.1p(c);d=r;t=t.1o(3j,"");G(t.1h(" ")==0)6M;l=M}N{3j=/^([>+~])\\s*(\\w*)/i;G((m=3j.2D(t))!=U){r=[];J k={};Y=m[2].2r();m=m[1];R(J j=0,3i=d.K;j<3i;j++){J n=m=="~"||m=="+"?d[j].2H:d[j].1x;R(;n;n=n.2H)G(n.16==1){J g=D.L(n);G(m=="~"&&k[g])1X;G(!Y||n.Y.2r()==Y){G(m=="~")k[g]=M;r.1p(n)}G(m=="+")1X}}d=r;t=D.3k(t.1o(3j,""));l=M}}G(t&&!l){G(!t.1h(",")){G(o==d[0])d.4s();2o=D.2R(2o,d);r=d=[o];t=" "+t.6v(1,t.K)}N{J h=6J;J m=h.2D(t);G(m){m=[0,m[2],m[3],m[1]]}N{h=6I;m=h.2D(t)}m[2]=m[2].1o(/\\\\/g,"");J f=d[d.K-1];G(m[1]=="#"&&f&&f.61&&!D.4n(f)){J p=f.61(m[2]);G((D.14.1f||D.14.2G)&&p&&1j p.2v=="23"&&p.2v!=m[2])p=D(\'[@2v="\'+m[2]+\'"]\',f)[0];d=r=p&&(!m[3]||D.Y(p,m[3]))?[p]:[]}N{R(J i=0;d[i];i++){J a=m[1]=="#"&&m[3]?m[3]:m[1]!=""||m[0]==""?"*":m[2];G(a=="*"&&d[i].Y.3y()=="49")a="3n";r=D.2R(r,d[i].3H(a))}G(m[1]==".")r=D.5m(r,m[2]);G(m[1]=="#"){J e=[];R(J i=0;r[i];i++)G(r[i].4G("2v")==m[2]){e=[r[i]];1X}r=e}d=r}t=t.1o(h,"")}}G(t){J b=D.1E(t,r);d=r=b.r;t=D.3k(b.t)}}G(t)d=[];G(d&&o==d[0])d.4s();2o=D.2R(2o,d);I 2o},5m:H(r,m,a){m=" "+m+" ";J c=[];R(J i=0;r[i];i++){J b=(" "+r[i].1F+" ").1h(m)>=0;G(!a&&b||a&&!b)c.1p(r[i])}I c},1E:H(t,r,h){J d;1B(t&&t!=d){d=t;J p=D.6x,m;R(J i=0;p[i];i++){m=p[i].2D(t);G(m){t=t.8r(m[0].K);m[2]=m[2].1o(/\\\\/g,"");1X}}G(!m)1X;G(m[1]==":"&&m[2]=="4Y")r=62.11(m[3])?D.1E(m[3],r,M).r:D(r).4Y(m[3]);N G(m[1]==".")r=D.5m(r,m[2],h);N G(m[1]=="["){J g=[],O=m[3];R(J i=0,3i=r.K;i<3i;i++){J a=r[i],z=a[D.3X[m[2]]||m[2]];G(z==U||/5Q|4d|2W/.11(m[2]))z=D.1K(a,m[2])||\'\';G((O==""&&!!z||O=="="&&z==m[5]||O=="!="&&z!=m[5]||O=="^="&&z&&!z.1h(m[5])||O=="$="&&z.6v(z.K-m[5].K)==m[5]||(O=="*="||O=="~=")&&z.1h(m[5])>=0)^h)g.1p(a)}r=g}N G(m[1]==":"&&m[2]=="3a-4u"){J e={},g=[],11=/(-?)(\\d*)n((?:\\+|-)?\\d*)/.2D(m[3]=="6D"&&"2n"||m[3]=="6C"&&"2n+1"||!/\\D/.11(m[3])&&"8q+"+m[3]||m[3]),3o=(11[1]+(11[2]||1))-0,d=11[3]-0;R(J i=0,3i=r.K;i<3i;i++){J j=r[i],1d=j.1d,2v=D.L(1d);G(!e[2v]){J c=1;R(J n=1d.1x;n;n=n.2H)G(n.16==1)n.4q=c++;e[2v]=M}J b=Q;G(3o==0){G(j.4q==d)b=M}N G((j.4q-d)%3o==0&&(j.4q-d)/3o>=0)b=M;G(b^h)g.1p(j)}r=g}N{J f=D.6H[m[1]];G(1j f=="49")f=f[m[2]];G(1j f=="23")f=6u("Q||H(a,i){I "+f+";}");r=D.3C(r,H(a,i){I f(a,i,m,r)},h)}}I{r:r,t:t}},4S:H(b,c){J a=[],1t=b[c];1B(1t&&1t!=S){G(1t.16==1)a.1p(1t);1t=1t[c]}I a},3a:H(a,e,c,b){e=e||1;J d=0;R(;a;a=a[c])G(a.16==1&&++d==e)1X;I a},5v:H(n,a){J r=[];R(;n;n=n.2H){G(n.16==1&&n!=a)r.1p(n)}I r}});D.W={1e:H(f,i,g,e){G(f.16==3||f.16==8)I;G(D.14.1f&&f.4I)f=1b;G(!g.24)g.24=7.24++;G(e!=12){J h=g;g=7.3M(h,H(){I h.1w(7,19)});g.L=e}J j=D.L(f,"3w")||D.L(f,"3w",{}),1H=D.L(f,"1H")||D.L(f,"1H",H(){G(1j D!="12"&&!D.W.5k)I D.W.1H.1w(19.3L.T,19)});1H.T=f;D.P(i.1R(/\\s+/),H(c,b){J a=b.1R(".");b=a[0];g.O=a[1];J d=j[b];G(!d){d=j[b]={};G(!D.W.2t[b]||D.W.2t[b].4p.1k(f)===Q){G(f.3K)f.3K(b,1H,Q);N G(f.6t)f.6t("4o"+b,1H)}}d[g.24]=g;D.W.26[b]=M});f=U},24:1,26:{},21:H(e,h,f){G(e.16==3||e.16==8)I;J i=D.L(e,"3w"),1L,5i;G(i){G(h==12||(1j h=="23"&&h.8p(0)=="."))R(J g 1n i)7.21(e,g+(h||""));N{G(h.O){f=h.2y;h=h.O}D.P(h.1R(/\\s+/),H(b,a){J c=a.1R(".");a=c[0];G(i[a]){G(f)2U i[a][f.24];N R(f 1n i[a])G(!c[1]||i[a][f].O==c[1])2U i[a][f];R(1L 1n i[a])1X;G(!1L){G(!D.W.2t[a]||D.W.2t[a].4A.1k(e)===Q){G(e.6p)e.6p(a,D.L(e,"1H"),Q);N G(e.6n)e.6n("4o"+a,D.L(e,"1H"))}1L=U;2U i[a]}}})}R(1L 1n i)1X;G(!1L){J d=D.L(e,"1H");G(d)d.T=U;D.3b(e,"3w");D.3b(e,"1H")}}},1P:H(h,c,f,g,i){c=D.2d(c);G(h.1h("!")>=0){h=h.3s(0,-1);J a=M}G(!f){G(7.26[h])D("*").1e([1b,S]).1P(h,c)}N{G(f.16==3||f.16==8)I 12;J b,1L,17=D.1D(f[h]||U),W=!c[0]||!c[0].32;G(W){c.6h({O:h,2J:f,32:H(){},3J:H(){},4C:1z()});c[0][E]=M}c[0].O=h;G(a)c[0].6m=M;J d=D.L(f,"1H");G(d)b=d.1w(f,c);G((!17||(D.Y(f,\'a\')&&h=="4V"))&&f["4o"+h]&&f["4o"+h].1w(f,c)===Q)b=Q;G(W)c.4s();G(i&&D.1D(i)){1L=i.1w(f,b==U?c:c.7d(b));G(1L!==12)b=1L}G(17&&g!==Q&&b!==Q&&!(D.Y(f,\'a\')&&h=="4V")){7.5k=M;1U{f[h]()}1V(e){}}7.5k=Q}I b},1H:H(b){J a,1L,38,5f,4m;b=19[0]=D.W.6l(b||1b.W);38=b.O.1R(".");b.O=38[0];38=38[1];5f=!38&&!b.6m;4m=(D.L(7,"3w")||{})[b.O];R(J j 1n 4m){J c=4m[j];G(5f||c.O==38){b.2y=c;b.L=c.L;1L=c.1w(7,19);G(a!==Q)a=1L;G(1L===Q){b.32();b.3J()}}}I a},6l:H(b){G(b[E]==M)I b;J d=b;b={8o:d};J c="8n 8m 8l 8k 2s 8j 47 5d 6j 5E 8i L 8h 8g 4K 2y 5a 59 8e 8b 58 6f 8a 88 4k 87 86 84 6d 2J 4C 6c O 82 81 35".1R(" ");R(J i=c.K;i;i--)b[c[i]]=d[c[i]];b[E]=M;b.32=H(){G(d.32)d.32();d.80=Q};b.3J=H(){G(d.3J)d.3J();d.7Z=M};b.4C=b.4C||1z();G(!b.2J)b.2J=b.6d||S;G(b.2J.16==3)b.2J=b.2J.1d;G(!b.4k&&b.4K)b.4k=b.4K==b.2J?b.6c:b.4K;G(b.58==U&&b.5d!=U){J a=S.1C,1c=S.1c;b.58=b.5d+(a&&a.2e||1c&&1c.2e||0)-(a.6b||0);b.6f=b.6j+(a&&a.2c||1c&&1c.2c||0)-(a.6a||0)}G(!b.35&&((b.47||b.47===0)?b.47:b.5a))b.35=b.47||b.5a;G(!b.59&&b.5E)b.59=b.5E;G(!b.35&&b.2s)b.35=(b.2s&1?1:(b.2s&2?3:(b.2s&4?2:0)));I b},3M:H(a,b){b.24=a.24=a.24||b.24||7.24++;I b},2t:{27:{4p:H(){55();I},4A:H(){I}},3D:{4p:H(){G(D.14.1f)I Q;D(7).2O("53",D.W.2t.3D.2y);I M},4A:H(){G(D.14.1f)I Q;D(7).4e("53",D.W.2t.3D.2y);I M},2y:H(a){G(F(a,7))I M;a.O="3D";I D.W.1H.1w(7,19)}},3N:{4p:H(){G(D.14.1f)I Q;D(7).2O("51",D.W.2t.3N.2y);I M},4A:H(){G(D.14.1f)I Q;D(7).4e("51",D.W.2t.3N.2y);I M},2y:H(a){G(F(a,7))I M;a.O="3N";I D.W.1H.1w(7,19)}}}};D.17.1l({2O:H(c,a,b){I c=="4X"?7.2V(c,a,b):7.P(H(){D.W.1e(7,c,b||a,b&&a)})},2V:H(d,b,c){J e=D.W.3M(c||b,H(a){D(7).4e(a,e);I(c||b).1w(7,19)});I 7.P(H(){D.W.1e(7,d,e,c&&b)})},4e:H(a,b){I 7.P(H(){D.W.21(7,a,b)})},1P:H(c,a,b){I 7.P(H(){D.W.1P(c,a,7,M,b)})},5C:H(c,a,b){I 7[0]&&D.W.1P(c,a,7[0],Q,b)},2m:H(b){J c=19,i=1;1B(i<c.K)D.W.3M(b,c[i++]);I 7.4V(D.W.3M(b,H(a){7.4Z=(7.4Z||0)%i;a.32();I c[7.4Z++].1w(7,19)||Q}))},7X:H(a,b){I 7.2O(\'3D\',a).2O(\'3N\',b)},27:H(a){55();G(D.2Q)a.1k(S,D);N D.3A.1p(H(){I a.1k(7,D)});I 7}});D.1l({2Q:Q,3A:[],27:H(){G(!D.2Q){D.2Q=M;G(D.3A){D.P(D.3A,H(){7.1k(S)});D.3A=U}D(S).5C("27")}}});J x=Q;H 55(){G(x)I;x=M;G(S.3K&&!D.14.2G)S.3K("69",D.27,Q);G(D.14.1f&&1b==1S)(H(){G(D.2Q)I;1U{S.1C.7V("1A")}1V(3e){3B(19.3L,0);I}D.27()})();G(D.14.2G)S.3K("69",H(){G(D.2Q)I;R(J i=0;i<S.4W.K;i++)G(S.4W[i].3R){3B(19.3L,0);I}D.27()},Q);G(D.14.2k){J a;(H(){G(D.2Q)I;G(S.3f!="68"&&S.3f!="1J"){3B(19.3L,0);I}G(a===12)a=D("V, 7A[7U=7S]").K;G(S.4W.K!=a){3B(19.3L,0);I}D.27()})()}D.W.1e(1b,"43",D.27)}D.P(("7R,7Q,43,85,4y,4X,4V,7P,"+"7O,7N,89,53,51,7M,2A,"+"5o,7L,7K,8d,3e").1R(","),H(i,b){D.17[b]=H(a){I a?7.2O(b,a):7.1P(b)}});J F=H(a,c){J b=a.4k;1B(b&&b!=c)1U{b=b.1d}1V(3e){b=c}I b==c};D(1b).2O("4X",H(){D("*").1e(S).4e()});D.17.1l({67:D.17.43,43:H(g,d,c){G(1j g!=\'23\')I 7.67(g);J e=g.1h(" ");G(e>=0){J i=g.3s(e,g.K);g=g.3s(0,e)}c=c||H(){};J f="2P";G(d)G(D.1D(d)){c=d;d=U}N{d=D.3n(d);f="6g"}J h=7;D.3Y({1a:g,O:f,1O:"2K",L:d,1J:H(a,b){G(b=="1W"||b=="7J")h.2K(i?D("<1v/>").3v(a.4U.1o(/<1m(.|\\s)*?\\/1m>/g,"")).2q(i):a.4U);h.P(c,[a.4U,b,a])}});I 7},aL:H(){I D.3n(7.7I())},7I:H(){I 7.2l(H(){I D.Y(7,"3V")?D.2d(7.aH):7}).1E(H(){I 7.34&&!7.3R&&(7.4J||/2A|6y/i.11(7.Y)||/1r|1G|3Q/i.11(7.O))}).2l(H(i,c){J b=D(7).6e();I b==U?U:b.1q==2p?D.2l(b,H(a,i){I{34:c.34,2x:a}}):{34:c.34,2x:b}}).3p()}});D.P("7H,7G,7F,7D,7C,7B".1R(","),H(i,o){D.17[o]=H(f){I 7.2O(o,f)}});J B=1z();D.1l({3p:H(d,b,a,c){G(D.1D(b)){a=b;b=U}I D.3Y({O:"2P",1a:d,L:b,1W:a,1O:c})},aE:H(b,a){I D.3p(b,U,a,"1m")},aD:H(c,b,a){I D.3p(c,b,a,"3z")},aC:H(d,b,a,c){G(D.1D(b)){a=b;b={}}I D.3Y({O:"6g",1a:d,L:b,1W:a,1O:c})},aA:H(a){D.1l(D.60,a)},60:{1a:5Z.5Q,26:M,O:"2P",2T:0,7z:"4R/x-ax-3V-aw",7x:M,31:M,L:U,5Y:U,3Q:U,4Q:{2N:"4R/2N, 1r/2N",2K:"1r/2K",1m:"1r/4t, 4R/4t",3z:"4R/3z, 1r/4t",1r:"1r/as",4w:"*/*"}},4z:{},3Y:H(s){s=D.1l(M,s,D.1l(M,{},D.60,s));J g,2Z=/=\\?(&|$)/g,1u,L,O=s.O.2r();G(s.L&&s.7x&&1j s.L!="23")s.L=D.3n(s.L);G(s.1O=="4P"){G(O=="2P"){G(!s.1a.1I(2Z))s.1a+=(s.1a.1I(/\\?/)?"&":"?")+(s.4P||"7u")+"=?"}N G(!s.L||!s.L.1I(2Z))s.L=(s.L?s.L+"&":"")+(s.4P||"7u")+"=?";s.1O="3z"}G(s.1O=="3z"&&(s.L&&s.L.1I(2Z)||s.1a.1I(2Z))){g="4P"+B++;G(s.L)s.L=(s.L+"").1o(2Z,"="+g+"$1");s.1a=s.1a.1o(2Z,"="+g+"$1");s.1O="1m";1b[g]=H(a){L=a;1W();1J();1b[g]=12;1U{2U 1b[g]}1V(e){}G(i)i.37(h)}}G(s.1O=="1m"&&s.1Y==U)s.1Y=Q;G(s.1Y===Q&&O=="2P"){J j=1z();J k=s.1a.1o(/(\\?|&)3m=.*?(&|$)/,"$ap="+j+"$2");s.1a=k+((k==s.1a)?(s.1a.1I(/\\?/)?"&":"?")+"3m="+j:"")}G(s.L&&O=="2P"){s.1a+=(s.1a.1I(/\\?/)?"&":"?")+s.L;s.L=U}G(s.26&&!D.4O++)D.W.1P("7H");J n=/^(?:\\w+:)?\\/\\/([^\\/?#]+)/;G(s.1O=="1m"&&O=="2P"&&n.11(s.1a)&&n.2D(s.1a)[1]!=5Z.al){J i=S.3H("6w")[0];J h=S.3h("1m");h.4d=s.1a;G(s.7t)h.aj=s.7t;G(!g){J l=Q;h.ah=h.ag=H(){G(!l&&(!7.3f||7.3f=="68"||7.3f=="1J")){l=M;1W();1J();i.37(h)}}}i.3U(h);I 12}J m=Q;J c=1b.7s?2B 7s("ae.ac"):2B 7r();G(s.5Y)c.6R(O,s.1a,s.31,s.5Y,s.3Q);N c.6R(O,s.1a,s.31);1U{G(s.L)c.4B("ab-aa",s.7z);G(s.5S)c.4B("a9-5R-a8",D.4z[s.1a]||"a7, a6 a5 a4 5N:5N:5N a2");c.4B("X-9Z-9Y","7r");c.4B("9W",s.1O&&s.4Q[s.1O]?s.4Q[s.1O]+", */*":s.4Q.4w)}1V(e){}G(s.7m&&s.7m(c,s)===Q){s.26&&D.4O--;c.7l();I Q}G(s.26)D.W.1P("7B",[c,s]);J d=H(a){G(!m&&c&&(c.3f==4||a=="2T")){m=M;G(f){7k(f);f=U}1u=a=="2T"&&"2T"||!D.7j(c)&&"3e"||s.5S&&D.7h(c,s.1a)&&"7J"||"1W";G(1u=="1W"){1U{L=D.6X(c,s.1O,s.9S)}1V(e){1u="5J"}}G(1u=="1W"){J b;1U{b=c.5I("7g-5R")}1V(e){}G(s.5S&&b)D.4z[s.1a]=b;G(!g)1W()}N D.5H(s,c,1u);1J();G(s.31)c=U}};G(s.31){J f=4I(d,13);G(s.2T>0)3B(H(){G(c){c.7l();G(!m)d("2T")}},s.2T)}1U{c.9P(s.L)}1V(e){D.5H(s,c,U,e)}G(!s.31)d();H 1W(){G(s.1W)s.1W(L,1u);G(s.26)D.W.1P("7C",[c,s])}H 1J(){G(s.1J)s.1J(c,1u);G(s.26)D.W.1P("7F",[c,s]);G(s.26&&!--D.4O)D.W.1P("7G")}I c},5H:H(s,a,b,e){G(s.3e)s.3e(a,b,e);G(s.26)D.W.1P("7D",[a,s,e])},4O:0,7j:H(a){1U{I!a.1u&&5Z.9O=="5p:"||(a.1u>=7e&&a.1u<9N)||a.1u==7c||a.1u==9K||D.14.2k&&a.1u==12}1V(e){}I Q},7h:H(a,c){1U{J b=a.5I("7g-5R");I a.1u==7c||b==D.4z[c]||D.14.2k&&a.1u==12}1V(e){}I Q},6X:H(a,c,b){J d=a.5I("9J-O"),2N=c=="2N"||!c&&d&&d.1h("2N")>=0,L=2N?a.9I:a.4U;G(2N&&L.1C.2j=="5J")7p"5J";G(b)L=b(L,c);G(c=="1m")D.5u(L);G(c=="3z")L=6u("("+L+")");I L},3n:H(a){J s=[];G(a.1q==2p||a.5w)D.P(a,H(){s.1p(3u(7.34)+"="+3u(7.2x))});N R(J j 1n a)G(a[j]&&a[j].1q==2p)D.P(a[j],H(){s.1p(3u(j)+"="+3u(7))});N s.1p(3u(j)+"="+3u(D.1D(a[j])?a[j]():a[j]));I s.6s("&").1o(/%20/g,"+")}});D.17.1l({1N:H(c,b){I c?7.2g({1Z:"1N",2h:"1N",1y:"1N"},c,b):7.1E(":1G").P(H(){7.V.18=7.5D||"";G(D.1g(7,"18")=="2F"){J a=D("<"+7.2j+" />").6P("1c");7.V.18=a.1g("18");G(7.V.18=="2F")7.V.18="3I";a.21()}}).3l()},1M:H(b,a){I b?7.2g({1Z:"1M",2h:"1M",1y:"1M"},b,a):7.1E(":4j").P(H(){7.5D=7.5D||D.1g(7,"18");7.V.18="2F"}).3l()},78:D.17.2m,2m:H(a,b){I D.1D(a)&&D.1D(b)?7.78.1w(7,19):a?7.2g({1Z:"2m",2h:"2m",1y:"2m"},a,b):7.P(H(){D(7)[D(7).3F(":1G")?"1N":"1M"]()})},9G:H(b,a){I 7.2g({1Z:"1N"},b,a)},9F:H(b,a){I 7.2g({1Z:"1M"},b,a)},9E:H(b,a){I 7.2g({1Z:"2m"},b,a)},9D:H(b,a){I 7.2g({1y:"1N"},b,a)},9M:H(b,a){I 7.2g({1y:"1M"},b,a)},9C:H(c,a,b){I 7.2g({1y:a},c,b)},2g:H(k,j,i,g){J h=D.77(j,i,g);I 7[h.36===Q?"P":"36"](H(){G(7.16!=1)I Q;J f=D.1l({},h),p,1G=D(7).3F(":1G"),46=7;R(p 1n k){G(k[p]=="1M"&&1G||k[p]=="1N"&&!1G)I f.1J.1k(7);G(p=="1Z"||p=="2h"){f.18=D.1g(7,"18");f.33=7.V.33}}G(f.33!=U)7.V.33="1G";f.45=D.1l({},k);D.P(k,H(c,a){J e=2B D.28(46,f,c);G(/2m|1N|1M/.11(a))e[a=="2m"?1G?"1N":"1M":a](k);N{J b=a.6r().1I(/^([+-]=)?([\\d+-.]+)(.*)$/),2b=e.1t(M)||0;G(b){J d=3d(b[2]),2M=b[3]||"2X";G(2M!="2X"){46.V[c]=(d||1)+2M;2b=((d||1)/e.1t(M))*2b;46.V[c]=2b+2M}G(b[1])d=((b[1]=="-="?-1:1)*d)+2b;e.3G(2b,d,2M)}N e.3G(2b,a,"")}});I M})},36:H(a,b){G(D.1D(a)||(a&&a.1q==2p)){b=a;a="28"}G(!a||(1j a=="23"&&!b))I A(7[0],a);I 7.P(H(){G(b.1q==2p)A(7,a,b);N{A(7,a).1p(b);G(A(7,a).K==1)b.1k(7)}})},9X:H(b,c){J a=D.3O;G(b)7.36([]);7.P(H(){R(J i=a.K-1;i>=0;i--)G(a[i].T==7){G(c)a[i](M);a.7n(i,1)}});G(!c)7.5A();I 7}});J A=H(b,c,a){G(b){c=c||"28";J q=D.L(b,c+"36");G(!q||a)q=D.L(b,c+"36",D.2d(a))}I q};D.17.5A=H(a){a=a||"28";I 7.P(H(){J q=A(7,a);q.4s();G(q.K)q[0].1k(7)})};D.1l({77:H(b,a,c){J d=b&&b.1q==a0?b:{1J:c||!c&&a||D.1D(b)&&b,2u:b,41:c&&a||a&&a.1q!=9t&&a};d.2u=(d.2u&&d.2u.1q==4L?d.2u:D.28.5K[d.2u])||D.28.5K.74;d.5M=d.1J;d.1J=H(){G(d.36!==Q)D(7).5A();G(D.1D(d.5M))d.5M.1k(7)};I d},41:{73:H(p,n,b,a){I b+a*p},5P:H(p,n,b,a){I((-29.9r(p*29.9q)/2)+0.5)*a+b}},3O:[],48:U,28:H(b,c,a){7.15=c;7.T=b;7.1i=a;G(!c.3Z)c.3Z={}}});D.28.44={4D:H(){G(7.15.2Y)7.15.2Y.1k(7.T,7.1z,7);(D.28.2Y[7.1i]||D.28.2Y.4w)(7);G(7.1i=="1Z"||7.1i=="2h")7.T.V.18="3I"},1t:H(a){G(7.T[7.1i]!=U&&7.T.V[7.1i]==U)I 7.T[7.1i];J r=3d(D.1g(7.T,7.1i,a));I r&&r>-9p?r:3d(D.2a(7.T,7.1i))||0},3G:H(c,b,d){7.5V=1z();7.2b=c;7.3l=b;7.2M=d||7.2M||"2X";7.1z=7.2b;7.2S=7.4N=0;7.4D();J e=7;H t(a){I e.2Y(a)}t.T=7.T;D.3O.1p(t);G(D.48==U){D.48=4I(H(){J a=D.3O;R(J i=0;i<a.K;i++)G(!a[i]())a.7n(i--,1);G(!a.K){7k(D.48);D.48=U}},13)}},1N:H(){7.15.3Z[7.1i]=D.1K(7.T.V,7.1i);7.15.1N=M;7.3G(0,7.1t());G(7.1i=="2h"||7.1i=="1Z")7.T.V[7.1i]="9m";D(7.T).1N()},1M:H(){7.15.3Z[7.1i]=D.1K(7.T.V,7.1i);7.15.1M=M;7.3G(7.1t(),0)},2Y:H(a){J t=1z();G(a||t>7.15.2u+7.5V){7.1z=7.3l;7.2S=7.4N=1;7.4D();7.15.45[7.1i]=M;J b=M;R(J i 1n 7.15.45)G(7.15.45[i]!==M)b=Q;G(b){G(7.15.18!=U){7.T.V.33=7.15.33;7.T.V.18=7.15.18;G(D.1g(7.T,"18")=="2F")7.T.V.18="3I"}G(7.15.1M)7.T.V.18="2F";G(7.15.1M||7.15.1N)R(J p 1n 7.15.45)D.1K(7.T.V,p,7.15.3Z[p])}G(b)7.15.1J.1k(7.T);I Q}N{J n=t-7.5V;7.4N=n/7.15.2u;7.2S=D.41[7.15.41||(D.41.5P?"5P":"73")](7.4N,n,0,1,7.15.2u);7.1z=7.2b+((7.3l-7.2b)*7.2S);7.4D()}I M}};D.1l(D.28,{5K:{9l:9j,9i:7e,74:9g},2Y:{2e:H(a){a.T.2e=a.1z},2c:H(a){a.T.2c=a.1z},1y:H(a){D.1K(a.T.V,"1y",a.1z)},4w:H(a){a.T.V[a.1i]=a.1z+a.2M}}});D.17.2i=H(){J b=0,1S=0,T=7[0],3q;G(T)ao(D.14){J d=T.1d,4a=T,1s=T.1s,1Q=T.2z,5U=2k&&3r(5B)<9c&&!/9a/i.11(v),1g=D.2a,3c=1g(T,"30")=="3c";G(T.7y){J c=T.7y();1e(c.1A+29.2f(1Q.1C.2e,1Q.1c.2e),c.1S+29.2f(1Q.1C.2c,1Q.1c.2c));1e(-1Q.1C.6b,-1Q.1C.6a)}N{1e(T.5X,T.5W);1B(1s){1e(1s.5X,1s.5W);G(42&&!/^t(98|d|h)$/i.11(1s.2j)||2k&&!5U)2C(1s);G(!3c&&1g(1s,"30")=="3c")3c=M;4a=/^1c$/i.11(1s.2j)?4a:1s;1s=1s.1s}1B(d&&d.2j&&!/^1c|2K$/i.11(d.2j)){G(!/^96|1T.*$/i.11(1g(d,"18")))1e(-d.2e,-d.2c);G(42&&1g(d,"33")!="4j")2C(d);d=d.1d}G((5U&&(3c||1g(4a,"30")=="5x"))||(42&&1g(4a,"30")!="5x"))1e(-1Q.1c.5X,-1Q.1c.5W);G(3c)1e(29.2f(1Q.1C.2e,1Q.1c.2e),29.2f(1Q.1C.2c,1Q.1c.2c))}3q={1S:1S,1A:b}}H 2C(a){1e(D.2a(a,"6V",M),D.2a(a,"6U",M))}H 1e(l,t){b+=3r(l,10)||0;1S+=3r(t,10)||0}I 3q};D.17.1l({30:H(){J a=0,1S=0,3q;G(7[0]){J b=7.1s(),2i=7.2i(),4c=/^1c|2K$/i.11(b[0].2j)?{1S:0,1A:0}:b.2i();2i.1S-=25(7,\'94\');2i.1A-=25(7,\'aF\');4c.1S+=25(b,\'6U\');4c.1A+=25(b,\'6V\');3q={1S:2i.1S-4c.1S,1A:2i.1A-4c.1A}}I 3q},1s:H(){J a=7[0].1s;1B(a&&(!/^1c|2K$/i.11(a.2j)&&D.1g(a,\'30\')==\'93\'))a=a.1s;I D(a)}});D.P([\'5e\',\'5G\'],H(i,b){J c=\'4y\'+b;D.17[c]=H(a){G(!7[0])I;I a!=12?7.P(H(){7==1b||7==S?1b.92(!i?a:D(1b).2e(),i?a:D(1b).2c()):7[c]=a}):7[0]==1b||7[0]==S?46[i?\'aI\':\'aJ\']||D.71&&S.1C[c]||S.1c[c]:7[0][c]}});D.P(["6N","4b"],H(i,b){J c=i?"5e":"5G",4f=i?"6k":"6i";D.17["5s"+b]=H(){I 7[b.3y()]()+25(7,"57"+c)+25(7,"57"+4f)};D.17["90"+b]=H(a){I 7["5s"+b]()+25(7,"2C"+c+"4b")+25(7,"2C"+4f+"4b")+(a?25(7,"6S"+c)+25(7,"6S"+4f):0)}})})();',62,669,'|||||||this|||||||||||||||||||||||||||||||||||if|function|return|var|length|data|true|else|type|each|false|for|document|elem|null|style|event||nodeName|||test|undefined||browser|options|nodeType|fn|display|arguments|url|window|body|parentNode|add|msie|css|indexOf|prop|typeof|call|extend|script|in|replace|push|constructor|text|offsetParent|cur|status|div|apply|firstChild|opacity|now|left|while|documentElement|isFunction|filter|className|hidden|handle|match|complete|attr|ret|hide|show|dataType|trigger|doc|split|top|table|try|catch|success|break|cache|height||remove|tbody|string|guid|num|global|ready|fx|Math|curCSS|start|scrollTop|makeArray|scrollLeft|max|animate|width|offset|tagName|safari|map|toggle||done|Array|find|toUpperCase|button|special|duration|id|copy|value|handler|ownerDocument|select|new|border|exec|stack|none|opera|nextSibling|pushStack|target|html|inArray|unit|xml|bind|GET|isReady|merge|pos|timeout|delete|one|selected|px|step|jsre|position|async|preventDefault|overflow|name|which|queue|removeChild|namespace|insertBefore|nth|removeData|fixed|parseFloat|error|readyState|multiFilter|createElement|rl|re|trim|end|_|param|first|get|results|parseInt|slice|childNodes|encodeURIComponent|append|events|elems|toLowerCase|json|readyList|setTimeout|grep|mouseenter|color|is|custom|getElementsByTagName|block|stopPropagation|addEventListener|callee|proxy|mouseleave|timers|defaultView|password|disabled|last|has|appendChild|form|domManip|props|ajax|orig|set|easing|mozilla|load|prototype|curAnim|self|charCode|timerId|object|offsetChild|Width|parentOffset|src|unbind|br|currentStyle|clean|float|visible|relatedTarget|previousSibling|handlers|isXMLDoc|on|setup|nodeIndex|unique|shift|javascript|child|RegExp|_default|deep|scroll|lastModified|teardown|setRequestHeader|timeStamp|update|empty|tr|getAttribute|innerHTML|setInterval|checked|fromElement|Number|jQuery|state|active|jsonp|accepts|application|dir|input|responseText|click|styleSheets|unload|not|lastToggle|outline|mouseout|getPropertyValue|mouseover|getComputedStyle|bindReady|String|padding|pageX|metaKey|keyCode|getWH|andSelf|clientX|Left|all|visibility|container|index|init|triggered|removeAttribute|classFilter|prevObject|submit|file|after|windowData|inner|client|globalEval|sibling|jquery|absolute|clone|wrapAll|dequeue|version|triggerHandler|oldblock|ctrlKey|createTextNode|Top|handleError|getResponseHeader|parsererror|speeds|checkbox|old|00|radio|swing|href|Modified|ifModified|lastChild|safari2|startTime|offsetTop|offsetLeft|username|location|ajaxSettings|getElementById|isSimple|values|selectedIndex|runtimeStyle|rsLeft|_load|loaded|DOMContentLoaded|clientTop|clientLeft|toElement|srcElement|val|pageY|POST|unshift|Bottom|clientY|Right|fix|exclusive|detachEvent|cloneNode|removeEventListener|swap|toString|join|attachEvent|eval|substr|head|parse|textarea|reset|image|zoom|odd|even|before|prepend|exclude|expr|quickClass|quickID|uuid|quickChild|continue|Height|textContent|appendTo|contents|open|margin|evalScript|borderTopWidth|borderLeftWidth|parent|httpData|setArray|CSS1Compat|compatMode|boxModel|cssFloat|linear|def|webkit|nodeValue|speed|_toggle|eq|100|replaceWith|304|concat|200|alpha|Last|httpNotModified|getAttributeNode|httpSuccess|clearInterval|abort|beforeSend|splice|styleFloat|throw|colgroup|XMLHttpRequest|ActiveXObject|scriptCharset|callback|fieldset|multiple|processData|getBoundingClientRect|contentType|link|ajaxSend|ajaxSuccess|ajaxError|col|ajaxComplete|ajaxStop|ajaxStart|serializeArray|notmodified|keypress|keydown|change|mouseup|mousedown|dblclick|focus|blur|stylesheet|hasClass|rel|doScroll|black|hover|solid|cancelBubble|returnValue|wheelDelta|view|round|shiftKey|resize|screenY|screenX|relatedNode|mousemove|prevValue|originalTarget|offsetHeight|keyup|newValue|offsetWidth|eventPhase|detail|currentTarget|cancelable|bubbles|attrName|attrChange|altKey|originalEvent|charAt|0n|substring|animated|header|noConflict|line|enabled|innerText|contains|only|weight|font|gt|lt|uFFFF|u0128|size|417|Boolean|Date|toggleClass|removeClass|addClass|removeAttr|replaceAll|insertAfter|prependTo|wrap|contentWindow|contentDocument|iframe|children|siblings|prevAll|wrapInner|nextAll|outer|prev|scrollTo|static|marginTop|next|inline|parents|able|cellSpacing|adobeair|cellspacing|522|maxLength|maxlength|readOnly|400|readonly|fast|600|class|slow|1px|htmlFor|reverse|10000|PI|cos|compatible|Function|setData|ie|ra|it|rv|getData|userAgent|navigator|fadeTo|fadeIn|slideToggle|slideUp|slideDown|ig|responseXML|content|1223|NaN|fadeOut|300|protocol|send|setAttribute|option|dataFilter|cssText|changed|be|Accept|stop|With|Requested|Object|can|GMT|property|1970|Jan|01|Thu|Since|If|Type|Content|XMLHTTP|th|Microsoft|td|onreadystatechange|onload|cap|charset|colg|host|tfoot|specified|with|1_|thead|leg|plain|attributes|opt|embed|urlencoded|www|area|hr|ajaxSetup|meta|post|getJSON|getScript|marginLeft|img|elements|pageYOffset|pageXOffset|abbr|serialize|pixelLeft'.split('|'),0,{}))
//]]>
</script>
<!--PRE-HEAD-START-->
<!--{{{-->	
<?php
	print tiddler_bodyDecode($tiddlers['MarkupPreHead']['body']);
?>	
<!--}}}-->
<!--PRE-HEAD-END-->
<title> My TiddlyWiki - a reusable non-linear personal web notebook </title>
<style id="styleArea" type="text/css">
#saveTest {display:none;}
#messageArea {display:none;}
#copyright {display:none;}
#storeArea {display:none;}
#storeArea div {padding:0.5em; margin:1em 0em 0em 0em; border-color:#fff #666 #444 #ddd; border-style:solid; border-width:2px; overflow:auto;}
#shadowArea {display:none;}
#javascriptWarning {width:100%; text-align:center; font-weight:bold; background-color:#dd1100; color:#fff; padding:1em 0em;}

</style>
<!--POST-HEAD-START-->
<?php
	if( isset( $tiddlers['MarkupPostHead'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostHead']['body']);
	}
?>
<!--POST-HEAD-END-->
</head>
<body onload="main();" onunload="if(window.checkUnsavedChanges) checkUnsavedChanges(); if(window.scrubNodes) scrubNodes(document.body);">
<!--PRE-BODY-START-->
<?php
	if( isset( $tiddlers['MarkupPreBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPreBody']['body']);
	}
?>
<!--PRE-BODY-END-->
<div id="copyright">
Welcome to TiddlyWiki created by Jeremy Ruston, Copyright &copy; 2007 UnaMesa Association
</div>
<noscript>
<div id="javascriptWarning">
This page requires JavaScript to function properly.<br /><br />If you are using Microsoft Internet Explorer you may need to click on the yellow bar above and select 'Allow Blocked Content'. You must then click 'Yes' on the following security warning.
</div>
</noscript>
<div id="saveTest"></div>

<div id="backstageCloak"></div>
<div id="backstageButton"></div>
<div id="backstageArea"><div id="backstageToolbar"></div></div>
<div id="backstage">
	<div id="backstagePanel"></div>
</div>
<div id="contentWrapper"></div>
<div id="contentStash"></div>
<div id="shadowArea">
<div title="MarkupPreHead">
<pre>	
<?php
	print tiddler_bodyDecode($tiddlers['MarkupPreHead']['body']);
?>
</pre>
</div>
<div title="ColorPalette">
<pre>Background: #fff
Foreground: #000
PrimaryPale: #8cf
PrimaryLight: #18f
PrimaryMid: #04b
PrimaryDark: #014
SecondaryPale: #ffc
SecondaryLight: #fe8
SecondaryMid: #db4
SecondaryDark: #841
TertiaryPale: #eee
TertiaryLight: #ccc
TertiaryMid: #999
TertiaryDark: #666
Error: #f88</pre>
</div>
<div title="StyleSheetColors">
<pre>/*{{{*/
body {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}

a {color:[[ColorPalette::PrimaryMid]];}
a:hover {background-color:[[ColorPalette::PrimaryMid]]; color:[[ColorPalette::Background]];}
a img {border:0;}

h1,h2,h3,h4,h5,h6 {color:[[ColorPalette::SecondaryDark]]; background:transparent;}
h1 {border-bottom:2px solid [[ColorPalette::TertiaryLight]];}
h2,h3 {border-bottom:1px solid [[ColorPalette::TertiaryLight]];}

.button {color:[[ColorPalette::PrimaryDark]]; border:1px solid [[ColorPalette::Background]];}
.button:hover {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::SecondaryLight]]; border-color:[[ColorPalette::SecondaryMid]];}
.button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::SecondaryDark]];}

.header {background:[[ColorPalette::PrimaryMid]];}
.headerShadow {color:[[ColorPalette::Foreground]];}
.headerShadow a {font-weight:normal; color:[[ColorPalette::Foreground]];}
.headerForeground {color:[[ColorPalette::Background]];}
.headerForeground a {font-weight:normal; color:[[ColorPalette::PrimaryPale]];}

.tabSelected{color:[[ColorPalette::PrimaryDark]];
	background:[[ColorPalette::TertiaryPale]];
	border-left:1px solid [[ColorPalette::TertiaryLight]];
	border-top:1px solid [[ColorPalette::TertiaryLight]];
	border-right:1px solid [[ColorPalette::TertiaryLight]];
}
.tabUnselected {color:[[ColorPalette::Background]]; background:[[ColorPalette::TertiaryMid]];}
.tabContents {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::TertiaryPale]]; border:1px solid [[ColorPalette::TertiaryLight]];}
.tabContents .button {border:0;}

#sidebar {}
#sidebarOptions input {border:1px solid [[ColorPalette::PrimaryMid]];}
#sidebarOptions .sliderPanel {background:[[ColorPalette::PrimaryPale]];}
#sidebarOptions .sliderPanel a {border:none;color:[[ColorPalette::PrimaryMid]];}
#sidebarOptions .sliderPanel a:hover {color:[[ColorPalette::Background]]; background:[[ColorPalette::PrimaryMid]];}
#sidebarOptions .sliderPanel a:active {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::Background]];}

.wizard {background:[[ColorPalette::PrimaryPale]]; border:1px solid [[ColorPalette::PrimaryMid]];}
.wizard h1 {color:[[ColorPalette::PrimaryDark]]; border:none;}
.wizard h2 {color:[[ColorPalette::Foreground]]; border:none;}
.wizardStep {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];
	border:1px solid [[ColorPalette::PrimaryMid]];}
.wizardStep.wizardStepDone {background:[[ColorPalette::TertiaryLight]];}
.wizardFooter {background:[[ColorPalette::PrimaryPale]];}
.wizardFooter .status {background:[[ColorPalette::PrimaryDark]]; color:[[ColorPalette::Background]];}
.wizard .button {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryLight]]; border: 1px solid;
	border-color:[[ColorPalette::SecondaryPale]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryDark]] [[ColorPalette::SecondaryPale]];}
.wizard .button:hover {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Background]];}
.wizard .button:active {color:[[ColorPalette::Background]]; background:[[ColorPalette::Foreground]]; border: 1px solid;
	border-color:[[ColorPalette::PrimaryDark]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryPale]] [[ColorPalette::PrimaryDark]];}

.wizard .notChanged {background:transparent;}
.wizard .changedLocally {background:#80ff80;}
.wizard .changedServer {background:#8080ff;}
.wizard .changedBoth {background:#ff8080;}
.wizard .notFound {background:#ffff80;}
.wizard .putToServer {background:#ff80ff;}
.wizard .gotFromServer {background:#80ffff;}

#messageArea {border:1px solid [[ColorPalette::SecondaryMid]]; background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]];}
#messageArea .button {color:[[ColorPalette::PrimaryMid]]; background:[[ColorPalette::SecondaryPale]]; border:none;}

.popupTiddler {background:[[ColorPalette::TertiaryPale]]; border:2px solid [[ColorPalette::TertiaryMid]];}

.popup {background:[[ColorPalette::TertiaryPale]]; color:[[ColorPalette::TertiaryDark]]; border-left:1px solid [[ColorPalette::TertiaryMid]]; border-top:1px solid [[ColorPalette::TertiaryMid]]; border-right:2px solid [[ColorPalette::TertiaryDark]]; border-bottom:2px solid [[ColorPalette::TertiaryDark]];}
.popup hr {color:[[ColorPalette::PrimaryDark]]; background:[[ColorPalette::PrimaryDark]]; border-bottom:1px;}
.popup li.disabled {color:[[ColorPalette::TertiaryMid]];}
.popup li a, .popup li a:visited {color:[[ColorPalette::Foreground]]; border: none;}
.popup li a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border: none;}
.popup li a:active {background:[[ColorPalette::SecondaryPale]]; color:[[ColorPalette::Foreground]]; border: none;}
.popupHighlight {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}
.listBreak div {border-bottom:1px solid [[ColorPalette::TertiaryDark]];}

.tiddler .defaultCommand {font-weight:bold;}

.shadow .title {color:[[ColorPalette::TertiaryDark]];}

.title {color:[[ColorPalette::SecondaryDark]];}
.subtitle {color:[[ColorPalette::TertiaryDark]];}

.toolbar {color:[[ColorPalette::PrimaryMid]];}
.toolbar a {color:[[ColorPalette::TertiaryLight]];}
.selected .toolbar a {color:[[ColorPalette::TertiaryMid]];}
.selected .toolbar a:hover {color:[[ColorPalette::Foreground]];}

.tagging, .tagged {border:1px solid [[ColorPalette::TertiaryPale]]; background-color:[[ColorPalette::TertiaryPale]];}
.selected .tagging, .selected .tagged {background-color:[[ColorPalette::TertiaryLight]]; border:1px solid [[ColorPalette::TertiaryMid]];}
.tagging .listTitle, .tagged .listTitle {color:[[ColorPalette::PrimaryDark]];}
.tagging .button, .tagged .button {border:none;}

.footer {color:[[ColorPalette::TertiaryLight]];}
.selected .footer {color:[[ColorPalette::TertiaryMid]];}

.sparkline {background:[[ColorPalette::PrimaryPale]]; border:0;}
.sparktick {background:[[ColorPalette::PrimaryDark]];}

.error, .errorButton {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::Error]];}
.warning {color:[[ColorPalette::Foreground]]; background:[[ColorPalette::SecondaryPale]];}
.lowlight {background:[[ColorPalette::TertiaryLight]];}

.zoomer {background:none; color:[[ColorPalette::TertiaryMid]]; border:3px solid [[ColorPalette::TertiaryMid]];}

.imageLink, #displayArea .imageLink {background:transparent;}

.annotation {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; border:2px solid [[ColorPalette::SecondaryMid]];}

.viewer .listTitle {list-style-type:none; margin-left:-2em;}
.viewer .button {border:1px solid [[ColorPalette::SecondaryMid]];}
.viewer blockquote {border-left:3px solid [[ColorPalette::TertiaryDark]];}

.viewer table, table.twtable {border:2px solid [[ColorPalette::TertiaryDark]];}
.viewer th, .viewer thead td, .twtable th, .twtable thead td {background:[[ColorPalette::SecondaryMid]]; border:1px solid [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::Background]];}
.viewer td, .viewer tr, .twtable td, .twtable tr {border:1px solid [[ColorPalette::TertiaryDark]];}

.viewer pre {border:1px solid [[ColorPalette::SecondaryLight]]; background:[[ColorPalette::SecondaryPale]];}
.viewer code {color:[[ColorPalette::SecondaryDark]];}
.viewer hr {border:0; border-top:dashed 1px [[ColorPalette::TertiaryDark]]; color:[[ColorPalette::TertiaryDark]];}

.highlight, .marked {background:[[ColorPalette::SecondaryLight]];}

.editor input {border:1px solid [[ColorPalette::PrimaryMid]];}
.editor textarea {border:1px solid [[ColorPalette::PrimaryMid]]; width:100%;}
.editorFooter {color:[[ColorPalette::TertiaryMid]];}

#backstageArea {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::TertiaryMid]];}
#backstageArea a {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}
#backstageArea a:hover {background:[[ColorPalette::SecondaryLight]]; color:[[ColorPalette::Foreground]]; }
#backstageArea a.backstageSelTab {background:[[ColorPalette::Background]]; color:[[ColorPalette::Foreground]];}
#backstageButton a {background:none; color:[[ColorPalette::Background]]; border:none;}
#backstageButton a:hover {background:[[ColorPalette::Foreground]]; color:[[ColorPalette::Background]]; border:none;}
#backstagePanel {background:[[ColorPalette::Background]]; border-color: [[ColorPalette::Background]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]] [[ColorPalette::TertiaryDark]];}
.backstagePanelFooter .button {border:none; color:[[ColorPalette::Background]];}
.backstagePanelFooter .button:hover {color:[[ColorPalette::Foreground]];}
#backstageCloak {background:[[ColorPalette::Foreground]]; opacity:0.6; filter:'alpha(opacity:60)';}
/*}}}*/</pre>
</div>
<div title="StyleSheetLayout">
<pre>/*{{{*/
* html .tiddler {height:1%;}

body {font-size:.75em; font-family:arial,helvetica; margin:0; padding:0;}

h1,h2,h3,h4,h5,h6 {font-weight:bold; text-decoration:none;}
h1,h2,h3 {padding-bottom:1px; margin-top:1.2em;margin-bottom:0.3em;}
h4,h5,h6 {margin-top:1em;}
h1 {font-size:1.35em;}
h2 {font-size:1.25em;}
h3 {font-size:1.1em;}
h4 {font-size:1em;}
h5 {font-size:.9em;}

hr {height:1px;}

a {text-decoration:none;}

dt {font-weight:bold;}

ol {list-style-type:decimal;}
ol ol {list-style-type:lower-alpha;}
ol ol ol {list-style-type:lower-roman;}
ol ol ol ol {list-style-type:decimal;}
ol ol ol ol ol {list-style-type:lower-alpha;}
ol ol ol ol ol ol {list-style-type:lower-roman;}
ol ol ol ol ol ol ol {list-style-type:decimal;}

.txtOptionInput {width:11em;}

#contentWrapper .chkOptionInput {border:0;}

.externalLink {text-decoration:underline;}

.indent {margin-left:3em;}
.outdent {margin-left:3em; text-indent:-3em;}
code.escaped {white-space:nowrap;}

.tiddlyLinkExisting {font-weight:bold;}
.tiddlyLinkNonExisting {font-style:italic;}

/* the 'a' is required for IE, otherwise it renders the whole tiddler in bold */
a.tiddlyLinkNonExisting.shadow {font-weight:bold;}

#mainMenu .tiddlyLinkExisting,
	#mainMenu .tiddlyLinkNonExisting,
	#sidebarTabs .tiddlyLinkNonExisting {font-weight:normal; font-style:normal;}
#sidebarTabs .tiddlyLinkExisting {font-weight:bold; font-style:normal;}

.header {position:relative;}
.header a:hover {background:transparent;}
.headerShadow {position:relative; padding:4.5em 0em 1em 1em; left:-1px; top:-1px;}
.headerForeground {position:absolute; padding:4.5em 0em 1em 1em; left:0px; top:0px;}

.siteTitle {font-size:3em;}
.siteSubtitle {font-size:1.2em;}

#mainMenu {position:absolute; left:0; width:10em; text-align:right; line-height:1.6em; padding:1.5em 0.5em 0.5em 0.5em; font-size:1.1em;}

#sidebar {position:absolute; right:3px; width:16em; font-size:.9em;}
#sidebarOptions {padding-top:0.3em;}
#sidebarOptions a {margin:0em 0.2em; padding:0.2em 0.3em; display:block;}
#sidebarOptions input {margin:0.4em 0.5em;}
#sidebarOptions .sliderPanel {margin-left:1em; padding:0.5em; font-size:.85em;}
#sidebarOptions .sliderPanel a {font-weight:bold; display:inline; padding:0;}
#sidebarOptions .sliderPanel input {margin:0 0 .3em 0;}
#sidebarTabs .tabContents {width:15em; overflow:hidden;}

.wizard {padding:0.1em 1em 0em 2em;}
.wizard h1 {font-size:2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}
.wizard h2 {font-size:1.2em; font-weight:bold; background:none; padding:0em 0em 0em 0em; margin:0.4em 0em 0.2em 0em;}
.wizardStep {padding:1em 1em 1em 1em;}
.wizard .button {margin:0.5em 0em 0em 0em; font-size:1.2em;}
.wizardFooter {padding:0.8em 0.4em 0.8em 0em;}
.wizardFooter .status {padding:0em 0.4em 0em 0.4em; margin-left:1em;}
.wizard .button {padding:0.1em 0.2em 0.1em 0.2em;}

#messageArea {position:fixed; top:2em; right:0em; margin:0.5em; padding:0.5em; z-index:2000; _position:absolute;}
.messageToolbar {display:block; text-align:right; padding:0.2em 0.2em 0.2em 0.2em;}
#messageArea a {text-decoration:underline;}

.tiddlerPopupButton {padding:0.2em 0.2em 0.2em 0.2em;}
.popupTiddler {position: absolute; z-index:300; padding:1em 1em 1em 1em; margin:0;}

.popup {position:absolute; z-index:300; font-size:.9em; padding:0; list-style:none; margin:0;}
.popup .popupMessage {padding:0.4em;}
.popup hr {display:block; height:1px; width:auto; padding:0; margin:0.2em 0em;}
.popup li.disabled {padding:0.4em;}
.popup li a {display:block; padding:0.4em; font-weight:normal; cursor:pointer;}
.listBreak {font-size:1px; line-height:1px;}
.listBreak div {margin:2px 0;}

.tabset {padding:1em 0em 0em 0.5em;}
.tab {margin:0em 0em 0em 0.25em; padding:2px;}
.tabContents {padding:0.5em;}
.tabContents ul, .tabContents ol {margin:0; padding:0;}
.txtMainTab .tabContents li {list-style:none;}
.tabContents li.listLink { margin-left:.75em;}

#contentWrapper {display:block;}
#splashScreen {display:none;}

#displayArea {margin:1em 17em 0em 14em;}

.toolbar {text-align:right; font-size:.9em;}

.tiddler {padding:1em 1em 0em 1em;}

.missing .viewer,.missing .title {font-style:italic;}

.title {font-size:1.6em; font-weight:bold;}

.missing .subtitle {display:none;}
.subtitle {font-size:1.1em;}

.tiddler .button {padding:0.2em 0.4em;}

.tagging {margin:0.5em 0.5em 0.5em 0; float:left; display:none;}
.isTag .tagging {display:block;}
.tagged {margin:0.5em; float:right;}
.tagging, .tagged {font-size:0.9em; padding:0.25em;}
.tagging ul, .tagged ul {list-style:none; margin:0.25em; padding:0;}
.tagClear {clear:both;}

.footer {font-size:.9em;}
.footer li {display:inline;}

.annotation {padding:0.5em; margin:0.5em;}

* html .viewer pre {width:99%; padding:0 0 1em 0;}
.viewer {line-height:1.4em; padding-top:0.5em;}
.viewer .button {margin:0em 0.25em; padding:0em 0.25em;}
.viewer blockquote {line-height:1.5em; padding-left:0.8em;margin-left:2.5em;}
.viewer ul, .viewer ol {margin-left:0.5em; padding-left:1.5em;}

.viewer table, table.twtable {border-collapse:collapse; margin:0.8em 1.0em;}
.viewer th, .viewer td, .viewer tr,.viewer caption,.twtable th, .twtable td, .twtable tr,.twtable caption {padding:3px;}
table.listView {font-size:0.85em; margin:0.8em 1.0em;}
table.listView th, table.listView td, table.listView tr {padding:0px 3px 0px 3px;}

.viewer pre {padding:0.5em; margin-left:0.5em; font-size:1.2em; line-height:1.4em; overflow:auto;}
.viewer code {font-size:1.2em; line-height:1.4em;}

.editor {font-size:1.1em;}
.editor input, .editor textarea {display:block; width:100%; font:inherit;}
.editorFooter {padding:0.25em 0em; font-size:.9em;}
.editorFooter .button {padding-top:0px; padding-bottom:0px;}

.fieldsetFix {border:0; padding:0; margin:1px 0px 1px 0px;}

.sparkline {line-height:1em;}
.sparktick {outline:0;}

.zoomer {font-size:1.1em; position:absolute; overflow:hidden;}
.zoomer div {padding:1em;}

* html #backstage {width:99%;}
* html #backstageArea {width:99%;}
#backstageArea {display:none; position:relative; overflow: hidden; z-index:150; padding:0.3em 0.5em 0.3em 0.5em;}
#backstageToolbar {position:relative;}
#backstageArea a {font-weight:bold; margin-left:0.5em; padding:0.3em 0.5em 0.3em 0.5em;}
#backstageButton {display:none; position:absolute; z-index:175; top:0em; right:0em;}
#backstageButton a {padding:0.1em 0.4em 0.1em 0.4em; margin:0.1em 0.1em 0.1em 0.1em;}
#backstage {position:relative; width:100%; z-index:50;}
#backstagePanel {display:none; z-index:100; position:absolute; width:90%; margin:0em 3em 0em 3em; padding:1em 1em 1em 1em;}
.backstagePanelFooter {padding-top:0.2em; float:right;}
.backstagePanelFooter a {padding:0.2em 0.4em 0.2em 0.4em;}
#backstageCloak {display:none; z-index:20; position:absolute; width:100%; height:100px;}

.whenBackstage {display:none;}
.backstageVisible .whenBackstage {display:block;}
/*}}}*/</pre>
</div>
<div title="StyleSheetLocale">
<pre>/***
StyleSheet for use when a translation requires any css style changes.
This StyleSheet can be used directly by languages such as Chinese, Japanese and Korean which need larger font sizes.
***/
/*{{{*/
body {font-size:0.8em;}
#sidebarOptions {font-size:1.05em;}
#sidebarOptions a {font-style:normal;}
#sidebarOptions .sliderPanel {font-size:0.95em;}
.subtitle {font-size:0.8em;}
.viewer table.listView {font-size:0.95em;}
/*}}}*/</pre>
</div>

<div title="StyleSheetPrint">
<pre>/*{{{*/
@media print {
#mainMenu, #sidebar, #messageArea, .toolbar, #backstageButton, #backstageArea {display: none ! important;}
#displayArea {margin: 1em 1em 0em 1em;}
/* Fixes a feature in Firefox 1.5.0.2 where print preview displays the noscript content */
noscript {display:none;}
}
/*}}}*/</pre>
</div>
<div title="PageTemplate">
<pre>&lt;!--{{{--&gt;
&lt;div class='header' macro='gradient vert [[ColorPalette::PrimaryLight]] [[ColorPalette::PrimaryMid]]'&gt;
&lt;div class='headerShadow'&gt;
&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;
&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;

&lt;/div&gt;
&lt;div class='headerForeground'&gt;
&lt;span class='siteTitle' refresh='content' tiddler='SiteTitle'&gt;&lt;/span&gt;&amp;nbsp;
&lt;span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'&gt;&lt;/span&gt;
&lt;/div&gt;
&lt;/div&gt;
&lt;div id='mainMenu' refresh='content' tiddler='MainMenu'&gt;&lt;/div&gt;

&lt;div id='sidebar'&gt;
&lt;div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'&gt;&lt;/div&gt;
&lt;div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'&gt;&lt;/div&gt;
&lt;/div&gt;
&lt;div id='displayArea'&gt;
&lt;div id='messageArea'&gt;&lt;/div&gt;
&lt;div id='tiddlerDisplay'&gt;&lt;/div&gt;

&lt;/div&gt;
&lt;!--}}}--&gt;</pre>
</div>
<div title="ViewTemplate">
<pre>&lt;!--{{{--&gt;
&lt;div class='toolbar' macro='toolbar [[ToolbarCommands::ViewToolbar]]'&gt;&lt;/div&gt;
&lt;div class='title' macro='view title'&gt;&lt;/div&gt;
&lt;div class='subtitle'&gt;&lt;span macro='view modifier link'&gt;&lt;/span&gt;, &lt;span macro='view modified date'&gt;&lt;/span&gt; (&lt;span macro='message views.wikified.createdPrompt'&gt;&lt;/span&gt; &lt;span macro='view created date'&gt;&lt;/span&gt;)&lt;/div&gt;

&lt;div class='tagging' macro='tagging'&gt;&lt;/div&gt;
&lt;div class='tagged' macro='tags'&gt;&lt;/div&gt;
&lt;div class='viewer' macro='view text wikified'&gt;&lt;/div&gt;
&lt;div class='tagClear'&gt;&lt;/div&gt;
&lt;!--}}}--&gt;</pre>
</div>
<div title="EditTemplate">
<pre>&lt;!--{{{--&gt;

&lt;div class='toolbar' macro='toolbar [[ToolbarCommands::EditToolbar]]'&gt;&lt;/div&gt;
&lt;div class='title' macro='view title'&gt;&lt;/div&gt;
&lt;div class='editor' macro='edit title'&gt;&lt;/div&gt;
&lt;div macro='annotations'&gt;&lt;/div&gt;
&lt;div class='editor' macro='edit text'&gt;&lt;/div&gt;
&lt;div class='editor' macro='edit tags'&gt;&lt;/div&gt;&lt;div class='editorFooter'&gt;&lt;span macro='message views.editor.tagPrompt'&gt;&lt;/span&gt;&lt;span macro='tagChooser excludeLists'&gt;&lt;/span&gt;&lt;/div&gt;

&lt;!--}}}--&gt;</pre>
</div>
<div title="GettingStarted">
<pre>To get started with this blank TiddlyWiki, you'll need to modify the following tiddlers:
* SiteTitle &amp; SiteSubtitle: The title and subtitle of the site, as shown above (after saving, they will also appear in the browser title bar)
* MainMenu: The menu (usually on the left)
* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the TiddlyWiki is opened
You'll also need to enter your username for signing your edits: &lt;&lt;option txtUserName&gt;&gt;</pre>
</div>
<div title="OptionsPanel">
<pre>These InterfaceOptions for customising TiddlyWiki are saved in your browser

Your username for signing your edits. Write it as a WikiWord (eg JoeBloggs)

&lt;&lt;option txtUserName&gt;&gt;
&lt;&lt;option chkSaveBackups&gt;&gt; SaveBackups

&lt;&lt;option chkAutoSave&gt;&gt; AutoSave
&lt;&lt;option chkRegExpSearch&gt;&gt; RegExpSearch
&lt;&lt;option chkCaseSensitiveSearch&gt;&gt; CaseSensitiveSearch
&lt;&lt;option chkAnimate&gt;&gt; EnableAnimations

----
Also see AdvancedOptions</pre>
</div>
<div title="ImportTiddlers">
<pre>&lt;&lt;importTiddlers&gt;&gt;</pre>

</div>
</div>
<!--POST-SHADOWAREA-->
<div id="storeArea">
<?php
include_once($cct_base."includes/include.php");
?>
</div>
<!--POST-STOREAREA-->
<!--POST-BODY-START-->
<?php
	if( isset( $tiddlers['MarkupPostBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostBody']['body']);
	}
?>
<!--POST-BODY-END-->
<script id="jsArea" type="text/javascript">
//<![CDATA[
//
// Please note:
//
// * This code is designed to be readable but for compactness it only includes brief comments. You can see fuller comments
//   in the project Subversion repository at http://svn.tiddlywiki.org/Trunk/core/
//
// * You should never need to modify this source code directly. TiddlyWiki is carefully designed to allow deep customisation
//   without changing the core code. Please consult the development group at http://groups.google.com/group/TiddlyWikiDev
//

//--
//-- Configuration repository
//--

// Miscellaneous options
var config = {
	numRssItems: 20, // Number of items in the RSS feed
	animDuration: 400, // Duration of UI animations in milliseconds
	cascadeFast: 20, // Speed for cascade animations (higher == slower)
	cascadeSlow: 60, // Speed for EasterEgg cascade animations
	cascadeDepth: 5, // Depth of cascade animation
	locale: "en" // W3C language tag
};

// Hashmap of alternative parsers for the wikifier
config.parsers = {};

// Adaptors
config.adaptors = {};
config.defaultAdaptor = null;

// Backstage tasks
config.tasks = {};

// Annotations
config.annotations = {};

// Custom fields to be automatically added to new tiddlers
config.defaultCustomFields = {};

// Messages
config.messages = {
	messageClose: {},
	dates: {},
	tiddlerPopup: {}
};

// Options that can be set in the options panel and/or cookies
config.options = {
	chkRegExpSearch: false,
	chkCaseSensitiveSearch: false,
	chkIncrementalSearch: true,
	chkAnimate: true,
	chkSaveBackups: true,
	chkAutoSave: false,
	chkGenerateAnRssFeed: false,
	chkSaveEmptyTemplate: false,
	chkOpenInNewWindow: true,
	chkToggleLinks: false,
	chkHttpReadOnly: true,
	chkForceMinorUpdate: false,
	chkConfirmDelete: true,
	chkInsertTabs: false,
	chkUsePreForStorage: true, // Whether to use <pre> format for storage
	chkDisplayInstrumentation: false,
	txtBackupFolder: "",
	txtEditorFocus: "text",
	txtMainTab: "tabTimeline",
	txtMoreTab: "moreTabAll",
	txtMaxEditRows: "30",
	txtFileSystemCharSet: "UTF-8",
	txtTheme: ""
	};
config.optionsDesc = {};

// Default tiddler templates
var DEFAULT_VIEW_TEMPLATE = 1;
var DEFAULT_EDIT_TEMPLATE = 2;
config.tiddlerTemplates = {
	1: "ViewTemplate",
	2: "EditTemplate"
};

// More messages (rather a legacy layout that should not really be like this)
config.views = {
	wikified: {
		tag: {}
	},
	editor: {
		tagChooser: {}
	}
};

// Backstage tasks
config.backstageTasks = ["save","sync","importTask","tweak","upgrade","plugins"];

// Extensions
config.extensions = {};

// Macros; each has a 'handler' member that is inserted later
config.macros = {
	today: {},
	version: {},
	search: {sizeTextbox: 15},
	tiddler: {},
	tag: {},
	tags: {},
	tagging: {},
	timeline: {},
	allTags: {},
	list: {
		all: {},
		missing: {},
		orphans: {},
		shadowed: {},
		touched: {},
		filter: {}
	},
	closeAll: {},
	permaview: {},
	saveChanges: {},
	slider: {},
	option: {},
	options: {},
	newTiddler: {},
	newJournal: {},
	tabs: {},
	gradient: {},
	message: {},
	view: {defaultView: "text"},
	edit: {},
	tagChooser: {},
	toolbar: {},
	plugins: {},
	refreshDisplay: {},
	importTiddlers: {},
	upgrade: {
		source: "http://www.tiddlywiki.com/upgrade/",
		backupExtension: "pre.core.upgrade"
	},
	sync: {},
	annotations: {}
};

// Commands supported by the toolbar macro
config.commands = {
	closeTiddler: {},
	closeOthers: {},
	editTiddler: {},
	saveTiddler: {hideReadOnly: true},
	cancelTiddler: {},
	deleteTiddler: {hideReadOnly: true},
	permalink: {},
	references: {type: "popup"},
	jump: {type: "popup"},
	syncing: {type: "popup"},
	fields: {type: "popup"}
};

// Browser detection... In a very few places, there's nothing else for it but to know what browser we're using.
config.userAgent = navigator.userAgent.toLowerCase();
config.browser = {
	isIE: config.userAgent.indexOf("msie") != -1 && config.userAgent.indexOf("opera") == -1,
	isGecko: config.userAgent.indexOf("gecko") != -1,
	ieVersion: /MSIE (\d.\d)/i.exec(config.userAgent), // config.browser.ieVersion[1], if it exists, will be the IE version string, eg "6.0"
	isSafari: config.userAgent.indexOf("applewebkit") != -1,
	isBadSafari: !((new RegExp("[\u0150\u0170]","g")).test("\u0150")),
	firefoxDate: /gecko\/(\d{8})/i.exec(config.userAgent), // config.browser.firefoxDate[1], if it exists, will be Firefox release date as "YYYYMMDD"
	isOpera: config.userAgent.indexOf("opera") != -1,
	isLinux: config.userAgent.indexOf("linux") != -1,
	isUnix: config.userAgent.indexOf("x11") != -1,
	isMac: config.userAgent.indexOf("mac") != -1,
	isWindows: config.userAgent.indexOf("win") != -1
};

// Basic regular expressions
config.textPrimitives = {
	upperLetter: "[A-Z\u00c0-\u00de\u0150\u0170]",
	lowerLetter: "[a-z0-9_\\-\u00df-\u00ff\u0151\u0171]",
	anyLetter:   "[A-Za-z0-9_\\-\u00c0-\u00de\u00df-\u00ff\u0150\u0170\u0151\u0171]",
	anyLetterStrict: "[A-Za-z0-9\u00c0-\u00de\u00df-\u00ff\u0150\u0170\u0151\u0171]"
};
if(config.browser.isBadSafari) {
	config.textPrimitives = {
		upperLetter: "[A-Z\u00c0-\u00de]",
		lowerLetter: "[a-z0-9_\\-\u00df-\u00ff]",
		anyLetter:   "[A-Za-z0-9_\\-\u00c0-\u00de\u00df-\u00ff]",
		anyLetterStrict: "[A-Za-z0-9\u00c0-\u00de\u00df-\u00ff]"
	};
}
config.textPrimitives.sliceSeparator = "::";
config.textPrimitives.sectionSeparator = "##";
config.textPrimitives.urlPattern = "(?:file|http|https|mailto|ftp|irc|news|data):[^\\s'\"]+(?:/|\\b)";
config.textPrimitives.unWikiLink = "~";
config.textPrimitives.wikiLink = "(?:(?:" + config.textPrimitives.upperLetter + "+" +
	config.textPrimitives.lowerLetter + "+" +
	config.textPrimitives.upperLetter +
	config.textPrimitives.anyLetter + "*)|(?:" +
	config.textPrimitives.upperLetter + "{2,}" +
	config.textPrimitives.lowerLetter + "+))";

config.textPrimitives.cssLookahead = "(?:(" + config.textPrimitives.anyLetter + "+)\\(([^\\)\\|\\n]+)(?:\\):))|(?:(" + config.textPrimitives.anyLetter + "+):([^;\\|\\n]+);)";
config.textPrimitives.cssLookaheadRegExp = new RegExp(config.textPrimitives.cssLookahead,"mg");

config.textPrimitives.brackettedLink = "\\[\\[([^\\]]+)\\]\\]";
config.textPrimitives.titledBrackettedLink = "\\[\\[([^\\[\\]\\|]+)\\|([^\\[\\]\\|]+)\\]\\]";
config.textPrimitives.tiddlerForcedLinkRegExp = new RegExp("(?:" + config.textPrimitives.titledBrackettedLink + ")|(?:" +
	config.textPrimitives.brackettedLink + ")|(?:" +
	config.textPrimitives.urlPattern + ")","mg");
config.textPrimitives.tiddlerAnyLinkRegExp = new RegExp("("+ config.textPrimitives.wikiLink + ")|(?:" +
	config.textPrimitives.titledBrackettedLink + ")|(?:" +
	config.textPrimitives.brackettedLink + ")|(?:" +
	config.textPrimitives.urlPattern + ")","mg");

config.glyphs = {
	browsers: [
		function() {return config.browser.isIE;},
		function() {return true;}
	],
	currBrowser: null,
	codes: {
		downTriangle: ["\u25BC","\u25BE"],
		downArrow: ["\u2193","\u2193"],
		bentArrowLeft: ["\u2190","\u21A9"],
		bentArrowRight: ["\u2192","\u21AA"]
	}
};

//--
//-- Shadow tiddlers
//--

config.shadowTiddlers = {
	StyleSheet: "",
	MarkupPreHead: "",
	MarkupPostHead: "",
	MarkupPreBody: "",
	MarkupPostBody: "",
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	AdvancedOptions: '<<options>>',
	PluginManager: '<<plugins>>',
	ToolbarCommands: '|~ViewToolbar|closeTiddler closeOthers +editTiddler > fields syncing permalink references jump|\n|~EditToolbar|+saveTiddler -cancelTiddler deleteTiddler|'
};

//--
//-- Translateable strings
//--

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

merge(config.options,{
	txtUserName: "YourName"});

merge(config.tasks,{
	save: {text: "save", tooltip: "Save your changes to this TiddlyWiki", action: saveChanges},
	sync: {text: "sync", tooltip: "Synchronise changes with other TiddlyWiki files and servers", content: '<<sync>>'},
	importTask: {text: "import", tooltip: "Import tiddlers and plugins from other TiddlyWiki files and servers", content: '<<importTiddlers>>'},
	tweak: {text: "tweak", tooltip: "Tweak the appearance and behaviour of TiddlyWiki", content: '<<options>>'},
	upgrade: {text: "upgrade", tooltip: "Upgrade TiddlyWiki core code", content: '<<upgrade>>'},
	plugins: {text: "plugins", tooltip: "Manage installed plugins", content: '<<plugins>>'}
});

// Options that can be set in the options panel and/or cookies
merge(config.optionsDesc,{
	txtUserName: "Username for signing your edits",
	chkRegExpSearch: "Enable regular expressions for searches",
	chkCaseSensitiveSearch: "Case-sensitive searching",
	chkIncrementalSearch: "Incremental key-by-key searching",
	chkAnimate: "Enable animations",
	chkSaveBackups: "Keep backup file when saving changes",
	chkAutoSave: "Automatically save changes",
	chkGenerateAnRssFeed: "Generate an RSS feed when saving changes",
	chkSaveEmptyTemplate: "Generate an empty template when saving changes",
	chkOpenInNewWindow: "Open external links in a new window",
	chkToggleLinks: "Clicking on links to open tiddlers causes them to close",
	chkHttpReadOnly: "Hide editing features when viewed over HTTP",
	chkForceMinorUpdate: "Don't update modifier username and date when editing tiddlers",
	chkConfirmDelete: "Require confirmation before deleting tiddlers",
	chkInsertTabs: "Use the tab key to insert tab characters instead of moving between fields",
	txtBackupFolder: "Name of folder to use for backups",
	txtMaxEditRows: "Maximum number of rows in edit boxes",
	txtFileSystemCharSet: "Default character set for saving changes (Firefox/Mozilla only)"});

merge(config.messages,{
	customConfigError: "Problems were encountered loading plugins. See PluginManager for details",
	pluginError: "Error: %0",
	pluginDisabled: "Not executed because disabled via 'systemConfigDisable' tag",
	pluginForced: "Executed because forced via 'systemConfigForce' tag",
	pluginVersionError: "Not executed because this plugin needs a newer version of TiddlyWiki",
	nothingSelected: "Nothing is selected. You must select one or more items first",
	savedSnapshotError: "It appears that this TiddlyWiki has been incorrectly saved. Please see http://www.tiddlywiki.com/#Download for details",
	subtitleUnknown: "(unknown)",
	undefinedTiddlerToolTip: "The tiddler '%0' doesn't yet exist",
	shadowedTiddlerToolTip: "The tiddler '%0' doesn't yet exist, but has a pre-defined shadow value",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "External link to %0",
	noTags: "There are no tagged tiddlers",
	notFileUrlError: "You need to save this TiddlyWiki to a file before you can save changes",
	cantSaveError: "It's not possible to save changes. Possible reasons include:\n- your browser doesn't support saving (Firefox, Internet Explorer, Safari and Opera all work if properly configured)\n- the pathname to your TiddlyWiki file contains illegal characters\n- the TiddlyWiki HTML file has been moved or renamed",
	invalidFileError: "The original file '%0' does not appear to be a valid TiddlyWiki",
	backupSaved: "Backup saved",
	backupFailed: "Failed to save backup file",
	rssSaved: "RSS feed saved",
	rssFailed: "Failed to save RSS feed file",
	emptySaved: "Empty template saved",
	emptyFailed: "Failed to save empty template file",
	mainSaved: "Main TiddlyWiki file saved",
	mainFailed: "Failed to save main TiddlyWiki file. Your changes have not been saved",
	macroError: "Error in macro <<\%0>>",
	macroErrorDetails: "Error while executing macro <<\%0>>:\n%1",
	missingMacro: "No such macro",
	overwriteWarning: "A tiddler named '%0' already exists. Choose OK to overwrite it",
	unsavedChangesWarning: "WARNING! There are unsaved changes in TiddlyWiki\n\nChoose OK to save\nChoose CANCEL to discard",
	confirmExit: "--------------------------------\n\nThere are unsaved changes in TiddlyWiki. If you continue you will lose those changes\n\n--------------------------------",
	saveInstructions: "SaveChanges",
	unsupportedTWFormat: "Unsupported TiddlyWiki format '%0'",
	tiddlerSaveError: "Error when saving tiddler '%0'",
	tiddlerLoadError: "Error when loading tiddler '%0'",
	wrongSaveFormat: "Cannot save with storage format '%0'. Using standard format for save.",
	invalidFieldName: "Invalid field name %0",
	fieldCannotBeChanged: "Field '%0' cannot be changed",
	loadingMissingTiddler: "Attempting to retrieve the tiddler '%0' from the '%1' server at:\n\n'%2' in the workspace '%3'",
	upgradeDone: "The upgrade to version %0 is now complete\n\nClick 'OK' to reload the newly upgraded TiddlyWiki"});

merge(config.messages.messageClose,{
	text: "close",
	tooltip: "close this message area"});

config.messages.backstage = {
	open: {text: "backstage", tooltip: "Open the backstage area to perform authoring and editing tasks"},
	close: {text: "close", tooltip: "Close the backstage area"},
	prompt: "backstage: ",
	decal: {
		edit: {text: "edit", tooltip: "Edit the tiddler '%0'"}
	}
};

config.messages.listView = {
	tiddlerTooltip: "Click for the full text of this tiddler",
	previewUnavailable: "(preview not available)"
};

config.messages.dates.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
config.messages.dates.days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
config.messages.dates.shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
config.messages.dates.shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// suffixes for dates, eg "1st","2nd","3rd"..."30th","31st"
config.messages.dates.daySuffixes = ["st","nd","rd","th","th","th","th","th","th","th",
		"th","th","th","th","th","th","th","th","th","th",
		"st","nd","rd","th","th","th","th","th","th","th",
		"st"];
config.messages.dates.am = "am";
config.messages.dates.pm = "pm";

merge(config.messages.tiddlerPopup,{
	});

merge(config.views.wikified.tag,{
	labelNoTags: "no tags",
	labelTags: "tags: ",
	openTag: "Open tag '%0'",
	tooltip: "Show tiddlers tagged with '%0'",
	openAllText: "Open all",
	openAllTooltip: "Open all of these tiddlers",
	popupNone: "No other tiddlers tagged with '%0'"});

merge(config.views.wikified,{
	defaultText: "The tiddler '%0' doesn't yet exist. Double-click to create it",
	defaultModifier: "(missing)",
	shadowModifier: "(built-in shadow tiddler)",
	dateFormat: "DD MMM YYYY",
	createdPrompt: "created"});

merge(config.views.editor,{
	tagPrompt: "Type tags separated with spaces, [[use double square brackets]] if necessary, or add existing",
	defaultText: "Type the text for '%0'"});

merge(config.views.editor.tagChooser,{
	text: "tags",
	tooltip: "Choose existing tags to add to this tiddler",
	popupNone: "There are no tags defined",
	tagTooltip: "Add the tag '%0'"});

merge(config.messages,{
	sizeTemplates:
		[
		{unit: 1024*1024*1024, template: "%0\u00a0GB"},
		{unit: 1024*1024, template: "%0\u00a0MB"},
		{unit: 1024, template: "%0\u00a0KB"},
		{unit: 1, template: "%0\u00a0B"}
		]});

merge(config.macros.search,{
	label: "search",
	prompt: "Search this TiddlyWiki",
	accessKey: "F",
	successMsg: "%0 tiddlers found matching %1",
	failureMsg: "No tiddlers found matching %0"});

merge(config.macros.tagging,{
	label: "tagging: ",
	labelNotTag: "not tagging",
	tooltip: "List of tiddlers tagged with '%0'"});

merge(config.macros.timeline,{
	dateFormat: "DD MMM YYYY"});

merge(config.macros.allTags,{
	tooltip: "Show tiddlers tagged with '%0'",
	noTags: "There are no tagged tiddlers"});

config.macros.list.all.prompt = "All tiddlers in alphabetical order";
config.macros.list.missing.prompt = "Tiddlers that have links to them but are not defined";
config.macros.list.orphans.prompt = "Tiddlers that are not linked to from any other tiddlers";
config.macros.list.shadowed.prompt = "Tiddlers shadowed with default contents";
config.macros.list.touched.prompt = "Tiddlers that have been modified locally";

merge(config.macros.closeAll,{
	label: "close all",
	prompt: "Close all displayed tiddlers (except any that are being edited)"});

merge(config.macros.permaview,{
	label: "permaview",
	prompt: "Link to an URL that retrieves all the currently displayed tiddlers"});

merge(config.macros.saveChanges,{
	label: "save changes",
	prompt: "Save all tiddlers to create a new TiddlyWiki",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "new tiddler",
	prompt: "Create a new tiddler",
	title: "New Tiddler",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "new journal",
	prompt: "Create a new tiddler from the current date and time",
	accessKey: "J"});

merge(config.macros.options,{
	wizardTitle: "Tweak advanced options",
	step1Title: "These options are saved in cookies in your browser",
	step1Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='false' name='chkUnknown'>Show unknown options</input>",
	unknownDescription: "//(unknown)//",
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "Option", type: 'String'},
			{name: 'Description', field: 'description', title: "Description", type: 'WikiText'},
			{name: 'Name', field: 'name', title: "Name", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'}
			]}
	});

merge(config.macros.plugins,{
	wizardTitle: "Manage plugins",
	step1Title: "Currently loaded plugins",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	skippedText: "(This plugin has not been executed because it was added since startup)",
	noPluginText: "There are no plugins installed",
	confirmDeleteText: "Are you sure you want to delete these plugins:\n\n%0",
	removeLabel: "remove systemConfig tag",
	removePrompt: "Remove systemConfig tag",
	deleteLabel: "delete",
	deletePrompt: "Delete these tiddlers forever",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Description', field: 'desc', title: "Description", type: 'String'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size'},
			{name: 'Forced', field: 'forced', title: "Forced", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "Disabled", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "Loaded", type: 'Boolean', trueText: "Yes", falseText: "No"},
			{name: 'Startup Time', field: 'startupTime', title: "Startup Time", type: 'String'},
			{name: 'Error', field: 'error', title: "Status", type: 'Boolean', trueText: "Error", falseText: "OK"},
			{name: 'Log', field: 'log', title: "Log", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

merge(config.macros.toolbar,{
	moreLabel: "more",
	morePrompt: "Reveal further commands"
	});

merge(config.macros.refreshDisplay,{
	label: "refresh",
	prompt: "Redraw the entire TiddlyWiki display"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "You cannot import into a read-only TiddlyWiki file. Try opening it from a file:// URL",
	wizardTitle: "Import tiddlers from another file or server",
	step1Title: "Step 1: Locate the server or TiddlyWiki file",
	step1Html: "Specify the type of the server: <select name='selTypes'><option value=''>Choose...</option></select><br>Enter the URL or pathname here: <input type='text' size=50 name='txtPath'><br>...or browse for a file: <input type='file' size=50 name='txtBrowse'><br><hr>...or select a pre-defined feed: <select name='selFeeds'><option value=''>Choose...</option></select>",
	openLabel: "open",
	openPrompt: "Open the connection to this file or server",
	openError: "There were problems fetching the tiddlywiki file",
	statusOpenHost: "Opening the host",
	statusGetWorkspaceList: "Getting the list of available workspaces",
	step2Title: "Step 2: Choose the workspace",
	step2Html: "Enter a workspace name: <input type='text' size=50 name='txtWorkspace'><br>...or select a workspace: <select name='selWorkspace'><option value=''>Choose...</option></select>",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel this import",
	statusOpenWorkspace: "Opening the workspace",
	statusGetTiddlerList: "Getting the list of available tiddlers",
	errorGettingTiddlerList: "Error getting list of tiddlers, click Cancel to try again",
	step3Title: "Step 3: Choose the tiddlers to import",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>Keep these tiddlers linked to this server so that you can synchronise subsequent changes</input><br><input type='checkbox' name='chkSave'>Save the details of this server in a 'systemServer' tiddler called:</input> <input type='text' size=25 name='txtSaveTiddler'>",
	importLabel: "import",
	importPrompt: "Import these tiddlers",
	confirmOverwriteText: "Are you sure you want to overwrite these tiddlers:\n\n%0",
	step4Title: "Step 4: Importing %0 tiddler(s)",
	step4Html: "<input type='hidden' name='markReport'></input>", // DO NOT TRANSLATE
	doneLabel: "done",
	donePrompt: "Close this wizard",
	statusDoingImport: "Importing tiddlers",
	statusDoneImport: "All tiddlers imported",
	systemServerNamePattern: "%2 on %1",
	systemServerNamePatternNoWorkspace: "%1",
	confirmOverwriteSaveTiddler: "The tiddler '%0' already exists. Click 'OK' to overwrite it with the details of this server, or 'Cancel' to leave it unchanged",
	serverSaveTemplate: "|''Type:''|%0|\n|''URL:''|%1|\n|''Workspace:''|%2|\n\nThis tiddler was automatically created to record the details of this server",
	serverSaveModifier: "(System)",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "Size", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "Tags", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.upgrade,{
	wizardTitle: "Upgrade TiddlyWiki core code",
	step1Title: "Update or repair this TiddlyWiki to the latest release",
	step1Html: "You are about to upgrade to the latest release of the TiddlyWiki core code (from <a href='%0' class='externalLink' target='_blank'>%1</a>). Your content will be preserved across the upgrade.<br><br>Note that core upgrades have been known to interfere with older plugins. If you run into problems with the upgraded file, see <a href='http://www.tiddlywiki.org/wiki/CoreUpgrades' class='externalLink' target='_blank'>http://www.tiddlywiki.org/wiki/CoreUpgrades</a>",
	errorCantUpgrade: "Unable to upgrade this TiddlyWiki. You can only perform upgrades on TiddlyWiki files stored locally",
	errorNotSaved: "You must save changes before you can perform an upgrade",
	step2Title: "Confirm the upgrade details",
	step2Html_downgrade: "You are about to downgrade to TiddlyWiki version %0 from %1.<br><br>Downgrading to an earlier version of the core code is not recommended",
	step2Html_restore: "This TiddlyWiki appears to be already using the latest version of the core code (%0).<br><br>You can continue to upgrade anyway to ensure that the core code hasn't been corrupted or damaged",
	step2Html_upgrade: "You are about to upgrade to TiddlyWiki version %0 from %1",
	upgradeLabel: "upgrade",
	upgradePrompt: "Prepare for the upgrade process",
	statusPreparingBackup: "Preparing backup",
	statusSavingBackup: "Saving backup file",
	errorSavingBackup: "There was a problem saving the backup file",
	statusLoadingCore: "Loading core code",
	errorLoadingCore: "Error loading the core code",
	errorCoreFormat: "Error with the new core code",
	statusSavingCore: "Saving the new core code",
	statusReloadingCore: "Reloading the new core code",
	startLabel: "start",
	startPrompt: "Start the upgrade process",
	cancelLabel: "cancel",
	cancelPrompt: "Cancel the upgrade process",
	step3Title: "Upgrade cancelled",
	step3Html: "You have cancelled the upgrade process"
	});

merge(config.macros.sync,{
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "Tiddler", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "Server type", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "Server host", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "Server workspace", type: 'String'},
			{name: 'Status', field: 'status', title: "Synchronisation status", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "Server URL", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "Sync these tiddlers", name: 'sync'}
			]},
	wizardTitle: "Synchronize with external servers and files",
	step1Title: "Choose the tiddlers you want to synchronize",
	step1Html: "<input type='hidden' name='markList'></input>", // DO NOT TRANSLATE
	syncLabel: "sync",
	syncPrompt: "Sync these tiddlers",
	hasChanged: "Changed while unplugged",
	hasNotChanged: "Unchanged while unplugged",
	syncStatusList: {
		none: {text: "...", display:null, className:'notChanged'},
		changedServer: {text: "Changed on server", display:null, className:'changedServer'},
		changedLocally: {text: "Changed while unplugged", display:null, className:'changedLocally'},
		changedBoth: {text: "Changed while unplugged and on server", display:null, className:'changedBoth'},
		notFound: {text: "Not found on server", display:null, className:'notFound'},
		putToServer: {text: "Saved update on server", display:null, className:'putToServer'},
		gotFromServer: {text: "Retrieved update from server", display:null, className:'gotFromServer'}
		}
	});

merge(config.macros.annotations,{
	});

merge(config.commands.closeTiddler,{
	text: "close",
	tooltip: "Close this tiddler"});

merge(config.commands.closeOthers,{
	text: "close others",
	tooltip: "Close all other tiddlers"});

merge(config.commands.editTiddler,{
	text: "edit",
	tooltip: "Edit this tiddler",
	readOnlyText: "view",
	readOnlyTooltip: "View the source of this tiddler"});

merge(config.commands.saveTiddler,{
	text: "done",
	tooltip: "Save changes to this tiddler"});

merge(config.commands.cancelTiddler,{
	text: "cancel",
	tooltip: "Undo changes to this tiddler",
	warning: "Are you sure you want to abandon your changes to '%0'?",
	readOnlyText: "done",
	readOnlyTooltip: "View this tiddler normally"});

merge(config.commands.deleteTiddler,{
	text: "delete",
	tooltip: "Delete this tiddler",
	warning: "Are you sure you want to delete '%0'?"});

merge(config.commands.permalink,{
	text: "permalink",
	tooltip: "Permalink for this tiddler"});

merge(config.commands.references,{
	text: "references",
	tooltip: "Show tiddlers that link to this one",
	popupNone: "No references"});

merge(config.commands.jump,{
	text: "jump",
	tooltip: "Jump to another open tiddler"});

merge(config.commands.syncing,{
	text: "syncing",
	tooltip: "Control synchronisation of this tiddler with a server or external file",
	currentlySyncing: "<div>Currently syncing via <span class='popupHighlight'>'%0'</span> to:</"+"div><div>host: <span class='popupHighlight'>%1</span></"+"div><div>workspace: <span class='popupHighlight'>%2</span></"+"div>", // Note escaping of closing <div> tag
	notCurrentlySyncing: "Not currently syncing",
	captionUnSync: "Stop synchronising this tiddler",
	chooseServer: "Synchronise this tiddler with another server:",
	currServerMarker: "\u25cf ",
	notCurrServerMarker: "  "});

merge(config.commands.fields,{
	text: "fields",
	tooltip: "Show the extended fields of this tiddler",
	emptyText: "There are no extended fields for this tiddler",
	listViewTemplate: {
		columns: [
			{name: 'Field', field: 'field', title: "Field", type: 'String'},
			{name: 'Value', field: 'value', title: "Value", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
			]}});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "[[GettingStarted]]",
	MainMenu: "[[GettingStarted]]",
	SiteTitle: "My TiddlyWiki",
	SiteSubtitle: "a reusable non-linear personal web notebook",
	SiteUrl: "http://www.tiddlywiki.com/",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD MMM YYYY" "journal">><<saveChanges>><<slider chkSliderOptionsPanel OptionsPanel "options \u00bb" "Change TiddlyWiki advanced options">>',
	SideBarTabs: '<<tabs txtMainTab "Timeline" "Timeline" TabTimeline "All" "All tiddlers" TabAll "Tags" "All tags" TabTags "More" "More lists" TabMore>>',
	TabMore: '<<tabs txtMoreTab "Missing" "Missing tiddlers" TabMoreMissing "Orphans" "Orphaned tiddlers" TabMoreOrphans "Shadowed" "Shadowed tiddlers" TabMoreShadowed>>'
	});

merge(config.annotations,{
	AdvancedOptions: "This shadow tiddler provides access to several advanced options",
	ColorPalette: "These values in this shadow tiddler determine the colour scheme of the ~TiddlyWiki user interface",
	DefaultTiddlers: "The tiddlers listed in this shadow tiddler will be automatically displayed when ~TiddlyWiki starts up",
	EditTemplate: "The HTML template in this shadow tiddler determines how tiddlers look while they are being edited",
	GettingStarted: "This shadow tiddler provides basic usage instructions",
	ImportTiddlers: "This shadow tiddler provides access to importing tiddlers",
	MainMenu: "This shadow tiddler is used as the contents of the main menu in the left-hand column of the screen",
	MarkupPreHead: "This tiddler is inserted at the top of the <head> section of the TiddlyWiki HTML file",
	MarkupPostHead: "This tiddler is inserted at the bottom of the <head> section of the TiddlyWiki HTML file",
	MarkupPreBody: "This tiddler is inserted at the top of the <body> section of the TiddlyWiki HTML file",
	MarkupPostBody: "This tiddler is inserted at the end of the <body> section of the TiddlyWiki HTML file immediately after the script block",
	OptionsPanel: "This shadow tiddler is used as the contents of the options panel slider in the right-hand sidebar",
	PageTemplate: "The HTML template in this shadow tiddler determines the overall ~TiddlyWiki layout",
	PluginManager: "This shadow tiddler provides access to the plugin manager",
	SideBarOptions: "This shadow tiddler is used as the contents of the option panel in the right-hand sidebar",
	SideBarTabs: "This shadow tiddler is used as the contents of the tabs panel in the right-hand sidebar",
	SiteSubtitle: "This shadow tiddler is used as the second part of the page title",
	SiteTitle: "This shadow tiddler is used as the first part of the page title",
	SiteUrl: "This shadow tiddler should be set to the full target URL for publication",
	StyleSheetColors: "This shadow tiddler contains CSS definitions related to the color of page elements. ''DO NOT EDIT THIS TIDDLER'', instead make your changes in the StyleSheet shadow tiddler",
	StyleSheet: "This tiddler can contain custom CSS definitions",
	StyleSheetLayout: "This shadow tiddler contains CSS definitions related to the layout of page elements. ''DO NOT EDIT THIS TIDDLER'', instead make your changes in the StyleSheet shadow tiddler",
	StyleSheetLocale: "This shadow tiddler contains CSS definitions related to the translation locale",
	StyleSheetPrint: "This shadow tiddler contains CSS definitions for printing",
	TabAll: "This shadow tiddler contains the contents of the 'All' tab in the right-hand sidebar",
	TabMore: "This shadow tiddler contains the contents of the 'More' tab in the right-hand sidebar",
	TabMoreMissing: "This shadow tiddler contains the contents of the 'Missing' tab in the right-hand sidebar",
	TabMoreOrphans: "This shadow tiddler contains the contents of the 'Orphans' tab in the right-hand sidebar",
	TabMoreShadowed: "This shadow tiddler contains the contents of the 'Shadowed' tab in the right-hand sidebar",
	TabTags: "This shadow tiddler contains the contents of the 'Tags' tab in the right-hand sidebar",
	TabTimeline: "This shadow tiddler contains the contents of the 'Timeline' tab in the right-hand sidebar",
	ToolbarCommands: "This shadow tiddler determines which commands are shown in tiddler toolbars",
	ViewTemplate: "The HTML template in this shadow tiddler determines how tiddlers look"
	});

//--
//-- Main
//--

var params = null; // Command line parameters
var store = null; // TiddlyWiki storage
var story = null; // Main story
var formatter = null; // Default formatters for the wikifier
var anim = typeof Animator == "function" ? new Animator() : null; // Animation engine
var readOnly = false; // Whether we're in readonly mode
var highlightHack = null; // Embarrassing hack department...
var hadConfirmExit = false; // Don't warn more than once
var safeMode = false; // Disable all plugins and cookies
var showBackstage; // Whether to include the backstage area
var installedPlugins = []; // Information filled in when plugins are executed
var startingUp = false; // Whether we're in the process of starting up
var pluginInfo,tiddler; // Used to pass information to plugins in loadPlugins()

// Whether to use the JavaSaver applet
var useJavaSaver = (config.browser.isSafari || config.browser.isOpera) && (document.location.toString().substr(0,4) != "http");

// Starting up
function main()
{
	var t10,t9,t8,t7,t6,t5,t4,t3,t2,t1,t0 = new Date();
	startingUp = true;
	window.onbeforeunload = function(e) {if(window.confirmExit) return confirmExit();};
	params = getParameters();
	if(params)
		params = params.parseParams("open",null,false);
	store = new TiddlyWiki();
	invokeParamifier(params,"oninit");
	story = new Story("tiddlerDisplay","tiddler");
	addEvent(document,"click",Popup.onDocumentClick);
	saveTest();
	loadOptionsCookie();
	for(var s=0; s<config.notifyTiddlers.length; s++)
		store.addNotification(config.notifyTiddlers[s].name,config.notifyTiddlers[s].notify);
	t1 = new Date();
	loadShadowTiddlers();
	t2 = new Date();
	store.loadFromDiv("storeArea","store",true);
	t3 = new Date();
	invokeParamifier(params,"onload");
	t4 = new Date();
	readOnly = (window.location.protocol == "file:") ? false : config.options.chkHttpReadOnly;
	var pluginProblem = loadPlugins();
	t5 = new Date();
	formatter = new Formatter(config.formatters);
	invokeParamifier(params,"onconfig");
	story.switchTheme(config.options.txtTheme);
	showBackstage = !readOnly;
	t6 = new Date();
	for(var m in config.macros) {
		if(config.macros[m].init)
			config.macros[m].init();
	}
	t7 = new Date();
	store.notifyAll();
	t8 = new Date();
	restart();
	refreshDisplay();
	t9 = new Date();
	if(pluginProblem) {
		story.displayTiddler(null,"PluginManager");
		displayMessage(config.messages.customConfigError);
	}
	if(showBackstage)
		backstage.init();
	t10 = new Date();
	if(config.options.chkDisplayInstrumentation) {
		displayMessage("LoadShadows " + (t2-t1) + " ms");
		displayMessage("LoadFromDiv " + (t3-t2) + " ms");
		displayMessage("LoadPlugins " + (t5-t4) + " ms");
		displayMessage("Macro init " + (t7-t6) + " ms");
		displayMessage("Notify " + (t8-t7) + " ms");
		displayMessage("Restart " + (t9-t8) + " ms");
		displayMessage("Total: " + (t10-t0) + " ms");
	}
	startingUp = false;
}

// Restarting
function restart()
{
	invokeParamifier(params,"onstart");
	if(story.isEmpty()) {
		story.displayDefaultTiddlers();
	}
	window.scrollTo(0,0);
}

function saveTest()
{
	var s = document.getElementById("saveTest");
	if(s.hasChildNodes())
		alert(config.messages.savedSnapshotError);
	s.appendChild(document.createTextNode("savetest"));
}

function loadShadowTiddlers()
{
	var shadows = new TiddlyWiki();
	shadows.loadFromDiv("shadowArea","shadows",true);
	shadows.forEachTiddler(function(title,tiddler){config.shadowTiddlers[title] = tiddler.text;});
	delete shadows;
}

function loadPlugins()
{
	if(safeMode)
		return false;
	var tiddlers = store.getTaggedTiddlers("systemConfig");
	var toLoad = [];
	var nLoaded = 0;
	var map = {};
	var nPlugins = tiddlers.length;
	installedPlugins = [];
	for(var i=0; i<nPlugins; i++) {
		var p = getPluginInfo(tiddlers[i]);
		installedPlugins[i] = p;
		var n = p.Name;
		if(n)
			map[n] = p;
		n = p.Source;
		if(n)
			map[n] = p;
	}
	var visit = function(p) {
		if(!p || p.done)
			return;
		p.done = 1;
		var reqs = p.Requires;
		if(reqs) {
			reqs = reqs.readBracketedList();
			for(var i=0; i<reqs.length; i++)
				visit(map[reqs[i]]);
		}
		toLoad.push(p);
	};
	for(i=0; i<nPlugins; i++)
		visit(installedPlugins[i]);
	for(i=0; i<toLoad.length; i++) {
		p = toLoad[i];
		pluginInfo = p;
		tiddler = p.tiddler;
		if(isPluginExecutable(p)) {
			if(isPluginEnabled(p)) {
				p.executed = true;
				var startTime = new Date();
				try {
					if(tiddler.text)
						window.eval(tiddler.text);
					nLoaded++;
				} catch(ex) {
					p.log.push(config.messages.pluginError.format([exceptionText(ex)]));
					p.error = true;
				}
				pluginInfo.startupTime = String((new Date()) - startTime) + "ms";
			} else {
				nPlugins--;
			}
		} else {
			p.warning = true;
		}
	}
	return nLoaded != nPlugins;
}

function getPluginInfo(tiddler)
{
	var p = store.getTiddlerSlices(tiddler.title,["Name","Description","Version","Requires","CoreVersion","Date","Source","Author","License","Browsers"]);
	p.tiddler = tiddler;
	p.title = tiddler.title;
	p.log = [];
	return p;
}

// Check that a particular plugin is valid for execution
function isPluginExecutable(plugin)
{
	if(plugin.tiddler.isTagged("systemConfigForce")) {
		plugin.log.push(config.messages.pluginForced);
		return true;
	}
	if(plugin["CoreVersion"]) {
		var coreVersion = plugin["CoreVersion"].split(".");
		var w = parseInt(coreVersion[0],10) - version.major;
		if(w == 0 && coreVersion[1])
			w = parseInt(coreVersion[1],10) - version.minor;
		if(w == 0 && coreVersion[2])
			w = parseInt(coreVersion[2],10) - version.revision;
		if(w > 0) {
			plugin.log.push(config.messages.pluginVersionError);
			return false;
		}
	}
	return true;
}

function isPluginEnabled(plugin)
{
	if(plugin.tiddler.isTagged("systemConfigDisable")) {
		plugin.log.push(config.messages.pluginDisabled);
		return false;
	}
	return true;
}

function invokeMacro(place,macro,params,wikifier,tiddler)
{
	try {
		var m = config.macros[macro];
		if(m && m.handler) {
			var tiddlerElem = story.findContainingTiddler(place);
			window.tiddler = tiddlerElem ? store.getTiddler(tiddlerElem.getAttribute("tiddler")) : null;
			window.place = place;
			m.handler(place,macro,params.readMacroParams(),wikifier,params,tiddler);
		} else {
			createTiddlyError(place,config.messages.macroError.format([macro]),config.messages.macroErrorDetails.format([macro,config.messages.missingMacro]));
		}
	} catch(ex) {
		createTiddlyError(place,config.messages.macroError.format([macro]),config.messages.macroErrorDetails.format([macro,ex.toString()]));
	}
}

//--
//-- Paramifiers
//--

function getParameters()
{
	var p = null;
	if(window.location.hash) {
		p = decodeURIComponent(window.location.hash.substr(1));
		if(config.browser.firefoxDate != null && config.browser.firefoxDate[1] < "20051111")
			p = convertUTF8ToUnicode(p);
	}
	return p;
}

function invokeParamifier(params,handler)
{
	if(!params || params.length == undefined || params.length <= 1)
		return;
	for(var i=1; i<params.length; i++) {
		var p = config.paramifiers[params[i].name];
		if(p && p[handler] instanceof Function)
			p[handler](params[i].value);
		else {
			var h = config.optionHandlers[params[i].name.substr(0,3)];
			if(h && h.set instanceof Function)
				h.set(params[i].name,params[i].value);
		}
	}
}

config.paramifiers = {};

config.paramifiers.start = {
	oninit: function(v) {
		safeMode = v.toLowerCase() == "safe";
	}
};

config.paramifiers.open = {
	onstart: function(v) {
		if(!readOnly || store.tiddlerExists(v) || store.isShadowTiddler(v))
			story.displayTiddler("bottom",v,null,false,null);
	}
};

config.paramifiers.story = {
	onstart: function(v) {
		var list = store.getTiddlerText(v,"").parseParams("open",null,false);
		invokeParamifier(list,"onstart");
	}
};

config.paramifiers.search = {
	onstart: function(v) {
		story.search(v,false,false);
	}
};

config.paramifiers.searchRegExp = {
	onstart: function(v) {
		story.prototype.search(v,false,true);
	}
};

config.paramifiers.tag = {
	onstart: function(v) {
		story.displayTiddlers(null,store.filterTiddlers("[tag["+v+"]]"),null,false,null);
	}
};

config.paramifiers.newTiddler = {
	onstart: function(v) {
		if(!readOnly) {
			story.displayTiddler(null,v,DEFAULT_EDIT_TEMPLATE);
			story.focusTiddler(v,"text");
		}
	}
};

config.paramifiers.newJournal = {
	onstart: function(v) {
		if(!readOnly) {
			var now = new Date();
			var title = now.formatString(v.trim());
			story.displayTiddler(null,title,DEFAULT_EDIT_TEMPLATE);
			story.focusTiddler(title,"text");
		}
	}
};

config.paramifiers.readOnly = {
	onconfig: function(v) {
		var p = v.toLowerCase();
		readOnly = p == "yes" ? true : (p == "no" ? false : readOnly);
	}
};

config.paramifiers.theme = {
	onconfig: function(v) {
		story.switchTheme(v);
	}
};

config.paramifiers.upgrade = {
	onstart: function(v) {
		upgradeFrom(v);
	}
};

config.paramifiers.recent= {
	onstart: function(v) {
		var titles=[];
		var tiddlers=store.getTiddlers("modified","excludeLists").reverse();
		for(var i=0; i<v && i<tiddlers.length; i++)
			titles.push(tiddlers[i].title);
		story.displayTiddlers(null,titles);
	}
};

config.paramifiers.filter = {
	onstart: function(v) {
		story.displayTiddlers(null,store.filterTiddlers(v),null,false);
	}
};

//--
//-- Formatter helpers
//--

function Formatter(formatters)
{
	this.formatters = [];
	var pattern = [];
	for(var n=0; n<formatters.length; n++) {
		pattern.push("(" + formatters[n].match + ")");
		this.formatters.push(formatters[n]);
	}
	this.formatterRegExp = new RegExp(pattern.join("|"),"mg");
}

config.formatterHelpers = {

	createElementAndWikify: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,this.element),this.termRegExp);
	},

	inlineCssHelper: function(w)
	{
		var styles = [];
		config.textPrimitives.cssLookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = config.textPrimitives.cssLookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			var s,v;
			if(lookaheadMatch[1]) {
				s = lookaheadMatch[1].unDash();
				v = lookaheadMatch[2];
			} else {
				s = lookaheadMatch[3].unDash();
				v = lookaheadMatch[4];
			}
			if(s=="bgcolor")
				s = "backgroundColor";
			styles.push({style: s, value: v});
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
			config.textPrimitives.cssLookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = config.textPrimitives.cssLookaheadRegExp.exec(w.source);
		}
		return styles;
	},

	applyCssHelper: function(e,styles)
	{
		for(var t=0; t< styles.length; t++) {
			try {
				e.style[styles[t].style] = styles[t].value;
			} catch (ex) {
			}
		}
	},

	enclosedTextHelper: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var text = lookaheadMatch[1];
			if(config.browser.isIE)
				text = text.replace(/\n/g,"\r");
			createTiddlyElement(w.output,this.element,null,null,text);
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	},

	isExternalLink: function(link)
	{
		if(store.tiddlerExists(link) || store.isShadowTiddler(link)) {
			return false;
		}
		var urlRegExp = new RegExp(config.textPrimitives.urlPattern,"mg");
		if(urlRegExp.exec(link)) {
			return true;
		}
		if(link.indexOf(".")!=-1 || link.indexOf("\\")!=-1 || link.indexOf("/")!=-1 || link.indexOf("#")!=-1) {
			return true;
		}
		return false;
	}

};

//--
//-- Standard formatters
//--

config.formatters = [
{
	name: "table",
	match: "^\\|(?:[^\\n]*)\\|(?:[fhck]?)$",
	lookaheadRegExp: /^\|([^\n]*)\|([fhck]?)$/mg,
	rowTermRegExp: /(\|(?:[fhck]?)$\n?)/mg,
	cellRegExp: /(?:\|([^\n\|]*)\|)|(\|[fhck]?$\n?)/mg,
	cellTermRegExp: /((?:\x20*)\|)/mg,
	rowTypes: {"c":"caption", "h":"thead", "":"tbody", "f":"tfoot"},
	handler: function(w)
	{
		var table = createTiddlyElement(w.output,"table",null,"twtable");
		var prevColumns = [];
		var currRowType = null;
		var rowContainer;
		var rowCount = 0;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			var nextRowType = lookaheadMatch[2];
			if(nextRowType == "k") {
				table.className = lookaheadMatch[1];
				w.nextMatch += lookaheadMatch[0].length+1;
			} else {
				if(nextRowType != currRowType) {
					rowContainer = createTiddlyElement(table,this.rowTypes[nextRowType]);
					currRowType = nextRowType;
				}
				if(currRowType == "c") {
					// Caption
					w.nextMatch++;
					if(rowContainer != table.firstChild)
						table.insertBefore(rowContainer,table.firstChild);
					rowContainer.setAttribute("align",rowCount == 0?"top":"bottom");
					w.subWikifyTerm(rowContainer,this.rowTermRegExp);
				} else {
					var theRow = createTiddlyElement(rowContainer,"tr",null,(rowCount&1)?"oddRow":"evenRow");
					theRow.onmouseover = function() {addClass(this,"hoverRow");};
					theRow.onmouseout = function() {removeClass(this,"hoverRow");};
					this.rowHandler(w,theRow,prevColumns);
					rowCount++;
				}
			}
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	},
	rowHandler: function(w,e,prevColumns)
	{
		var col = 0;
		var colSpanCount = 1;
		var prevCell = null;
		this.cellRegExp.lastIndex = w.nextMatch;
		var cellMatch = this.cellRegExp.exec(w.source);
		while(cellMatch && cellMatch.index == w.nextMatch) {
			if(cellMatch[1] == "~") {
				// Rowspan
				var last = prevColumns[col];
				if(last) {
					last.rowSpanCount++;
					last.element.setAttribute("rowspan",last.rowSpanCount);
					last.element.setAttribute("rowSpan",last.rowSpanCount); // Needed for IE
					last.element.valign = "center";
				}
				w.nextMatch = this.cellRegExp.lastIndex-1;
			} else if(cellMatch[1] == ">") {
				// Colspan
				colSpanCount++;
				w.nextMatch = this.cellRegExp.lastIndex-1;
			} else if(cellMatch[2]) {
				// End of row
				if(prevCell && colSpanCount > 1) {
					prevCell.setAttribute("colspan",colSpanCount);
					prevCell.setAttribute("colSpan",colSpanCount); // Needed for IE
				}
				w.nextMatch = this.cellRegExp.lastIndex;
				break;
			} else {
				// Cell
				w.nextMatch++;
				var styles = config.formatterHelpers.inlineCssHelper(w);
				var spaceLeft = false;
				var chr = w.source.substr(w.nextMatch,1);
				while(chr == " ") {
					spaceLeft = true;
					w.nextMatch++;
					chr = w.source.substr(w.nextMatch,1);
				}
				var cell;
				if(chr == "!") {
					cell = createTiddlyElement(e,"th");
					w.nextMatch++;
				} else {
					cell = createTiddlyElement(e,"td");
				}
				prevCell = cell;
				prevColumns[col] = {rowSpanCount:1,element:cell};
				if(colSpanCount > 1) {
					cell.setAttribute("colspan",colSpanCount);
					cell.setAttribute("colSpan",colSpanCount); // Needed for IE
					colSpanCount = 1;
				}
				config.formatterHelpers.applyCssHelper(cell,styles);
				w.subWikifyTerm(cell,this.cellTermRegExp);
				if(w.matchText.substr(w.matchText.length-2,1) == " ") // spaceRight
					cell.align = spaceLeft ? "center" : "left";
				else if(spaceLeft)
					cell.align = "right";
				w.nextMatch--;
			}
			col++;
			this.cellRegExp.lastIndex = w.nextMatch;
			cellMatch = this.cellRegExp.exec(w.source);
		}
	}
},

{
	name: "heading",
	match: "^!{1,6}",
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		w.subWikifyTerm(createTiddlyElement(w.output,"h" + w.matchLength),this.termRegExp);
	}
},

{
	name: "list",
	match: "^(?:[\\*#;:]+)",
	lookaheadRegExp: /^(?:(?:(\*)|(#)|(;)|(:))+)/mg,
	termRegExp: /(\n)/mg,
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0, currType = null;
		var listLevel, listType, itemType, baseType;
		w.nextMatch = w.matchStart;
		this.lookaheadRegExp.lastIndex = w.nextMatch;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		while(lookaheadMatch && lookaheadMatch.index == w.nextMatch) {
			if(lookaheadMatch[1]) {
				listType = "ul";
				itemType = "li";
			} else if(lookaheadMatch[2]) {
				listType = "ol";
				itemType = "li";
			} else if(lookaheadMatch[3]) {
				listType = "dl";
				itemType = "dt";
			} else if(lookaheadMatch[4]) {
				listType = "dl";
				itemType = "dd";
			}
			if(!baseType)
				baseType = listType;
			listLevel = lookaheadMatch[0].length;
			w.nextMatch += lookaheadMatch[0].length;
			var t;
			if(listLevel > currLevel) {
				for(t=currLevel; t<listLevel; t++) {
					var target = (currLevel == 0) ? stack[stack.length-1] : stack[stack.length-1].lastChild;
					stack.push(createTiddlyElement(target,listType));
				}
			} else if(listType!=baseType && listLevel==1) {
				w.nextMatch -= lookaheadMatch[0].length;
				return;
			} else if(listLevel < currLevel) {
				for(t=currLevel; t>listLevel; t--)
					stack.pop();
			} else if(listLevel == currLevel && listType != currType) {
				stack.pop();
				stack.push(createTiddlyElement(stack[stack.length-1].lastChild,listType));
			}
			currLevel = listLevel;
			currType = listType;
			var e = createTiddlyElement(stack[stack.length-1],itemType);
			w.subWikifyTerm(e,this.termRegExp);
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		}
	}
},

{
	name: "quoteByBlock",
	match: "^<<<\\n",
	termRegExp: /(^<<<(\n|$))/mg,
	element: "blockquote",
	handler: config.formatterHelpers.createElementAndWikify
},

{
	name: "quoteByLine",
	match: "^>+",
	lookaheadRegExp: /^>+/mg,
	termRegExp: /(\n)/mg,
	element: "blockquote",
	handler: function(w)
	{
		var stack = [w.output];
		var currLevel = 0;
		var newLevel = w.matchLength;
		var t;
		do {
			if(newLevel > currLevel) {
				for(t=currLevel; t<newLevel; t++)
					stack.push(createTiddlyElement(stack[stack.length-1],this.element));
			} else if(newLevel < currLevel) {
				for(t=currLevel; t>newLevel; t--)
					stack.pop();
			}
			currLevel = newLevel;
			w.subWikifyTerm(stack[stack.length-1],this.termRegExp);
			createTiddlyElement(stack[stack.length-1],"br");
			this.lookaheadRegExp.lastIndex = w.nextMatch;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			var matched = lookaheadMatch && lookaheadMatch.index == w.nextMatch;
			if(matched) {
				newLevel = lookaheadMatch[0].length;
				w.nextMatch += lookaheadMatch[0].length;
			}
		} while(matched);
	}
},

{
	name: "rule",
	match: "^----+$\\n?|<hr ?/?>\\n?",
	handler: function(w)
	{
		createTiddlyElement(w.output,"hr");
	}
},

{
	name: "monospacedByLine",
	match: "^(?:/\\*\\{\\{\\{\\*/|\\{\\{\\{|//\\{\\{\\{|<!--\\{\\{\\{-->)\\n",
	element: "pre",
	handler: function(w)
	{
		switch(w.matchText) {
		case "/*{{{*/\n": // CSS
			this.lookaheadRegExp = /\/\*\{\{\{\*\/\n*((?:^[^\n]*\n)+?)(\n*^\/\*\}\}\}\*\/$\n?)/mg;
			break;
		case "{{{\n": // monospaced block
			this.lookaheadRegExp = /^\{\{\{\n((?:^[^\n]*\n)+?)(^\}\}\}$\n?)/mg;
			break;
		case "//{{{\n": // plugin
			this.lookaheadRegExp = /^\/\/\{\{\{\n\n*((?:^[^\n]*\n)+?)(\n*^\/\/\}\}\}$\n?)/mg;
			break;
		case "<!--{{{-->\n": //template
			this.lookaheadRegExp = /<!--\{\{\{-->\n*((?:^[^\n]*\n)+?)(\n*^<!--\}\}\}-->$\n?)/mg;
			break;
		default:
			break;
		}
		config.formatterHelpers.enclosedTextHelper.call(this,w);
	}
},

{
	name: "wikifyComment",
	match: "^(?:/\\*\\*\\*|<!---)\\n",
	handler: function(w)
	{
		var termRegExp = (w.matchText == "/***\n") ? (/(^\*\*\*\/\n)/mg) : (/(^--->\n)/mg);
		w.subWikifyTerm(w.output,termRegExp);
	}
},

{
	name: "macro",
	match: "<<",
	lookaheadRegExp: /<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart && lookaheadMatch[1]) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
		}
	}
},

{
	name: "prettyLink",
	match: "\\[\\[",
	lookaheadRegExp: /\[\[(.*?)(?:\|(~)?(.*?))?\]\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e;
			var text = lookaheadMatch[1];
			if(lookaheadMatch[3]) {
				// Pretty bracketted link
				var link = lookaheadMatch[3];
				e = (!lookaheadMatch[2] && config.formatterHelpers.isExternalLink(link)) ?
						createExternalLink(w.output,link) : createTiddlyLink(w.output,decodeURIComponent(link),false,null,w.isStatic,w.tiddler);
			} else {
				// Simple bracketted link
				e = createTiddlyLink(w.output,decodeURIComponent(text),false,null,w.isStatic,w.tiddler);
			}
			createTiddlyText(e,text);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "wikiLink",
	match: config.textPrimitives.unWikiLink+"?"+config.textPrimitives.wikiLink,
	handler: function(w)
	{
		if(w.matchText.substr(0,1) == config.textPrimitives.unWikiLink) {
			w.outputText(w.output,w.matchStart+1,w.nextMatch);
			return;
		}
		if(w.matchStart > 0) {
			var preRegExp = new RegExp(config.textPrimitives.anyLetterStrict,"mg");
			preRegExp.lastIndex = w.matchStart-1;
			var preMatch = preRegExp.exec(w.source);
			if(preMatch.index == w.matchStart-1) {
				w.outputText(w.output,w.matchStart,w.nextMatch);
				return;
			}
		}
		if(w.autoLinkWikiWords || store.isShadowTiddler(w.matchText)) {
			var link = createTiddlyLink(w.output,w.matchText,false,null,w.isStatic,w.tiddler);
			w.outputText(link,w.matchStart,w.nextMatch);
		} else {
			w.outputText(w.output,w.matchStart,w.nextMatch);
		}
	}
},

{
	name: "urlLink",
	match: config.textPrimitives.urlPattern,
	handler: function(w)
	{
		w.outputText(createExternalLink(w.output,w.matchText),w.matchStart,w.nextMatch);
	}
},

{
	name: "image",
	match: "\\[[<>]?[Ii][Mm][Gg]\\[",
	lookaheadRegExp: /\[([<]?)(>?)[Ii][Mm][Gg]\[(?:([^\|\]]+)\|)?([^\[\]\|]+)\](?:\[([^\]]*)\])?\]/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			var e = w.output;
			if(lookaheadMatch[5]) {
				var link = lookaheadMatch[5];
				e = config.formatterHelpers.isExternalLink(link) ? createExternalLink(w.output,link) : createTiddlyLink(w.output,link,false,null,w.isStatic,w.tiddler);
				addClass(e,"imageLink");
			}
			var img = createTiddlyElement(e,"img");
			if(lookaheadMatch[1])
				img.align = "left";
			else if(lookaheadMatch[2])
				img.align = "right";
			if(lookaheadMatch[3]) {
				img.title = lookaheadMatch[3];
				img.setAttribute("alt",lookaheadMatch[3]);
			}
			img.src = lookaheadMatch[4];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "html",
	match: "<[Hh][Tt][Mm][Ll]>",
	lookaheadRegExp: /<[Hh][Tt][Mm][Ll]>((?:.|\n)*?)<\/[Hh][Tt][Mm][Ll]>/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			createTiddlyElement(w.output,"span").innerHTML = lookaheadMatch[1];
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "commentByBlock",
	match: "/%",
	lookaheadRegExp: /\/%((?:.|\n)*?)%\//mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
			w.nextMatch = this.lookaheadRegExp.lastIndex;
	}
},

{
	name: "characterFormat",
	match: "''|//|__|\\^\\^|~~|--(?!\\s|$)|\\{\\{\\{",
	handler: function(w)
	{
		switch(w.matchText) {
		case "''":
			w.subWikifyTerm(w.output.appendChild(document.createElement("strong")),/('')/mg);
			break;
		case "//":
			w.subWikifyTerm(createTiddlyElement(w.output,"em"),/(\/\/)/mg);
			break;
		case "__":
			w.subWikifyTerm(createTiddlyElement(w.output,"u"),/(__)/mg);
			break;
		case "^^":
			w.subWikifyTerm(createTiddlyElement(w.output,"sup"),/(\^\^)/mg);
			break;
		case "~~":
			w.subWikifyTerm(createTiddlyElement(w.output,"sub"),/(~~)/mg);
			break;
		case "--":
			w.subWikifyTerm(createTiddlyElement(w.output,"strike"),/(--)/mg);
			break;
		case "{{{":
			var lookaheadRegExp = /\{\{\{((?:.|\n)*?)\}\}\}/mg;
			lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = lookaheadRegExp.exec(w.source);
			if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
				createTiddlyElement(w.output,"code",null,null,lookaheadMatch[1]);
				w.nextMatch = lookaheadRegExp.lastIndex;
			}
			break;
		}
	}
},

{
	name: "customFormat",
	match: "@@|\\{\\{",
	handler: function(w)
	{
		switch(w.matchText) {
		case "@@":
			var e = createTiddlyElement(w.output,"span");
			var styles = config.formatterHelpers.inlineCssHelper(w);
			if(styles.length == 0)
				e.className = "marked";
			else
				config.formatterHelpers.applyCssHelper(e,styles);
			w.subWikifyTerm(e,/(@@)/mg);
			break;
		case "{{":
			var lookaheadRegExp = /\{\{[\s]*([\w]+[\s\w]*)[\s]*\{(\n?)/mg;
			lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = lookaheadRegExp.exec(w.source);
			if(lookaheadMatch) {
				w.nextMatch = lookaheadRegExp.lastIndex;
				e = createTiddlyElement(w.output,lookaheadMatch[2] == "\n" ? "div" : "span",null,lookaheadMatch[1]);
				w.subWikifyTerm(e,/(\}\}\})/mg);
			}
			break;
		}
	}
},

{
	name: "mdash",
	match: "--",
	handler: function(w)
	{
		createTiddlyElement(w.output,"span").innerHTML = "&mdash;";
	}
},

{
	name: "lineBreak",
	match: "\\n|<br ?/?>",
	handler: function(w)
	{
		createTiddlyElement(w.output,"br");
	}
},

{
	name: "rawText",
	match: "\\\"{3}|<nowiki>",
	lookaheadRegExp: /(?:\"{3}|<nowiki>)((?:.|\n)*?)(?:\"{3}|<\/nowiki>)/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			createTiddlyElement(w.output,"span",null,null,lookaheadMatch[1]);
			w.nextMatch = this.lookaheadRegExp.lastIndex;
		}
	}
},

{
	name: "htmlEntitiesEncoding",
	match: "(?:(?:&#?[a-zA-Z0-9]{2,8};|.)(?:&#?(?:x0*(?:3[0-6][0-9a-fA-F]|1D[c-fC-F][0-9a-fA-F]|20[d-fD-F][0-9a-fA-F]|FE2[0-9a-fA-F])|0*(?:76[89]|7[7-9][0-9]|8[0-7][0-9]|761[6-9]|76[2-7][0-9]|84[0-3][0-9]|844[0-7]|6505[6-9]|6506[0-9]|6507[0-1]));)+|&#?[a-zA-Z0-9]{2,8};)",
	handler: function(w)
	{
		createTiddlyElement(w.output,"span").innerHTML = w.matchText;
	}
}

];

//--
//-- Wikifier
//--

function getParser(tiddler,format)
{
	if(tiddler) {
		if(!format)
			format = tiddler.fields["wikiformat"];
		var i;
		if(format) {
			for(i in config.parsers) {
				if(format == config.parsers[i].format)
					return config.parsers[i];
			}
		} else {
			for(i in config.parsers) {
				if(tiddler.isTagged(config.parsers[i].formatTag))
					return config.parsers[i];
			}
		}
	}
	return formatter;
}

function wikify(source,output,highlightRegExp,tiddler)
{
	if(source) {
		var wikifier = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
		var t0 = new Date();
		wikifier.subWikify(output);
		if(tiddler && config.options.chkDisplayInstrumentation)
			displayMessage("wikify:" +tiddler.title+ " in " + (new Date()-t0) + " ms");
	}
}

function wikifyStatic(source,highlightRegExp,tiddler,format)
{
	var e = createTiddlyElement(document.body,"pre");
	e.style.display = "none";
	var html = "";
	if(source && source != "") {
		if(!tiddler)
			tiddler = new Tiddler("temp");
		var wikifier = new Wikifier(source,getParser(tiddler,format),highlightRegExp,tiddler);
		wikifier.isStatic = true;
		wikifier.subWikify(e);
		html = e.innerHTML;
		removeNode(e);
	}
	return html;
}

function wikifyPlain(title,theStore,limit)
{
	if(!theStore)
		theStore = store;
	if(theStore.tiddlerExists(title) || theStore.isShadowTiddler(title)) {
		return wikifyPlainText(theStore.getTiddlerText(title),limit,tiddler);
	} else {
		return "";
	}
}

function wikifyPlainText(text,limit,tiddler)
{
	if(limit > 0)
		text = text.substr(0,limit);
	var wikifier = new Wikifier(text,formatter,null,tiddler);
	return wikifier.wikifyPlain();
}

function highlightify(source,output,highlightRegExp,tiddler)
{
	if(source) {
		var wikifier = new Wikifier(source,formatter,highlightRegExp,tiddler);
		wikifier.outputText(output,0,source.length);
	}
}

function Wikifier(source,formatter,highlightRegExp,tiddler)
{
	this.source = source;
	this.output = null;
	this.formatter = formatter;
	this.nextMatch = 0;
	this.autoLinkWikiWords = tiddler && tiddler.autoLinkWikiWords() == false ? false : true;
	this.highlightRegExp = highlightRegExp;
	this.highlightMatch = null;
	this.isStatic = false;
	if(highlightRegExp) {
		highlightRegExp.lastIndex = 0;
		this.highlightMatch = highlightRegExp.exec(source);
	}
	this.tiddler = tiddler;
}

Wikifier.prototype.wikifyPlain = function()
{
	var e = createTiddlyElement(document.body,"div");
	e.style.display = "none";
	this.subWikify(e);
	var text = getPlainText(e);
	removeNode(e);
	return text;
};

Wikifier.prototype.subWikify = function(output,terminator)
{
	try {
		if(terminator)
			this.subWikifyTerm(output,new RegExp("(" + terminator + ")","mg"));
		else
			this.subWikifyUnterm(output);
	} catch(ex) {
		showException(ex);
	}
};

Wikifier.prototype.subWikifyUnterm = function(output)
{
	var oldOutput = this.output;
	this.output = output;
	this.formatter.formatterRegExp.lastIndex = this.nextMatch;
	var formatterMatch = this.formatter.formatterRegExp.exec(this.source);
	while(formatterMatch) {
		// Output any text before the match
		if(formatterMatch.index > this.nextMatch)
			this.outputText(this.output,this.nextMatch,formatterMatch.index);
		// Set the match parameters for the handler
		this.matchStart = formatterMatch.index;
		this.matchLength = formatterMatch[0].length;
		this.matchText = formatterMatch[0];
		this.nextMatch = this.formatter.formatterRegExp.lastIndex;
		for(var t=1; t<formatterMatch.length; t++) {
			if(formatterMatch[t]) {
				this.formatter.formatters[t-1].handler(this);
				this.formatter.formatterRegExp.lastIndex = this.nextMatch;
				break;
			}
		}
		formatterMatch = this.formatter.formatterRegExp.exec(this.source);
	}
	if(this.nextMatch < this.source.length) {
		this.outputText(this.output,this.nextMatch,this.source.length);
		this.nextMatch = this.source.length;
	}
	this.output = oldOutput;
};

Wikifier.prototype.subWikifyTerm = function(output,terminatorRegExp)
{
	var oldOutput = this.output;
	this.output = output;
	terminatorRegExp.lastIndex = this.nextMatch;
	var terminatorMatch = terminatorRegExp.exec(this.source);
	this.formatter.formatterRegExp.lastIndex = this.nextMatch;
	var formatterMatch = this.formatter.formatterRegExp.exec(terminatorMatch ? this.source.substr(0,terminatorMatch.index) : this.source);
	while(terminatorMatch || formatterMatch) {
		if(terminatorMatch && (!formatterMatch || terminatorMatch.index <= formatterMatch.index)) {
			if(terminatorMatch.index > this.nextMatch)
				this.outputText(this.output,this.nextMatch,terminatorMatch.index);
			this.matchText = terminatorMatch[1];
			this.matchLength = terminatorMatch[1].length;
			this.matchStart = terminatorMatch.index;
			this.nextMatch = this.matchStart + this.matchLength;
			this.output = oldOutput;
			return;
		}
		if(formatterMatch.index > this.nextMatch)
			this.outputText(this.output,this.nextMatch,formatterMatch.index);
		this.matchStart = formatterMatch.index;
		this.matchLength = formatterMatch[0].length;
		this.matchText = formatterMatch[0];
		this.nextMatch = this.formatter.formatterRegExp.lastIndex;
		for(var t=1; t<formatterMatch.length; t++) {
			if(formatterMatch[t]) {
				this.formatter.formatters[t-1].handler(this);
				this.formatter.formatterRegExp.lastIndex = this.nextMatch;
				break;
			}
		}
		terminatorRegExp.lastIndex = this.nextMatch;
		terminatorMatch = terminatorRegExp.exec(this.source);
		formatterMatch = this.formatter.formatterRegExp.exec(terminatorMatch ? this.source.substr(0,terminatorMatch.index) : this.source);
	}
	if(this.nextMatch < this.source.length) {
		this.outputText(this.output,this.nextMatch,this.source.length);
		this.nextMatch = this.source.length;
	}
	this.output = oldOutput;
};

Wikifier.prototype.outputText = function(place,startPos,endPos)
{
	while(this.highlightMatch && (this.highlightRegExp.lastIndex > startPos) && (this.highlightMatch.index < endPos) && (startPos < endPos)) {
		if(this.highlightMatch.index > startPos) {
			createTiddlyText(place,this.source.substring(startPos,this.highlightMatch.index));
			startPos = this.highlightMatch.index;
		}
		var highlightEnd = Math.min(this.highlightRegExp.lastIndex,endPos);
		var theHighlight = createTiddlyElement(place,"span",null,"highlight",this.source.substring(startPos,highlightEnd));
		startPos = highlightEnd;
		if(startPos >= this.highlightRegExp.lastIndex)
			this.highlightMatch = this.highlightRegExp.exec(this.source);
	}
	if(startPos < endPos) {
		createTiddlyText(place,this.source.substring(startPos,endPos));
	}
};

//--
//-- Macro definitions
//--

config.macros.today.handler = function(place,macroName,params)
{
	var now = new Date();
	var text = params[0] ? now.formatString(params[0].trim()) : now.toLocaleString();
	createTiddlyElement(place,"span",null,null,text);
};

config.macros.version.handler = function(place)
{
	createTiddlyElement(place,"span",null,null,formatVersion());
};

config.macros.list.handler = function(place,macroName,params)
{
	var type = params[0] || "all";
	var list = document.createElement("ul");
	place.appendChild(list);
	if(this[type].prompt)
		createTiddlyElement(list,"li",null,"listTitle",this[type].prompt);
	var results;
	if(this[type].handler)
		results = this[type].handler(params);
	for(var t = 0; t < results.length; t++) {
		var li = document.createElement("li");
		list.appendChild(li);
		createTiddlyLink(li,typeof results[t] == "string" ? results[t] : results[t].title,true);
	}
};

config.macros.list.all.handler = function(params)
{
	return store.reverseLookup("tags","excludeLists",false,"title");
};

config.macros.list.missing.handler = function(params)
{
	return store.getMissingLinks();
};

config.macros.list.orphans.handler = function(params)
{
	return store.getOrphans();
};

config.macros.list.shadowed.handler = function(params)
{
	return store.getShadowed();
};

config.macros.list.touched.handler = function(params)
{
	return store.getTouched();
};

config.macros.list.filter.handler = function(params)
{
	var filter = params[1];
	var results = [];
	if(filter) {
		var tiddlers = store.filterTiddlers(filter);
		for(var t=0; t<tiddlers.length; t++)
			results.push(tiddlers[t].title);
	}
	return results;
};

config.macros.allTags.handler = function(place,macroName,params)
{
	var tags = store.getTags(params[0]);
	var ul = createTiddlyElement(place,"ul");
	if(tags.length == 0)
		createTiddlyElement(ul,"li",null,"listTitle",this.noTags);
	for(var t=0; t<tags.length; t++) {
		var title = tags[t][0];
		var info = getTiddlyLinkInfo(title);
		var li = createTiddlyElement(ul,"li");
		var btn = createTiddlyButton(li,title + " (" + tags[t][1] + ")",this.tooltip.format([title]),onClickTag,info.classes);
		btn.setAttribute("tag",title);
		btn.setAttribute("refresh","link");
		btn.setAttribute("tiddlyLink",title);
	}
};

config.macros.timeline.handler = function(place,macroName,params)
{
	var field = params[0] || "modified";
	var tiddlers = store.reverseLookup("tags","excludeLists",false,field);
	var lastDay = "";
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var dateFormat = params[2] || this.dateFormat;
	for(var t=tiddlers.length-1; t>=last; t--) {
		var tiddler = tiddlers[t];
		var theDay = tiddler[field].convertToLocalYYYYMMDDHHMM().substr(0,8);
		if(theDay != lastDay) {
			var ul = document.createElement("ul");
			place.appendChild(ul);
			createTiddlyElement(ul,"li",null,"listTitle",tiddler[field].formatString(dateFormat));
			lastDay = theDay;
		}
		createTiddlyElement(ul,"li",null,"listLink").appendChild(createTiddlyLink(place,tiddler.title,true));
	}
};

config.macros.tiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("name",null,true,false,true);
	var names = params[0]["name"];
	var tiddlerName = names[0];
	var className = names[1] || null;
	var args = params[0]["with"];
	var wrapper = createTiddlyElement(place,"span",null,className);
	if(!args) {
		wrapper.setAttribute("refresh","content");
		wrapper.setAttribute("tiddler",tiddlerName);
	}
	var text = store.getTiddlerText(tiddlerName);
	if(text) {
		var stack = config.macros.tiddler.tiddlerStack;
		if(stack.indexOf(tiddlerName) !== -1)
			return;
		stack.push(tiddlerName);
		try {
			var n = args ? Math.min(args.length,9) : 0;
			for(var i=0; i<n; i++) {
				var placeholderRE = new RegExp("\\$" + (i + 1),"mg");
				text = text.replace(placeholderRE,args[i]);
			}
			config.macros.tiddler.renderText(wrapper,text,tiddlerName,params);
		} finally {
			stack.pop();
		}
	}
};

config.macros.tiddler.renderText = function(place,text,tiddlerName,params)
{
	wikify(text,place,null,store.getTiddler(tiddlerName));
};

config.macros.tiddler.tiddlerStack = [];

config.macros.tag.handler = function(place,macroName,params)
{
	createTagButton(place,params[0],null,params[1],params[2]);
};

config.macros.tags.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var ul = createTiddlyElement(place,"ul");
	var title = getParam(params,"anon","");
	if(title && store.tiddlerExists(title))
		tiddler = store.getTiddler(title);
	var sep = getParam(params,"sep"," ");
	var lingo = config.views.wikified.tag;
	var prompt = tiddler.tags.length == 0 ? lingo.labelNoTags : lingo.labelTags;
	createTiddlyElement(ul,"li",null,"listTitle",prompt.format([tiddler.title]));
	for(var t=0; t<tiddler.tags.length; t++) {
		createTagButton(createTiddlyElement(ul,"li"),tiddler.tags[t],tiddler.title);
		if(t<tiddler.tags.length-1)
			createTiddlyText(ul,sep);
	}
};

config.macros.tagging.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var ul = createTiddlyElement(place,"ul");
	var title = getParam(params,"anon","");
	if(title == "" && tiddler instanceof Tiddler)
		title = tiddler.title;
	var sep = getParam(params,"sep"," ");
	ul.setAttribute("title",this.tooltip.format([title]));
	var tagged = store.getTaggedTiddlers(title);
	var prompt = tagged.length == 0 ? this.labelNotTag : this.label;
	createTiddlyElement(ul,"li",null,"listTitle",prompt.format([title,tagged.length]));
	for(var t=0; t<tagged.length; t++) {
		createTiddlyLink(createTiddlyElement(ul,"li"),tagged[t].title,true);
		if(t<tagged.length-1)
			createTiddlyText(ul,sep);
	}
};

config.macros.closeAll.handler = function(place)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.closeAll.onClick = function(e)
{
	story.closeAllTiddlers();
	return false;
};

config.macros.permaview.handler = function(place)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.permaview.onClick = function(e)
{
	story.permaView();
	return false;
};

config.macros.saveChanges.handler = function(place,macroName,params)
{
	if(!readOnly)
		createTiddlyButton(place,params[0] || this.label,params[1] || this.prompt,this.onClick,null,null,this.accessKey);
};

config.macros.saveChanges.onClick = function(e)
{
	saveChanges();
	return false;
};

config.macros.slider.onClickSlider = function(ev)
{
	var e = ev || window.event;
	var n = this.nextSibling;
	var cookie = n.getAttribute("cookie");
	var isOpen = n.style.display != "none";
	if(config.options.chkAnimate && anim && typeof Slider == "function")
		anim.startAnimating(new Slider(n,!isOpen,null,"none"));
	else
		n.style.display = isOpen ? "none" : "block";
	config.options[cookie] = !isOpen;
	saveOptionCookie(cookie);
	return false;
};

config.macros.slider.createSlider = function(place,cookie,title,tooltip)
{
	var c = cookie || "";
	var btn = createTiddlyButton(place,title,tooltip,this.onClickSlider);
	var panel = createTiddlyElement(null,"div",null,"sliderPanel");
	panel.setAttribute("cookie",c);
	panel.style.display = config.options[c] ? "block" : "none";
	place.appendChild(panel);
	return panel;
};

config.macros.slider.handler = function(place,macroName,params)
{
	var panel = this.createSlider(place,params[0],params[2],params[3]);
	var text = store.getTiddlerText(params[1]);
	panel.setAttribute("refresh","content");
	panel.setAttribute("tiddler",params[1]);
	if(text)
		wikify(text,panel,null,store.getTiddler(params[1]));
};

// <<gradient [[tiddler name]] vert|horiz rgb rgb rgb rgb... >>
config.macros.gradient.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var panel = wikifier ? createTiddlyElement(place,"div",null,"gradient") : place;
	panel.style.position = "relative";
	panel.style.overflow = "hidden";
	panel.style.zIndex = "0";
	if(wikifier) {
		var styles = config.formatterHelpers.inlineCssHelper(wikifier);
		config.formatterHelpers.applyCssHelper(panel,styles);
	}
	params = paramString.parseParams("color");
	var locolors = [], hicolors = [];
	for(var t=2; t<params.length; t++) {
		var c = params[t].value;
		if(params[t].name == "snap") {
			hicolors[hicolors.length-1] = c;
		} else {
			locolors.push(c);
			hicolors.push(c);
		}
	}
	drawGradient(panel,params[1].value != "vert",locolors,hicolors);
	if(wikifier)
		wikifier.subWikify(panel,">>");
	if(document.all) {
		panel.style.height = "100%";
		panel.style.width = "100%";
	}
};

config.macros.message.handler = function(place,macroName,params)
{
	if(params[0]) {
		var names = params[0].split(".");
		var lookupMessage = function(root,nameIndex) {
				if(names[nameIndex] in root) {
					if(nameIndex < names.length-1)
						return (lookupMessage(root[names[nameIndex]],nameIndex+1));
					else
						return root[names[nameIndex]];
				} else
					return null;
			};
		var m = lookupMessage(config,0);
		if(m == null)
			m = lookupMessage(window,0);
		createTiddlyText(place,m.toString().format(params.splice(1)));
	}
};


config.macros.view.views = {
	text: function(value,place,params,wikifier,paramString,tiddler) {
		highlightify(value,place,highlightHack,tiddler);
	},
	link: function(value,place,params,wikifier,paramString,tiddler) {
		createTiddlyLink(place,value,true);
	},
	wikified: function(value,place,params,wikifier,paramString,tiddler) {
		if(params[2])
			value=params[2].unescapeLineBreaks().format([value]);
		wikify(value,place,highlightHack,tiddler);
	},
	date: function(value,place,params,wikifier,paramString,tiddler) {
		value = Date.convertFromYYYYMMDDHHMM(value);
		createTiddlyText(place,value.formatString(params[2] ? params[2] : config.views.wikified.dateFormat));
	}
};

config.macros.view.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if((tiddler instanceof Tiddler) && params[0]) {
		var value = store.getValue(tiddler,params[0]);
		if(value) {
			var type = params[1] || config.macros.view.defaultView;
			var handler = config.macros.view.views[type];
			if(handler)
				handler(value,place,params,wikifier,paramString,tiddler);
		}
	}
};

config.macros.edit.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var field = params[0];
	var rows = params[1] || 0;
	var defVal = params[2] || '';
	if((tiddler instanceof Tiddler) && field) {
		story.setDirty(tiddler.title,true);
		var e,v;
		if(field != "text" && !rows) {
			e = createTiddlyElement(null,"input");
			if(tiddler.isReadOnly())
				e.setAttribute("readOnly","readOnly");
			e.setAttribute("edit",field);
			e.setAttribute("type","text");
			e.value = store.getValue(tiddler,field) || defVal;
			e.setAttribute("size","40");
			e.setAttribute("autocomplete","off");
			place.appendChild(e);
		} else {
			var wrapper1 = createTiddlyElement(null,"fieldset",null,"fieldsetFix");
			var wrapper2 = createTiddlyElement(wrapper1,"div");
			e = createTiddlyElement(wrapper2,"textarea");
			if(tiddler.isReadOnly())
				e.setAttribute("readOnly","readOnly");
			e.value = v = store.getValue(tiddler,field) || defVal;
			rows = rows || 10;
			var lines = v.match(/\n/mg);
			var maxLines = Math.max(parseInt(config.options.txtMaxEditRows),5);
			if(lines != null && lines.length > rows)
				rows = lines.length + 5;
			rows = Math.min(rows,maxLines);
			e.setAttribute("rows",rows);
			e.setAttribute("edit",field);
			place.appendChild(wrapper1);
		}
		return e;
	}
};

config.macros.tagChooser.onClick = function(ev)
{
	var e = ev || window.event;
	var lingo = config.views.editor.tagChooser;
	var popup = Popup.create(this);
	var tags = store.getTags(this.getAttribute("tags"));
	if(tags.length == 0)
		createTiddlyText(createTiddlyElement(popup,"li"),lingo.popupNone);
	for(var t=0; t<tags.length; t++) {
		var tag = createTiddlyButton(createTiddlyElement(popup,"li"),tags[t][0],lingo.tagTooltip.format([tags[t][0]]),config.macros.tagChooser.onTagClick);
		tag.setAttribute("tag",tags[t][0]);
		tag.setAttribute("tiddler",this.getAttribute("tiddler"));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

config.macros.tagChooser.onTagClick = function(ev)
{
	var e = ev || window.event;
	if(e.metaKey || e.ctrlKey) stopEvent(e); //# keep popup open on CTRL-click
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(!readOnly)
		story.setTiddlerTag(title,tag,0);
	return false;
};

config.macros.tagChooser.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(tiddler instanceof Tiddler) {
		var lingo = config.views.editor.tagChooser;
		var btn = createTiddlyButton(place,lingo.text,lingo.tooltip,this.onClick);
		btn.setAttribute("tiddler",tiddler.title);
		btn.setAttribute("tags",params[0]);
	}
};

config.macros.refreshDisplay.handler = function(place)
{
	createTiddlyButton(place,this.label,this.prompt,this.onClick);
};

config.macros.refreshDisplay.onClick = function(e)
{
	refreshAll();
	return false;
};

config.macros.annotations.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = tiddler ? tiddler.title : null;
	var a = title ? config.annotations[title] : null;
	if(!tiddler || !title || !a)
		return;
	var text = a.format([title]);
	wikify(text,createTiddlyElement(place,"div",null,"annotation"),null,tiddler);
};

//--
//-- NewTiddler and NewJournal macros
//--

config.macros.newTiddler.createNewTiddlerButton = function(place,title,params,label,prompt,accessKey,newFocus,isJournal)
{
	var tags = [];
	for(var t=1; t<params.length; t++) {
		if((params[t].name == "anon" && t != 1) || (params[t].name == "tag"))
			tags.push(params[t].value);
	}
	label = getParam(params,"label",label);
	prompt = getParam(params,"prompt",prompt);
	accessKey = getParam(params,"accessKey",accessKey);
	newFocus = getParam(params,"focus",newFocus);
	var customFields = getParam(params,"fields","");
	if(!customFields && !store.isShadowTiddler(title))
		customFields = String.encodeHashMap(config.defaultCustomFields);
	var btn = createTiddlyButton(place,label,prompt,this.onClickNewTiddler,null,null,accessKey);
	btn.setAttribute("newTitle",title);
	btn.setAttribute("isJournal",isJournal ? "true" : "false");
	if(tags.length > 0)
		btn.setAttribute("params",tags.join("|"));
	btn.setAttribute("newFocus",newFocus);
	btn.setAttribute("newTemplate",getParam(params,"template",DEFAULT_EDIT_TEMPLATE));
	if(customFields !== "")
		btn.setAttribute("customFields",customFields);
	var text = getParam(params,"text");
	if(text !== undefined)
		btn.setAttribute("newText",text);
	return btn;
};

config.macros.newTiddler.onClickNewTiddler = function()
{
	var title = this.getAttribute("newTitle");
	if(this.getAttribute("isJournal") == "true") {
		title = new Date().formatString(title.trim());
	}
	var params = this.getAttribute("params");
	var tags = params ? params.split("|") : [];
	var focus = this.getAttribute("newFocus");
	var template = this.getAttribute("newTemplate");
	var customFields = this.getAttribute("customFields");
	if(!customFields && !store.isShadowTiddler(title))
		customFields = String.encodeHashMap(config.defaultCustomFields);
	story.displayTiddler(null,title,template,false,null,null);
	var tiddlerElem = story.getTiddler(title);
	if(customFields)
		story.addCustomFields(tiddlerElem,customFields);
	var text = this.getAttribute("newText");
	if(typeof text == "string" && story.getTiddlerField(title,"text"))
		story.getTiddlerField(title,"text").value = text.format([title]);
	for(var t=0;t<tags.length;t++)
		story.setTiddlerTag(title,tags[t],+1);
	story.focusTiddler(title,focus);
	return false;
};

config.macros.newTiddler.handler = function(place,macroName,params,wikifier,paramString)
{
	if(!readOnly) {
		params = paramString.parseParams("anon",null,true,false,false);
		var title = params[1] && params[1].name == "anon" ? params[1].value : this.title;
		title = getParam(params,"title",title);
		this.createNewTiddlerButton(place,title,params,this.label,this.prompt,this.accessKey,"title",false);
	}
};

config.macros.newJournal.handler = function(place,macroName,params,wikifier,paramString)
{
	if(!readOnly) {
		params = paramString.parseParams("anon",null,true,false,false);
		var title = params[1] && params[1].name == "anon" ? params[1].value : config.macros.timeline.dateFormat;
		title = getParam(params,"title",title);
		config.macros.newTiddler.createNewTiddlerButton(place,title,params,this.label,this.prompt,this.accessKey,"text",true);
	}
};

//--
//-- Search macro
//--

config.macros.search.handler = function(place,macroName,params)
{
	var searchTimeout = null;
	var btn = createTiddlyButton(place,this.label,this.prompt,this.onClick,"searchButton");
	var txt = createTiddlyElement(null,"input",null,"txtOptionInput searchField");
	if(params[0])
		txt.value = params[0];
	if(config.browser.isSafari) {
		txt.setAttribute("type","search");
		txt.setAttribute("results","5");
	} else {
		txt.setAttribute("type","text");
	}
	place.appendChild(txt);
	txt.onkeyup = this.onKeyPress;
	txt.onfocus = this.onFocus;
	txt.setAttribute("size",this.sizeTextbox);
	txt.setAttribute("accessKey",this.accessKey);
	txt.setAttribute("autocomplete","off");
	txt.setAttribute("lastSearchText","");
};

// Global because there's only ever one outstanding incremental search timer
config.macros.search.timeout = null;

config.macros.search.doSearch = function(txt)
{
	if(txt.value.length > 0) {
		story.search(txt.value,config.options.chkCaseSensitiveSearch,config.options.chkRegExpSearch);
		txt.setAttribute("lastSearchText",txt.value);
	}
};

config.macros.search.onClick = function(e)
{
	config.macros.search.doSearch(this.nextSibling);
	return false;
};

config.macros.search.onKeyPress = function(ev)
{
	var e = ev || window.event;
	switch(e.keyCode) {
		case 13: // Ctrl-Enter
		case 10: // Ctrl-Enter on IE PC
			config.macros.search.doSearch(this);
			break;
		case 27: // Escape
			this.value = "";
			clearMessage();
			break;
	}
	if(config.options.chkIncrementalSearch) {
		if(this.value.length > 2) {
			if(this.value != this.getAttribute("lastSearchText")) {
				if(config.macros.search.timeout)
					clearTimeout(config.macros.search.timeout);
				var txt = this;
				config.macros.search.timeout = setTimeout(function() {config.macros.search.doSearch(txt);},500);
			}
		} else {
			if(config.macros.search.timeout)
				clearTimeout(config.macros.search.timeout);
		}
	}
};

config.macros.search.onFocus = function(e)
{
	this.select();
};

//--
//-- Tabs macro
//--

config.macros.tabs.handler = function(place,macroName,params)
{
	var cookie = params[0];
	var numTabs = (params.length-1)/3;
	var wrapper = createTiddlyElement(null,"div",null,"tabsetWrapper " + cookie);
	var tabset = createTiddlyElement(wrapper,"div",null,"tabset");
	tabset.setAttribute("cookie",cookie);
	var validTab = false;
	for(var t=0; t<numTabs; t++) {
		var label = params[t*3+1];
		var prompt = params[t*3+2];
		var content = params[t*3+3];
		var tab = createTiddlyButton(tabset,label,prompt,this.onClickTab,"tab tabUnselected");
		tab.setAttribute("tab",label);
		tab.setAttribute("content",content);
		tab.title = prompt;
		if(config.options[cookie] == label)
			validTab = true;
	}
	if(!validTab)
		config.options[cookie] = params[1];
	place.appendChild(wrapper);
	this.switchTab(tabset,config.options[cookie]);
};

config.macros.tabs.onClickTab = function(e)
{
	config.macros.tabs.switchTab(this.parentNode,this.getAttribute("tab"));
	return false;
};

config.macros.tabs.switchTab = function(tabset,tab)
{
	var cookie = tabset.getAttribute("cookie");
	var theTab = null;
	var nodes = tabset.childNodes;
	for(var t=0; t<nodes.length; t++) {
		if(nodes[t].getAttribute && nodes[t].getAttribute("tab") == tab) {
			theTab = nodes[t];
			theTab.className = "tab tabSelected";
		} else {
			nodes[t].className = "tab tabUnselected";
		}
	}
	if(theTab) {
		if(tabset.nextSibling && tabset.nextSibling.className == "tabContents")
			removeNode(tabset.nextSibling);
		var tabContent = createTiddlyElement(null,"div",null,"tabContents");
		tabset.parentNode.insertBefore(tabContent,tabset.nextSibling);
		var contentTitle = theTab.getAttribute("content");
		wikify(store.getTiddlerText(contentTitle),tabContent,null,store.getTiddler(contentTitle));
		if(cookie) {
			config.options[cookie] = tab;
			saveOptionCookie(cookie);
		}
	}
};

//--
//-- Tiddler toolbar
//--

// Create a toolbar command button
config.macros.toolbar.createCommand = function(place,commandName,tiddler,className)
{
	if(typeof commandName != "string") {
		var c = null;
		for(var t in config.commands) {
			if(config.commands[t] == commandName)
				c = t;
		}
		commandName = c;
	}
	if((tiddler instanceof Tiddler) && (typeof commandName == "string")) {
		var command = config.commands[commandName];
		if(command.isEnabled ? command.isEnabled(tiddler) : this.isCommandEnabled(command,tiddler)) {
			var text = command.getText ? command.getText(tiddler) : this.getCommandText(command,tiddler);
			var tooltip = command.getTooltip ? command.getTooltip(tiddler) : this.getCommandTooltip(command,tiddler);
			var cmd;
			switch(command.type) {
			case "popup":
				cmd = this.onClickPopup;
				break;
			case "command":
			default:
				cmd = this.onClickCommand;
				break;
			}
			var btn = createTiddlyButton(null,text,tooltip,cmd);
			btn.setAttribute("commandName",commandName);
			btn.setAttribute("tiddler",tiddler.title);
			if(className)
				addClass(btn,className);
			place.appendChild(btn);
		}
	}
};

config.macros.toolbar.isCommandEnabled = function(command,tiddler)
{
	var title = tiddler.title;
	var ro = tiddler.isReadOnly();
	var shadow = store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};

config.macros.toolbar.getCommandText = function(command,tiddler)
{
	return tiddler.isReadOnly() && command.readOnlyText || command.text;
};

config.macros.toolbar.getCommandTooltip = function(command,tiddler)
{
	return tiddler.isReadOnly() && command.readOnlyTooltip || command.tooltip;
};

config.macros.toolbar.onClickCommand = function(ev)
{
	var e = ev || window.event;
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	var command = config.commands[this.getAttribute("commandName")];
	return command.handler(e,this,this.getAttribute("tiddler"));
};

config.macros.toolbar.onClickPopup = function(ev)
{
	var e = ev || window.event;
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	var popup = Popup.create(this);
	var command = config.commands[this.getAttribute("commandName")];
	var title = this.getAttribute("tiddler");
	var tiddler = store.fetchTiddler(title);
	popup.setAttribute("tiddler",title);
	command.handlePopup(popup,title);
	Popup.show();
	return false;
};

// Invoke the first command encountered from a given place that is tagged with a specified class
config.macros.toolbar.invokeCommand = function(place,className,event)
{
	var children = place.getElementsByTagName("a");
	for(var t=0; t<children.length; t++) {
		var c = children[t];
		if(hasClass(c,className) && c.getAttribute && c.getAttribute("commandName")) {
			if(c.onclick instanceof Function)
				c.onclick.call(c,event);
			break;
		}
	}
};

config.macros.toolbar.onClickMore = function(ev)
{
	var e = this.nextSibling;
	e.style.display = "inline";
	removeNode(this);
	return false;
};

config.macros.toolbar.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	for(var t=0; t<params.length; t++) {
		var c = params[t];
		switch(c) {
		case '>':
			var btn = createTiddlyButton(place,this.moreLabel,this.morePrompt,config.macros.toolbar.onClickMore);
			addClass(btn,"moreCommand");
			var e = createTiddlyElement(place,"span",null,"moreCommand");
			e.style.display = "none";
			place = e;
			break;
		default:
			var className = "";
			switch(c.substr(0,1)) {
			case "+":
				className = "defaultCommand";
				c = c.substr(1);
				break;
			case "-":
				className = "cancelCommand";
				c = c.substr(1);
				break;
			}
			if(c in config.commands)
				this.createCommand(place,c,tiddler,className);
			break;
		}
	}
};

//--
//-- Menu and toolbar commands
//--

config.commands.closeTiddler.handler = function(event,src,title)
{
	if(story.isDirty(title) && !readOnly) {
		if(!confirm(config.commands.cancelTiddler.warning.format([title])))
			return false;
	}
	story.setDirty(title,false);
	story.closeTiddler(title,true);
	return false;
};

config.commands.closeOthers.handler = function(event,src,title)
{
	story.closeAllTiddlers(title);
	return false;
};

config.commands.editTiddler.handler = function(event,src,title)
{
	clearMessage();
	var tiddlerElem = story.getTiddler(title);
	var fields = tiddlerElem.getAttribute("tiddlyFields");
	story.displayTiddler(null,title,DEFAULT_EDIT_TEMPLATE,false,null,fields);
	story.focusTiddler(title,config.options.txtEditorFocus||"text");
	return false;
};

config.commands.saveTiddler.handler = function(event,src,title)
{
	var newTitle = story.saveTiddler(title,event.shiftKey);
	if(newTitle)
		story.displayTiddler(null,newTitle);
	return false;
};

config.commands.cancelTiddler.handler = function(event,src,title)
{
	if(story.hasChanges(title) && !readOnly) {
		if(!confirm(this.warning.format([title])))
			return false;
	}
	story.setDirty(title,false);
	story.displayTiddler(null,title);
	return false;
};

config.commands.deleteTiddler.handler = function(event,src,title)
{
	var deleteIt = true;
	if(config.options.chkConfirmDelete)
		deleteIt = confirm(this.warning.format([title]));
	if(deleteIt) {
		store.removeTiddler(title);
		story.closeTiddler(title,true);
		autoSaveChanges();
	}
	return false;
};

config.commands.permalink.handler = function(event,src,title)
{
	var t = encodeURIComponent(String.encodeTiddlyLink(title));
	if(window.location.hash != t)
		window.location.hash = t;
	return false;
};

config.commands.references.handlePopup = function(popup,title)
{
	var references = store.getReferringTiddlers(title);
	var c = false;
	for(var r=0; r<references.length; r++) {
		if(references[r].title != title && !references[r].isTagged("excludeLists")) {
			createTiddlyLink(createTiddlyElement(popup,"li"),references[r].title,true);
			c = true;
		}
	}
	if(!c)
		createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),this.popupNone);
};

config.commands.jump.handlePopup = function(popup,title)
{
	story.forEachTiddler(function(title,element) {
		createTiddlyLink(createTiddlyElement(popup,"li"),title,true,null,false,null,true);
		});
};

config.commands.syncing.handlePopup = function(popup,title)
{
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return;
	var serverType = tiddler.getServerType();
	var serverHost = tiddler.fields['server.host'];
	var serverWorkspace = tiddler.fields['server.workspace'];
	if(!serverWorkspace)
		serverWorkspace = "";
	if(serverType) {
		var e = createTiddlyElement(popup,"li",null,"popupMessage");
		e.innerHTML = config.commands.syncing.currentlySyncing.format([serverType,serverHost,serverWorkspace]);
	} else {
		createTiddlyElement(popup,"li",null,"popupMessage",config.commands.syncing.notCurrentlySyncing);
	}
	if(serverType) {
		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
		var btn = createTiddlyButton(createTiddlyElement(popup,"li"),this.captionUnSync,null,config.commands.syncing.onChooseServer);
		btn.setAttribute("tiddler",title);
		btn.setAttribute("server.type","");
	}
	createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
	createTiddlyElement(popup,"li",null,"popupMessage",config.commands.syncing.chooseServer);
	var feeds = store.getTaggedTiddlers("systemServer","title");
	for(var t=0; t<feeds.length; t++) {
		var f = feeds[t];
		var feedServerType = store.getTiddlerSlice(f.title,"Type");
		if(!feedServerType)
			feedServerType = "file";
		var feedServerHost = store.getTiddlerSlice(f.title,"URL");
		if(!feedServerHost)
			feedServerHost = "";
		var feedServerWorkspace = store.getTiddlerSlice(f.title,"Workspace");
		if(!feedServerWorkspace)
			feedServerWorkspace = "";
		var caption = f.title;
		if(serverType == feedServerType && serverHost == feedServerHost && serverWorkspace == feedServerWorkspace) {
			caption = config.commands.syncing.currServerMarker + caption;
		} else {
			caption = config.commands.syncing.notCurrServerMarker + caption;
		}
		btn = createTiddlyButton(createTiddlyElement(popup,"li"),caption,null,config.commands.syncing.onChooseServer);
		btn.setAttribute("tiddler",title);
		btn.setAttribute("server.type",feedServerType);
		btn.setAttribute("server.host",feedServerHost);
		btn.setAttribute("server.workspace",feedServerWorkspace);
	}
};

config.commands.syncing.onChooseServer = function(e)
{
	var tiddler = this.getAttribute("tiddler");
	var serverType = this.getAttribute("server.type");
	if(serverType) {
		store.addTiddlerFields(tiddler,{
			"server.type": serverType,
			"server.host": this.getAttribute("server.host"),
			"server.workspace": this.getAttribute("server.workspace")
			});
	} else {
		store.setValue(tiddler,"server",null);
	}
	return false;
};

config.commands.fields.handlePopup = function(popup,title)
{
	var tiddler = store.fetchTiddler(title);
	if(!tiddler)
		return;
	var items = [];
	store.forEachField(tiddler,function(tiddler,fieldName,value){items.push({field:fieldName,value:value});},true);
	items.sort(function(a,b) {return a.field < b.field ? -1 : (a.field == b.field ? 0 : +1);});
	if(items.length > 0)
		ListView.create(popup,items,this.listViewTemplate);
	else
		createTiddlyElement(popup,"div",null,null,this.emptyText);
};

//--
//-- Tiddler() object
//--

function Tiddler(title)
{
	this.title = title;
	this.text = "";
	this.modifier = null;
	this.created = new Date();
	this.modified = this.created;
	this.links = [];
	this.linksUpdated = false;
	this.tags = [];
	this.fields = {};
	return this;
}

Tiddler.prototype.getLinks = function()
{
	if(this.linksUpdated==false)
		this.changed();
	return this.links;
};

// Returns the fields that are inherited in string field:"value" field2:"value2" format
Tiddler.prototype.getInheritedFields = function()
{
	var f = {};
	for(var i in this.fields) {
		if(i=="server.host" || i=="server.workspace" || i=="wikiformat"|| i=="server.type") {
			f[i] = this.fields[i];
		}
	}
	return String.encodeHashMap(f);
};

// Increment the changeCount of a tiddler
Tiddler.prototype.incChangeCount = function()
{
	var c = this.fields['changecount'];
	c = c ? parseInt(c,10) : 0;
	this.fields['changecount'] = String(c+1);
};

// Clear the changeCount of a tiddler
Tiddler.prototype.clearChangeCount = function()
{
	if(this.fields['changecount']) {
		delete this.fields['changecount'];
	}
};

Tiddler.prototype.doNotSave = function()
{
	return this.fields['doNotSave'];
};

// Returns true if the tiddler has been updated since the tiddler was created or downloaded
Tiddler.prototype.isTouched = function()
{
	var changeCount = this.fields['changecount'];
	if(changeCount === undefined)
		changeCount = 0;
	return changeCount > 0;
};

// Change the text and other attributes of a tiddler
Tiddler.prototype.set = function(title,text,modifier,modified,tags,created,fields)
{
	this.assign(title,text,modifier,modified,tags,created,fields);
	this.changed();
	return this;
};

// Change the text and other attributes of a tiddler without triggered a tiddler.changed() call
Tiddler.prototype.assign = function(title,text,modifier,modified,tags,created,fields)
{
	if(title != undefined)
		this.title = title;
	if(text != undefined)
		this.text = text;
	if(modifier != undefined)
		this.modifier = modifier;
	if(modified != undefined)
		this.modified = modified;
	if(created != undefined)
		this.created = created;
	if(fields != undefined)
		this.fields = fields;
	if(tags != undefined)
		this.tags = (typeof tags == "string") ? tags.readBracketedList() : tags;
	else if(this.tags == undefined)
		this.tags = [];
	return this;
};

// Get the tags for a tiddler as a string (space delimited, using [[brackets]] for tags containing spaces)
Tiddler.prototype.getTags = function()
{
	return String.encodeTiddlyLinkList(this.tags);
};

// Test if a tiddler carries a tag
Tiddler.prototype.isTagged = function(tag)
{
	return this.tags.indexOf(tag) != -1;
};

// Static method to convert "\n" to newlines, "\s" to "\"
Tiddler.unescapeLineBreaks = function(text)
{
	return text ? text.unescapeLineBreaks() : "";
};

// Convert newlines to "\n", "\" to "\s"
Tiddler.prototype.escapeLineBreaks = function()
{
	return this.text.escapeLineBreaks();
};

// Updates the secondary information (like links[] array) after a change to a tiddler
Tiddler.prototype.changed = function()
{
	this.links = [];
	var text = this.text;
	// remove 'quoted' text before scanning tiddler source
	text = text.replace(/\/%((?:.|\n)*?)%\//g,"").
		replace(/\{{3}((?:.|\n)*?)\}{3}/g,"").
		replace(/"""((?:.|\n)*?)"""/g,"").
		replace(/\<nowiki\>((?:.|\n)*?)\<\/nowiki\>/g,"").
		replace(/\<html\>((?:.|\n)*?)\<\/html\>/g,"").
		replace(/\<script((?:.|\n)*?)\<\/script\>/g,"");
	var t = this.autoLinkWikiWords() ? 0 : 1;
	var tiddlerLinkRegExp = t==0 ? config.textPrimitives.tiddlerAnyLinkRegExp : config.textPrimitives.tiddlerForcedLinkRegExp;
	tiddlerLinkRegExp.lastIndex = 0;
	var formatMatch = tiddlerLinkRegExp.exec(text);
	while(formatMatch) {
		var lastIndex = tiddlerLinkRegExp.lastIndex;
		if(t==0 && formatMatch[1] && formatMatch[1] != this.title) {
			// wikiWordLink
			if(formatMatch.index > 0) {
				var preRegExp = new RegExp(config.textPrimitives.unWikiLink+"|"+config.textPrimitives.anyLetter,"mg");
				preRegExp.lastIndex = formatMatch.index-1;
				var preMatch = preRegExp.exec(text);
				if(preMatch.index != formatMatch.index-1)
					this.links.pushUnique(formatMatch[1]);
			} else {
				this.links.pushUnique(formatMatch[1]);
			}
		}
		else if(formatMatch[2-t] && !config.formatterHelpers.isExternalLink(formatMatch[3-t])) // titledBrackettedLink
			this.links.pushUnique(formatMatch[3-t]);
		else if(formatMatch[4-t] && formatMatch[4-t] != this.title) // brackettedLink
			this.links.pushUnique(formatMatch[4-t]);
		tiddlerLinkRegExp.lastIndex = lastIndex;
		formatMatch = tiddlerLinkRegExp.exec(text);
	}
	this.linksUpdated = true;
};

Tiddler.prototype.getSubtitle = function()
{
	var modifier = this.modifier;
	if(!modifier)
		modifier = config.messages.subtitleUnknown;
	var modified = this.modified;
	if(modified)
		modified = modified.toLocaleString();
	else
		modified = config.messages.subtitleUnknown;
	return config.messages.tiddlerLinkTooltip.format([this.title,modifier,modified]);
};

Tiddler.prototype.isReadOnly = function()
{
	return readOnly;
};

Tiddler.prototype.autoLinkWikiWords = function()
{
	return !(this.isTagged("systemConfig") || this.isTagged("excludeMissing"));
};

Tiddler.prototype.generateFingerprint = function()
{
	return "0x" + Crypto.hexSha1Str(this.text);
};

Tiddler.prototype.getServerType = function()
{
	var serverType = null;
	if(this.fields['server.type'])
		serverType = this.fields['server.type'];
	if(!serverType)
		serverType = this.fields['wikiformat'];
	if(serverType && !config.adaptors[serverType])
		serverType = null;
	return serverType;
};

Tiddler.prototype.getAdaptor = function()
{
	var serverType = this.getServerType();
	return serverType ? new config.adaptors[serverType]() : null;
};

//--
//-- TiddlyWiki() object contains Tiddler()s
//--

function TiddlyWiki()
{
	var tiddlers = {}; // Hashmap by name of tiddlers
	this.tiddlersUpdated = false;
	this.namedNotifications = []; // Array of {name:,notify:} of notification functions
	this.notificationLevel = 0;
	this.slices = {}; // map tiddlerName->(map sliceName->sliceValue). Lazy.
	this.clear = function() {
		tiddlers = {};
		this.setDirty(false);
	};
	this.fetchTiddler = function(title) {
		var t = tiddlers[title];
		return t instanceof Tiddler ? t : null;
	};
	this.deleteTiddler = function(title) {
		delete this.slices[title];
		delete tiddlers[title];
	};
	this.addTiddler = function(tiddler) {
		delete this.slices[tiddler.title];
		tiddlers[tiddler.title] = tiddler;
	};
	this.forEachTiddler = function(callback) {
		for(var t in tiddlers) {
			var tiddler = tiddlers[t];
			if(tiddler instanceof Tiddler)
				callback.call(this,t,tiddler);
		}
	};
}

TiddlyWiki.prototype.setDirty = function(dirty)
{
	this.dirty = dirty;
};

TiddlyWiki.prototype.isDirty = function()
{
	return this.dirty;
};

TiddlyWiki.prototype.tiddlerExists = function(title)
{
	var t = this.fetchTiddler(title);
	return t != undefined;
};

TiddlyWiki.prototype.isShadowTiddler = function(title)
{
	return config.shadowTiddlers[title] === undefined ? false : true;
};

TiddlyWiki.prototype.createTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler) {
		tiddler = new Tiddler(title);
		this.addTiddler(tiddler);
		this.setDirty(true);
	}
	return tiddler;
};

TiddlyWiki.prototype.getTiddler = function(title)
{
	var t = this.fetchTiddler(title);
	if(t != undefined)
		return t;
	else
		return null;
};

TiddlyWiki.prototype.getShadowTiddlerText = function(title)
{
	if(typeof config.shadowTiddlers[title] == "string")
		return config.shadowTiddlers[title];
	else
		return "";
};

TiddlyWiki.prototype.getTiddlerText = function(title,defaultText)
{
	if(!title)
		return defaultText;
	var pos = title.indexOf(config.textPrimitives.sectionSeparator);
	var section = null;
	if(pos != -1) {
		section = title.substr(pos + config.textPrimitives.sectionSeparator.length);
		title = title.substr(0,pos);
	}
	pos = title.indexOf(config.textPrimitives.sliceSeparator);
	if(pos != -1) {
		var slice = this.getTiddlerSlice(title.substr(0,pos),title.substr(pos + config.textPrimitives.sliceSeparator.length));
		if(slice)
			return slice;
	}
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		if(!section)
			return tiddler.text;
		var re = new RegExp("(^!{1,6}" + section.escapeRegExp() + "[ \t]*\n)","mg");
		re.lastIndex = 0;
		var match = re.exec(tiddler.text);
		if(match) {
			var t = tiddler.text.substr(match.index+match[1].length);
			var re2 = /^!/mg;
			re2.lastIndex = 0;
			match = re2.exec(t); //# search for the next heading
			if(match)
				t = t.substr(0,match.index-1);//# don't include final \n
			return t;
		}
		return defaultText;
	}
	if(this.isShadowTiddler(title))
		return this.getShadowTiddlerText(title);
	if(defaultText != undefined)
		return defaultText;
	return null;
};

TiddlyWiki.prototype.getRecursiveTiddlerText = function(title,defaultText,depth)
{
	var bracketRegExp = new RegExp("(?:\\[\\[([^\\]]+)\\]\\])","mg");
	var text = this.getTiddlerText(title,null);
	if(text == null)
		return defaultText;
	var textOut = [];
	var lastPos = 0;
	do {
		var match = bracketRegExp.exec(text);
		if(match) {
			textOut.push(text.substr(lastPos,match.index-lastPos));
			if(match[1]) {
				if(depth <= 0)
					textOut.push(match[1]);
				else
					textOut.push(this.getRecursiveTiddlerText(match[1],"[[" + match[1] + "]]",depth-1));
			}
			lastPos = match.index + match[0].length;
		} else {
			textOut.push(text.substr(lastPos));
		}
	} while(match);
	return textOut.join("");
};

TiddlyWiki.prototype.slicesRE = /(?:^([\'\/]{0,2})~?([\.\w]+)\:\1[\t\x20]*([^\n]+)[\t\x20]*$)|(?:^\|([\'\/]{0,2})~?([\.\w]+)\:?\4\|[\t\x20]*([^\n]+)[\t\x20]*\|$)/gm;

// @internal
TiddlyWiki.prototype.calcAllSlices = function(title)
{
	var slices = {};
	var text = this.getTiddlerText(title,"");
	this.slicesRE.lastIndex = 0;
	var m = this.slicesRE.exec(text);
	while(m) {
		if(m[2])
			slices[m[2]] = m[3];
		else
			slices[m[5]] = m[6];
		m = this.slicesRE.exec(text);
	}
	return slices;
};

// Returns the slice of text of the given name
TiddlyWiki.prototype.getTiddlerSlice = function(title,sliceName)
{
	var slices = this.slices[title];
	if(!slices) {
		slices = this.calcAllSlices(title);
		this.slices[title] = slices;
	}
	return slices[sliceName];
};

// Build an hashmap of the specified named slices of a tiddler
TiddlyWiki.prototype.getTiddlerSlices = function(title,sliceNames)
{
	var r = {};
	for(var t=0; t<sliceNames.length; t++) {
		var slice = this.getTiddlerSlice(title,sliceNames[t]);
		if(slice)
			r[sliceNames[t]] = slice;
	}
	return r;
};

TiddlyWiki.prototype.suspendNotifications = function()
{
	this.notificationLevel--;
};

TiddlyWiki.prototype.resumeNotifications = function()
{
	this.notificationLevel++;
};

// Invoke the notification handlers for a particular tiddler
TiddlyWiki.prototype.notify = function(title,doBlanket)
{
	if(!this.notificationLevel) {
		for(var t=0; t<this.namedNotifications.length; t++) {
			var n = this.namedNotifications[t];
			if((n.name == null && doBlanket) || (n.name == title))
				n.notify(title);
		}
	}
};

// Invoke the notification handlers for all tiddlers
TiddlyWiki.prototype.notifyAll = function()
{
	if(!this.notificationLevel) {
		for(var t=0; t<this.namedNotifications.length; t++) {
			var n = this.namedNotifications[t];
			if(n.name)
				n.notify(n.name);
		}
	}
};

// Add a notification handler to a tiddler
TiddlyWiki.prototype.addNotification = function(title,fn)
{
	for(var i=0; i<this.namedNotifications.length; i++) {
		if((this.namedNotifications[i].name == title) && (this.namedNotifications[i].notify == fn))
			return this;
	}
	this.namedNotifications.push({name: title, notify: fn});
	return this;
};

TiddlyWiki.prototype.removeTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		this.deleteTiddler(title);
		this.notify(title,true);
		this.setDirty(true);
	}
};

// Reset the sync status of a freshly synced tiddler
TiddlyWiki.prototype.resetTiddler = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		tiddler.clearChangeCount();
		this.notify(title,true);
		this.setDirty(true);
	}
};

TiddlyWiki.prototype.setTiddlerTag = function(title,status,tag)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		var t = tiddler.tags.indexOf(tag);
		if(t != -1)
			tiddler.tags.splice(t,1);
		if(status)
			tiddler.tags.push(tag);
		tiddler.changed();
		tiddler.incChangeCount();
		this.notify(title,true);
		this.setDirty(true);
	}
};

TiddlyWiki.prototype.addTiddlerFields = function(title,fields)
{
	var tiddler = this.fetchTiddler(title);
	if(!tiddler)
		return;
	merge(tiddler.fields,fields);
	tiddler.changed();
	tiddler.incChangeCount();
	this.notify(title,true);
	this.setDirty(true);
};

TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags,fields,clearChangeCount,created)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler) {
		created = created || tiddler.created; // Preserve created date
		this.deleteTiddler(title);
	} else {
		created = created || modified;
		tiddler = new Tiddler();
	}
	tiddler.set(newTitle,newBody,modifier,modified,tags,created,fields);
	this.addTiddler(tiddler);
	if(clearChangeCount)
		tiddler.clearChangeCount();
	else
		tiddler.incChangeCount();
	if(title != newTitle)
		this.notify(title,true);
	this.notify(newTitle,true);
	this.setDirty(true);
	return tiddler;
};

TiddlyWiki.prototype.incChangeCount = function(title)
{
	var tiddler = this.fetchTiddler(title);
	if(tiddler)
		tiddler.incChangeCount();
};

TiddlyWiki.prototype.getLoader = function()
{
	if(!this.loader)
		this.loader = new TW21Loader();
	return this.loader;
};

TiddlyWiki.prototype.getSaver = function()
{
	if(!this.saver)
		this.saver = new TW21Saver();
	return this.saver;
};

// Return all tiddlers formatted as an HTML string
TiddlyWiki.prototype.allTiddlersAsHtml = function()
{
	return this.getSaver().externalize(store);
};

// Load contents of a TiddlyWiki from an HTML DIV
TiddlyWiki.prototype.loadFromDiv = function(src,idPrefix,noUpdate)
{
	this.idPrefix = idPrefix;
	var storeElem = (typeof src == "string") ? document.getElementById(src) : src;
	if(!storeElem)
		return;
	var tiddlers = this.getLoader().loadTiddlers(this,storeElem.childNodes);
	this.setDirty(false);
	if(!noUpdate) {
		for(var i = 0;i<tiddlers.length; i++)
			tiddlers[i].changed();
	}
};

// Load contents of a TiddlyWiki from a string
// Returns null if there's an error
TiddlyWiki.prototype.importTiddlyWiki = function(text)
{
	var posDiv = locateStoreArea(text);
	if(!posDiv)
		return null;
	var content = "<" + "html><" + "body>" + text.substring(posDiv[0],posDiv[1] + endSaveArea.length) + "<" + "/body><" + "/html>";
	// Create the iframe
	var iframe = document.createElement("iframe");
	iframe.style.display = "none";
	document.body.appendChild(iframe);
	var doc = iframe.document;
	if(iframe.contentDocument)
		doc = iframe.contentDocument; // For NS6
	else if(iframe.contentWindow)
		doc = iframe.contentWindow.document; // For IE5.5 and IE6
	// Put the content in the iframe
	doc.open();
	doc.writeln(content);
	doc.close();
	// Load the content into a TiddlyWiki() object
	var storeArea = doc.getElementById("storeArea");
	this.loadFromDiv(storeArea,"store");
	// Get rid of the iframe
	iframe.parentNode.removeChild(iframe);
	return this;
};

TiddlyWiki.prototype.updateTiddlers = function()
{
	this.tiddlersUpdated = true;
	this.forEachTiddler(function(title,tiddler) {
		tiddler.changed();
	});
};

// Return an array of tiddlers matching a search regular expression
TiddlyWiki.prototype.search = function(searchRegExp,sortField,excludeTag,match)
{
	var candidates = this.reverseLookup("tags",excludeTag,!!match);
	var results = [];
	for(var t=0; t<candidates.length; t++) {
		if((candidates[t].title.search(searchRegExp) != -1) || (candidates[t].text.search(searchRegExp) != -1))
			results.push(candidates[t]);
	}
	if(!sortField)
		sortField = "title";
	results.sort(function(a,b) {return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);});
	return results;
};

// Returns a list of all tags in use
//   excludeTag - if present, excludes tags that are themselves tagged with excludeTag
// Returns an array of arrays where [tag][0] is the name of the tag and [tag][1] is the number of occurances
TiddlyWiki.prototype.getTags = function(excludeTag)
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		for(var g=0; g<tiddler.tags.length; g++) {
			var tag = tiddler.tags[g];
			var n = true;
			for(var c=0; c<results.length; c++) {
				if(results[c][0] == tag) {
					n = false;
					results[c][1]++;
				}
			}
			if(n && excludeTag) {
				var t = this.fetchTiddler(tag);
				if(t && t.isTagged(excludeTag))
					n = false;
			}
			if(n)
				results.push([tag,1]);
		}
	});
	results.sort(function(a,b) {return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : (a[0].toLowerCase() == b[0].toLowerCase() ? 0 : +1);});
	return results;
};

// Return an array of the tiddlers that are tagged with a given tag
TiddlyWiki.prototype.getTaggedTiddlers = function(tag,sortField)
{
	return this.reverseLookup("tags",tag,true,sortField);
};

// Return an array of the tiddlers that link to a given tiddler
TiddlyWiki.prototype.getReferringTiddlers = function(title,unusedParameter,sortField)
{
	if(!this.tiddlersUpdated)
		this.updateTiddlers();
	return this.reverseLookup("links",title,true,sortField);
};

// Return an array of the tiddlers that do or do not have a specified entry in the specified storage array (ie, "links" or "tags")
// lookupMatch == true to match tiddlers, false to exclude tiddlers
TiddlyWiki.prototype.reverseLookup = function(lookupField,lookupValue,lookupMatch,sortField)
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		var f = !lookupMatch;
		for(var lookup=0; lookup<tiddler[lookupField].length; lookup++) {
			if(tiddler[lookupField][lookup] == lookupValue)
				f = lookupMatch;
		}
		if(f)
			results.push(tiddler);
	});
	if(!sortField)
		sortField = "title";
	results.sort(function(a,b) {return a[sortField] < b[sortField] ? -1 : (a[sortField] == b[sortField] ? 0 : +1);});
	return results;
};

// Return the tiddlers as a sorted array
TiddlyWiki.prototype.getTiddlers = function(field,excludeTag)
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(excludeTag == undefined || !tiddler.isTagged(excludeTag))
			results.push(tiddler);
	});
	if(field)
		results.sort(function(a,b) {return a[field] < b[field] ? -1 : (a[field] == b[field] ? 0 : +1);});
	return results;
};

// Return array of names of tiddlers that are referred to but not defined
TiddlyWiki.prototype.getMissingLinks = function(sortField)
{
	if(!this.tiddlersUpdated)
		this.updateTiddlers();
	var results = [];
	this.forEachTiddler(function (title,tiddler) {
		if(tiddler.isTagged("excludeMissing") || tiddler.isTagged("systemConfig"))
			return;
		for(var n=0; n<tiddler.links.length;n++) {
			var link = tiddler.links[n];
			if(this.fetchTiddler(link) == null && !this.isShadowTiddler(link))
				results.pushUnique(link);
		}
	});
	results.sort();
	return results;
};

// Return an array of names of tiddlers that are defined but not referred to
TiddlyWiki.prototype.getOrphans = function()
{
	var results = [];
	this.forEachTiddler(function (title,tiddler) {
		if(this.getReferringTiddlers(title).length == 0 && !tiddler.isTagged("excludeLists"))
			results.push(title);
	});
	results.sort();
	return results;
};

// Return an array of names of all the shadow tiddlers
TiddlyWiki.prototype.getShadowed = function()
{
	var results = [];
	for(var t in config.shadowTiddlers) {
		if(this.isShadowTiddler(t))
			results.push(t);
	}
	results.sort();
	return results;
};

// Return an array of tiddlers that have been touched since they were downloaded or created
TiddlyWiki.prototype.getTouched = function()
{
	var results = [];
	this.forEachTiddler(function(title,tiddler) {
		if(tiddler.isTouched())
			results.push(tiddler);
		});
	results.sort();
	return results;
};

// Resolves a Tiddler reference or tiddler title into a Tiddler object, or null if it doesn't exist
TiddlyWiki.prototype.resolveTiddler = function(tiddler)
{
	var t = (typeof tiddler == 'string') ? this.getTiddler(tiddler) : tiddler;
	return t instanceof Tiddler ? t : null;
};

// Filter a list of tiddlers
TiddlyWiki.prototype.filterTiddlers = function(filter)
{
	var results = [];
	if(filter) {
		var tiddler;
		var re = /([^\s\[\]]+)|(?:\[([ \w]+)\[([^\]]+)\]\])|(?:\[\[([^\]]+)\]\])/mg;
		var match = re.exec(filter);
		while(match) {
			if(match[1] || match[4]) {
				var title = match[1] || match[4];
				tiddler = this.fetchTiddler(title);
				if(tiddler) {
					results.pushUnique(tiddler);
				} else if(this.isShadowTiddler(title)) {
					tiddler = new Tiddler();
					tiddler.set(title,this.getTiddlerText(title));
					results.pushUnique(tiddler);
				} else {
					results.pushUnique(new Tiddler(title));
				}
			} else if(match[2]) {
				switch(match[2]) {
					case "tag":
						var matched = this.getTaggedTiddlers(match[3]);
						for(var m = 0; m < matched.length; m++)
							results.pushUnique(matched[m]);
						break;
					case "sort":
						results = this.sortTiddlers(results,match[3]);
						break;
				}
			}
			match = re.exec(filter);
		}
	}
	return results;
};

// Sort a list of tiddlers
TiddlyWiki.prototype.sortTiddlers = function(tiddlers,field)
{
	var asc = +1;
	switch(field.substr(0,1)) {
	case "-":
		asc = -1;
		// Note: this fall-through is intentional
		/*jsl:fallthru*/
	case "+":
		field = field.substr(1);
		break;
	}
	if(TiddlyWiki.standardFieldAccess[field])
		tiddlers.sort(function(a,b) {return a[field] < b[field] ? -asc : (a[field] == b[field] ? 0 : asc);});
	else
		tiddlers.sort(function(a,b) {return a.fields[field] < b.fields[field] ? -asc : (a.fields[field] == b.fields[field] ? 0 : +asc);});
	return tiddlers;
};

// Returns true if path is a valid field name (path),
// i.e. a sequence of identifiers, separated by '.'
TiddlyWiki.isValidFieldName = function(name)
{
	var match = /[a-zA-Z_]\w*(\.[a-zA-Z_]\w*)*/.exec(name);
	return match && (match[0] == name);
};

// Throws an exception when name is not a valid field name.
TiddlyWiki.checkFieldName = function(name)
{
	if(!TiddlyWiki.isValidFieldName(name))
		throw config.messages.invalidFieldName.format([name]);
};

function StringFieldAccess(n,readOnly)
{
	this.set = readOnly ?
			function(t,v) {if(v != t[n]) throw config.messages.fieldCannotBeChanged.format([n]);} :
			function(t,v) {if(v != t[n]) {t[n] = v; return true;}};
	this.get = function(t) {return t[n];};
}

function DateFieldAccess(n)
{
	this.set = function(t,v) {
		var d = v instanceof Date ? v : Date.convertFromYYYYMMDDHHMM(v);
		if(d != t[n]) {
			t[n] = d; return true;
		}
	};
	this.get = function(t) {return t[n].convertToYYYYMMDDHHMM();};
}

function LinksFieldAccess(n)
{
	this.set = function(t,v) {
		var s = (typeof v == "string") ? v.readBracketedList() : v;
		if(s.toString() != t[n].toString()) {
			t[n] = s; return true;
		}
	};
	this.get = function(t) {return String.encodeTiddlyLinkList(t[n]);};
}

TiddlyWiki.standardFieldAccess = {
	// The set functions return true when setting the data has changed the value.
	"title":    new StringFieldAccess("title",true),
	// Handle the "tiddler" field name as the title
	"tiddler":  new StringFieldAccess("title",true),
	"text":     new StringFieldAccess("text"),
	"modifier": new StringFieldAccess("modifier"),
	"modified": new DateFieldAccess("modified"),
	"created":  new DateFieldAccess("created"),
	"tags":     new LinksFieldAccess("tags")
};

TiddlyWiki.isStandardField = function(name)
{
	return TiddlyWiki.standardFieldAccess[name] != undefined;
};

// Sets the value of the given field of the tiddler to the value.
// Setting an ExtendedField's value to null or undefined removes the field.
// Setting a namespace to undefined removes all fields of that namespace.
// The fieldName is case-insensitive.
// All values will be converted to a string value.
TiddlyWiki.prototype.setValue = function(tiddler,fieldName,value)
{
	TiddlyWiki.checkFieldName(fieldName);
	var t = this.resolveTiddler(tiddler);
	if(!t)
		return;
	fieldName = fieldName.toLowerCase();
	var isRemove = (value === undefined) || (value === null);
	var accessor = TiddlyWiki.standardFieldAccess[fieldName];
	if(accessor) {
		if(isRemove)
			// don't remove StandardFields
			return;
		var h = TiddlyWiki.standardFieldAccess[fieldName];
		if(!h.set(t,value))
			return;
	} else {
		var oldValue = t.fields[fieldName];
		if(isRemove) {
			if(oldValue !== undefined) {
				// deletes a single field
				delete t.fields[fieldName];
			} else {
				// no concrete value is defined for the fieldName
				// so we guess this is a namespace path.
				// delete all fields in a namespace
				var re = new RegExp('^'+fieldName+'\\.');
				var dirty = false;
				for(var n in t.fields) {
					if(n.match(re)) {
						delete t.fields[n];
						dirty = true;
					}
				}
				if(!dirty)
					return;
			}
		} else {
			// the "normal" set case. value is defined (not null/undefined)
			// For convenience provide a nicer conversion Date->String
			value = value instanceof Date ? value.convertToYYYYMMDDHHMMSSMMM() : String(value);
			if(oldValue == value)
				return;
			t.fields[fieldName] = value;
		}
	}
	// When we are here the tiddler/store really was changed.
	this.notify(t.title,true);
	if(!fieldName.match(/^temp\./))
		this.setDirty(true);
};

// Returns the value of the given field of the tiddler.
// The fieldName is case-insensitive.
// Will only return String values (or undefined).
TiddlyWiki.prototype.getValue = function(tiddler,fieldName)
{
	var t = this.resolveTiddler(tiddler);
	if(!t)
		return undefined;
	fieldName = fieldName.toLowerCase();
	var accessor = TiddlyWiki.standardFieldAccess[fieldName];
	if(accessor) {
		return accessor.get(t);
	}
	return t.fields[fieldName];
};

// Calls the callback function for every field in the tiddler.
// When callback function returns a non-false value the iteration stops
// and that value is returned.
// The order of the fields is not defined.
// @param callback a function(tiddler,fieldName,value).
TiddlyWiki.prototype.forEachField = function(tiddler,callback,onlyExtendedFields)
{
	var t = this.resolveTiddler(tiddler);
	if(!t)
		return undefined;
	var n,result;
	for(n in t.fields) {
		result = callback(t,n,t.fields[n]);
		if(result)
			return result;
		}
	if(onlyExtendedFields)
		return undefined;
	for(n in TiddlyWiki.standardFieldAccess) {
		if(n == "tiddler")
			// even though the "title" field can also be referenced through the name "tiddler"
			// we only visit this field once.
			continue;
		result = callback(t,n,TiddlyWiki.standardFieldAccess[n].get(t));
		if(result)
			return result;
	}
	return undefined;
};

//--
//-- Story functions
//--

function Story(containerId,idPrefix)
{
	this.container = containerId;
	this.idPrefix = idPrefix;
	this.highlightRegExp = null;
	this.tiddlerId = function(title) {
		var id = this.idPrefix + title;
		return id==this.container ? this.idPrefix + "_" + title : id;
	};
	this.containerId = function() {
		return this.container;
	};
}

Story.prototype.getTiddler = function(title)
{
	return document.getElementById(this.tiddlerId(title));
};

Story.prototype.getContainer = function()
{
	return document.getElementById(this.containerId());
};

Story.prototype.forEachTiddler = function(fn)
{
	var place = this.getContainer();
	if(!place)
		return;
	var e = place.firstChild;
	while(e) {
		var n = e.nextSibling;
		var title = e.getAttribute("tiddler");
		fn.call(this,title,e);
		e = n;
	}
};

Story.prototype.displayDefaultTiddlers = function()
{
	this.displayTiddlers(null,store.filterTiddlers(store.getTiddlerText("DefaultTiddlers")));
};

Story.prototype.displayTiddlers = function(srcElement,titles,template,animate,unused,customFields,toggle)
{
	for(var t = titles.length-1;t>=0;t--)
		this.displayTiddler(srcElement,titles[t],template,animate,unused,customFields);
};

Story.prototype.displayTiddler = function(srcElement,tiddler,template,animate,unused,customFields,toggle,animationSrc)
{
	var title = (tiddler instanceof Tiddler) ? tiddler.title : tiddler;
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		if(toggle)
			this.closeTiddler(title,true);
		else
			this.refreshTiddler(title,template,false,customFields);
	} else {
		var place = this.getContainer();
		var before = this.positionTiddler(srcElement);
		tiddlerElem = this.createTiddler(place,before,title,template,customFields);
	}
	if(animationSrc && typeof animationSrc !== "string") {
		srcElement = animationSrc;
	}
	if(srcElement && typeof srcElement !== "string") {
		if(config.options.chkAnimate && (animate == undefined || animate == true) && anim && typeof Zoomer == "function" && typeof Scroller == "function")
			anim.startAnimating(new Zoomer(title,srcElement,tiddlerElem),new Scroller(tiddlerElem));
		else
			window.scrollTo(0,ensureVisible(tiddlerElem));
	}
};

Story.prototype.positionTiddler = function(srcElement)
{
	var place = this.getContainer();
	var before = null;
	if(typeof srcElement == "string") {
		switch(srcElement) {
		case "top":
			before = place.firstChild;
			break;
		case "bottom":
			before = null;
			break;
		}
	} else {
		var after = this.findContainingTiddler(srcElement);
		if(after == null) {
			before = place.firstChild;
		} else if(after.nextSibling) {
			before = after.nextSibling;
			if(before.nodeType != 1)
				before = null;
		}
	}
	return before;
};

Story.prototype.createTiddler = function(place,before,title,template,customFields)
{
	var tiddlerElem = createTiddlyElement(null,"div",this.tiddlerId(title),"tiddler");
	tiddlerElem.setAttribute("refresh","tiddler");
	if(customFields)
		tiddlerElem.setAttribute("tiddlyFields",customFields);
	place.insertBefore(tiddlerElem,before);
	var defaultText = null;
	if(!store.tiddlerExists(title) && !store.isShadowTiddler(title))
		defaultText = this.loadMissingTiddler(title,customFields,tiddlerElem);
	this.refreshTiddler(title,template,false,customFields,defaultText);
	return tiddlerElem;
};

Story.prototype.loadMissingTiddler = function(title,fields,tiddlerElem)
{
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ? fields.decodeHashMap() : (fields || {});
	var serverType = tiddler.getServerType();
	var host = tiddler.fields['server.host'];
	var workspace = tiddler.fields['server.workspace'];
	if(!serverType || !host)
		return null;
	var sm = new SyncMachine(serverType,{
			start: function() {
				return this.openHost(host,"openWorkspace");
			},
			openWorkspace: function() {
				return this.openWorkspace(workspace,"getTiddler");
			},
			getTiddler: function() {
				return this.getTiddler(title,"onGetTiddler");
			},
			onGetTiddler: function(context) {
				var tiddler = context.tiddler;
				if(tiddler && tiddler.text) {
					var downloaded = new Date();
					if(!tiddler.created)
						tiddler.created = downloaded;
					if(!tiddler.modified)
						tiddler.modified = tiddler.created;
					store.saveTiddler(tiddler.title,tiddler.title,tiddler.text,tiddler.modifier,tiddler.modified,tiddler.tags,tiddler.fields,true,tiddler.created);
					autoSaveChanges();
				}
				delete this;
				return true;
			},
			error: function(message) {
				displayMessage("Error loading missing tiddler from %0: %1".format([host,message]));
			}
		});
	sm.go();
	return config.messages.loadingMissingTiddler.format([title,serverType,host,workspace]);
};

Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	if(!template)
		template = DEFAULT_VIEW_TEMPLATE;
	if(template == DEFAULT_VIEW_TEMPLATE || template == DEFAULT_EDIT_TEMPLATE)
		template = config.tiddlerTemplates[template];
	return template;
};

Story.prototype.getTemplateForTiddler = function(title,template,tiddler)
{
	return store.getRecursiveTiddlerText(template,null,10);
};

Story.prototype.refreshTiddler = function(title,template,force,customFields,defaultText)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		if(tiddlerElem.getAttribute("dirty") == "true" && !force)
			return tiddlerElem;
		template = this.chooseTemplateForTiddler(title,template);
		var currTemplate = tiddlerElem.getAttribute("template");
		if((template != currTemplate) || force) {
			var tiddler = store.getTiddler(title);
			if(!tiddler) {
				tiddler = new Tiddler();
				if(store.isShadowTiddler(title)) {
					var tags = [];
					tiddler.set(title,store.getTiddlerText(title),config.views.wikified.shadowModifier,version.date,tags,version.date);
				} else {
					var text = template=="EditTemplate" ?
								config.views.editor.defaultText.format([title]) :
								config.views.wikified.defaultText.format([title]);
					text = defaultText || text;
					var fields = customFields ? customFields.decodeHashMap() : null;
					tiddler.set(title,text,config.views.wikified.defaultModifier,version.date,[],version.date,fields);
				}
			}
			tiddlerElem.setAttribute("tags",tiddler.tags.join(" "));
			tiddlerElem.setAttribute("tiddler",title);
			tiddlerElem.setAttribute("template",template);
			tiddlerElem.onmouseover = this.onTiddlerMouseOver;
			tiddlerElem.onmouseout = this.onTiddlerMouseOut;
			tiddlerElem.ondblclick = this.onTiddlerDblClick;
			tiddlerElem[window.event?"onkeydown":"onkeypress"] = this.onTiddlerKeyPress;
			tiddlerElem.innerHTML = this.getTemplateForTiddler(title,template,tiddler);
			applyHtmlMacros(tiddlerElem,tiddler);
			if(store.getTaggedTiddlers(title).length > 0)
				addClass(tiddlerElem,"isTag");
			else
				removeClass(tiddlerElem,"isTag");
			if(store.tiddlerExists(title)) {
				removeClass(tiddlerElem,"shadow");
				removeClass(tiddlerElem,"missing");
			} else {
				addClass(tiddlerElem,store.isShadowTiddler(title) ? "shadow" : "missing");
			}
			if(customFields)
				this.addCustomFields(tiddlerElem,customFields);
			forceReflow();
		}
	}
	return tiddlerElem;
};

Story.prototype.addCustomFields = function(place,customFields)
{
	var fields = customFields.decodeHashMap();
	var w = document.createElement("div");
	w.style.display = "none";
	place.appendChild(w);
	for(var t in fields) {
		var e = document.createElement("input");
		e.setAttribute("type","text");
		e.setAttribute("value",fields[t]);
		w.appendChild(e);
		e.setAttribute("edit",t);
	}
};

Story.prototype.refreshAllTiddlers = function(force)
{
	var e = this.getContainer().firstChild;
	while(e) {
		var template = e.getAttribute("template");
		if(template && e.getAttribute("dirty") != "true") {
			this.refreshTiddler(e.getAttribute("tiddler"),force ? null : template,true);
		}
		e = e.nextSibling;
	}
};

Story.prototype.onTiddlerMouseOver = function(e)
{
	if(window.addClass instanceof Function)
		addClass(this,"selected");
};

Story.prototype.onTiddlerMouseOut = function(e)
{
	if(window.removeClass instanceof Function)
		removeClass(this,"selected");
};

Story.prototype.onTiddlerDblClick = function(ev)
{
	var e = ev || window.event;
	var target = resolveTarget(e);
	if(target && target.nodeName.toLowerCase() != "input" && target.nodeName.toLowerCase() != "textarea") {
		if(document.selection && document.selection.empty)
			document.selection.empty();
		config.macros.toolbar.invokeCommand(this,"defaultCommand",e);
		e.cancelBubble = true;
		if(e.stopPropagation) e.stopPropagation();
		return true;
	}
	return false;
};

Story.prototype.onTiddlerKeyPress = function(ev)
{
	var e = ev || window.event;
	clearMessage();
	var consume = false;
	var title = this.getAttribute("tiddler");
	var target = resolveTarget(e);
	switch(e.keyCode) {
	case 9: // Tab
		if(config.options.chkInsertTabs && target.tagName.toLowerCase() == "textarea") {
			replaceSelection(target,String.fromCharCode(9));
			consume = true;
		}
		if(config.isOpera) {
			target.onblur = function() {
				this.focus();
				this.onblur = null;
			};
		}
		break;
	case 13: // Ctrl-Enter
	case 10: // Ctrl-Enter on IE PC
	case 77: // Ctrl-Enter is "M" on some platforms
		if(e.ctrlKey) {
			blurElement(this);
			config.macros.toolbar.invokeCommand(this,"defaultCommand",e);
			consume = true;
		}
		break;
	case 27: // Escape
		blurElement(this);
		config.macros.toolbar.invokeCommand(this,"cancelCommand",e);
		consume = true;
		break;
	}
	e.cancelBubble = consume;
	if(consume) {
		if(e.stopPropagation) e.stopPropagation(); // Stop Propagation
		e.returnValue = true; // Cancel The Event in IE
		if(e.preventDefault ) e.preventDefault(); // Cancel The Event in Moz
	}
	return !consume;
};

Story.prototype.getTiddlerField = function(title,field)
{
	var tiddlerElem = this.getTiddler(title);
	var e = null;
	if(tiddlerElem ) {
		var children = tiddlerElem.getElementsByTagName("*");
		for(var t=0; t<children.length; t++) {
			var c = children[t];
			if(c.tagName.toLowerCase() == "input" || c.tagName.toLowerCase() == "textarea") {
				if(!e)
					e = c;
				if(c.getAttribute("edit") == field)
					e = c;
			}
		}
	}
	return e;
};

Story.prototype.focusTiddler = function(title,field)
{
	var e = this.getTiddlerField(title,field);
	if(e) {
		e.focus();
		e.select();
	}
};

Story.prototype.blurTiddler = function(title)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem && tiddlerElem.focus && tiddlerElem.blur) {
		tiddlerElem.focus();
		tiddlerElem.blur();
	}
};

Story.prototype.setTiddlerField = function(title,tag,mode,field)
{
	var c = this.getTiddlerField(title,field);
	var tags = c.value.readBracketedList();
	tags.setItem(tag,mode);
	c.value = String.encodeTiddlyLinkList(tags);
};

Story.prototype.setTiddlerTag = function(title,tag,mode)
{
	this.setTiddlerField(title,tag,mode,"tags");
};

Story.prototype.closeTiddler = function(title,animate,unused)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		clearMessage();
		this.scrubTiddler(tiddlerElem);
		if(config.options.chkAnimate && animate && anim && typeof Slider == "function")
			anim.startAnimating(new Slider(tiddlerElem,false,null,"all"));
		else {
			removeNode(tiddlerElem);
			forceReflow();
		}
	}
};

Story.prototype.scrubTiddler = function(tiddlerElem)
{
	tiddlerElem.id = null;
};

Story.prototype.setDirty = function(title,dirty)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem)
		tiddlerElem.setAttribute("dirty",dirty ? "true" : "false");
};

Story.prototype.isDirty = function(title)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem)
		return tiddlerElem.getAttribute("dirty") == "true";
	return null;
};

Story.prototype.areAnyDirty = function()
{
	var r = false;
	this.forEachTiddler(function(title,element) {
		if(this.isDirty(title))
			r = true;
	});
	return r;
};

Story.prototype.closeAllTiddlers = function(exclude)
{
	clearMessage();
	this.forEachTiddler(function(title,element) {
		if((title != exclude) && element.getAttribute("dirty") != "true")
			this.closeTiddler(title);
	});
	window.scrollTo(0,ensureVisible(this.container));
};

Story.prototype.isEmpty = function()
{
	var place = this.getContainer();
	return place && place.firstChild == null;
};

Story.prototype.search = function(text,useCaseSensitive,useRegExp)
{
	this.closeAllTiddlers();
	highlightHack = new RegExp(useRegExp ? text : text.escapeRegExp(),useCaseSensitive ? "mg" : "img");
	var matches = store.search(highlightHack,"title","excludeSearch");
	this.displayTiddlers(null,matches);
	highlightHack = null;
	var q = useRegExp ? "/" : "'";
	if(matches.length > 0)
		displayMessage(config.macros.search.successMsg.format([matches.length.toString(),q + text + q]));
	else
		displayMessage(config.macros.search.failureMsg.format([q + text + q]));
};

Story.prototype.findContainingTiddler = function(e)
{
	while(e && !hasClass(e,"tiddler"))
		e = e.parentNode;
	return e;
};

Story.prototype.gatherSaveFields = function(e,fields)
{
	if(e && e.getAttribute) {
		var f = e.getAttribute("edit");
		if(f)
			fields[f] = e.value.replace(/\r/mg,"");
		if(e.hasChildNodes()) {
			var c = e.childNodes;
			for(var t=0; t<c.length; t++)
				this.gatherSaveFields(c[t],fields);
		}
	}
};

Story.prototype.hasChanges = function(title)
{
	var e = this.getTiddler(title);
	if(e) {
		var fields = {};
		this.gatherSaveFields(e,fields);
		var tiddler = store.fetchTiddler(title);
		if(!tiddler)
			return false;
		for(var n in fields) {
			if(store.getValue(title,n) != fields[n])
				return true;
		}
	}
	return false;
};

Story.prototype.saveTiddler = function(title,minorUpdate)
{
	var tiddlerElem = this.getTiddler(title);
	if(tiddlerElem) {
		var fields = {};
		this.gatherSaveFields(tiddlerElem,fields);
		var newTitle = fields.title || title;
		if(!store.tiddlerExists(newTitle))
			newTitle = newTitle.trim();
		if(store.tiddlerExists(newTitle) && newTitle != title) {
			if(!confirm(config.messages.overwriteWarning.format([newTitle.toString()])))
				return null;
		}
		if(newTitle != title)
			this.closeTiddler(newTitle,false);
		tiddlerElem.id = this.tiddlerId(newTitle);
		tiddlerElem.setAttribute("tiddler",newTitle);
		tiddlerElem.setAttribute("template",DEFAULT_VIEW_TEMPLATE);
		tiddlerElem.setAttribute("dirty","false");
		if(config.options.chkForceMinorUpdate)
			minorUpdate = !minorUpdate;
		if(!store.tiddlerExists(newTitle))
			minorUpdate = false;
		var newDate = new Date();
		var extendedFields = store.tiddlerExists(newTitle) ? store.fetchTiddler(newTitle).fields : (newTitle!=title && store.tiddlerExists(title) ? store.fetchTiddler(title).fields : merge({},config.defaultCustomFields));
		for(var n in fields) {
			if(!TiddlyWiki.isStandardField(n))
				extendedFields[n] = fields[n];
		}
		var tiddler = store.saveTiddler(title,newTitle,fields.text,minorUpdate ? undefined : config.options.txtUserName,minorUpdate ? undefined : newDate,fields.tags,extendedFields);
		autoSaveChanges(null,[tiddler]);
		return newTitle;
	}
	return null;
};

Story.prototype.permaView = function()
{
	var links = [];
	this.forEachTiddler(function(title,element) {
		links.push(String.encodeTiddlyLink(title));
	});
	var t = encodeURIComponent(links.join(" "));
	if(t == "")
		t = "#";
	if(window.location.hash != t)
		window.location.hash = t;
};

Story.prototype.switchTheme = function(theme)
{
	if(safeMode)
		return;

	var isAvailable = function(title) {
		var s = title ? title.indexOf(config.textPrimitives.sectionSeparator) : -1;
		if(s!=-1)
			title = title.substr(0,s);
		return store.tiddlerExists(title) || store.isShadowTiddler(title);
	};

	var getSlice = function(theme,slice) {
		var r;
		if(readOnly)
			r = store.getTiddlerSlice(theme,slice+"ReadOnly") || store.getTiddlerSlice(theme,"Web"+slice);
		r = r || store.getTiddlerSlice(theme,slice);
		if(r && r.indexOf(config.textPrimitives.sectionSeparator)==0)
			r = theme + r;
		return isAvailable(r) ? r : slice;
	};

	var replaceNotification = function(i,name,theme,slice) {
		var newName = getSlice(theme,slice);
		if(name!=newName && store.namedNotifications[i].name==name) {
			store.namedNotifications[i].name = newName;
			return newName;
		}
		return name;
	};

	var pt = config.refresherData.pageTemplate;
	var vi = DEFAULT_VIEW_TEMPLATE;
	var vt = config.tiddlerTemplates[vi];
	var ei = DEFAULT_EDIT_TEMPLATE;
	var et = config.tiddlerTemplates[ei];

	for(var i=0; i<config.notifyTiddlers.length; i++) {
		var name = config.notifyTiddlers[i].name;
		switch(name) {
		case "PageTemplate":
			config.refresherData.pageTemplate = replaceNotification(i,config.refresherData.pageTemplate,theme,name);
			break;
		case "StyleSheet":
			removeStyleSheet(config.refresherData.styleSheet);
			config.refresherData.styleSheet = replaceNotification(i,config.refresherData.styleSheet,theme,name);
			break;
		case "ColorPalette":
			config.refresherData.colorPalette = replaceNotification(i,config.refresherData.colorPalette,theme,name);
			break;
		default:
			break;
		}
	}
	config.tiddlerTemplates[vi] = getSlice(theme,"ViewTemplate");
	config.tiddlerTemplates[ei] = getSlice(theme,"EditTemplate");
	if(!startingUp) {
		if(config.refresherData.pageTemplate!=pt || config.tiddlerTemplates[vi]!=vt || config.tiddlerTemplates[ei]!=et) {
			refreshAll();
			this.refreshAllTiddlers(true);
		} else {
			setStylesheet(store.getRecursiveTiddlerText(config.refresherData.styleSheet,"",10),config.refreshers.styleSheet);
		}
		config.options.txtTheme = theme;
		saveOptionCookie("txtTheme");
	}
};

//--
//-- Backstage
//--

var backstage = {
	area: null,
	toolbar: null,
	button: null,
	showButton: null,
	hideButton: null,
	cloak: null,
	panel: null,
	panelBody: null,
	panelFooter: null,
	currTabName: null,
	currTabElem: null,
	content: null,

	init: function() {
		var cmb = config.messages.backstage;
		this.area = document.getElementById("backstageArea");
		this.toolbar = document.getElementById("backstageToolbar");
		this.button = document.getElementById("backstageButton");
		this.button.style.display = "block";
		var t = cmb.open.text + " " + glyph("bentArrowLeft");
		this.showButton = createTiddlyButton(this.button,t,cmb.open.tooltip,
						function(e) {backstage.show(); return false;},null,"backstageShow");
		t = glyph("bentArrowRight") + " " + cmb.close.text;
		this.hideButton = createTiddlyButton(this.button,t,cmb.close.tooltip,
						function(e) {backstage.hide(); return false;},null,"backstageHide");
		this.cloak = document.getElementById("backstageCloak");
		this.panel = document.getElementById("backstagePanel");
		this.panelFooter = createTiddlyElement(this.panel,"div",null,"backstagePanelFooter");
		this.panelBody = createTiddlyElement(this.panel,"div",null,"backstagePanelBody");
		this.cloak.onmousedown = function(e) {backstage.switchTab(null);};
		createTiddlyText(this.toolbar,cmb.prompt);
		for(t=0; t<config.backstageTasks.length; t++) {
			var taskName = config.backstageTasks[t];
			var task = config.tasks[taskName];
			var handler = task.action ? this.onClickCommand : this.onClickTab;
			var text = task.text + (task.action ? "" : glyph("downTriangle"));
			var btn = createTiddlyButton(this.toolbar,text,task.tooltip,handler,"backstageTab");
			btn.setAttribute("task",taskName);
			addClass(btn,task.action ? "backstageAction" : "backstageTask");
			}
		this.content = document.getElementById("contentWrapper");
		if(config.options.chkBackstage)
			this.show();
		else
			this.hide();
	},

	isVisible: function() {
		return this.area ? this.area.style.display == "block" : false;
	},

	show: function() {
		this.area.style.display = "block";
		if(anim && config.options.chkAnimate) {
			backstage.toolbar.style.left = findWindowWidth() + "px";
			var p = [{style: "left", start: findWindowWidth(), end: 0, template: "%0px"}];
			anim.startAnimating(new Morpher(backstage.toolbar,config.animDuration,p));
		} else {
			backstage.area.style.left = "0px";
		}
		this.showButton.style.display = "none";
		this.hideButton.style.display = "block";
		config.options.chkBackstage = true;
		saveOptionCookie("chkBackstage");
		addClass(this.content,"backstageVisible");
	},

	hide: function() {
		if(this.currTabElem) {
			this.switchTab(null);
		} else {
			backstage.toolbar.style.left = "0px";
			if(anim && config.options.chkAnimate) {
				var p = [{style: "left", start: 0, end: findWindowWidth(), template: "%0px"}];
				var c = function(element,properties) {backstage.area.style.display = "none";};
				anim.startAnimating(new Morpher(backstage.toolbar,config.animDuration,p,c));
			} else {
				this.area.style.display = "none";
			}
			this.showButton.style.display = "block";
			this.hideButton.style.display = "none";
			config.options.chkBackstage = false;
			saveOptionCookie("chkBackstage");
			removeClass(this.content,"backstageVisible");
		}
	},

	onClickCommand: function(e) {
		var task = config.tasks[this.getAttribute("task")];
		displayMessage(task);
		if(task.action) {
			backstage.switchTab(null);
			task.action();
		}
		return false;
	},

	onClickTab: function(e) {
		backstage.switchTab(this.getAttribute("task"));
		return false;
	},

	// Switch to a given tab, or none if null is passed
	switchTab: function(tabName) {
		var tabElem = null;
		var e = this.toolbar.firstChild;
		while(e)
			{
			if(e.getAttribute && e.getAttribute("task") == tabName)
				tabElem = e;
			e = e.nextSibling;
			}
		if(tabName == backstage.currTabName)
			return;
		if(backstage.currTabElem) {
			removeClass(this.currTabElem,"backstageSelTab");
		}
		if(tabElem && tabName) {
			backstage.preparePanel();
			addClass(tabElem,"backstageSelTab");
			var task = config.tasks[tabName];
			wikify(task.content,backstage.panelBody,null,null);
			backstage.showPanel();
		} else if(backstage.currTabElem) {
			backstage.hidePanel();
		}
		backstage.currTabName = tabName;
		backstage.currTabElem = tabElem;
	},

	isPanelVisible: function() {
		return backstage.panel ? backstage.panel.style.display == "block" : false;
	},

	preparePanel: function() {
		backstage.cloak.style.height = findWindowHeight() + "px";
		backstage.cloak.style.display = "block";
		removeChildren(backstage.panelBody);
		return backstage.panelBody;
	},

	showPanel: function() {
		backstage.panel.style.display = "block";
		if(anim && config.options.chkAnimate) {
			backstage.panel.style.top = (-backstage.panel.offsetHeight) + "px";
			var p = [{style: "top", start: -backstage.panel.offsetHeight, end: 0, template: "%0px"}];
			anim.startAnimating(new Morpher(backstage.panel,config.animDuration,p),new Scroller(backstage.panel,false));
		} else {
			backstage.panel.style.top = "0px";
		}
		return backstage.panelBody;
	},

	hidePanel: function() {
		if(backstage.currTabElem)
			removeClass(backstage.currTabElem,"backstageSelTab");
		backstage.currTabElem = null;
		backstage.currTabName = null;
		if(anim && config.options.chkAnimate) {
			var p = [
				{style: "top", start: 0, end: -(backstage.panel.offsetHeight), template: "%0px"},
				{style: "display", atEnd: "none"}
			];
			var c = function(element,properties) {backstage.cloak.style.display = "none";};
			anim.startAnimating(new Morpher(backstage.panel,config.animDuration,p,c));
		 } else {
			backstage.panel.style.display = "none";
			backstage.cloak.style.display = "none";
		}
	}
};

config.macros.backstage = {};

config.macros.backstage.handler = function(place,macroName,params)
{
	var backstageTask = config.tasks[params[0]];
	if(backstageTask)
		createTiddlyButton(place,backstageTask.text,backstageTask.tooltip,function(e) {backstage.switchTab(params[0]); return false;});
};

//--
//-- ImportTiddlers macro
//--

config.macros.importTiddlers.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(readOnly) {
		createTiddlyElement(place,"div",null,"marked",this.readOnlyWarning);
		return;
	}
	var w = new Wizard();
	w.createWizard(place,this.wizardTitle);
	this.restart(w);
};

config.macros.importTiddlers.onCancel = function(e)
{
	var wizard = new Wizard(this);
	var place = wizard.clear();
	config.macros.importTiddlers.restart(wizard);
	return false;
};

config.macros.importTiddlers.onClose = function(e)
{
	backstage.hidePanel();
	return false;
};

config.macros.importTiddlers.restart = function(wizard)
{
	wizard.addStep(this.step1Title,this.step1Html);
	var s = wizard.getElement("selTypes");
	for(var t in config.adaptors) {
		var e = createTiddlyElement(s,"option",null,null,config.adaptors[t].serverLabel ? config.adaptors[t].serverLabel : t);
		e.value = t;
	}
	if(config.defaultAdaptor)
		s.value = config.defaultAdaptor;
	s = wizard.getElement("selFeeds");
	var feeds = this.getFeeds();
	for(t in feeds) {
		e = createTiddlyElement(s,"option",null,null,t);
		e.value = t;
	}
	wizard.setValue("feeds",feeds);
	s.onchange = config.macros.importTiddlers.onFeedChange;
	var fileInput = wizard.getElement("txtBrowse");
	fileInput.onchange = config.macros.importTiddlers.onBrowseChange;
	fileInput.onkeyup = config.macros.importTiddlers.onBrowseChange;
	wizard.setButtons([{caption: this.openLabel, tooltip: this.openPrompt, onClick: config.macros.importTiddlers.onOpen}]);
	wizard.formElem.action = "javascript:;";
	wizard.formElem.onsubmit = function() {
		if(this.txtPath.value.length)
			this.lastChild.firstChild.onclick();
	};
};

config.macros.importTiddlers.getFeeds = function()
{
	var feeds = {};
	var tagged = store.getTaggedTiddlers("systemServer","title");
	for(var t=0; t<tagged.length; t++) {
		var title = tagged[t].title;
		var serverType = store.getTiddlerSlice(title,"Type");
		if(!serverType)
			serverType = "file";
		feeds[title] = {title: title,
						url: store.getTiddlerSlice(title,"URL"),
						workspace: store.getTiddlerSlice(title,"Workspace"),
						workspaceList: store.getTiddlerSlice(title,"WorkspaceList"),
						tiddlerFilter: store.getTiddlerSlice(title,"TiddlerFilter"),
						serverType: serverType,
						description: store.getTiddlerSlice(title,"Description")};
	}
	return feeds;
};

config.macros.importTiddlers.onFeedChange = function(e)
{
	var wizard = new Wizard(this);
	var selTypes = wizard.getElement("selTypes");
	var fileInput = wizard.getElement("txtPath");
	var feeds = wizard.getValue("feeds");
	var f = feeds[this.value];
	if(f) {
		selTypes.value = f.serverType;
		fileInput.value = f.url;
		wizard.setValue("feedName",f.serverType);
		wizard.setValue("feedHost",f.url);
		wizard.setValue("feedWorkspace",f.workspace);
		wizard.setValue("feedWorkspaceList",f.workspaceList);
		wizard.setValue("feedTiddlerFilter",f.tiddlerFilter);
	}
	return false;
};

config.macros.importTiddlers.onBrowseChange = function(e)
{
	var wizard = new Wizard(this);
	var fileInput = wizard.getElement("txtPath");
	fileInput.value = config.macros.importTiddlers.getURLFromLocalPath(this.value);
	var serverType = wizard.getElement("selTypes");
	serverType.value = "file";
	return true;
};

config.macros.importTiddlers.getURLFromLocalPath = function(v)
{
	if(!v||!v.length)
		return v;
	v = v.replace(/\\/g,"/"); // use "/" for cross-platform consistency
	var u;
	var t = v.split(":");
	var p = t[1]||t[0]; // remove drive letter (if any)
	if (t[1] && (t[0]=="http"||t[0]=="https"||t[0]=="file")) {
		u = v;
	} else if(p.substr(0,1)=="/") {
		u = document.location.protocol + "//" + document.location.hostname + (t[1] ? "/" : "") + v;
	} else {
		var c = document.location.href.replace(/\\/g,"/");
		var pos = c.lastIndexOf("/");
		if (pos!=-1)
			c = c.substr(0,pos); // remove filename
		u = c + "/" + p;
	}
	return u;
};

config.macros.importTiddlers.onOpen = function(e)
{
	var wizard = new Wizard(this);
	var fileInput = wizard.getElement("txtPath");
	var url = fileInput.value;
	var serverType = wizard.getElement("selTypes").value || config.defaultAdaptor;
	var adaptor = new config.adaptors[serverType]();
	wizard.setValue("adaptor",adaptor);
	wizard.setValue("serverType",serverType);
	wizard.setValue("host",url);
	var ret = adaptor.openHost(url,null,wizard,config.macros.importTiddlers.onOpenHost);
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}],config.macros.importTiddlers.statusOpenHost);
	return false;
};

config.macros.importTiddlers.onOpenHost = function(context,wizard)
{
	var adaptor = wizard.getValue("adaptor");
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onOpenHost: " + context.statusText);
	var ret = adaptor.getWorkspaceList(context,wizard,config.macros.importTiddlers.onGetWorkspaceList);
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}],config.macros.importTiddlers.statusGetWorkspaceList);
};

config.macros.importTiddlers.onGetWorkspaceList = function(context,wizard)
{
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onGetWorkspaceList: " + context.statusText);
	wizard.setValue("context",context);
	var workspace = wizard.getValue("feedWorkspace");
	if(!workspace && context.workspaces.length==1)
		workspace = context.workspaces[0].title;
	if(workspace) {
		var ret = context.adaptor.openWorkspace(workspace,context,wizard,config.macros.importTiddlers.onOpenWorkspace);
		if(ret !== true)
			displayMessage(ret);
		wizard.setValue("workspace",workspace);
		wizard.setButtons([{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}],config.macros.importTiddlers.statusOpenWorkspace);
		return;
	}
	wizard.addStep(config.macros.importTiddlers.step2Title,config.macros.importTiddlers.step2Html);
	var s = wizard.getElement("selWorkspace");
	s.onchange = config.macros.importTiddlers.onWorkspaceChange;
	for(var t=0; t<context.workspaces.length; t++) {
		var e = createTiddlyElement(s,"option",null,null,context.workspaces[t].title);
		e.value = context.workspaces[t].title;
	}
	var workspaceList = wizard.getValue("feedWorkspaceList");
	if(workspaceList) {
		var list = workspaceList.parseParams("workspace",null,false,true);
		for(var n=1; n<list.length; n++) {
			if(context.workspaces.findByField("title",list[n].value) == null) {
				e = createTiddlyElement(s,"option",null,null,list[n].value);
				e.value = list[n].value;
			}
		}
	}
	if(workspace) {
		t = wizard.getElement("txtWorkspace");
		t.value = workspace;
	}
	wizard.setButtons([{caption: config.macros.importTiddlers.openLabel, tooltip: config.macros.importTiddlers.openPrompt, onClick: config.macros.importTiddlers.onChooseWorkspace}]);
};

config.macros.importTiddlers.onWorkspaceChange = function(e)
{
	var wizard = new Wizard(this);
	var t = wizard.getElement("txtWorkspace");
	t.value = this.value;
	this.selectedIndex = 0;
	return false;
};

config.macros.importTiddlers.onChooseWorkspace = function(e)
{
	var wizard = new Wizard(this);
	var adaptor = wizard.getValue("adaptor");
	var workspace = wizard.getElement("txtWorkspace").value;
	wizard.setValue("workspace",workspace);
	var context = wizard.getValue("context");
	var ret = adaptor.openWorkspace(workspace,context,wizard,config.macros.importTiddlers.onOpenWorkspace);
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}],config.macros.importTiddlers.statusOpenWorkspace);
	return false;
};

config.macros.importTiddlers.onOpenWorkspace = function(context,wizard)
{
	if(context.status !== true)
		displayMessage("Error in importTiddlers.onOpenWorkspace: " + context.statusText);
	var adaptor = wizard.getValue("adaptor");
	var ret = adaptor.getTiddlerList(context,wizard,config.macros.importTiddlers.onGetTiddlerList,wizard.getValue("feedTiddlerFilter"));
	if(ret !== true)
		displayMessage(ret);
	wizard.setButtons([{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}],config.macros.importTiddlers.statusGetTiddlerList);
};

config.macros.importTiddlers.onGetTiddlerList = function(context,wizard)
{
	if(context.status !== true) {
		wizard.setButtons([{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}],config.macros.importTiddlers.errorGettingTiddlerList);
		return;
	}
	// Extract data for the listview
	var listedTiddlers = [];
	if(context.tiddlers) {
		for(var n=0; n<context.tiddlers.length; n++) {
			var tiddler = context.tiddlers[n];
			listedTiddlers.push({
				title: tiddler.title,
				modified: tiddler.modified,
				modifier: tiddler.modifier,
				text: tiddler.text ? wikifyPlainText(tiddler.text,100) : "",
				tags: tiddler.tags,
				size: tiddler.text ? tiddler.text.length : 0,
				tiddler: tiddler
			});
		}
	}
	listedTiddlers.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	// Display the listview
	wizard.addStep(config.macros.importTiddlers.step3Title,config.macros.importTiddlers.step3Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	var listView = ListView.create(listWrapper,listedTiddlers,config.macros.importTiddlers.listViewTemplate);
	wizard.setValue("listView",listView);
	wizard.setValue("context",context);
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler");
	txtSaveTiddler.value = config.macros.importTiddlers.generateSystemServerName(wizard);
	wizard.setButtons([
			{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel},
			{caption: config.macros.importTiddlers.importLabel, tooltip: config.macros.importTiddlers.importPrompt, onClick: config.macros.importTiddlers.doImport}
		]);
};

config.macros.importTiddlers.generateSystemServerName = function(wizard)
{
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var pattern = config.macros.importTiddlers[workspace ? "systemServerNamePattern" : "systemServerNamePatternNoWorkspace"];
	return pattern.format([serverType,host,workspace]);
};

config.macros.importTiddlers.saveServerTiddler = function(wizard)
{
	var txtSaveTiddler = wizard.getElement("txtSaveTiddler").value;
	if(store.tiddlerExists(txtSaveTiddler)) {
		if(!confirm(config.macros.importTiddlers.confirmOverwriteSaveTiddler.format([txtSaveTiddler])))
			return;
		store.suspendNotifications();
		store.removeTiddler(txtSaveTiddler);
		store.resumeNotifications();
	}
	var serverType = wizard.getValue("serverType");
	var host = wizard.getValue("host");
	var workspace = wizard.getValue("workspace");
	var text = config.macros.importTiddlers.serverSaveTemplate.format([serverType,host,workspace]);
	store.saveTiddler(txtSaveTiddler,txtSaveTiddler,text,config.macros.importTiddlers.serverSaveModifier,new Date(),["systemServer"]);
};

config.macros.importTiddlers.doImport = function(e)
{
	var wizard = new Wizard(this);
	if(wizard.getElement("chkSave").checked)
		config.macros.importTiddlers.saveServerTiddler(wizard);
	var chkSync = wizard.getElement("chkSync").checked;
	wizard.setValue("sync",chkSync);
	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	var adaptor = wizard.getValue("adaptor");
	var overwrite = [];
	var t;
	for(t=0; t<rowNames.length; t++) {
		if(store.tiddlerExists(rowNames[t]))
			overwrite.push(rowNames[t]);
	}
	if(overwrite.length > 0) {
		if(!confirm(config.macros.importTiddlers.confirmOverwriteText.format([overwrite.join(", ")])))
			return false;
	}
	wizard.addStep(config.macros.importTiddlers.step4Title.format([rowNames.length]),config.macros.importTiddlers.step4Html);
	for(t=0; t<rowNames.length; t++) {
		var link = document.createElement("div");
		createTiddlyLink(link,rowNames[t],true);
		var place = wizard.getElement("markReport");
		place.parentNode.insertBefore(link,place);
	}
	wizard.setValue("remainingImports",rowNames.length);
	wizard.setButtons([
			{caption: config.macros.importTiddlers.cancelLabel, tooltip: config.macros.importTiddlers.cancelPrompt, onClick: config.macros.importTiddlers.onCancel}
		],config.macros.importTiddlers.statusDoingImport);
	var wizardContext = wizard.getValue("context");
	var tiddlers = wizardContext ? wizardContext.tiddlers : [];
	for(t=0; t<rowNames.length; t++) {
		var context = {
			allowSynchronous:true,
			tiddler:tiddlers[tiddlers.findByField("title",rowNames[t])]
		};
		adaptor.getTiddler(rowNames[t],context,wizard,config.macros.importTiddlers.onGetTiddler);
	}
	return false;
};

config.macros.importTiddlers.onGetTiddler = function(context,wizard)
{
	if(!context.status)
		displayMessage("Error in importTiddlers.onGetTiddler: " + context.statusText);
	var tiddler = context.tiddler;
	store.suspendNotifications();
	store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
	if(!wizard.getValue("sync")) {
		store.setValue(tiddler.title,'server',null);
	}
	store.resumeNotifications();
	if(!context.isSynchronous)
		store.notify(tiddler.title,true);
	var remainingImports = wizard.getValue("remainingImports")-1;
	wizard.setValue("remainingImports",remainingImports);
	if(remainingImports == 0) {
		if(context.isSynchronous) {
			store.notifyAll();
			refreshDisplay();
		}
		wizard.setButtons([
				{caption: config.macros.importTiddlers.doneLabel, tooltip: config.macros.importTiddlers.donePrompt, onClick: config.macros.importTiddlers.onClose}
			],config.macros.importTiddlers.statusDoneImport);
		autoSaveChanges();
	}
};

//--
//-- Upgrade macro
//--

config.macros.upgrade.handler = function(place)
{
	var w = new Wizard();
	w.createWizard(place,this.wizardTitle);
	w.addStep(this.step1Title,this.step1Html.format([this.source,this.source]));
	w.setButtons([{caption: this.upgradeLabel, tooltip: this.upgradePrompt, onClick: this.onClickUpgrade}]);
};

config.macros.upgrade.onClickUpgrade = function(e)
{
	var me = config.macros.upgrade;
	var w = new Wizard(this);
	if(window.location.protocol != "file:") {
		alert(me.errorCantUpgrade);
		return false;
	}
	if(story.areAnyDirty() || store.isDirty()) {
		alert(me.errorNotSaved);
		return false;
	}
	var localPath = getLocalPath(document.location.toString());
	var backupPath = getBackupPath(localPath,me.backupExtension);
	w.setValue("backupPath",backupPath);
	w.setButtons([],me.statusPreparingBackup);
	var original = loadOriginal(localPath);
	w.setButtons([],me.statusSavingBackup);
	var backup = config.browser.isIE ? ieCopyFile(backupPath,localPath) : saveFile(backupPath,original);
	if(backup != true) {
		w.setButtons([],me.errorSavingBackup);
		alert(me.errorSavingBackup);
		return false;
	}
	w.setButtons([],me.statusLoadingCore);
	var load = loadRemoteFile(me.source,me.onLoadCore,w);
	if(typeof load == "string") {
		w.setButtons([],me.errorLoadingCore);
		alert(me.errorLoadingCore);
		return false;
	}
	return false;
};

config.macros.upgrade.onLoadCore = function(status,params,responseText,url,xhr)
{
	var me = config.macros.upgrade;
	var w = params;
	var errMsg;
	if(!status)
		errMsg = me.errorLoadingCore;
	var newVer = me.extractVersion(responseText);
	if(!newVer)
		errMsg = me.errorCoreFormat;
	if(errMsg) {
		w.setButtons([],errMsg);
		alert(errMsg);
		return;
	}
	var onStartUpgrade = function(e) {
		w.setButtons([],me.statusSavingCore);
		var localPath = getLocalPath(document.location.toString());
		saveFile(localPath,responseText);
		w.setButtons([],me.statusReloadingCore);
		var backupPath = w.getValue("backupPath");
		var newLoc = document.location.toString() + '?time=' + new Date().convertToYYYYMMDDHHMM() + '#upgrade:[[' + encodeURI(backupPath) + ']]';
		window.setTimeout(function () {window.location = newLoc;},10);
	};
	var step2 = [me.step2Html_downgrade,me.step2Html_restore,me.step2Html_upgrade][compareVersions(version,newVer) + 1];
	w.addStep(me.step2Title,step2.format([formatVersion(newVer),formatVersion(version)]));
	w.setButtons([{caption: me.startLabel, tooltip: me.startPrompt, onClick: onStartUpgrade},{caption: me.cancelLabel, tooltip: me.cancelPrompt, onClick: me.onCancel}]);
};

config.macros.upgrade.onCancel = function(e)
{
	var me = config.macros.upgrade;
	var w = new Wizard(this);
	w.addStep(me.step3Title,me.step3Html);
	w.setButtons([]);
	return false;
};

config.macros.upgrade.extractVersion = function(upgradeFile)
{
	var re = /^var version = \{title: "([^"]+)", major: (\d+), minor: (\d+), revision: (\d+)(, beta: (\d+)){0,1}, date: new Date\("([^"]+)"\)/mg;
	var m = re.exec(upgradeFile);
	return  m ? {title: m[1], major: m[2], minor: m[3], revision: m[4], beta: m[6], date: new Date(m[7])} : null;
};

function upgradeFrom(path)
{
	var importStore = new TiddlyWiki();
	var tw = loadFile(path);
	if(window.netscape !== undefined)
		tw = convertUTF8ToUnicode(tw);
	importStore.importTiddlyWiki(tw);
	importStore.forEachTiddler(function(title,tiddler) {
		if(!store.getTiddler(title)) {
			store.addTiddler(tiddler);
		}
	});
	refreshDisplay();
	saveChanges(); //# To create appropriate Markup* sections
	alert(config.messages.upgradeDone.format([formatVersion()]));
	window.location = window.location.toString().substr(0,window.location.toString().lastIndexOf('?'));
}

//--
//-- Sync macro
//--

// Synchronisation handlers
config.syncers = {};

// Sync state.
var currSync = null;

// sync macro
config.macros.sync.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	if(!wikifier.isStatic)
		this.startSync(place);
};

config.macros.sync.cancelSync = function()
{
	currSync = null;
};

config.macros.sync.startSync = function(place)
{
	if(currSync)
		config.macros.sync.cancelSync();
	currSync = {};
	currSync.syncList = this.getSyncableTiddlers();
	currSync.syncTasks = this.createSyncTasks(currSync.syncList);
	this.preProcessSyncableTiddlers(currSync.syncList);
	var wizard = new Wizard();
	currSync.wizard = wizard;
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	currSync.listView = ListView.create(listWrapper,currSync.syncList,this.listViewTemplate);
	this.processSyncableTiddlers(currSync.syncList);
	wizard.setButtons([{caption: this.syncLabel, tooltip: this.syncPrompt, onClick: this.doSync}]);
};

config.macros.sync.getSyncableTiddlers = function()
{
	var list = [];
	store.forEachTiddler(function(title,tiddler) {
		var syncItem = {};
		syncItem.serverType = tiddler.getServerType();
		syncItem.serverHost = tiddler.fields['server.host'];
		if(syncItem.serverType && syncItem.serverHost) {
			syncItem.serverWorkspace = tiddler.fields['server.workspace'];
			syncItem.tiddler = tiddler;
			syncItem.title = tiddler.title;
			syncItem.isTouched = tiddler.isTouched();
			syncItem.selected = syncItem.isTouched;
			syncItem.syncStatus = config.macros.sync.syncStatusList[syncItem.isTouched ? "changedLocally" : "none"];
			syncItem.status = syncItem.syncStatus.text;
			list.push(syncItem);
		}
		});
	list.sort(function(a,b) {return a.title < b.title ? -1 : (a.title == b.title ? 0 : +1);});
	return list;
};

config.macros.sync.preProcessSyncableTiddlers = function(syncList)
{
	for(var i=0; i<syncList.length; i++) {
		var si = syncList[i];
		si.serverUrl = si.syncTask.syncMachine.generateTiddlerInfo(si.tiddler).uri;
	}
};

config.macros.sync.processSyncableTiddlers = function(syncList)
{
	for(var i=0; i<syncList.length; i++) {
		var si = syncList[i];
		if(si.syncStatus.display)
			si.rowElement.style.display = si.syncStatus.display;
		if(si.syncStatus.className)
			si.rowElement.className = si.syncStatus.className;
	}
};

config.macros.sync.createSyncTasks = function(syncList)
{
	var syncTasks = [];
	for(var i=0; i<syncList.length; i++) {
		var si = syncList[i];
		var r = null;
		for(var j=0; j<syncTasks.length; j++) {
			var cst = syncTasks[j];
			if(si.serverType == cst.serverType && si.serverHost == cst.serverHost && si.serverWorkspace == cst.serverWorkspace)
				r = cst;
		}
		if(r) {
			si.syncTask = r;
			r.syncItems.push(si);
		} else {
			si.syncTask = this.createSyncTask(si);
			syncTasks.push(si.syncTask);
		}
	}
	return syncTasks;
};

config.macros.sync.createSyncTask = function(syncItem)
{
	var st = {};
	st.serverType = syncItem.serverType;
	st.serverHost = syncItem.serverHost;
	st.serverWorkspace = syncItem.serverWorkspace;
	st.syncItems = [syncItem];
	st.syncMachine = new SyncMachine(st.serverType,{
		start: function() {
			return this.openHost(st.serverHost,"openWorkspace");
		},
		openWorkspace: function() {
			return this.openWorkspace(st.serverWorkspace,"getTiddlerList");
		},
		getTiddlerList: function() {
			return this.getTiddlerList("onGetTiddlerList");
		},
		onGetTiddlerList: function(context) {
			var tiddlers = context.tiddlers;
			for(var i=0; i<st.syncItems.length; i++) {
				var si = st.syncItems[i];
				var f = tiddlers.findByField("title",si.title);
				if(f !== null) {
					if(tiddlers[f].fields['server.page.revision'] > si.tiddler.fields['server.page.revision']) {
						si.syncStatus = config.macros.sync.syncStatusList[si.isTouched ? 'changedBoth' : 'changedServer'];
					}
				} else {
					si.syncStatus = config.macros.sync.syncStatusList.notFound;
				}
				config.macros.sync.updateSyncStatus(si);
			}
		},
		getTiddler: function(title) {
			return this.getTiddler(title,"onGetTiddler");
		},
		onGetTiddler: function(context) {
			var tiddler = context.tiddler;
			var syncItem = st.syncItems.findByField("title",tiddler.title);
			if(syncItem !== null) {
				syncItem = st.syncItems[syncItem];
				store.saveTiddler(tiddler.title, tiddler.title, tiddler.text, tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields, true, tiddler.created);
				syncItem.syncStatus = config.macros.sync.syncStatusList.gotFromServer;
				config.macros.sync.updateSyncStatus(syncItem);
			}
		},
		putTiddler: function(tiddler) {
			return this.putTiddler(tiddler,"onPutTiddler");
		},
		onPutTiddler: function(context) {
			var title = context.title;
			var syncItem = st.syncItems.findByField("title",title);
			if(syncItem !== null) {
				syncItem = st.syncItems[syncItem];
				store.resetTiddler(title);
				if(context.status) {
					syncItem.syncStatus = config.macros.sync.syncStatusList.putToServer;
					config.macros.sync.updateSyncStatus(syncItem);
				}
			}
		}
	});
	st.syncMachine.go();
	return st;
};

config.macros.sync.updateSyncStatus = function(syncItem)
{
	var e = syncItem.colElements["status"];
	removeChildren(e);
	createTiddlyText(e,syncItem.syncStatus.text);
	if(syncItem.syncStatus.display)
		syncItem.rowElement.style.display = syncItem.syncStatus.display;
	if(syncItem.syncStatus.className)
		syncItem.rowElement.className = syncItem.syncStatus.className;
};

config.macros.sync.doSync = function(e)
{
	var rowNames = ListView.getSelectedRows(currSync.listView);
	var sl = config.macros.sync.syncStatusList;
	for(var i=0; i<currSync.syncList.length; i++) {
		var si = currSync.syncList[i];
		if(rowNames.indexOf(si.title) != -1) {
			var r = true;
			switch(si.syncStatus) {
			case sl.changedServer:
				r = si.syncTask.syncMachine.go("getTiddler",si.title);
				break;
			case sl.notFound:
			case sl.changedLocally:
			case sl.changedBoth:
				r = si.syncTask.syncMachine.go("putTiddler",si.tiddler);
				break;
			default:
				break;
			}
			if(!r)
				displayMessage("Error in doSync: " + r);
		}
	}
	return false;
};

function SyncMachine(serverType,steps)
{
	this.serverType = serverType;
	this.adaptor = new config.adaptors[serverType]();
	this.steps = steps;
}

SyncMachine.prototype.go = function(step,context)
{
	var r = context ? context.status : null;
	if(typeof r == "string") {
		this.invokeError(r);
		return r;
	}
	var h = this.steps[step ? step : "start"];
	if(!h)
		return null;
	r = h.call(this,context);
	if(typeof r == "string")
		this.invokeError(r);
	return r;
};

SyncMachine.prototype.invokeError = function(message)
{
	if(this.steps.error)
		this.steps.error(message);
};

SyncMachine.prototype.openHost = function(host,nextStep)
{
	var me = this;
	return me.adaptor.openHost(host,null,null,function(context) {me.go(nextStep,context);});
};

SyncMachine.prototype.getWorkspaceList = function(nextStep)
{
	var me = this;
	return me.adaptor.getWorkspaceList(null,null,function(context) {me.go(nextStep,context);});
};

SyncMachine.prototype.openWorkspace = function(workspace,nextStep)
{
	var me = this;
	return me.adaptor.openWorkspace(workspace,null,null,function(context) {me.go(nextStep,context);});
};

SyncMachine.prototype.getTiddlerList = function(nextStep)
{
	var me = this;
	return me.adaptor.getTiddlerList(null,null,function(context) {me.go(nextStep,context);});
};

SyncMachine.prototype.generateTiddlerInfo = function(tiddler)
{
	return this.adaptor.generateTiddlerInfo(tiddler);
};

SyncMachine.prototype.getTiddler = function(title,nextStep)
{
	var me = this;
	return me.adaptor.getTiddler(title,null,null,function(context) {me.go(nextStep,context);});
};

SyncMachine.prototype.putTiddler = function(tiddler,nextStep)
{
	var me = this;
	if(me.adaptor.putTiddler)
		return me.adaptor.putTiddler(tiddler,null,null,function(context) {me.go(nextStep,context);});
	return false;
};

//--
//-- Manager UI for groups of tiddlers
//--

config.macros.plugins.handler = function(place,macroName,params,wikifier,paramString)
{
	var wizard = new Wizard();
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	listWrapper.setAttribute("refresh","macro");
	listWrapper.setAttribute("macroName","plugins");
	listWrapper.setAttribute("params",paramString);
	this.refresh(listWrapper,paramString);
};

config.macros.plugins.refresh = function(listWrapper,params)
{
	var wizard = new Wizard(listWrapper);
	var selectedRows = [];
	ListView.forEachSelector(listWrapper,function(e,rowName) {
			if(e.checked)
				selectedRows.push(e.getAttribute("rowName"));
		});
	removeChildren(listWrapper);
	params = params.parseParams("anon");
	var plugins = installedPlugins.slice(0);
	var t,tiddler,p;
	var configTiddlers = store.getTaggedTiddlers("systemConfig");
	for(t=0; t<configTiddlers.length; t++) {
		tiddler = configTiddlers[t];
		if(plugins.findByField("title",tiddler.title) == null) {
			p = getPluginInfo(tiddler);
			p.executed = false;
			p.log.splice(0,0,this.skippedText);
			plugins.push(p);
		}
	}
	for(t=0; t<plugins.length; t++) {
		p = plugins[t];
		p.size = p.tiddler.text ? p.tiddler.text.length : 0;
		p.forced = p.tiddler.isTagged("systemConfigForce");
		p.disabled = p.tiddler.isTagged("systemConfigDisable");
		p.Selected = selectedRows.indexOf(plugins[t].title) != -1;
		p.desc = store.getTiddlerSlice(p.tiddler.title,"Description");
	}
	if(plugins.length == 0) {
		createTiddlyElement(listWrapper,"em",null,null,this.noPluginText);
		wizard.setButtons([]);
	} else {
		var listView = ListView.create(listWrapper,plugins,this.listViewTemplate,this.onSelectCommand);
		wizard.setValue("listView",listView);
		wizard.setButtons([
				{caption: config.macros.plugins.removeLabel, tooltip: config.macros.plugins.removePrompt, onClick: config.macros.plugins.doRemoveTag},
				{caption: config.macros.plugins.deleteLabel, tooltip: config.macros.plugins.deletePrompt, onClick: config.macros.plugins.doDelete}
			]);
	}
};

config.macros.plugins.doRemoveTag = function(e)
{
	var wizard = new Wizard(this);
	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	if(rowNames.length == 0) {
		alert(config.messages.nothingSelected);
	} else {
		for(var t=0; t<rowNames.length; t++)
			store.setTiddlerTag(rowNames[t],false,"systemConfig");
	}
};

config.macros.plugins.doDelete = function(e)
{
	var wizard = new Wizard(this);
	var listView = wizard.getValue("listView");
	var rowNames = ListView.getSelectedRows(listView);
	if(rowNames.length == 0) {
		alert(config.messages.nothingSelected);
	} else {
		if(confirm(config.macros.plugins.confirmDeleteText.format([rowNames.join(", ")]))) {
			for(var t=0; t<rowNames.length; t++) {
				store.removeTiddler(rowNames[t]);
				story.closeTiddler(rowNames[t],true);
			}
		}
	}
};

//--
//-- Message area
//--

function getMessageDiv()
{
	var msgArea = document.getElementById("messageArea");
	if(!msgArea)
		return null;
	if(!msgArea.hasChildNodes())
		createTiddlyButton(createTiddlyElement(msgArea,"div",null,"messageToolbar"),
			config.messages.messageClose.text,
			config.messages.messageClose.tooltip,
			clearMessage);
	msgArea.style.display = "block";
	return createTiddlyElement(msgArea,"div");
}

function displayMessage(text,linkText)
{
	var e = getMessageDiv();
	if(!e) {
		alert(text);
		return;
	}
	if(linkText) {
		var link = createTiddlyElement(e,"a",null,null,text);
		link.href = linkText;
		link.target = "_blank";
	} else {
		e.appendChild(document.createTextNode(text));
	}
}

function clearMessage()
{
	var msgArea = document.getElementById("messageArea");
	if(msgArea) {
		removeChildren(msgArea);
		msgArea.style.display = "none";
	}
	return false;
}

//--
//-- Refresh mechanism
//--

config.notifyTiddlers = [
	{name: "StyleSheetLayout", notify: refreshStyles},
	{name: "StyleSheetColors", notify: refreshStyles},
	{name: "StyleSheet", notify: refreshStyles},
	{name: "StyleSheetPrint", notify: refreshStyles},
	{name: "PageTemplate", notify: refreshPageTemplate},
	{name: "SiteTitle", notify: refreshPageTitle},
	{name: "SiteSubtitle", notify: refreshPageTitle},
	{name: "ColorPalette", notify: refreshColorPalette},
	{name: null, notify: refreshDisplay}
];

config.refreshers = {
	link: function(e,changeList)
		{
		var title = e.getAttribute("tiddlyLink");
		refreshTiddlyLink(e,title);
		return true;
		},

	tiddler: function(e,changeList)
		{
		var title = e.getAttribute("tiddler");
		var template = e.getAttribute("template");
		if(changeList && changeList.indexOf(title) != -1 && !story.isDirty(title))
			story.refreshTiddler(title,template,true);
		else
			refreshElements(e,changeList);
		return true;
		},

	content: function(e,changeList)
		{
		var title = e.getAttribute("tiddler");
		var force = e.getAttribute("force");
		if(force != null || changeList == null || changeList.indexOf(title) != -1) {
			removeChildren(e);
			wikify(store.getTiddlerText(title,""),e,null,store.fetchTiddler(title));
			return true;
		} else
			return false;
		},

	macro: function(e,changeList)
		{
		var macro = e.getAttribute("macroName");
		var params = e.getAttribute("params");
		if(macro)
			macro = config.macros[macro];
		if(macro && macro.refresh)
			macro.refresh(e,params);
		return true;
		}
};

config.refresherData = {
	styleSheet: "StyleSheet",
	defaultStyleSheet: "StyleSheet",
	pageTemplate: "PageTemplate",
	defaultPageTemplate: "PageTemplate",
	colorPalette: "ColorPalette",
	defaultColorPalette: "ColorPalette"
};

function refreshElements(root,changeList)
{
	var nodes = root.childNodes;
	for(var c=0; c<nodes.length; c++) {
		var e = nodes[c], type = null;
		if(e.getAttribute && (e.tagName ? e.tagName != "IFRAME" : true))
			type = e.getAttribute("refresh");
		var refresher = config.refreshers[type];
		var refreshed = false;
		if(refresher != undefined)
			refreshed = refresher(e,changeList);
		if(e.hasChildNodes() && !refreshed)
			refreshElements(e,changeList);
	}
}

function applyHtmlMacros(root,tiddler)
{
	var e = root.firstChild;
	while(e) {
		var nextChild = e.nextSibling;
		if(e.getAttribute) {
			var macro = e.getAttribute("macro");
			if(macro) {
				e.removeAttribute("macro");
				var params = "";
				var p = macro.indexOf(" ");
				if(p != -1) {
					params = macro.substr(p+1);
					macro = macro.substr(0,p);
				}
				invokeMacro(e,macro,params,null,tiddler);
			}
		}
		if(e.hasChildNodes())
			applyHtmlMacros(e,tiddler);
		e = nextChild;
	}
}

function refreshPageTemplate(title)
{
	var stash = createTiddlyElement(document.body,"div");
	stash.style.display = "none";
	var display = story.getContainer();
	var nodes,t;
	if(display) {
		nodes = display.childNodes;
		for(t=nodes.length-1; t>=0; t--)
			stash.appendChild(nodes[t]);
	}
	var wrapper = document.getElementById("contentWrapper");

	var isAvailable = function(title) {
		var s = title ? title.indexOf(config.textPrimitives.sectionSeparator) : -1;
		if(s!=-1)
			title = title.substr(0,s);
		return store.tiddlerExists(title) || store.isShadowTiddler(title);
	};
	if(!title || !isAvailable(title))
		title = config.refresherData.pageTemplate;
	if(!isAvailable(title))
		title = config.refresherData.defaultPageTemplate; //# this one is always avaialable
	wrapper.innerHTML = store.getRecursiveTiddlerText(title,null,10);
	applyHtmlMacros(wrapper);
	refreshElements(wrapper);
	display = story.getContainer();
	removeChildren(display);
	if(!display)
		display = createTiddlyElement(wrapper,"div",story.containerId());
	nodes = stash.childNodes;
	for(t=nodes.length-1; t>=0; t--)
		display.appendChild(nodes[t]);
	removeNode(stash);
}

function refreshDisplay(hint)
{
	if(typeof hint == "string")
		hint = [hint];
	var e = document.getElementById("contentWrapper");
	refreshElements(e,hint);
	if(backstage.isPanelVisible()) {
		e = document.getElementById("backstage");
		refreshElements(e,hint);
	}
}

function refreshPageTitle()
{
	document.title = getPageTitle();
}

function getPageTitle()
{
	var st = wikifyPlain("SiteTitle");
	var ss = wikifyPlain("SiteSubtitle");
	return st + ((st == "" || ss == "") ? "" : " - ") + ss;
}

function refreshStyles(title,doc)
{
	setStylesheet(title == null ? "" : store.getRecursiveTiddlerText(title,"",10),title,doc || document);
}

function refreshColorPalette(title)
{
	if(!startingUp)
		refreshAll();
}

function refreshAll()
{
	refreshPageTemplate();
	refreshDisplay();
	refreshStyles("StyleSheetLayout");
	refreshStyles("StyleSheetColors");
	refreshStyles(config.refresherData.styleSheet);
	refreshStyles("StyleSheetPrint");
}

//--
//-- Options stuff
//--

config.optionHandlers = {
	'txt': {
		get: function(name) {return encodeCookie(config.options[name].toString());},
		set: function(name,value) {config.options[name] = decodeCookie(value);}
	},
	'chk': {
		get: function(name) {return config.options[name] ? "true" : "false";},
		set: function(name,value) {config.options[name] = value == "true";}
	}
};

function loadOptionsCookie()
{
	if(safeMode)
		return;
	var cookies = document.cookie.split(";");
	for(var c=0; c<cookies.length; c++) {
		var p = cookies[c].indexOf("=");
		if(p != -1) {
			var name = cookies[c].substr(0,p).trim();
			var value = cookies[c].substr(p+1).trim();
			var optType = name.substr(0,3);
			if(config.optionHandlers[optType] && config.optionHandlers[optType].set)
				config.optionHandlers[optType].set(name,value);
		}
	}
}

function saveOptionCookie(name)
{
	if(safeMode)
		return;
	var c = name + "=";
	var optType = name.substr(0,3);
	if(config.optionHandlers[optType] && config.optionHandlers[optType].get)
		c += config.optionHandlers[optType].get(name);
	c += "; expires=Fri, 1 Jan 2038 12:00:00 UTC; path=/";
	document.cookie = c;
}

function removeCookie(name)
{
	document.cookie = name + "=; expires=Thu, 01-Jan-1970 00:00:01 UTC; path=/;";
}

function encodeCookie(s)
{
	return escape(convertUnicodeToHtmlEntities(s));
}

function decodeCookie(s)
{
	s = unescape(s);
	var re = /&#[0-9]{1,5};/g;
	return s.replace(re,function($0) {return String.fromCharCode(eval($0.replace(/[&#;]/g,"")));});
}


config.macros.option.genericCreate = function(place,type,opt,className,desc)
{
	var typeInfo = config.macros.option.types[type];
	var c = document.createElement(typeInfo.elementType);
	if(typeInfo.typeValue)
		c.setAttribute("type",typeInfo.typeValue);
	c[typeInfo.eventName] = typeInfo.onChange;
	c.setAttribute("option",opt);
	c.className = className || typeInfo.className;
	if(config.optionsDesc[opt])
		c.setAttribute("title",config.optionsDesc[opt]);
	place.appendChild(c);
	if(desc != "no")
		createTiddlyText(place,config.optionsDesc[opt] || opt);
	c[typeInfo.valueField] = config.options[opt];
	return c;
};

config.macros.option.genericOnChange = function(e)
{
	var opt = this.getAttribute("option");
	if(opt) {
		var optType = opt.substr(0,3);
		var handler = config.macros.option.types[optType];
		if(handler.elementType && handler.valueField)
			config.macros.option.propagateOption(opt,handler.valueField,this[handler.valueField],handler.elementType,this);
	}
	return true;
};

config.macros.option.types = {
	'txt': {
		elementType: "input",
		valueField: "value",
		eventName: "onchange",
		className: "txtOptionInput",
		create: config.macros.option.genericCreate,
		onChange: config.macros.option.genericOnChange
	},
	'chk': {
		elementType: "input",
		valueField: "checked",
		eventName: "onclick",
		className: "chkOptionInput",
		typeValue: "checkbox",
		create: config.macros.option.genericCreate,
		onChange: config.macros.option.genericOnChange
	}
};

config.macros.option.propagateOption = function(opt,valueField,value,elementType,elem)
{
	config.options[opt] = value;
	saveOptionCookie(opt);
	var nodes = document.getElementsByTagName(elementType);
	for(var t=0; t<nodes.length; t++) {
		var optNode = nodes[t].getAttribute("option");
		if(opt == optNode && nodes[t]!=elem)
			nodes[t][valueField] = value;
	}
};

config.macros.option.handler = function(place,macroName,params,wikifier,paramString)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var opt = (params[1] && params[1].name == "anon") ? params[1].value : getParam(params,"name",null);
	var className = (params[2] && params[2].name == "anon") ? params[2].value : getParam(params,"class",null);
	var desc = getParam(params,"desc","no");
	var type = opt.substr(0,3);
	var h = config.macros.option.types[type];
	if(h && h.create)
		h.create(place,type,opt,className,desc);
};

config.macros.options.handler = function(place,macroName,params,wikifier,paramString)
{
	params = paramString.parseParams("anon",null,true,false,false);
	var showUnknown = getParam(params,"showUnknown","no");
	var wizard = new Wizard();
	wizard.createWizard(place,this.wizardTitle);
	wizard.addStep(this.step1Title,this.step1Html);
	var markList = wizard.getElement("markList");
	var chkUnknown = wizard.getElement("chkUnknown");
	chkUnknown.checked = showUnknown == "yes";
	chkUnknown.onchange = this.onChangeUnknown;
	var listWrapper = document.createElement("div");
	markList.parentNode.insertBefore(listWrapper,markList);
	wizard.setValue("listWrapper",listWrapper);
	this.refreshOptions(listWrapper,showUnknown == "yes");
};

config.macros.options.refreshOptions = function(listWrapper,showUnknown)
{
	var opts = [];
	for(var n in config.options) {
		var opt = {};
		opt.option = "";
		opt.name = n;
		opt.lowlight = !config.optionsDesc[n];
		opt.description = opt.lowlight ? this.unknownDescription : config.optionsDesc[n];
		if(!opt.lowlight || showUnknown)
			opts.push(opt);
	}
	opts.sort(function(a,b) {return a.name.substr(3) < b.name.substr(3) ? -1 : (a.name.substr(3) == b.name.substr(3) ? 0 : +1);});
	var listview = ListView.create(listWrapper,opts,this.listViewTemplate);
	for(n=0; n<opts.length; n++) {
		var type = opts[n].name.substr(0,3);
		var h = config.macros.option.types[type];
		if(h && h.create) {
			h.create(opts[n].colElements['option'],type,opts[n].name,null,"no");
		}
	}
};

config.macros.options.onChangeUnknown = function(e)
{
	var wizard = new Wizard(this);
	var listWrapper = wizard.getValue("listWrapper");
	removeChildren(listWrapper);
	config.macros.options.refreshOptions(listWrapper,this.checked);
	return false;
};

//--
//-- Saving
//--

var saveUsingSafari = false;

var startSaveArea = '<div id="' + 'storeArea">'; // Split up into two so that indexOf() of this source doesn't find it
var endSaveArea = '</d' + 'iv>';

// If there are unsaved changes, force the user to confirm before exitting
function confirmExit()
{
	hadConfirmExit = true;
	if((store && store.isDirty && store.isDirty()) || (story && story.areAnyDirty && story.areAnyDirty()))
		return config.messages.confirmExit;
}

// Give the user a chance to save changes before exitting
function checkUnsavedChanges()
{
	if(store && store.isDirty && store.isDirty() && window.hadConfirmExit === false) {
		if(confirm(config.messages.unsavedChangesWarning))
			saveChanges();
	}
}

function updateLanguageAttribute(s)
{
	if(config.locale) {
		var mRE = /(<html(?:.*?)?)(?: xml:lang\="([a-z]+)")?(?: lang\="([a-z]+)")?>/;
		var m = mRE.exec(s);
		if(m) {
			var t = m[1];
			if(m[2])
				t += ' xml:lang="' + config.locale + '"';
			if(m[3])
				t += ' lang="' + config.locale + '"';
			t += ">";
			s = s.substr(0,m.index) + t + s.substr(m.index+m[0].length);
		}
	}
	return s;
}

function updateMarkupBlock(s,blockName,tiddlerName)
{
	return s.replaceChunk(
			"<!--%0-START-->".format([blockName]),
			"<!--%0-END-->".format([blockName]),
			"\n" + convertUnicodeToFileFormat(store.getRecursiveTiddlerText(tiddlerName,"")) + "\n");
}

function updateOriginal(original,posDiv,localPath)
{
	if(!posDiv)
		posDiv = locateStoreArea(original);
	if(!posDiv) {
		alert(config.messages.invalidFileError.format([localPath]));
		return null;
	}
	var revised = original.substr(0,posDiv[0] + startSaveArea.length) + "\n" +
				convertUnicodeToFileFormat(store.allTiddlersAsHtml()) + "\n" +
				original.substr(posDiv[1]);
	var newSiteTitle = convertUnicodeToFileFormat(getPageTitle()).htmlEncode();
	revised = revised.replaceChunk("<title"+">","</title"+">"," " + newSiteTitle + " ");
	revised = updateLanguageAttribute(revised);
	revised = updateMarkupBlock(revised,"PRE-HEAD","MarkupPreHead");
	revised = updateMarkupBlock(revised,"POST-HEAD","MarkupPostHead");
	revised = updateMarkupBlock(revised,"PRE-BODY","MarkupPreBody");
	revised = updateMarkupBlock(revised,"POST-SCRIPT","MarkupPostBody");
	return revised;
}

function locateStoreArea(original)
{
	// Locate the storeArea div's
	var posOpeningDiv = original.indexOf(startSaveArea);
	var limitClosingDiv = original.indexOf("<"+"!--POST-STOREAREA--"+">");
	if(limitClosingDiv == -1)
		limitClosingDiv = original.indexOf("<"+"!--POST-BODY-START--"+">");
	var posClosingDiv = original.lastIndexOf(endSaveArea,limitClosingDiv == -1 ? original.length : limitClosingDiv);
	return (posOpeningDiv != -1 && posClosingDiv != -1) ? [posOpeningDiv,posClosingDiv] : null;
}

function autoSaveChanges(onlyIfDirty,tiddlers)
{
	if(config.options.chkAutoSave)
		saveChanges(onlyIfDirty,tiddlers);
}

function loadOriginal(localPath)
{
	return loadFile(localPath);
}

// Save this tiddlywiki with the pending changes
function saveChanges(onlyIfDirty,tiddlers)
{
	if(onlyIfDirty && !store.isDirty())
		return;
	clearMessage();
	var t0 = new Date();
	var originalPath = document.location.toString();
	if(originalPath.substr(0,5) != "file:") {
		alert(config.messages.notFileUrlError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
		return;
	}
	var localPath = getLocalPath(originalPath);
	var original = loadOriginal(localPath);
	if(original == null) {
		alert(config.messages.cantSaveError);
		if(store.tiddlerExists(config.messages.saveInstructions))
			story.displayTiddler(null,config.messages.saveInstructions);
		return;
	}
	var posDiv = locateStoreArea(original);
	if(!posDiv) {
		alert(config.messages.invalidFileError.format([localPath]));
		return;
	}
	saveMain(localPath,original,posDiv);
	if(config.options.chkSaveBackups)
		saveBackup(localPath,original);
	if(config.options.chkSaveEmptyTemplate)
		saveEmpty(localPath,original,posDiv);
	if(config.options.chkGenerateAnRssFeed && saveRss instanceof Function)
		saveRss(localPath);
	if(config.options.chkDisplayInstrumentation)
		displayMessage("saveChanges " + (new Date()-t0) + " ms");
}

function saveMain(localPath,original,posDiv)
{
	var save;
	try {
		var revised = updateOriginal(original,posDiv,localPath);
		save = saveFile(localPath,revised);
	} catch (ex) {
		showException(ex);
	}
	if(save) {
		displayMessage(config.messages.mainSaved,"file://" + localPath);
		store.setDirty(false);
	} else {
		alert(config.messages.mainFailed);
	}
}

function saveBackup(localPath,original)
{
	var backupPath = getBackupPath(localPath);
	var backup = copyFile(backupPath,localPath);
	if(!backup)
		backup = saveFile(backupPath,original);
	if(backup)
		displayMessage(config.messages.backupSaved,"file://" + backupPath);
	else
		alert(config.messages.backupFailed);
}

function saveEmpty(localPath,original,posDiv)
{
	var emptyPath,p;
	if((p = localPath.lastIndexOf("/")) != -1)
		emptyPath = localPath.substr(0,p) + "/";
	else if((p = localPath.lastIndexOf("\\")) != -1)
		emptyPath = localPath.substr(0,p) + "\\";
	else
		emptyPath = localPath + ".";
	emptyPath += "empty.html";
	var empty = original.substr(0,posDiv[0] + startSaveArea.length) + original.substr(posDiv[1]);
	var emptySave = saveFile(emptyPath,empty);
	if(emptySave)
		displayMessage(config.messages.emptySaved,"file://" + emptyPath);
	else
		alert(config.messages.emptyFailed);
}

function getLocalPath(origPath)
{
	var originalPath = convertUriToUTF8(origPath,config.options.txtFileSystemCharSet);
	// Remove any location or query part of the URL
	var argPos = originalPath.indexOf("?");
	if(argPos != -1)
		originalPath = originalPath.substr(0,argPos);
	var hashPos = originalPath.indexOf("#");
	if(hashPos != -1)
		originalPath = originalPath.substr(0,hashPos);
	// Convert file://localhost/ to file:///
	if(originalPath.indexOf("file://localhost/") == 0)
		originalPath = "file://" + originalPath.substr(16);
	// Convert to a native file format
	var localPath;
	if(originalPath.charAt(9) == ":") // pc local file
		localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
		localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
	else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(7));
	else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
		localPath = unescape(originalPath.substr(5));
	else // pc network file
		localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
	return localPath;
}

function getBackupPath(localPath,title,extension)
{
	var slash = "\\";
	var dirPathPos = localPath.lastIndexOf("\\");
	if(dirPathPos == -1) {
		dirPathPos = localPath.lastIndexOf("/");
		slash = "/";
	}
	var backupFolder = config.options.txtBackupFolder;
	if(!backupFolder || backupFolder == "")
		backupFolder = ".";
	var backupPath = localPath.substr(0,dirPathPos) + slash + backupFolder + localPath.substr(dirPathPos);
	backupPath = backupPath.substr(0,backupPath.lastIndexOf(".")) + ".";
	if(title)
		backupPath += title.replace(/[\\\/\*\?\":<> ]/g,"_") + ".";
	backupPath += (new Date()).convertToYYYYMMDDHHMMSSMMM() + "." + (extension || "html");
	return backupPath;
}

//--
//-- RSS Saving
//--

function saveRss(localPath)
{
	var rssPath = localPath.substr(0,localPath.lastIndexOf(".")) + ".xml";
	if(saveFile(rssPath,convertUnicodeToFileFormat(generateRss())))
		displayMessage(config.messages.rssSaved,"file://" + rssPath);
	else
		alert(config.messages.rssFailed);
}

tiddlerToRssItem = function(tiddler,uri)
{
	var s = "<title" + ">" + tiddler.title.htmlEncode() + "</title" + ">\n";
	s += "<description>" + wikifyStatic(tiddler.text,null,tiddler).htmlEncode() + "</description>\n";
	for(var i=0; i<tiddler.tags.length; i++)
		s += "<category>" + tiddler.tags[i] + "</category>\n";
	s += "<link>" + uri + "#" + encodeURIComponent(String.encodeTiddlyLink(tiddler.title)) + "</link>\n";
	s +="<pubDate>" + tiddler.modified.toGMTString() + "</pubDate>\n";
	return s;
};

function generateRss()
{
	var s = [];
	var d = new Date();
	var u = store.getTiddlerText("SiteUrl");
	// Assemble the header
	s.push("<" + "?xml version=\"1.0\"?" + ">");
	s.push("<rss version=\"2.0\">");
	s.push("<channel>");
	s.push("<title" + ">" + wikifyPlain("SiteTitle").htmlEncode() + "</title" + ">");
	if(u)
		s.push("<link>" + u.htmlEncode() + "</link>");
	s.push("<description>" + wikifyPlain("SiteSubtitle").htmlEncode() + "</description>");
	s.push("<language>" + config.locale + "</language>");
	s.push("<copyright>Copyright " + d.getFullYear() + " " + config.options.txtUserName.htmlEncode() + "</copyright>");
	s.push("<pubDate>" + d.toGMTString() + "</pubDate>");
	s.push("<lastBuildDate>" + d.toGMTString() + "</lastBuildDate>");
	s.push("<docs>http://blogs.law.harvard.edu/tech/rss</docs>");
	s.push("<generator>TiddlyWiki " + formatVersion() + "</generator>");
	// The body
	var tiddlers = store.getTiddlers("modified","excludeLists");
	var n = config.numRssItems > tiddlers.length ? 0 : tiddlers.length-config.numRssItems;
	for(var i=tiddlers.length-1; i>=n; i--) {
		s.push("<item>\n" + tiddlerToRssItem(tiddlers[i],u) + "\n</item>");
	}
	// And footer
	s.push("</channel>");
	s.push("</rss>");
	// Save it all
	return s.join("\n");
}

//--
//-- Filesystem code
//--

function convertUTF8ToUnicode(u)
{
	return config.browser.isOpera || !window.netscape ? manualConvertUTF8ToUnicode(u) : mozConvertUTF8ToUnicode(u);
}

function manualConvertUTF8ToUnicode(utf)
{
	var uni = utf;
	var src = 0;
	var dst = 0;
	var b1, b2, b3;
	var c;
	while(src < utf.length) {
		b1 = utf.charCodeAt(src++);
		if(b1 < 0x80) {
			dst++;
		} else if(b1 < 0xE0) {
			b2 = utf.charCodeAt(src++);
			c = String.fromCharCode(((b1 & 0x1F) << 6) | (b2 & 0x3F));
			uni = uni.substring(0,dst++).concat(c,utf.substr(src));
		} else {
			b2 = utf.charCodeAt(src++);
			b3 = utf.charCodeAt(src++);
			c = String.fromCharCode(((b1 & 0xF) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F));
			uni = uni.substring(0,dst++).concat(c,utf.substr(src));
		}
	}
	return uni;
}

function mozConvertUTF8ToUnicode(u)
{
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
	} catch(ex) {
		return manualConvertUTF8ToUnicode(u);
	} // fallback
	var s = converter.ConvertToUnicode(u);
	var fin = converter.Finish();
	return fin.length > 0 ? s+fin : s;
}

function convertUnicodeToFileFormat(s)
{
	return config.browser.isOpera || !window.netscape ? convertUnicodeToHtmlEntities(s) : mozConvertUnicodeToUTF8(s);
}

function convertUnicodeToHtmlEntities(s)
{
	var re = /[^\u0000-\u007F]/g;
	return s.replace(re,function($0) {return "&#" + $0.charCodeAt(0).toString() + ";";});
}

function convertUnicodeToUTF8(s)
{
// return convertUnicodeToFileFormat to allow plugin migration
	return convertUnicodeToFileFormat(s);
}

function manualConvertUnicodeToUTF8(s)
{
	return unescape(encodeURIComponent(s));
}

function mozConvertUnicodeToUTF8(s)
{
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
		converter.charset = "UTF-8";
	} catch(ex) {
		return manualConvertUnicodeToUTF8(s);
	} // fallback
	var u = converter.ConvertFromUnicode(s);
	var fin = converter.Finish();
	return fin.length > 0 ? u + fin : u;
}

function convertUriToUTF8(uri,charSet)
{
	if(window.netscape == undefined || charSet == undefined || charSet == "")
		return uri;
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
		var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
	} catch(ex) {
		return uri;
	}
	return converter.convertURISpecToUTF8(uri,charSet);
}

function copyFile(dest,source)
{
	return config.browser.isIE ? ieCopyFile(dest,source) : false;
}

function saveFile(fileUrl,content)
{
	var r = mozillaSaveFile(fileUrl,content);
	if(!r)
		r = ieSaveFile(fileUrl,content);
	if(!r)
		r = javaSaveFile(fileUrl,content);
	return r;
}

function loadFile(fileUrl)
{
	var r = mozillaLoadFile(fileUrl);
	if((r == null) || (r == false))
		r = ieLoadFile(fileUrl);
	if((r == null) || (r == false))
		r = javaLoadFile(fileUrl);
	return r;
}

function ieCreatePath(path)
{
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
	} catch(ex) {
		return null;
	}

	var pos = path.lastIndexOf("\\");
	if(pos==-1)
		pos = path.lastIndexOf("/");
	if(pos!=-1)
		path = path.substring(0,pos+1);

	var scan = [path];
	var parent = fso.GetParentFolderName(path);
	while(parent && !fso.FolderExists(parent)) {
		scan.push(parent);
		parent = fso.GetParentFolderName(parent);
	}

	for(i=scan.length-1;i>=0;i--) {
		if(!fso.FolderExists(scan[i])) {
			fso.CreateFolder(scan[i]);
		}
	}
	return true;
}

// Returns null if it can't do it, false if there's an error, true if it saved OK
function ieSaveFile(filePath,content)
{
	ieCreatePath(filePath);
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
	} catch(ex) {
		return null;
	}
	var file = fso.OpenTextFile(filePath,2,-1,0);
	file.Write(content);
	file.Close();
	return true;
}

// Returns null if it can't do it, false if there's an error, or a string of the content if successful
function ieLoadFile(filePath)
{
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		var file = fso.OpenTextFile(filePath,1);
		var content = file.ReadAll();
		file.Close();
	} catch(ex) {
		return null;
	}
	return content;
}

function ieCopyFile(dest,source)
{
	ieCreatePath(dest);
	try {
		var fso = new ActiveXObject("Scripting.FileSystemObject");
		fso.GetFile(source).Copy(dest);
	} catch(ex) {
		return false;
	}
	return true;
}

// Returns null if it can't do it, false if there's an error, true if it saved OK
function mozillaSaveFile(filePath,content)
{
	if(window.Components) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filePath);
			if(!file.exists())
				file.create(0,0664);
			var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
			out.init(file,0x20|0x02,00004,null);
			out.write(content,content.length);
			out.flush();
			out.close();
			return true;
		} catch(ex) {
			return false;
		}
	}
	return null;
}

// Returns null if it can't do it, false if there's an error, or a string of the content if successful
function mozillaLoadFile(filePath)
{
	if(window.Components) {
		try {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
			var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(filePath);
			if(!file.exists())
				return null;
			var inputStream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
			inputStream.init(file,0x01,00004,null);
			var sInputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
			sInputStream.init(inputStream);
			var contents = sInputStream.read(sInputStream.available());
			sInputStream.close();
			inputStream.close();
			return contents;
		} catch(ex) {
			return false;
		}
	}
	return null;
}

function javaUrlToFilename(url)
{
	var f = "//localhost";
	if(url.indexOf(f) == 0)
		return url.substring(f.length);
	var i = url.indexOf(":");
	return i > 0 ? url.substring(i-1) : url;
}

function javaSaveFile(filePath,content)
{
	try {
		if(document.applets["TiddlySaver"])
			return document.applets["TiddlySaver"].saveFile(javaUrlToFilename(filePath),"UTF-8",content);
	} catch(ex) {
	}
	try {
		var s = new java.io.PrintStream(new java.io.FileOutputStream(javaUrlToFilename(filePath)));
		s.print(content);
		s.close();
	} catch(ex) {
		return null;
	}
	return true;
}

function javaLoadFile(filePath)
{
	try {
		if(document.applets["TiddlySaver"])
			return String(document.applets["TiddlySaver"].loadFile(javaUrlToFilename(filePath),"UTF-8"));
	} catch(ex) {
	}
	var content = [];
	try {
		var r = new java.io.BufferedReader(new java.io.FileReader(javaUrlToFilename(filePath)));
		var line;
		while((line = r.readLine()) != null)
			content.push(new String(line));
		r.close();
	} catch(ex) {
		return null;
	}
	return content.join("\n");
}

//--
//-- Server adaptor base class
//--

function AdaptorBase()
{
	this.host = null;
	this.store = null;
	return this;
}

AdaptorBase.prototype.close = function()
{
	return true;
};

AdaptorBase.prototype.fullHostName = function(host)
{
	if(!host)
		return '';
	host = host.trim();
	if(!host.match(/:\/\//))
		host = 'http://' + host;
	if(host.substr(host.length-1) == '/')
		host = host.substr(0,host.length-1);
	return host;
};

AdaptorBase.minHostName = function(host)
{
	return host ? host.replace(/^http:\/\//,'').replace(/\/$/,'') : '';
};

AdaptorBase.prototype.setContext = function(context,userParams,callback)
{
	if(!context) context = {};
	context.userParams = userParams;
	if(callback) context.callback = callback;
	context.adaptor = this;
	if(!context.host)
		context.host = this.host;
	context.host = this.fullHostName(context.host);
	if(!context.workspace)
		context.workspace = this.workspace;
	return context;
};

// Open the specified host
AdaptorBase.prototype.openHost = function(host,context,userParams,callback)
{
	this.host = host;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {context.callback(context,userParams);},10);
	return true;
};

// Open the specified workspace
AdaptorBase.prototype.openWorkspace = function(workspace,context,userParams,callback)
{
	this.workspace = workspace;
	context = this.setContext(context,userParams,callback);
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

//--
//-- Server adaptor for talking to static TiddlyWiki files
//--

function FileAdaptor()
{
}

FileAdaptor.prototype = new AdaptorBase();

FileAdaptor.serverType = 'file';
FileAdaptor.serverLabel = 'TiddlyWiki';

FileAdaptor.loadTiddlyWikiCallback = function(status,context,responseText,url,xhr)
{
	context.status = status;
	if(!status) {
		context.statusText = "Error reading file";
	} else {
		context.adaptor.store = new TiddlyWiki();
		if(!context.adaptor.store.importTiddlyWiki(responseText)) {
			context.statusText = config.messages.invalidFileError.format([url]);
			context.status = false;
		}
	}
	context.complete(context,context.userParams);
};

// Get the list of workspaces on a given server
FileAdaptor.prototype.getWorkspaceList = function(context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.workspaces = [{title:"(default)"}];
	context.status = true;
	if(callback)
		window.setTimeout(function() {callback(context,userParams);},10);
	return true;
};

// Gets the list of tiddlers within a given workspace
FileAdaptor.prototype.getTiddlerList = function(context,userParams,callback,filter)
{
	context = this.setContext(context,userParams,callback);
	if(!context.filter)
		context.filter = filter;
	context.complete = FileAdaptor.getTiddlerListComplete;
	if(this.store) {
		var ret = context.complete(context,context.userParams);
	} else {
		ret = loadRemoteFile(context.host,FileAdaptor.loadTiddlyWikiCallback,context);
		if(typeof ret != "string")
			ret = true;
	}
	return ret;
};

FileAdaptor.getTiddlerListComplete = function(context,userParams)
{
	if(context.status) {
		if(context.filter) {
			context.tiddlers = context.adaptor.store.filterTiddlers(context.filter);
		} else {
			context.tiddlers = [];
			context.adaptor.store.forEachTiddler(function(title,tiddler) {context.tiddlers.push(tiddler);});
		}
		for(var i=0; i<context.tiddlers.length; i++) {
			context.tiddlers[i].fields['server.type'] = FileAdaptor.serverType;
			context.tiddlers[i].fields['server.host'] = AdaptorBase.minHostName(context.host);
			context.tiddlers[i].fields['server.page.revision'] = context.tiddlers[i].modified.convertToYYYYMMDDHHMM();
		}
		context.status = true;
	}
	if(context.callback) {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

FileAdaptor.prototype.generateTiddlerInfo = function(tiddler)
{
	var info = {};
	info.uri = tiddler.fields['server.host'] + "#" + tiddler.title;
	return info;
};

// Retrieve a tiddler from a given workspace on a given server
FileAdaptor.prototype.getTiddler = function(title,context,userParams,callback)
{
	context = this.setContext(context,userParams,callback);
	context.title = title;
	context.complete = FileAdaptor.getTiddlerComplete;
	return context.adaptor.store ?
		context.complete(context,context.userParams) :
		loadRemoteFile(context.host,FileAdaptor.loadTiddlyWikiCallback,context);
};

FileAdaptor.getTiddlerComplete = function(context,userParams)
{
	var t = context.adaptor.store.fetchTiddler(context.title);
	t.fields['server.type'] = FileAdaptor.serverType;
	t.fields['server.host'] = AdaptorBase.minHostName(context.host);
	t.fields['server.page.revision'] = t.modified.convertToYYYYMMDDHHMM();
	context.tiddler = t;
	context.status = true;
	if(context.allowSynchronous) {
		context.isSynchronous = true;
		context.callback(context,userParams);
	} else {
		window.setTimeout(function() {context.callback(context,userParams);},10);
	}
	return true;
};

FileAdaptor.prototype.close = function()
{
	delete this.store;
	this.store = null;
};

config.adaptors[FileAdaptor.serverType] = FileAdaptor;

config.defaultAdaptor = FileAdaptor.serverType;

//--
//-- Remote HTTP requests
//--

function loadRemoteFile(url,callback,params)
{
	return httpReq("GET",url,callback,params);
}

function httpReq(type,url,callback,params,headers,data,contentType,username,password,allowCache)
{
	var x = null;
	try {
		x = new XMLHttpRequest(); //# Modern
	} catch(ex) {
		try {
			x = new ActiveXObject("Msxml2.XMLHTTP"); //# IE 6
		} catch(ex2) {
		}
	}
	if(!x)
		return "Can't create XMLHttpRequest object";
	x.onreadystatechange = function() {
		try {
			var status = x.status;
		} catch(ex) {
			status = false;
		}
		if(x.readyState == 4 && callback && (status !== undefined)) {
			if([0, 200, 201, 204, 207].contains(status))
				callback(true,params,x.responseText,url,x);
			else
				callback(false,params,null,url,x);
			x.onreadystatechange = function(){};
			x = null;
		}
	};
	if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
		window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	try {
		if(!allowCache)
			url = url + (url.indexOf("?") < 0 ? "?" : "&") + "nocache=" + Math.random();
		x.open(type,url,true,username,password);
		if(data)
			x.setRequestHeader("Content-Type", contentType || "application/x-www-form-urlencoded");
		if(x.overrideMimeType)
			x.setRequestHeader("Connection", "close");
		if(headers) {
			for(var n in headers)
				x.setRequestHeader(n,headers[n]);
		}
		x.setRequestHeader("X-Requested-With", "TiddlyWiki " + formatVersion());
		x.send(data);
	} catch(ex) {
		return exceptionText(ex);
	}
	return x;
}

// included for compatibility
function getXMLHttpRequest()
{
	try {
		var x = new XMLHttpRequest(); // Modern
	} catch(ex) {
		try {
			x = new ActiveXObject("Msxml2.XMLHTTP"); // IE 6
		} catch (ex2) {
			return null;
		}
	}
	return x;
}

// included for compatibility
function doHttp(type,url,data,contentType,username,password,callback,params,headers,allowCache)
{
	return httpReq(type,url,callback,params,headers,data,contentType,username,password,allowCache);
}

//--
//-- TiddlyWiki-specific utility functions
//--

function formatVersion(v)
{
	v = v || version;
	return v.major + "." + v.minor + "." + v.revision + (v.beta ? " (beta " + v.beta + ")" : "");
}

function compareVersions(v1,v2)
{
	var a = ["major","minor","revision"];
	for(var i = 0; i<a.length; i++) {
		var x1 = v1[a[i]] || 0;
		var x2 = v2[a[i]] || 0;
		if(x1<x2)
			return 1;
		if(x1>x2)
			return -1;
	}
	x1 = v1.beta || 9999;
	x2 = v2.beta || 9999;
	if(x1<x2)
		return 1;
	return x1 > x2 ? -1 : 0;
}

function createTiddlyButton(parent,text,tooltip,action,className,id,accessKey,attribs)
{
	var btn = document.createElement("a");
	if(action) {
		btn.onclick = action;
		btn.setAttribute("href","javascript:;");
	}
	if(tooltip)
		btn.setAttribute("title",tooltip);
	if(text)
		btn.appendChild(document.createTextNode(text));
	btn.className = className || "button";
	if(id)
		btn.id = id;
	if(attribs) {
		for(var i in attribs) {
			btn.setAttribute(i,attribs[i]);
		}
	}
	if(parent)
		parent.appendChild(btn);
	if(accessKey)
		btn.setAttribute("accessKey",accessKey);
	return btn;
}

function createTiddlyLink(place,title,includeText,className,isStatic,linkedFromTiddler,noToggle)
{
	var text = includeText ? title : null;
	var i = getTiddlyLinkInfo(title,className);
	var btn = isStatic ? createExternalLink(place,store.getTiddlerText("SiteUrl",null) + "#" + title) : createTiddlyButton(place,text,i.subTitle,onClickTiddlerLink,i.classes);
	if(isStatic)
		btn.className += ' ' + className;
	btn.setAttribute("refresh","link");
	btn.setAttribute("tiddlyLink",title);
	if(noToggle)
		btn.setAttribute("noToggle","true");
	if(linkedFromTiddler) {
		var fields = linkedFromTiddler.getInheritedFields();
		if(fields)
			btn.setAttribute("tiddlyFields",fields);
	}
	return btn;
}

function refreshTiddlyLink(e,title)
{
	var i = getTiddlyLinkInfo(title,e.className);
	e.className = i.classes;
	e.title = i.subTitle;
}

function getTiddlyLinkInfo(title,currClasses)
{
	var classes = currClasses ? currClasses.split(" ") : [];
	classes.pushUnique("tiddlyLink");
	var tiddler = store.fetchTiddler(title);
	var subTitle;
	if(tiddler) {
		subTitle = tiddler.getSubtitle();
		classes.pushUnique("tiddlyLinkExisting");
		classes.remove("tiddlyLinkNonExisting");
		classes.remove("shadow");
	} else {
		classes.remove("tiddlyLinkExisting");
		classes.pushUnique("tiddlyLinkNonExisting");
		if(store.isShadowTiddler(title)) {
			subTitle = config.messages.shadowedTiddlerToolTip.format([title]);
			classes.pushUnique("shadow");
		} else {
			subTitle = config.messages.undefinedTiddlerToolTip.format([title]);
			classes.remove("shadow");
		}
	}
	if(typeof config.annotations[title]=="string")
		subTitle = config.annotations[title];
	return {classes: classes.join(" "),subTitle: subTitle};
}

function createExternalLink(place,url)
{
	var link = document.createElement("a");
	link.className = "externalLink";
	link.href = url;
	link.title = config.messages.externalLinkTooltip.format([url]);
	if(config.options.chkOpenInNewWindow)
		link.target = "_blank";
	place.appendChild(link);
	return link;
}

// Event handler for clicking on a tiddly link
function onClickTiddlerLink(ev)
{
	var e = ev || window.event;
	var target = resolveTarget(e);
	var link = target;
	var title = null;
	var fields = null;
	var noToggle = null;
	do {
		title = link.getAttribute("tiddlyLink");
		fields = link.getAttribute("tiddlyFields");
		noToggle = link.getAttribute("noToggle");
		link = link.parentNode;
	} while(title == null && link != null);
	if(!store.isShadowTiddler(title)) {
		var f = fields ? fields.decodeHashMap() : {};
		fields = String.encodeHashMap(merge(f,config.defaultCustomFields,true));
	}
	if(title) {
		var toggling = e.metaKey || e.ctrlKey;
		if(config.options.chkToggleLinks)
			toggling = !toggling;
		if(noToggle)
			toggling = false;
		if(store.getTiddler(title))
			fields = null;
		story.displayTiddler(target,title,null,true,null,fields,toggling);
	}
	clearMessage();
	return false;
}

// Create a button for a tag with a popup listing all the tiddlers that it tags
function createTagButton(place,tag,excludeTiddler,title,tooltip)
{
	var btn = createTiddlyButton(place,title||tag,(tooltip||config.views.wikified.tag.tooltip).format([tag]),onClickTag);
	btn.setAttribute("tag",tag);
	if(excludeTiddler)
		btn.setAttribute("tiddler",excludeTiddler);
	return btn;
}

// Event handler for clicking on a tiddler tag
function onClickTag(ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	var tag = this.getAttribute("tag");
	var title = this.getAttribute("tiddler");
	if(popup && tag) {
		var tagged = store.getTaggedTiddlers(tag);
		var titles = [];
		var li,r;
		for(r=0;r<tagged.length;r++) {
			if(tagged[r].title != title)
				titles.push(tagged[r].title);
		}
		var lingo = config.views.wikified.tag;
		if(titles.length > 0) {
			var openAll = createTiddlyButton(createTiddlyElement(popup,"li"),lingo.openAllText.format([tag]),lingo.openAllTooltip,onClickTagOpenAll);
			openAll.setAttribute("tag",tag);
			createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
			for(r=0; r<titles.length; r++) {
				createTiddlyLink(createTiddlyElement(popup,"li"),titles[r],true);
			}
		} else {
			createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),lingo.popupNone.format([tag]));
		}
		createTiddlyElement(createTiddlyElement(popup,"li",null,"listBreak"),"div");
		var h = createTiddlyLink(createTiddlyElement(popup,"li"),tag,false);
		createTiddlyText(h,lingo.openTag.format([tag]));
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

// Event handler for 'open all' on a tiddler popup
function onClickTagOpenAll(ev)
{
	var tiddlers = store.getTaggedTiddlers(this.getAttribute("tag"));
	story.displayTiddlers(this,tiddlers);
	return false;
}

function onClickError(ev)
{
	var e = ev || window.event;
	var popup = Popup.create(this);
	var lines = this.getAttribute("errorText").split("\n");
	for(var t=0; t<lines.length; t++)
		createTiddlyElement(popup,"li",null,null,lines[t]);
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
}

function createTiddlyDropDown(place,onchange,options,defaultValue)
{
	var sel = createTiddlyElement(place,"select");
	sel.onchange = onchange;
	for(var t=0; t<options.length; t++) {
		var e = createTiddlyElement(sel,"option",null,null,options[t].caption);
		e.value = options[t].name;
		if(options[t].name == defaultValue)
			e.selected = true;
	}
	return sel;
}

function createTiddlyPopup(place,caption,tooltip,tiddler)
{
	if(tiddler.text) {
		createTiddlyLink(place,caption,true);
		var btn = createTiddlyButton(place,glyph("downArrow"),tooltip,onClickTiddlyPopup,"tiddlerPopupButton");
		btn.tiddler = tiddler;
	} else {
		createTiddlyText(place,caption);
	}
}

function onClickTiddlyPopup(ev)
{
	var e = ev || window.event;
	var tiddler = this.tiddler;
	if(tiddler.text) {
		var popup = Popup.create(this,"div","popupTiddler");
		wikify(tiddler.text,popup,null,tiddler);
		Popup.show();
	}
	if(e) e.cancelBubble = true;
	if(e && e.stopPropagation) e.stopPropagation();
	return false;
}

function createTiddlyError(place,title,text)
{
	var btn = createTiddlyButton(place,title,null,onClickError,"errorButton");
	if(text) btn.setAttribute("errorText",text);
}

function merge(dst,src,preserveExisting)
{
	for(var i in src) {
		if(!preserveExisting || dst[i] === undefined)
			dst[i] = src[i];
	}
	return dst;
}

// Returns a string containing the description of an exception, optionally prepended by a message
function exceptionText(e,message)
{
	var s = e.description || e.toString();
	return message ? "%0:\n%1".format([message,s]) : s;
}

// Displays an alert of an exception description with optional message
function showException(e,message)
{
	alert(exceptionText(e,message));
}

function alertAndThrow(m)
{
	alert(m);
	throw(m);
}

function glyph(name)
{
	var g = config.glyphs;
	var b = g.currBrowser;
	if(b == null) {
		b = 0;
		while(!g.browsers[b]() && b < g.browsers.length-1)
			b++;
		g.currBrowser = b;
	}
	if(!g.codes[name])
		return "";
	return g.codes[name][b];
}

if(!window.console) {
	console = {tiddlywiki:true,log:function(message) {displayMessage(message);}};
}

//-
//- Animation engine
//-

function Animator()
{
	this.running = 0; // Incremented at start of each animation, decremented afterwards. If zero, the interval timer is disabled
	this.timerID = 0; // ID of the timer used for animating
	this.animations = []; // List of animations in progress
	return this;
}

// Start animation engine
Animator.prototype.startAnimating = function() //# Variable number of arguments
{
	for(var t=0; t<arguments.length; t++)
		this.animations.push(arguments[t]);
	if(this.running == 0) {
		var me = this;
		this.timerID = window.setInterval(function() {me.doAnimate(me);},10);
	}
	this.running += arguments.length;
};

// Perform an animation engine tick, calling each of the known animation modules
Animator.prototype.doAnimate = function(me)
{
	var a = 0;
	while(a < me.animations.length) {
		var animation = me.animations[a];
		if(animation.tick()) {
			a++;
		} else {
			me.animations.splice(a,1);
			if(--me.running == 0)
				window.clearInterval(me.timerID);
		}
	}
};

Animator.slowInSlowOut = function(progress)
{
	return(1-((Math.cos(progress * Math.PI)+1)/2));
};

//--
//-- Morpher animation
//--

// Animate a set of properties of an element
function Morpher(element,duration,properties,callback)
{
	this.element = element;
	this.duration = duration;
	this.properties = properties;
	this.startTime = new Date();
	this.endTime = Number(this.startTime) + duration;
	this.callback = callback;
	this.tick();
	return this;
}

Morpher.prototype.assignStyle = function(element,style,value)
{
	switch(style) {
	case "-tw-vertScroll":
		window.scrollTo(findScrollX(),value);
		break;
	case "-tw-horizScroll":
		window.scrollTo(value,findScrollY());
		break;
	default:
		element.style[style] = value;
		break;
	}
};

Morpher.prototype.stop = function()
{
	for(var t=0; t<this.properties.length; t++) {
		var p = this.properties[t];
		if(p.atEnd !== undefined) {
			this.assignStyle(this.element,p.style,p.atEnd);
		}
	}
	if(this.callback)
		this.callback(this.element,this.properties);
};

Morpher.prototype.tick = function()
{
	var currTime = Number(new Date());
	var progress = Animator.slowInSlowOut(Math.min(1,(currTime-this.startTime)/this.duration));
	for(var t=0; t<this.properties.length; t++) {
		var p = this.properties[t];
		if(p.start !== undefined && p.end !== undefined) {
			var template = p.template || "%0";
			switch(p.format) {
			case undefined:
			case "style":
				var v = p.start + (p.end-p.start) * progress;
				this.assignStyle(this.element,p.style,template.format([v]));
				break;
			case "color":
				break;
			}
		}
	}
	if(currTime >= this.endTime) {
		this.stop();
		return false;
	}
	return true;
};

//--
//-- Zoomer animation
//--

function Zoomer(text,startElement,targetElement,unused)
{
	var e = createTiddlyElement(document.body,"div",null,"zoomer");
	createTiddlyElement(e,"div",null,null,text);
	var winWidth = findWindowWidth();
	var winHeight = findWindowHeight();
	var p = [
		{style: 'left', start: findPosX(startElement), end: findPosX(targetElement), template: '%0px'},
		{style: 'top', start: findPosY(startElement), end: findPosY(targetElement), template: '%0px'},
		{style: 'width', start: Math.min(startElement.scrollWidth,winWidth), end: Math.min(targetElement.scrollWidth,winWidth), template: '%0px', atEnd: 'auto'},
		{style: 'height', start: Math.min(startElement.scrollHeight,winHeight), end: Math.min(targetElement.scrollHeight,winHeight), template: '%0px', atEnd: 'auto'},
		{style: 'fontSize', start: 8, end: 24, template: '%0pt'}
	];
	var c = function(element,properties) {removeNode(element);};
	return new Morpher(e,config.animDuration,p,c);
}

//--
//-- Scroller animation
//--

function Scroller(targetElement)
{
	var p = [{style: '-tw-vertScroll', start: findScrollY(), end: ensureVisible(targetElement)}];
	return new Morpher(targetElement,config.animDuration,p);
}

//--
//-- Slider animation
//--

// deleteMode - "none", "all" [delete target element and it's children], [only] "children" [but not the target element]
function Slider(element,opening,unused,deleteMode)
{
	element.style.overflow = 'hidden';
	if(opening)
		element.style.height = '0px'; // Resolves a Firefox flashing bug
	element.style.display = 'block';
	var left = findPosX(element);
	var width = element.scrollWidth;
	var height = element.scrollHeight;
	var winWidth = findWindowWidth();
	var p = [];
	var c = null;
	if(opening) {
		p.push({style: 'height', start: 0, end: height, template: '%0px', atEnd: 'auto'});
		p.push({style: 'opacity', start: 0, end: 1, template: '%0'});
		p.push({style: 'filter', start: 0, end: 100, template: 'alpha(opacity:%0)'});
	} else {
		p.push({style: 'height', start: height, end: 0, template: '%0px'});
		p.push({style: 'display', atEnd: 'none'});
		p.push({style: 'opacity', start: 1, end: 0, template: '%0'});
		p.push({style: 'filter', start: 100, end: 0, template: 'alpha(opacity:%0)'});
		switch(deleteMode) {
		case "all":
			c = function(element,properties) {removeNode(element);};
			break;
		case "children":
			c = function(element,properties) {removeChildren(element);};
			break;
		}
	}
	return new Morpher(element,config.animDuration,p,c);
}

//--
//-- Popup menu
//--

var Popup = {
	stack: [] // Array of objects with members root: and popup:
	};

Popup.create = function(root,elem,className)
{
	var stackPosition = this.find(root,"popup");
	Popup.remove(stackPosition+1);
	var popup = createTiddlyElement(document.body,elem || "ol","popup",className || "popup");
	popup.stackPosition = stackPosition;
	Popup.stack.push({root: root, popup: popup});
	return popup;
};

Popup.onDocumentClick = function(ev)
{
	var e = ev || window.event;
	if(e.eventPhase == undefined)
		Popup.remove();
	else if(e.eventPhase == Event.BUBBLING_PHASE || e.eventPhase == Event.AT_TARGET)
		Popup.remove();
	return true;
};

Popup.show = function(valign,halign,offset)
{
	var curr = Popup.stack[Popup.stack.length-1];
	this.place(curr.root,curr.popup,valign,halign,offset);
	addClass(curr.root,"highlight");
	if(config.options.chkAnimate && anim && typeof Scroller == "function")
		anim.startAnimating(new Scroller(curr.popup));
	else
		window.scrollTo(0,ensureVisible(curr.popup));
};

Popup.place = function(root,popup,valign,halign,offset)
{
	if(!offset)
		var offset = {x:0,y:0};
	if(popup.stackPosition >= 0 && !valign && !halign) {
		offset.x = offset.x + root.offsetWidth;
	} else {
		offset.x = (halign == 'right') ? offset.x + root.offsetWidth : offset.x;
		offset.y = (valign == 'top') ? offset.y : offset.y + root.offsetHeight;
	}
	var rootLeft = findPosX(root);
	var rootTop = findPosY(root);
	var popupLeft = rootLeft + offset.x;
	var popupTop = rootTop + offset.y;
	var winWidth = findWindowWidth();
	if(popup.offsetWidth > winWidth*0.75)
		popup.style.width = winWidth*0.75 + "px";
	var popupWidth = popup.offsetWidth;
	var scrollWidth = winWidth - document.body.offsetWidth;
	if(popupLeft + popupWidth > winWidth - scrollWidth - 1) {
		if(halign == 'right')
			popupLeft = popupLeft - root.offsetWidth - popupWidth;
		else
			popupLeft = winWidth - popupWidth - scrollWidth - 1;
	}
	popup.style.left = popupLeft + "px";
	popup.style.top = popupTop + "px";
	popup.style.display = "block";
};

Popup.find = function(e)
{
	var pos = -1;
	for (var t=this.stack.length-1; t>=0; t--) {
		if(isDescendant(e,this.stack[t].popup))
			pos = t;
	}
	return pos;
};

Popup.remove = function(pos)
{
	if(!pos) var pos = 0;
	if(Popup.stack.length > pos) {
		Popup.removeFrom(pos);
	}
};

Popup.removeFrom = function(from)
{
	for(var t=Popup.stack.length-1; t>=from; t--) {
		var p = Popup.stack[t];
		removeClass(p.root,"highlight");
		removeNode(p.popup);
	}
	Popup.stack = Popup.stack.slice(0,from);
};

//--
//-- Wizard support
//--

function Wizard(elem)
{
	if(elem) {
		this.formElem = findRelated(elem,"wizard","className");
		this.bodyElem = findRelated(this.formElem.firstChild,"wizardBody","className","nextSibling");
		this.footElem = findRelated(this.formElem.firstChild,"wizardFooter","className","nextSibling");
	} else {
		this.formElem = null;
		this.bodyElem = null;
		this.footElem = null;
	}
}

Wizard.prototype.setValue = function(name,value)
{
	if(this.formElem)
		this.formElem[name] = value;
};

Wizard.prototype.getValue = function(name)
{
	return this.formElem ? this.formElem[name] : null;
};

Wizard.prototype.createWizard = function(place,title)
{
	this.formElem = createTiddlyElement(place,"form",null,"wizard");
	createTiddlyElement(this.formElem,"h1",null,null,title);
	this.bodyElem = createTiddlyElement(this.formElem,"div",null,"wizardBody");
	this.footElem = createTiddlyElement(this.formElem,"div",null,"wizardFooter");
};

Wizard.prototype.clear = function()
{
	removeChildren(this.bodyElem);
};

Wizard.prototype.setButtons = function(buttonInfo,status)
{
	removeChildren(this.footElem);
	for(var t=0; t<buttonInfo.length; t++) {
		createTiddlyButton(this.footElem,buttonInfo[t].caption,buttonInfo[t].tooltip,buttonInfo[t].onClick);
		insertSpacer(this.footElem);
		}
	if(typeof status == "string") {
		createTiddlyElement(this.footElem,"span",null,"status",status);
	}
};

Wizard.prototype.addStep = function(stepTitle,html)
{
	removeChildren(this.bodyElem);
	var w = createTiddlyElement(this.bodyElem,"div");
	createTiddlyElement(w,"h2",null,null,stepTitle);
	var step = createTiddlyElement(w,"div",null,"wizardStep");
	step.innerHTML = html;
	applyHtmlMacros(step,tiddler);
};

Wizard.prototype.getElement = function(name)
{
	return this.formElem.elements[name];
};

//--
//-- ListView gadget
//--

var ListView = {};

// Create a listview
ListView.create = function(place,listObject,listTemplate,callback,className)
{
	var table = createTiddlyElement(place,"table",null,className || "listView twtable");
	var thead = createTiddlyElement(table,"thead");
	var r = createTiddlyElement(thead,"tr");
	for(var t=0; t<listTemplate.columns.length; t++) {
		var columnTemplate = listTemplate.columns[t];
		var c = createTiddlyElement(r,"th");
		var colType = ListView.columnTypes[columnTemplate.type];
		if(colType && colType.createHeader) {
			colType.createHeader(c,columnTemplate,t);
			if(columnTemplate.className)
				addClass(c,columnTemplate.className);
		}
	}
	var tbody = createTiddlyElement(table,"tbody");
	for(var rc=0; rc<listObject.length; rc++) {
		var rowObject = listObject[rc];
		r = createTiddlyElement(tbody,"tr");
		for(c=0; c<listTemplate.rowClasses.length; c++) {
			if(rowObject[listTemplate.rowClasses[c].field])
				addClass(r,listTemplate.rowClasses[c].className);
		}
		rowObject.rowElement = r;
		rowObject.colElements = {};
		for(var cc=0; cc<listTemplate.columns.length; cc++) {
			c = createTiddlyElement(r,"td");
			columnTemplate = listTemplate.columns[cc];
			var field = columnTemplate.field;
			colType = ListView.columnTypes[columnTemplate.type];
			if(colType && colType.createItem) {
				colType.createItem(c,rowObject,field,columnTemplate,cc,rc);
				if(columnTemplate.className)
					addClass(c,columnTemplate.className);
			}
			rowObject.colElements[field] = c;
		}
	}
	if(callback && listTemplate.actions)
		createTiddlyDropDown(place,ListView.getCommandHandler(callback),listTemplate.actions);
	if(callback && listTemplate.buttons) {
		for(t=0; t<listTemplate.buttons.length; t++) {
			var a = listTemplate.buttons[t];
			if(a && a.name != "")
				createTiddlyButton(place,a.caption,null,ListView.getCommandHandler(callback,a.name,a.allowEmptySelection));
		}
	}
	return table;
};

ListView.getCommandHandler = function(callback,name,allowEmptySelection)
{
	return function(e) {
		var view = findRelated(this,"TABLE",null,"previousSibling");
		var tiddlers = [];
		ListView.forEachSelector(view,function(e,rowName) {
					if(e.checked)
						tiddlers.push(rowName);
					});
		if(tiddlers.length == 0 && !allowEmptySelection) {
			alert(config.messages.nothingSelected);
		} else {
			if(this.nodeName.toLowerCase() == "select") {
				callback(view,this.value,tiddlers);
				this.selectedIndex = 0;
			} else {
				callback(view,name,tiddlers);
			}
		}
	};
};

// Invoke a callback for each selector checkbox in the listview
ListView.forEachSelector = function(view,callback)
{
	var checkboxes = view.getElementsByTagName("input");
	var hadOne = false;
	for(var t=0; t<checkboxes.length; t++) {
		var cb = checkboxes[t];
		if(cb.getAttribute("type") == "checkbox") {
			var rn = cb.getAttribute("rowName");
			if(rn) {
				callback(cb,rn);
				hadOne = true;
			}
		}
	}
	return hadOne;
};

ListView.getSelectedRows = function(view)
{
	var rowNames = [];
	ListView.forEachSelector(view,function(e,rowName) {
				if(e.checked)
					rowNames.push(rowName);
				});
	return rowNames;
};

ListView.columnTypes = {};

ListView.columnTypes.String = {
	createHeader: function(place,columnTemplate,col)
		{
			createTiddlyText(place,columnTemplate.title);
		},
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined)
				createTiddlyText(place,v);
		}
};

ListView.columnTypes.WikiText = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined)
				wikify(v,place,null,null);
		}
};

ListView.columnTypes.Tiddler = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined && v.title)
				createTiddlyPopup(place,v.title,config.messages.listView.tiddlerTooltip,v);
		}
};

ListView.columnTypes.Size = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined) {
				var t = 0;
				while(t<config.messages.sizeTemplates.length-1 && v<config.messages.sizeTemplates[t].unit)
					t++;
				createTiddlyText(place,config.messages.sizeTemplates[t].template.format([Math.round(v/config.messages.sizeTemplates[t].unit)]));
			}
		}
};

ListView.columnTypes.Link = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			var c = columnTemplate.text;
			if(v != undefined)
				createTiddlyText(createExternalLink(place,v),c || v);
		}
};

ListView.columnTypes.Date = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined)
				createTiddlyText(place,v.formatString(columnTemplate.dateFormat));
		}
};

ListView.columnTypes.StringList = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined) {
				for(var t=0; t<v.length; t++) {
					createTiddlyText(place,v[t]);
					createTiddlyElement(place,"br");
				}
			}
		}
};

ListView.columnTypes.Selector = {
	createHeader: function(place,columnTemplate,col)
		{
			createTiddlyCheckbox(place,null,false,this.onHeaderChange);
		},
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var e = createTiddlyCheckbox(place,null,listObject[field],null);
			e.setAttribute("rowName",listObject[columnTemplate.rowName]);
		},
	onHeaderChange: function(e)
		{
			var state = this.checked;
			var view = findRelated(this,"TABLE");
			if(!view)
				return;
			ListView.forEachSelector(view,function(e,rowName) {
								e.checked = state;
							});
		}
};

ListView.columnTypes.Tags = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var tags = listObject[field];
			createTiddlyText(place,String.encodeTiddlyLinkList(tags));
		}
};

ListView.columnTypes.Boolean = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			if(listObject[field] == true)
				createTiddlyText(place,columnTemplate.trueText);
			if(listObject[field] == false)
				createTiddlyText(place,columnTemplate.falseText);
		}
};

ListView.columnTypes.TagCheckbox = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var e = createTiddlyCheckbox(place,null,listObject[field],this.onChange);
			e.setAttribute("tiddler",listObject.title);
			e.setAttribute("tag",columnTemplate.tag);
		},
	onChange : function(e)
		{
			var tag = this.getAttribute("tag");
			var tiddler = this.getAttribute("tiddler");
			store.setTiddlerTag(tiddler,this.checked,tag);
		}
};

ListView.columnTypes.TiddlerLink = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var v = listObject[field];
			if(v != undefined) {
				var link = createTiddlyLink(place,listObject[columnTemplate.tiddlerLink],false,null);
				createTiddlyText(link,listObject[field]);
			}
		}
};

//--
//-- Augmented methods for the JavaScript Number(), Array(), String() and Date() objects
//--

// Clamp a number to a range
Number.prototype.clamp = function(min,max)
{
	var c = this;
	if(c < min)
		c = min;
	if(c > max)
		c = max;
	return c;
};

// Add indexOf function if browser does not support it
if(!Array.indexOf) {
Array.prototype.indexOf = function(item,from)
{
	if(!from)
		from = 0;
	for(var i=from; i<this.length; i++) {
		if(this[i] === item)
			return i;
	}
	return -1;
};}

// Find an entry in a given field of the members of an array
Array.prototype.findByField = function(field,value)
{
	for(var t=0; t<this.length; t++) {
		if(this[t][field] == value)
			return t;
	}
	return null;
};

// Return whether an entry exists in an array
Array.prototype.contains = function(item)
{
	return this.indexOf(item) != -1;
};

// Adds, removes or toggles a particular value within an array
//  value - value to add
//  mode - +1 to add value, -1 to remove value, 0 to toggle it
Array.prototype.setItem = function(value,mode)
{
	var p = this.indexOf(value);
	if(mode == 0)
		mode = (p == -1) ? +1 : -1;
	if(mode == +1) {
		if(p == -1)
			this.push(value);
	} else if(mode == -1) {
		if(p != -1)
			this.splice(p,1);
	}
};

// Return whether one of a list of values exists in an array
Array.prototype.containsAny = function(items)
{
	for(var i=0; i<items.length; i++) {
		if(this.indexOf(items[i]) != -1)
			return true;
	}
	return false;
};

// Return whether all of a list of values exists in an array
Array.prototype.containsAll = function(items)
{
	for(var i = 0; i<items.length; i++) {
		if(this.indexOf(items[i]) == -1)
			return false;
	}
	return true;
};

// Push a new value into an array only if it is not already present in the array. If the optional unique parameter is false, it reverts to a normal push
Array.prototype.pushUnique = function(item,unique)
{
	if(unique === false) {
		this.push(item);
	} else {
		if(this.indexOf(item) == -1)
			this.push(item);
	}
};

Array.prototype.remove = function(item)
{
	var p = this.indexOf(item);
	if(p != -1)
		this.splice(p,1);
};

if(!Array.prototype.map) {
Array.prototype.map = function(fn,thisObj)
{
	var scope = thisObj || window;
	var a = [];
	for(var i=0, j=this.length; i < j; ++i) {
		a.push(fn.call(scope,this[i],i,this));
	}
	return a;
};}

// Get characters from the right end of a string
String.prototype.right = function(n)
{
	return n < this.length ? this.slice(this.length-n) : this;
};

// Trim whitespace from both ends of a string
String.prototype.trim = function()
{
	return this.replace(/^\s*|\s*$/g,"");
};

// Convert a string from a CSS style property name to a JavaScript style name ("background-color" -> "backgroundColor")
String.prototype.unDash = function()
{
	var s = this.split("-");
	if(s.length > 1) {
		for(var t=1; t<s.length; t++)
			s[t] = s[t].substr(0,1).toUpperCase() + s[t].substr(1);
	}
	return s.join("");
};

// Substitute substrings from an array into a format string that includes '%1'-type specifiers
String.prototype.format = function(substrings)
{
	var subRegExp = /(?:%(\d+))/mg;
	var currPos = 0;
	var r = [];
	do {
		var match = subRegExp.exec(this);
		if(match && match[1]) {
			if(match.index > currPos)
				r.push(this.substring(currPos,match.index));
			r.push(substrings[parseInt(match[1])]);
			currPos = subRegExp.lastIndex;
		}
	} while(match);
	if(currPos < this.length)
		r.push(this.substring(currPos,this.length));
	return r.join("");
};

// Escape any special RegExp characters with that character preceded by a backslash
String.prototype.escapeRegExp = function()
{
	var s = "\\^$*+?()=!|,{}[].";
	var c = this;
	for(var t=0; t<s.length; t++)
		c = c.replace(new RegExp("\\" + s.substr(t,1),"g"),"\\" + s.substr(t,1));
	return c;
};

// Convert "\" to "\s", newlines to "\n" (and remove carriage returns)
String.prototype.escapeLineBreaks = function()
{
	return this.replace(/\\/mg,"\\s").replace(/\n/mg,"\\n").replace(/\r/mg,"");
};

// Convert "\n" to newlines, "\b" to " ", "\s" to "\" (and remove carriage returns)
String.prototype.unescapeLineBreaks = function()
{
	return this.replace(/\\n/mg,"\n").replace(/\\b/mg," ").replace(/\\s/mg,"\\").replace(/\r/mg,"");
};

// Convert & to "&amp;", < to "&lt;", > to "&gt;" and " to "&quot;"
String.prototype.htmlEncode = function()
{
	return this.replace(/&/mg,"&amp;").replace(/</mg,"&lt;").replace(/>/mg,"&gt;").replace(/\"/mg,"&quot;");
};

// Convert "&amp;" to &, "&lt;" to <, "&gt;" to > and "&quot;" to "
String.prototype.htmlDecode = function()
{
	return this.replace(/&lt;/mg,"<").replace(/&gt;/mg,">").replace(/&quot;/mg,"\"").replace(/&amp;/mg,"&");
};

// Convert a string to it's JSON representation by encoding control characters, double quotes and backslash. See json.org
String.prototype.toJSONString = function()
{
	var m = {
		'\b': '\\b',
		'\f': '\\f',
		'\n': '\\n',
		'\r': '\\r',
		'\t': '\\t',
		'"' : '\\"',
		'\\': '\\\\'
		};
	var replaceFn = function(a,b) {
		var c = m[b];
		if(c)
			return c;
		c = b.charCodeAt();
		return '\\u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
		};
	if(/["\\\x00-\x1f]/.test(this))
		return '"' + this.replace(/([\x00-\x1f\\"])/g,replaceFn) + '"';
	return '"' + this + '"';
};

// Parse a space-separated string of name:value parameters
// The result is an array of objects:
//   result[0] = object with a member for each parameter name, value of that member being an array of values
//   result[1..n] = one object for each parameter, with 'name' and 'value' members
String.prototype.parseParams = function(defaultName,defaultValue,allowEval,noNames,cascadeDefaults)
{
	var parseToken = function(match,p) {
		var n;
		if(match[p]) // Double quoted
			n = match[p];
		else if(match[p+1]) // Single quoted
			n = match[p+1];
		else if(match[p+2]) // Double-square-bracket quoted
			n = match[p+2];
		else if(match[p+3]) // Double-brace quoted
			try {
				n = match[p+3];
				if(allowEval)
					n = window.eval(n);
			} catch(ex) {
				throw "Unable to evaluate {{" + match[p+3] + "}}: " + exceptionText(ex);
			}
		else if(match[p+4]) // Unquoted
			n = match[p+4];
		else if(match[p+5]) // empty quote
			n = "";
		return n;
	};
	var r = [{}];
	var dblQuote = "(?:\"((?:(?:\\\\\")|[^\"])+)\")";
	var sngQuote = "(?:'((?:(?:\\\\\')|[^'])+)')";
	var dblSquare = "(?:\\[\\[((?:\\s|\\S)*?)\\]\\])";
	var dblBrace = "(?:\\{\\{((?:\\s|\\S)*?)\\}\\})";
	var unQuoted = noNames ? "([^\"'\\s]\\S*)" : "([^\"':\\s][^\\s:]*)";
	var emptyQuote = "((?:\"\")|(?:''))";
	var skipSpace = "(?:\\s*)";
	var token = "(?:" + dblQuote + "|" + sngQuote + "|" + dblSquare + "|" + dblBrace + "|" + unQuoted + "|" + emptyQuote + ")";
	var re = noNames ? new RegExp(token,"mg") : new RegExp(skipSpace + token + skipSpace + "(?:(\\:)" + skipSpace + token + ")?","mg");
	var params = [];
	do {
		var match = re.exec(this);
		if(match) {
			var n = parseToken(match,1);
			if(noNames) {
				r.push({name:"",value:n});
			} else {
				var v = parseToken(match,8);
				if(v == null && defaultName) {
					v = n;
					n = defaultName;
				} else if(v == null && defaultValue) {
					v = defaultValue;
				}
				r.push({name:n,value:v});
				if(cascadeDefaults) {
					defaultName = n;
					defaultValue = v;
				}
			}
		}
	} while(match);
	// Summarise parameters into first element
	for(var t=1; t<r.length; t++) {
		if(r[0][r[t].name])
			r[0][r[t].name].push(r[t].value);
		else
			r[0][r[t].name] = [r[t].value];
	}
	return r;
};

// Process a string list of macro parameters into an array. Parameters can be quoted with "", '',
// [[]], {{ }} or left unquoted (and therefore space-separated). Double-braces {{}} results in
// an *evaluated* parameter: e.g. {{config.options.txtUserName}} results in the current user's name.
String.prototype.readMacroParams = function()
{
	var p = this.parseParams("list",null,true,true);
	var n = [];
	for(var t=1; t<p.length; t++)
		n.push(p[t].value);
	return n;
};

// Process a string list of unique tiddler names into an array. Tiddler names that have spaces in them must be [[bracketed]]
String.prototype.readBracketedList = function(unique)
{
	var p = this.parseParams("list",null,false,true);
	var n = [];
	for(var t=1; t<p.length; t++) {
		if(p[t].value)
			n.pushUnique(p[t].value,unique);
	}
	return n;
};

// Returns array with start and end index of chunk between given start and end marker, or undefined.
String.prototype.getChunkRange = function(start,end)
{
	var s = this.indexOf(start);
	if(s != -1) {
		s += start.length;
		var e = this.indexOf(end,s);
		if(e != -1)
			return [s,e];
	}
};

// Replace a chunk of a string given start and end markers
String.prototype.replaceChunk = function(start,end,sub)
{
	var r = this.getChunkRange(start,end);
	return r ? this.substring(0,r[0]) + sub + this.substring(r[1]) : this;
};

// Returns a chunk of a string between start and end markers, or undefined
String.prototype.getChunk = function(start,end)
{
	var r = this.getChunkRange(start,end);
	if(r)
		return this.substring(r[0],r[1]);
};


// Static method to bracket a string with double square brackets if it contains a space
String.encodeTiddlyLink = function(title)
{
	return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
};

// Static method to encodeTiddlyLink for every item in an array and join them with spaces
String.encodeTiddlyLinkList = function(list)
{
	if(list) {
		var results = [];
		for(var t=0; t<list.length; t++)
			results.push(String.encodeTiddlyLink(list[t]));
		return results.join(" ");
	} else {
		return "";
	}
};

// Convert a string as a sequence of name:"value" pairs into a hashmap
String.prototype.decodeHashMap = function()
{
	var fields = this.parseParams("anon","",false);
	var r = {};
	for(var t=1; t<fields.length; t++)
		r[fields[t].name] = fields[t].value;
	return r;
};

// Static method to encode a hashmap into a name:"value"... string
String.encodeHashMap = function(hashmap)
{
	var r = [];
	for(var t in hashmap)
		r.push(t + ':"' + hashmap[t] + '"');
	return r.join(" ");
};

// Static method to left-pad a string with 0s to a certain width
String.zeroPad = function(n,d)
{
	var s = n.toString();
	if(s.length < d)
		s = "000000000000000000000000000".substr(0,d-s.length) + s;
	return s;
};

String.prototype.startsWith = function(prefix)
{
	return !prefix || this.substring(0,prefix.length) == prefix;
};

// Returns the first value of the given named parameter.
function getParam(params,name,defaultValue)
{
	if(!params)
		return defaultValue;
	var p = params[0][name];
	return p ? p[0] : defaultValue;
}

// Returns the first value of the given boolean named parameter.
function getFlag(params,name,defaultValue)
{
	return !!getParam(params,name,defaultValue);
}

// Substitute date components into a string
Date.prototype.formatString = function(template)
{
	var t = template.replace(/0hh12/g,String.zeroPad(this.getHours12(),2));
	t = t.replace(/hh12/g,this.getHours12());
	t = t.replace(/0hh/g,String.zeroPad(this.getHours(),2));
	t = t.replace(/hh/g,this.getHours());
	t = t.replace(/mmm/g,config.messages.dates.shortMonths[this.getMonth()]);
	t = t.replace(/0mm/g,String.zeroPad(this.getMinutes(),2));
	t = t.replace(/mm/g,this.getMinutes());
	t = t.replace(/0ss/g,String.zeroPad(this.getSeconds(),2));
	t = t.replace(/ss/g,this.getSeconds());
	t = t.replace(/[ap]m/g,this.getAmPm().toLowerCase());
	t = t.replace(/[AP]M/g,this.getAmPm().toUpperCase());
	t = t.replace(/wYYYY/g,this.getYearForWeekNo());
	t = t.replace(/wYY/g,String.zeroPad(this.getYearForWeekNo()-2000,2));
	t = t.replace(/YYYY/g,this.getFullYear());
	t = t.replace(/YY/g,String.zeroPad(this.getFullYear()-2000,2));
	t = t.replace(/MMM/g,config.messages.dates.months[this.getMonth()]);
	t = t.replace(/0MM/g,String.zeroPad(this.getMonth()+1,2));
	t = t.replace(/MM/g,this.getMonth()+1);
	t = t.replace(/0WW/g,String.zeroPad(this.getWeek(),2));
	t = t.replace(/WW/g,this.getWeek());
	t = t.replace(/DDD/g,config.messages.dates.days[this.getDay()]);
	t = t.replace(/ddd/g,config.messages.dates.shortDays[this.getDay()]);
	t = t.replace(/0DD/g,String.zeroPad(this.getDate(),2));
	t = t.replace(/DDth/g,this.getDate()+this.daySuffix());
	t = t.replace(/DD/g,this.getDate());
	var tz = this.getTimezoneOffset();
	var atz = Math.abs(tz);
	t = t.replace(/TZD/g,(tz < 0 ? '+' : '-') + String.zeroPad(Math.floor(atz / 60),2) + ':' + String.zeroPad(atz % 60,2));
	t = t.replace(/\\/g,"");
	return t;
};

Date.prototype.getWeek = function()
{
	var dt = new Date(this.getTime());
	var d = dt.getDay();
	if(d==0) d=7;// JavaScript Sun=0, ISO Sun=7
	dt.setTime(dt.getTime()+(4-d)*86400000);// shift day to Thurs of same week to calculate weekNo
	var n = Math.floor((dt.getTime()-new Date(dt.getFullYear(),0,1)+3600000)/86400000);
	return Math.floor(n/7)+1;
};

Date.prototype.getYearForWeekNo = function()
{
	var dt = new Date(this.getTime());
	var d = dt.getDay();
	if(d==0) d=7;// JavaScript Sun=0, ISO Sun=7
	dt.setTime(dt.getTime()+(4-d)*86400000);// shift day to Thurs of same week
	return dt.getFullYear();
};

Date.prototype.getHours12 = function()
{
	var h = this.getHours();
	return h > 12 ? h-12 : ( h > 0 ? h : 12 );
};

Date.prototype.getAmPm = function()
{
	return this.getHours() >= 12 ? config.messages.dates.pm : config.messages.dates.am;
};

Date.prototype.daySuffix = function()
{
	return config.messages.dates.daySuffixes[this.getDate()-1];
};

// Convert a date to local YYYYMMDDHHMM string format
Date.prototype.convertToLocalYYYYMMDDHHMM = function()
{
	return this.getFullYear() + String.zeroPad(this.getMonth()+1,2) + String.zeroPad(this.getDate(),2) + String.zeroPad(this.getHours(),2) + String.zeroPad(this.getMinutes(),2);
};

// Convert a date to UTC YYYYMMDDHHMM string format
Date.prototype.convertToYYYYMMDDHHMM = function()
{
	return this.getUTCFullYear() + String.zeroPad(this.getUTCMonth()+1,2) + String.zeroPad(this.getUTCDate(),2) + String.zeroPad(this.getUTCHours(),2) + String.zeroPad(this.getUTCMinutes(),2);
};

// Convert a date to UTC YYYYMMDD.HHMMSSMMM string format
Date.prototype.convertToYYYYMMDDHHMMSSMMM = function()
{
	return this.getUTCFullYear() + String.zeroPad(this.getUTCMonth()+1,2) + String.zeroPad(this.getUTCDate(),2) + "." + String.zeroPad(this.getUTCHours(),2) + String.zeroPad(this.getUTCMinutes(),2) + String.zeroPad(this.getUTCSeconds(),2) + String.zeroPad(this.getUTCMilliseconds(),4);
};

// Static method to create a date from a UTC YYYYMMDDHHMM format string
Date.convertFromYYYYMMDDHHMM = function(d)
{
	var hh = d.substr(8,2) || "00";
	var mm = d.substr(10,2) || "00";
	return new Date(Date.UTC(parseInt(d.substr(0,4),10),
			parseInt(d.substr(4,2),10)-1,
			parseInt(d.substr(6,2),10),
			parseInt(hh,10),
			parseInt(mm,10),0,0));
};

//--
//-- Crypto functions and associated conversion routines
//--

// Crypto 'namespace'
function Crypto() {}

// Convert a string to an array of big-endian 32-bit words
Crypto.strToBe32s = function(str)
{
	var be=[];
	var len=Math.floor(str.length/4);
	var i, j;
	for(i=0, j=0; i<len; i++, j+=4) {
		be[i]=((str.charCodeAt(j)&0xff) << 24)|((str.charCodeAt(j+1)&0xff) << 16)|((str.charCodeAt(j+2)&0xff) << 8)|(str.charCodeAt(j+3)&0xff);
	}
	while(j<str.length) {
		be[j>>2] |= (str.charCodeAt(j)&0xff)<<(24-(j*8)%32);
		j++;
	}
	return be;
};

// Convert an array of big-endian 32-bit words to a string
Crypto.be32sToStr = function(be)
{
	var str='';
	for(var i=0;i<be.length*32;i+=8) {
		str += String.fromCharCode((be[i>>5]>>>(24-i%32)) & 0xff);
	}
	return str;
};

// Convert an array of big-endian 32-bit words to a hex string
Crypto.be32sToHex = function(be)
{
	var hex='0123456789ABCDEF';
	var str='';
	for(var i=0;i<be.length*4;i++) {
		str += hex.charAt((be[i>>2]>>((3-i%4)*8+4))&0xF) + hex.charAt((be[i>>2]>>((3-i%4)*8))&0xF);
	}
	return str;
};

// Return, in hex, the SHA-1 hash of a string
Crypto.hexSha1Str = function(str)
{
	return Crypto.be32sToHex(Crypto.sha1Str(str));
};

// Return the SHA-1 hash of a string
Crypto.sha1Str = function(str)
{
	return Crypto.sha1(Crypto.strToBe32s(str),str.length);
};

// Calculate the SHA-1 hash of an array of blen bytes of big-endian 32-bit words
Crypto.sha1 = function(x,blen)
{
	// Add 32-bit integers, wrapping at 32 bits
	function add32(a,b)
	{
		var lsw=(a&0xFFFF)+(b&0xFFFF);
		var msw=(a>>16)+(b>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	}
	function AA(a,b,c,d,e)
	{
		b=(b>>>27)|(b<<5);
		var lsw=(a&0xFFFF)+(b&0xFFFF)+(c&0xFFFF)+(d&0xFFFF)+(e&0xFFFF);
		var msw=(a>>16)+(b>>16)+(c>>16)+(d>>16)+(e>>16)+(lsw>>16);
		return (msw<<16)|(lsw&0xFFFF);
	}
	function RR(w,j)
	{
		var n=w[j-3]^w[j-8]^w[j-14]^w[j-16];
		return (n>>>31)|(n<<1);
	}

	var len=blen*8;
	x[len>>5] |= 0x80 << (24-len%32);
	x[((len+64>>9)<<4)+15]=len;
	var w=new Array(80);

	var k1=0x5A827999;
	var k2=0x6ED9EBA1;
	var k3=0x8F1BBCDC;
	var k4=0xCA62C1D6;

	var h0=0x67452301;
	var h1=0xEFCDAB89;
	var h2=0x98BADCFE;
	var h3=0x10325476;
	var h4=0xC3D2E1F0;

	for(var i=0;i<x.length;i+=16) {
		var j=0;
		var t;
		var a=h0;
		var b=h1;
		var c=h2;
		var d=h3;
		var e=h4;
		while(j<16) {
			w[j]=x[i+j];
			t=AA(e,a,d^(b&(c^d)),w[j],k1);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a=t; j++;
		}
		while(j<20) {
			w[j]=RR(w,j);
			t=AA(e,a,d^(b&(c^d)),w[j],k1);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a=t; j++;
		}
		while(j<40) {
			w[j]=RR(w,j);
			t=AA(e,a,b^c^d,w[j],k2);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a=t; j++;
		}
		while(j<60) {
			w[j]=RR(w,j);
			t=AA(e,a,(b&c)|(d&(b|c)),w[j],k3);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a=t; j++;
		}
		while(j<80) {
			w[j]=RR(w,j);
			t=AA(e,a,b^c^d,w[j],k4);
			e=d; d=c; c=(b>>>2)|(b<<30); b=a; a=t; j++;
		}
		h0=add32(h0,a);
		h1=add32(h1,b);
		h2=add32(h2,c);
		h3=add32(h3,d);
		h4=add32(h4,e);
	}
	return [h0,h1,h2,h3,h4];
};

//--
//-- RGB colour object
//--

// Construct an RGB colour object from a '#rrggbb', '#rgb' or 'rgb(n,n,n)' string or from separate r,g,b values
function RGB(r,g,b)
{
	this.r = 0;
	this.g = 0;
	this.b = 0;
	if(typeof r == "string") {
		if(r.substr(0,1) == "#") {
			if(r.length == 7) {
				this.r = parseInt(r.substr(1,2),16)/255;
				this.g = parseInt(r.substr(3,2),16)/255;
				this.b = parseInt(r.substr(5,2),16)/255;
			} else {
				this.r = parseInt(r.substr(1,1),16)/15;
				this.g = parseInt(r.substr(2,1),16)/15;
				this.b = parseInt(r.substr(3,1),16)/15;
			}
		} else {
			var rgbPattern = /rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/;
			var c = r.match(rgbPattern);
			if(c) {
				this.r = parseInt(c[1],10)/255;
				this.g = parseInt(c[2],10)/255;
				this.b = parseInt(c[3],10)/255;
			}
		}
	} else {
		this.r = r;
		this.g = g;
		this.b = b;
	}
	return this;
}

// Mixes this colour with another in a specified proportion
// c = other colour to mix
// f = 0..1 where 0 is this colour and 1 is the new colour
// Returns an RGB object
RGB.prototype.mix = function(c,f)
{
	return new RGB(this.r + (c.r-this.r) * f,this.g + (c.g-this.g) * f,this.b + (c.b-this.b) * f);
};

// Return an rgb colour as a #rrggbb format hex string
RGB.prototype.toString = function()
{
	return "#" + ("0" + Math.floor(this.r.clamp(0,1) * 255).toString(16)).right(2) +
				 ("0" + Math.floor(this.g.clamp(0,1) * 255).toString(16)).right(2) +
				 ("0" + Math.floor(this.b.clamp(0,1) * 255).toString(16)).right(2);
};

//--
//-- DOM utilities - many derived from www.quirksmode.org
//--

function drawGradient(place,horiz,locolors,hicolors)
{
	if(!hicolors)
		hicolors = locolors;
	for(var t=0; t<= 100; t+=2) {
		var bar = document.createElement("div");
		place.appendChild(bar);
		bar.style.position = "absolute";
		bar.style.left = horiz ? t + "%" : 0;
		bar.style.top = horiz ? 0 : t + "%";
		bar.style.width = horiz ? (101-t) + "%" : "100%";
		bar.style.height = horiz ? "100%" : (101-t) + "%";
		bar.style.zIndex = -1;
		var p = t/100*(locolors.length-1);
		var hc = hicolors[Math.floor(p)];
		if(typeof hc == "string")
			hc = new RGB(hc);
		var lc = locolors[Math.ceil(p)];
		if(typeof lc == "string")
			lc = new RGB(lc);
		bar.style.backgroundColor = hc.mix(lc,p-Math.floor(p)).toString();
	}
}

function createTiddlyText(parent,text)
{
	return parent.appendChild(document.createTextNode(text));
}

function createTiddlyCheckbox(parent,caption,checked,onChange)
{
	var cb = document.createElement("input");
	cb.setAttribute("type","checkbox");
	cb.onclick = onChange;
	parent.appendChild(cb);
	cb.checked = checked;
	cb.className = "chkOptionInput";
	if(caption)
		wikify(caption,parent);
	return cb;
}

function createTiddlyElement(parent,element,id,className,text,attribs)
{
	var e = document.createElement(element);
	if(className != null)
		e.className = className;
	if(id != null)
		e.setAttribute("id",id);
	if(text != null)
		e.appendChild(document.createTextNode(text));
	if(attribs) {
		for(var n in attribs) {
			e.setAttribute(n,attribs[n]);
		}
	}
	if(parent != null)
		parent.appendChild(e);
	return e;
}

function addEvent(obj,type,fn)
{
	if(obj.attachEvent) {
		obj['e'+type+fn] = fn;
		obj[type+fn] = function(){obj['e'+type+fn](window.event);};
		obj.attachEvent('on'+type,obj[type+fn]);
	} else {
		obj.addEventListener(type,fn,false);
	}
}

function removeEvent(obj,type,fn)
{
	if(obj.detachEvent) {
		obj.detachEvent('on'+type,obj[type+fn]);
		obj[type+fn] = null;
	} else {
		obj.removeEventListener(type,fn,false);
	}
}

function addClass(e,className)
{
	var currClass = e.className.split(" ");
	if(currClass.indexOf(className) == -1)
		e.className += " " + className;
}

function removeClass(e,className)
{
	var currClass = e.className.split(" ");
	var i = currClass.indexOf(className);
	while(i != -1) {
		currClass.splice(i,1);
		i = currClass.indexOf(className);
	}
	e.className = currClass.join(" ");
}

function hasClass(e,className)
{
	if(e.className && e.className.split(" ").indexOf(className) != -1) {
		return true;
	}
	return false;
}

// Find the closest relative with a given property value (property defaults to tagName, relative defaults to parentNode)
function findRelated(e,value,name,relative)
{
	name = name || "tagName";
	relative = relative || "parentNode";
	if(name == "className") {
		while(e && !hasClass(e,value)) {
			e = e[relative];
		}
	} else {
		while(e && e[name] != value) {
			e = e[relative];
		}
	}
	return e;
}

// Resolve the target object of an event
function resolveTarget(e)
{
	var obj;
	if(e.target)
		obj = e.target;
	else if(e.srcElement)
		obj = e.srcElement;
	if(obj.nodeType == 3) // defeat Safari bug
		obj = obj.parentNode;
	return obj;
}

// Prevent an event from bubbling
function stopEvent(e)
{
	var ev = e || window.event;
	ev.cancelBubble = true;
	if(ev.stopPropagation) ev.stopPropagation();
	return false;
}

// Return the content of an element as plain text with no formatting
function getPlainText(e)
{
	var text = "";
	if(e.innerText)
		text = e.innerText;
	else if(e.textContent)
		text = e.textContent;
	return text;
}

// Get the scroll position for window.scrollTo necessary to scroll a given element into view
function ensureVisible(e)
{
	var posTop = findPosY(e);
	var posBot = posTop + e.offsetHeight;
	var winTop = findScrollY();
	var winHeight = findWindowHeight();
	var winBot = winTop + winHeight;
	if(posTop < winTop) {
		return posTop;
	} else if(posBot > winBot) {
		if(e.offsetHeight < winHeight)
			return posTop - (winHeight - e.offsetHeight);
		else
			return posTop;
	} else {
		return winTop;
	}
}

// Get the current width of the display window
function findWindowWidth()
{
	return window.innerWidth || document.documentElement.clientWidth;
}

// Get the current height of the display window
function findWindowHeight()
{
	return window.innerHeight || document.documentElement.clientHeight;
}

// Get the current horizontal page scroll position
function findScrollX()
{
	return window.scrollX || document.documentElement.scrollLeft;
}

// Get the current vertical page scroll position
function findScrollY()
{
	return window.scrollY || document.documentElement.scrollTop;
}

function findPosX(obj)
{
	var curleft = 0;
	while(obj.offsetParent) {
		curleft += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	return curleft;
}

function findPosY(obj)
{
	var curtop = 0;
	while(obj.offsetParent) {
		curtop += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return curtop;
}

// Blur a particular element
function blurElement(e)
{
	if(e && e.focus && e.blur) {
		e.focus();
		e.blur();
	}
}

// Create a non-breaking space
function insertSpacer(place)
{
	var e = document.createTextNode(String.fromCharCode(160));
	if(place)
		place.appendChild(e);
	return e;
}

// Remove all children of a node
function removeChildren(e)
{
	while(e && e.hasChildNodes())
		removeNode(e.firstChild);
}

// Remove a node and all it's children
function removeNode(e)
{
	scrubNode(e);
	e.parentNode.removeChild(e);
}

// Remove any event handlers or non-primitve custom attributes
function scrubNode(e)
{
	if(!config.browser.isIE)
		return;
	var att = e.attributes;
	if(att) {
		for(var t=0; t<att.length; t++) {
			var n = att[t].name;
			if(n !== 'style' && (typeof e[n] === 'function' || (typeof e[n] === 'object' && e[n] != null))) {
				try {
					e[n] = null;
				} catch(ex) {
				}
			}
		}
	}
	var c = e.firstChild;
	while(c) {
		scrubNode(c);
		c = c.nextSibling;
	}
}

// Add a stylesheet, replacing any previous custom stylesheet
function setStylesheet(s,id,doc)
{
	if(!id)
		id = "customStyleSheet";
	if(!doc)
		doc = document;
	var n = doc.getElementById(id);
	if(doc.createStyleSheet) {
		// Test for IE's non-standard createStyleSheet method
		if(n)
			n.parentNode.removeChild(n);
		// This failed without the &nbsp;
		doc.getElementsByTagName("head")[0].insertAdjacentHTML("beforeEnd","&nbsp;<style id='" + id + "'>" + s + "</style>");
	} else {
		if(n) {
			n.replaceChild(doc.createTextNode(s),n.firstChild);
		} else {
			n = doc.createElement("style");
			n.type = "text/css";
			n.id = id;
			n.appendChild(doc.createTextNode(s));
			doc.getElementsByTagName("head")[0].appendChild(n);
		}
	}
}

function removeStyleSheet(id)
{
	var e = document.getElementById(id);
	if(e)
		e.parentNode.removeChild(e);
}

// Force the browser to do a document reflow when needed to workaround browser bugs
function forceReflow()
{
	if(config.browser.isGecko) {
		setStylesheet("body {top:0px;margin-top:0px;}","forceReflow");
		setTimeout(function() {setStylesheet("","forceReflow");},1);
	}
}

// Replace the current selection of a textarea or text input and scroll it into view
function replaceSelection(e,text)
{
	if(e.setSelectionRange) {
		var oldpos = e.selectionStart;
		var isRange = e.selectionEnd > e.selectionStart;
		e.value = e.value.substr(0,e.selectionStart) + text + e.value.substr(e.selectionEnd);
		e.setSelectionRange(isRange ? oldpos : oldpos + text.length,oldpos + text.length);
		var linecount = e.value.split('\n').length;
		var thisline = e.value.substr(0,e.selectionStart).split('\n').length-1;
		e.scrollTop = Math.floor((thisline - e.rows / 2) * e.scrollHeight / linecount);
	} else if(document.selection) {
		var range = document.selection.createRange();
		if(range.parentElement() == e) {
			var isCollapsed = range.text == "";
			range.text = text;
			if(!isCollapsed) {
				range.moveStart('character', -text.length);
				range.select();
			}
		}
	}
}

// Returns the text of the given (text) node, possibly merging subsequent text nodes
function getNodeText(e)
{
	var t = "";
	while(e && e.nodeName == "#text") {
		t += e.nodeValue;
		e = e.nextSibling;
	}
	return t;
}

// Returns true if the element e has a given ancestor element
function isDescendant(e,ancestor)
{
	while(e) {
		if(e === ancestor)
			return true;
		e = e.parentNode;
	}
	return false;
}

//--
//-- LoaderBase and SaverBase
//--

function LoaderBase() {}

LoaderBase.prototype.loadTiddler = function(store,node,tiddlers)
{
	var title = this.getTitle(store,node);
	if(safeMode && store.isShadowTiddler(title))
		return;
	if(title) {
		var tiddler = store.createTiddler(title);
		this.internalizeTiddler(store,tiddler,title,node);
		tiddlers.push(tiddler);
	}
};

LoaderBase.prototype.loadTiddlers = function(store,nodes)
{
	var tiddlers = [];
	for(var t = 0; t < nodes.length; t++) {
		try {
			this.loadTiddler(store,nodes[t],tiddlers);
		} catch(ex) {
			showException(ex,config.messages.tiddlerLoadError.format([this.getTitle(store,nodes[t])]));
		}
	}
	return tiddlers;
};

function SaverBase() {}

SaverBase.prototype.externalize = function(store)
{
	var results = [];
	var tiddlers = store.getTiddlers("title");
	for(var t = 0; t < tiddlers.length; t++) {
		if(!tiddlers[t].doNotSave())
			results.push(this.externalizeTiddler(store, tiddlers[t]));
	}
	return results.join("\n");
};

//--
//-- TW21Loader (inherits from LoaderBase)
//--

function TW21Loader() {}

TW21Loader.prototype = new LoaderBase();

TW21Loader.prototype.getTitle = function(store,node)
{
	var title = null;
	if(node.getAttribute) {
		title = node.getAttribute("title");
		if(!title)
			title = node.getAttribute("tiddler");
	}
	if(!title && node.id) {
		var lenPrefix = store.idPrefix.length;
		if(node.id.substr(0,lenPrefix) == store.idPrefix)
			title = node.id.substr(lenPrefix);
	}
	return title;
};

TW21Loader.prototype.internalizeTiddler = function(store,tiddler,title,node)
{
	var e = node.firstChild;
	var text = null;
	if(node.getAttribute("tiddler")) {
		text = getNodeText(e).unescapeLineBreaks();
	} else {
		while(e.nodeName!="PRE" && e.nodeName!="pre") {
			e = e.nextSibling;
		}
		text = e.innerHTML.replace(/\r/mg,"").htmlDecode();
	}
	var modifier = node.getAttribute("modifier");
	var c = node.getAttribute("created");
	var m = node.getAttribute("modified");
	var created = c ? Date.convertFromYYYYMMDDHHMM(c) : version.date;
	var modified = m ? Date.convertFromYYYYMMDDHHMM(m) : created;
	var tags = node.getAttribute("tags");
	var fields = {};
	var attrs = node.attributes;
	for(var i = attrs.length-1; i >= 0; i--) {
		var name = attrs[i].name;
		if(attrs[i].specified && !TiddlyWiki.isStandardField(name)) {
			fields[name] = attrs[i].value.unescapeLineBreaks();
		}
	}
	tiddler.assign(title,text,modifier,modified,tags,created,fields);
	return tiddler;
};

//--
//-- TW21Saver (inherits from SaverBase)
//--

function TW21Saver() {}

TW21Saver.prototype = new SaverBase();

TW21Saver.prototype.externalizeTiddler = function(store,tiddler)
{
	try {
		var extendedAttributes = "";
		var usePre = config.options.chkUsePreForStorage;
		store.forEachField(tiddler,
			function(tiddler,fieldName,value) {
				// don't store stuff from the temp namespace
				if(typeof value != "string")
					value = "";
				if(!fieldName.match(/^temp\./))
					extendedAttributes += ' %0="%1"'.format([fieldName,value.escapeLineBreaks().htmlEncode()]);
			},true);
		var created = tiddler.created;
		var modified = tiddler.modified;
		var attributes = tiddler.modifier ? ' modifier="' + tiddler.modifier.htmlEncode() + '"' : "";
		attributes += (usePre && created == version.date) ? "" :' created="' + created.convertToYYYYMMDDHHMM() + '"';
		attributes += (usePre && modified == created) ? "" : ' modified="' + modified.convertToYYYYMMDDHHMM() +'"';
		var tags = tiddler.getTags();
		if(!usePre || tags)
			attributes += ' tags="' + tags.htmlEncode() + '"';
		return ('<div %0="%1"%2%3>%4</'+'div>').format([
				usePre ? "title" : "tiddler",
				tiddler.title.htmlEncode(),
				attributes,
				extendedAttributes,
				usePre ? "\n<pre>" + tiddler.text.htmlEncode() + "</pre>\n" : tiddler.text.escapeLineBreaks().htmlEncode()
			]);
	} catch (ex) {
		throw exceptionText(ex,config.messages.tiddlerSaveError.format([tiddler.title]));
	}
};

//]]>
</script>
<script id="jsdeprecatedArea" type="text/javascript">
//<![CDATA[
//--
//-- Deprecated Tiddler code
//--

// @Deprecated: Use tiddlerToRssItem(tiddler,uri) instead
Tiddler.prototype.toRssItem = function(uri)
{
	return tiddlerToRssItem(this,uri);
};

// @Deprecated: Use "<item>\n" + tiddlerToRssItem(tiddler,uri)  + "\n</item>" instead
Tiddler.prototype.saveToRss = function(uri)
{
	return "<item>\n" + tiddlerToRssItem(this,uri) + "\n</item>";
};

//]]>
</script>
<script id="jqueryArea" type="text/javascript">
//<![CDATA[
//]]>
</script>
<script type="text/javascript">
//<![CDATA[
if(useJavaSaver)
	document.write("<applet style='position:absolute;left:-1px' name='TiddlySaver' code='TiddlySaver.class' archive='TiddlySaver.jar' width='1' height='1'></applet>");
//]]>
</script>
<!--POST-SCRIPT-START-->
<?php
	if( isset( $tiddlers['MarkupPostBody'] ) )
	{
		print tiddler_bodyDecode($tiddlers['MarkupPostBody']['body']);
	}
?>
<!--POST-SCRIPT-END-->

</body>
</html>
