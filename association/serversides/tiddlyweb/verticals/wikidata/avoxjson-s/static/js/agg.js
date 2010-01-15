/*
 * jQuery JavaScript Library v1.3.2
 * http://jquery.com/
 *
 * Copyright (c) 2009 John Resig
 * Dual licensed under the MIT and GPL licenses.
 * http://docs.jquery.com/License
 *
 * Date: 2009-02-19 17:34:21 -0500 (Thu, 19 Feb 2009)
 * Revision: 6246
 */
(function(){var l=this,g,y=l.jQuery,p=l.$,o=l.jQuery=l.$=function(E,F){return new o.fn.init(E,F)},D=/^[^<]*(<(.|\s)+>)[^>]*$|^#([\w-]+)$/,f=/^.[^:#\[\.,]*$/;o.fn=o.prototype={init:function(E,H){E=E||document;if(E.nodeType){this[0]=E;this.length=1;this.context=E;return this}if(typeof E==="string"){var G=D.exec(E);if(G&&(G[1]||!H)){if(G[1]){E=o.clean([G[1]],H)}else{var I=document.getElementById(G[3]);if(I&&I.id!=G[3]){return o().find(E)}var F=o(I||[]);F.context=document;F.selector=E;return F}}else{return o(H).find(E)}}else{if(o.isFunction(E)){return o(document).ready(E)}}if(E.selector&&E.context){this.selector=E.selector;this.context=E.context}return this.setArray(o.isArray(E)?E:o.makeArray(E))},selector:"",jquery:"1.3.2",size:function(){return this.length},get:function(E){return E===g?Array.prototype.slice.call(this):this[E]},pushStack:function(F,H,E){var G=o(F);G.prevObject=this;G.context=this.context;if(H==="find"){G.selector=this.selector+(this.selector?" ":"")+E}else{if(H){G.selector=this.selector+"."+H+"("+E+")"}}return G},setArray:function(E){this.length=0;Array.prototype.push.apply(this,E);return this},each:function(F,E){return o.each(this,F,E)},index:function(E){return o.inArray(E&&E.jquery?E[0]:E,this)},attr:function(F,H,G){var E=F;if(typeof F==="string"){if(H===g){return this[0]&&o[G||"attr"](this[0],F)}else{E={};E[F]=H}}return this.each(function(I){for(F in E){o.attr(G?this.style:this,F,o.prop(this,E[F],G,I,F))}})},css:function(E,F){if((E=="width"||E=="height")&&parseFloat(F)<0){F=g}return this.attr(E,F,"curCSS")},text:function(F){if(typeof F!=="object"&&F!=null){return this.empty().append((this[0]&&this[0].ownerDocument||document).createTextNode(F))}var E="";o.each(F||this,function(){o.each(this.childNodes,function(){if(this.nodeType!=8){E+=this.nodeType!=1?this.nodeValue:o.fn.text([this])}})});return E},wrapAll:function(E){if(this[0]){var F=o(E,this[0].ownerDocument).clone();if(this[0].parentNode){F.insertBefore(this[0])}F.map(function(){var G=this;while(G.firstChild){G=G.firstChild}return G}).append(this)}return this},wrapInner:function(E){return this.each(function(){o(this).contents().wrapAll(E)})},wrap:function(E){return this.each(function(){o(this).wrapAll(E)})},append:function(){return this.domManip(arguments,true,function(E){if(this.nodeType==1){this.appendChild(E)}})},prepend:function(){return this.domManip(arguments,true,function(E){if(this.nodeType==1){this.insertBefore(E,this.firstChild)}})},before:function(){return this.domManip(arguments,false,function(E){this.parentNode.insertBefore(E,this)})},after:function(){return this.domManip(arguments,false,function(E){this.parentNode.insertBefore(E,this.nextSibling)})},end:function(){return this.prevObject||o([])},push:[].push,sort:[].sort,splice:[].splice,find:function(E){if(this.length===1){var F=this.pushStack([],"find",E);F.length=0;o.find(E,this[0],F);return F}else{return this.pushStack(o.unique(o.map(this,function(G){return o.find(E,G)})),"find",E)}},clone:function(G){var E=this.map(function(){if(!o.support.noCloneEvent&&!o.isXMLDoc(this)){var I=this.outerHTML;if(!I){var J=this.ownerDocument.createElement("div");J.appendChild(this.cloneNode(true));I=J.innerHTML}return o.clean([I.replace(/ jQuery\d+="(?:\d+|null)"/g,"").replace(/^\s*/,"")])[0]}else{return this.cloneNode(true)}});if(G===true){var H=this.find("*").andSelf(),F=0;E.find("*").andSelf().each(function(){if(this.nodeName!==H[F].nodeName){return}var I=o.data(H[F],"events");for(var K in I){for(var J in I[K]){o.event.add(this,K,I[K][J],I[K][J].data)}}F++})}return E},filter:function(E){return this.pushStack(o.isFunction(E)&&o.grep(this,function(G,F){return E.call(G,F)})||o.multiFilter(E,o.grep(this,function(F){return F.nodeType===1})),"filter",E)},closest:function(E){var G=o.expr.match.POS.test(E)?o(E):null,F=0;return this.map(function(){var H=this;while(H&&H.ownerDocument){if(G?G.index(H)>-1:o(H).is(E)){o.data(H,"closest",F);return H}H=H.parentNode;F++}})},not:function(E){if(typeof E==="string"){if(f.test(E)){return this.pushStack(o.multiFilter(E,this,true),"not",E)}else{E=o.multiFilter(E,this)}}var F=E.length&&E[E.length-1]!==g&&!E.nodeType;return this.filter(function(){return F?o.inArray(this,E)<0:this!=E})},add:function(E){return this.pushStack(o.unique(o.merge(this.get(),typeof E==="string"?o(E):o.makeArray(E))))},is:function(E){return !!E&&o.multiFilter(E,this).length>0},hasClass:function(E){return !!E&&this.is("."+E)},val:function(K){if(K===g){var E=this[0];if(E){if(o.nodeName(E,"option")){return(E.attributes.value||{}).specified?E.value:E.text}if(o.nodeName(E,"select")){var I=E.selectedIndex,L=[],M=E.options,H=E.type=="select-one";if(I<0){return null}for(var F=H?I:0,J=H?I+1:M.length;F<J;F++){var G=M[F];if(G.selected){K=o(G).val();if(H){return K}L.push(K)}}return L}return(E.value||"").replace(/\r/g,"")}return g}if(typeof K==="number"){K+=""}return this.each(function(){if(this.nodeType!=1){return}if(o.isArray(K)&&/radio|checkbox/.test(this.type)){this.checked=(o.inArray(this.value,K)>=0||o.inArray(this.name,K)>=0)}else{if(o.nodeName(this,"select")){var N=o.makeArray(K);o("option",this).each(function(){this.selected=(o.inArray(this.value,N)>=0||o.inArray(this.text,N)>=0)});if(!N.length){this.selectedIndex=-1}}else{this.value=K}}})},html:function(E){return E===g?(this[0]?this[0].innerHTML.replace(/ jQuery\d+="(?:\d+|null)"/g,""):null):this.empty().append(E)},replaceWith:function(E){return this.after(E).remove()},eq:function(E){return this.slice(E,+E+1)},slice:function(){return this.pushStack(Array.prototype.slice.apply(this,arguments),"slice",Array.prototype.slice.call(arguments).join(","))},map:function(E){return this.pushStack(o.map(this,function(G,F){return E.call(G,F,G)}))},andSelf:function(){return this.add(this.prevObject)},domManip:function(J,M,L){if(this[0]){var I=(this[0].ownerDocument||this[0]).createDocumentFragment(),F=o.clean(J,(this[0].ownerDocument||this[0]),I),H=I.firstChild;if(H){for(var G=0,E=this.length;G<E;G++){L.call(K(this[G],H),this.length>1||G>0?I.cloneNode(true):I)}}if(F){o.each(F,z)}}return this;function K(N,O){return M&&o.nodeName(N,"table")&&o.nodeName(O,"tr")?(N.getElementsByTagName("tbody")[0]||N.appendChild(N.ownerDocument.createElement("tbody"))):N}}};o.fn.init.prototype=o.fn;function z(E,F){if(F.src){o.ajax({url:F.src,async:false,dataType:"script"})}else{o.globalEval(F.text||F.textContent||F.innerHTML||"")}if(F.parentNode){F.parentNode.removeChild(F)}}function e(){return +new Date}o.extend=o.fn.extend=function(){var J=arguments[0]||{},H=1,I=arguments.length,E=false,G;if(typeof J==="boolean"){E=J;J=arguments[1]||{};H=2}if(typeof J!=="object"&&!o.isFunction(J)){J={}}if(I==H){J=this;--H}for(;H<I;H++){if((G=arguments[H])!=null){for(var F in G){var K=J[F],L=G[F];if(J===L){continue}if(E&&L&&typeof L==="object"&&!L.nodeType){J[F]=o.extend(E,K||(L.length!=null?[]:{}),L)}else{if(L!==g){J[F]=L}}}}}return J};var b=/z-?index|font-?weight|opacity|zoom|line-?height/i,q=document.defaultView||{},s=Object.prototype.toString;o.extend({noConflict:function(E){l.$=p;if(E){l.jQuery=y}return o},isFunction:function(E){return s.call(E)==="[object Function]"},isArray:function(E){return s.call(E)==="[object Array]"},isXMLDoc:function(E){return E.nodeType===9&&E.documentElement.nodeName!=="HTML"||!!E.ownerDocument&&o.isXMLDoc(E.ownerDocument)},globalEval:function(G){if(G&&/\S/.test(G)){var F=document.getElementsByTagName("head")[0]||document.documentElement,E=document.createElement("script");E.type="text/javascript";if(o.support.scriptEval){E.appendChild(document.createTextNode(G))}else{E.text=G}F.insertBefore(E,F.firstChild);F.removeChild(E)}},nodeName:function(F,E){return F.nodeName&&F.nodeName.toUpperCase()==E.toUpperCase()},each:function(G,K,F){var E,H=0,I=G.length;if(F){if(I===g){for(E in G){if(K.apply(G[E],F)===false){break}}}else{for(;H<I;){if(K.apply(G[H++],F)===false){break}}}}else{if(I===g){for(E in G){if(K.call(G[E],E,G[E])===false){break}}}else{for(var J=G[0];H<I&&K.call(J,H,J)!==false;J=G[++H]){}}}return G},prop:function(H,I,G,F,E){if(o.isFunction(I)){I=I.call(H,F)}return typeof I==="number"&&G=="curCSS"&&!b.test(E)?I+"px":I},className:{add:function(E,F){o.each((F||"").split(/\s+/),function(G,H){if(E.nodeType==1&&!o.className.has(E.className,H)){E.className+=(E.className?" ":"")+H}})},remove:function(E,F){if(E.nodeType==1){E.className=F!==g?o.grep(E.className.split(/\s+/),function(G){return !o.className.has(F,G)}).join(" "):""}},has:function(F,E){return F&&o.inArray(E,(F.className||F).toString().split(/\s+/))>-1}},swap:function(H,G,I){var E={};for(var F in G){E[F]=H.style[F];H.style[F]=G[F]}I.call(H);for(var F in G){H.style[F]=E[F]}},css:function(H,F,J,E){if(F=="width"||F=="height"){var L,G={position:"absolute",visibility:"hidden",display:"block"},K=F=="width"?["Left","Right"]:["Top","Bottom"];function I(){L=F=="width"?H.offsetWidth:H.offsetHeight;if(E==="border"){return}o.each(K,function(){if(!E){L-=parseFloat(o.curCSS(H,"padding"+this,true))||0}if(E==="margin"){L+=parseFloat(o.curCSS(H,"margin"+this,true))||0}else{L-=parseFloat(o.curCSS(H,"border"+this+"Width",true))||0}})}if(H.offsetWidth!==0){I()}else{o.swap(H,G,I)}return Math.max(0,Math.round(L))}return o.curCSS(H,F,J)},curCSS:function(I,F,G){var L,E=I.style;if(F=="opacity"&&!o.support.opacity){L=o.attr(E,"opacity");return L==""?"1":L}if(F.match(/float/i)){F=w}if(!G&&E&&E[F]){L=E[F]}else{if(q.getComputedStyle){if(F.match(/float/i)){F="float"}F=F.replace(/([A-Z])/g,"-$1").toLowerCase();var M=q.getComputedStyle(I,null);if(M){L=M.getPropertyValue(F)}if(F=="opacity"&&L==""){L="1"}}else{if(I.currentStyle){var J=F.replace(/\-(\w)/g,function(N,O){return O.toUpperCase()});L=I.currentStyle[F]||I.currentStyle[J];if(!/^\d+(px)?$/i.test(L)&&/^\d/.test(L)){var H=E.left,K=I.runtimeStyle.left;I.runtimeStyle.left=I.currentStyle.left;E.left=L||0;L=E.pixelLeft+"px";E.left=H;I.runtimeStyle.left=K}}}}return L},clean:function(F,K,I){K=K||document;if(typeof K.createElement==="undefined"){K=K.ownerDocument||K[0]&&K[0].ownerDocument||document}if(!I&&F.length===1&&typeof F[0]==="string"){var H=/^<(\w+)\s*\/?>$/.exec(F[0]);if(H){return[K.createElement(H[1])]}}var G=[],E=[],L=K.createElement("div");o.each(F,function(P,S){if(typeof S==="number"){S+=""}if(!S){return}if(typeof S==="string"){S=S.replace(/(<(\w+)[^>]*?)\/>/g,function(U,V,T){return T.match(/^(abbr|br|col|img|input|link|meta|param|hr|area|embed)$/i)?U:V+"></"+T+">"});var O=S.replace(/^\s+/,"").substring(0,10).toLowerCase();var Q=!O.indexOf("<opt")&&[1,"<select multiple='multiple'>","</select>"]||!O.indexOf("<leg")&&[1,"<fieldset>","</fieldset>"]||O.match(/^<(thead|tbody|tfoot|colg|cap)/)&&[1,"<table>","</table>"]||!O.indexOf("<tr")&&[2,"<table><tbody>","</tbody></table>"]||(!O.indexOf("<td")||!O.indexOf("<th"))&&[3,"<table><tbody><tr>","</tr></tbody></table>"]||!O.indexOf("<col")&&[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"]||!o.support.htmlSerialize&&[1,"div<div>","</div>"]||[0,"",""];L.innerHTML=Q[1]+S+Q[2];while(Q[0]--){L=L.lastChild}if(!o.support.tbody){var R=/<tbody/i.test(S),N=!O.indexOf("<table")&&!R?L.firstChild&&L.firstChild.childNodes:Q[1]=="<table>"&&!R?L.childNodes:[];for(var M=N.length-1;M>=0;--M){if(o.nodeName(N[M],"tbody")&&!N[M].childNodes.length){N[M].parentNode.removeChild(N[M])}}}if(!o.support.leadingWhitespace&&/^\s/.test(S)){L.insertBefore(K.createTextNode(S.match(/^\s*/)[0]),L.firstChild)}S=o.makeArray(L.childNodes)}if(S.nodeType){G.push(S)}else{G=o.merge(G,S)}});if(I){for(var J=0;G[J];J++){if(o.nodeName(G[J],"script")&&(!G[J].type||G[J].type.toLowerCase()==="text/javascript")){E.push(G[J].parentNode?G[J].parentNode.removeChild(G[J]):G[J])}else{if(G[J].nodeType===1){G.splice.apply(G,[J+1,0].concat(o.makeArray(G[J].getElementsByTagName("script"))))}I.appendChild(G[J])}}return E}return G},attr:function(J,G,K){if(!J||J.nodeType==3||J.nodeType==8){return g}var H=!o.isXMLDoc(J),L=K!==g;G=H&&o.props[G]||G;if(J.tagName){var F=/href|src|style/.test(G);if(G=="selected"&&J.parentNode){J.parentNode.selectedIndex}if(G in J&&H&&!F){if(L){if(G=="type"&&o.nodeName(J,"input")&&J.parentNode){throw"type property can't be changed"}J[G]=K}if(o.nodeName(J,"form")&&J.getAttributeNode(G)){return J.getAttributeNode(G).nodeValue}if(G=="tabIndex"){var I=J.getAttributeNode("tabIndex");return I&&I.specified?I.value:J.nodeName.match(/(button|input|object|select|textarea)/i)?0:J.nodeName.match(/^(a|area)$/i)&&J.href?0:g}return J[G]}if(!o.support.style&&H&&G=="style"){return o.attr(J.style,"cssText",K)}if(L){J.setAttribute(G,""+K)}var E=!o.support.hrefNormalized&&H&&F?J.getAttribute(G,2):J.getAttribute(G);return E===null?g:E}if(!o.support.opacity&&G=="opacity"){if(L){J.zoom=1;J.filter=(J.filter||"").replace(/alpha\([^)]*\)/,"")+(parseInt(K)+""=="NaN"?"":"alpha(opacity="+K*100+")")}return J.filter&&J.filter.indexOf("opacity=")>=0?(parseFloat(J.filter.match(/opacity=([^)]*)/)[1])/100)+"":""}G=G.replace(/-([a-z])/ig,function(M,N){return N.toUpperCase()});if(L){J[G]=K}return J[G]},trim:function(E){return(E||"").replace(/^\s+|\s+$/g,"")},makeArray:function(G){var E=[];if(G!=null){var F=G.length;if(F==null||typeof G==="string"||o.isFunction(G)||G.setInterval){E[0]=G}else{while(F){E[--F]=G[F]}}}return E},inArray:function(G,H){for(var E=0,F=H.length;E<F;E++){if(H[E]===G){return E}}return -1},merge:function(H,E){var F=0,G,I=H.length;if(!o.support.getAll){while((G=E[F++])!=null){if(G.nodeType!=8){H[I++]=G}}}else{while((G=E[F++])!=null){H[I++]=G}}return H},unique:function(K){var F=[],E={};try{for(var G=0,H=K.length;G<H;G++){var J=o.data(K[G]);if(!E[J]){E[J]=true;F.push(K[G])}}}catch(I){F=K}return F},grep:function(F,J,E){var G=[];for(var H=0,I=F.length;H<I;H++){if(!E!=!J(F[H],H)){G.push(F[H])}}return G},map:function(E,J){var F=[];for(var G=0,H=E.length;G<H;G++){var I=J(E[G],G);if(I!=null){F[F.length]=I}}return F.concat.apply([],F)}});var C=navigator.userAgent.toLowerCase();o.browser={version:(C.match(/.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/)||[0,"0"])[1],safari:/webkit/.test(C),opera:/opera/.test(C),msie:/msie/.test(C)&&!/opera/.test(C),mozilla:/mozilla/.test(C)&&!/(compatible|webkit)/.test(C)};o.each({parent:function(E){return E.parentNode},parents:function(E){return o.dir(E,"parentNode")},next:function(E){return o.nth(E,2,"nextSibling")},prev:function(E){return o.nth(E,2,"previousSibling")},nextAll:function(E){return o.dir(E,"nextSibling")},prevAll:function(E){return o.dir(E,"previousSibling")},siblings:function(E){return o.sibling(E.parentNode.firstChild,E)},children:function(E){return o.sibling(E.firstChild)},contents:function(E){return o.nodeName(E,"iframe")?E.contentDocument||E.contentWindow.document:o.makeArray(E.childNodes)}},function(E,F){o.fn[E]=function(G){var H=o.map(this,F);if(G&&typeof G=="string"){H=o.multiFilter(G,H)}return this.pushStack(o.unique(H),E,G)}});o.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(E,F){o.fn[E]=function(G){var J=[],L=o(G);for(var K=0,H=L.length;K<H;K++){var I=(K>0?this.clone(true):this).get();o.fn[F].apply(o(L[K]),I);J=J.concat(I)}return this.pushStack(J,E,G)}});o.each({removeAttr:function(E){o.attr(this,E,"");if(this.nodeType==1){this.removeAttribute(E)}},addClass:function(E){o.className.add(this,E)},removeClass:function(E){o.className.remove(this,E)},toggleClass:function(F,E){if(typeof E!=="boolean"){E=!o.className.has(this,F)}o.className[E?"add":"remove"](this,F)},remove:function(E){if(!E||o.filter(E,[this]).length){o("*",this).add([this]).each(function(){o.event.remove(this);o.removeData(this)});if(this.parentNode){this.parentNode.removeChild(this)}}},empty:function(){o(this).children().remove();while(this.firstChild){this.removeChild(this.firstChild)}}},function(E,F){o.fn[E]=function(){return this.each(F,arguments)}});function j(E,F){return E[0]&&parseInt(o.curCSS(E[0],F,true),10)||0}var h="jQuery"+e(),v=0,A={};o.extend({cache:{},data:function(F,E,G){F=F==l?A:F;var H=F[h];if(!H){H=F[h]=++v}if(E&&!o.cache[H]){o.cache[H]={}}if(G!==g){o.cache[H][E]=G}return E?o.cache[H][E]:H},removeData:function(F,E){F=F==l?A:F;var H=F[h];if(E){if(o.cache[H]){delete o.cache[H][E];E="";for(E in o.cache[H]){break}if(!E){o.removeData(F)}}}else{try{delete F[h]}catch(G){if(F.removeAttribute){F.removeAttribute(h)}}delete o.cache[H]}},queue:function(F,E,H){if(F){E=(E||"fx")+"queue";var G=o.data(F,E);if(!G||o.isArray(H)){G=o.data(F,E,o.makeArray(H))}else{if(H){G.push(H)}}}return G},dequeue:function(H,G){var E=o.queue(H,G),F=E.shift();if(!G||G==="fx"){F=E[0]}if(F!==g){F.call(H)}}});o.fn.extend({data:function(E,G){var H=E.split(".");H[1]=H[1]?"."+H[1]:"";if(G===g){var F=this.triggerHandler("getData"+H[1]+"!",[H[0]]);if(F===g&&this.length){F=o.data(this[0],E)}return F===g&&H[1]?this.data(H[0]):F}else{return this.trigger("setData"+H[1]+"!",[H[0],G]).each(function(){o.data(this,E,G)})}},removeData:function(E){return this.each(function(){o.removeData(this,E)})},queue:function(E,F){if(typeof E!=="string"){F=E;E="fx"}if(F===g){return o.queue(this[0],E)}return this.each(function(){var G=o.queue(this,E,F);if(E=="fx"&&G.length==1){G[0].call(this)}})},dequeue:function(E){return this.each(function(){o.dequeue(this,E)})}});
/*
 * Sizzle CSS Selector Engine - v0.9.3
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){var R=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?/g,L=0,H=Object.prototype.toString;var F=function(Y,U,ab,ac){ab=ab||[];U=U||document;if(U.nodeType!==1&&U.nodeType!==9){return[]}if(!Y||typeof Y!=="string"){return ab}var Z=[],W,af,ai,T,ad,V,X=true;R.lastIndex=0;while((W=R.exec(Y))!==null){Z.push(W[1]);if(W[2]){V=RegExp.rightContext;break}}if(Z.length>1&&M.exec(Y)){if(Z.length===2&&I.relative[Z[0]]){af=J(Z[0]+Z[1],U)}else{af=I.relative[Z[0]]?[U]:F(Z.shift(),U);while(Z.length){Y=Z.shift();if(I.relative[Y]){Y+=Z.shift()}af=J(Y,af)}}}else{var ae=ac?{expr:Z.pop(),set:E(ac)}:F.find(Z.pop(),Z.length===1&&U.parentNode?U.parentNode:U,Q(U));af=F.filter(ae.expr,ae.set);if(Z.length>0){ai=E(af)}else{X=false}while(Z.length){var ah=Z.pop(),ag=ah;if(!I.relative[ah]){ah=""}else{ag=Z.pop()}if(ag==null){ag=U}I.relative[ah](ai,ag,Q(U))}}if(!ai){ai=af}if(!ai){throw"Syntax error, unrecognized expression: "+(ah||Y)}if(H.call(ai)==="[object Array]"){if(!X){ab.push.apply(ab,ai)}else{if(U.nodeType===1){for(var aa=0;ai[aa]!=null;aa++){if(ai[aa]&&(ai[aa]===true||ai[aa].nodeType===1&&K(U,ai[aa]))){ab.push(af[aa])}}}else{for(var aa=0;ai[aa]!=null;aa++){if(ai[aa]&&ai[aa].nodeType===1){ab.push(af[aa])}}}}}else{E(ai,ab)}if(V){F(V,U,ab,ac);if(G){hasDuplicate=false;ab.sort(G);if(hasDuplicate){for(var aa=1;aa<ab.length;aa++){if(ab[aa]===ab[aa-1]){ab.splice(aa--,1)}}}}}return ab};F.matches=function(T,U){return F(T,null,null,U)};F.find=function(aa,T,ab){var Z,X;if(!aa){return[]}for(var W=0,V=I.order.length;W<V;W++){var Y=I.order[W],X;if((X=I.match[Y].exec(aa))){var U=RegExp.leftContext;if(U.substr(U.length-1)!=="\\"){X[1]=(X[1]||"").replace(/\\/g,"");Z=I.find[Y](X,T,ab);if(Z!=null){aa=aa.replace(I.match[Y],"");break}}}}if(!Z){Z=T.getElementsByTagName("*")}return{set:Z,expr:aa}};F.filter=function(ad,ac,ag,W){var V=ad,ai=[],aa=ac,Y,T,Z=ac&&ac[0]&&Q(ac[0]);while(ad&&ac.length){for(var ab in I.filter){if((Y=I.match[ab].exec(ad))!=null){var U=I.filter[ab],ah,af;T=false;if(aa==ai){ai=[]}if(I.preFilter[ab]){Y=I.preFilter[ab](Y,aa,ag,ai,W,Z);if(!Y){T=ah=true}else{if(Y===true){continue}}}if(Y){for(var X=0;(af=aa[X])!=null;X++){if(af){ah=U(af,Y,X,aa);var ae=W^!!ah;if(ag&&ah!=null){if(ae){T=true}else{aa[X]=false}}else{if(ae){ai.push(af);T=true}}}}}if(ah!==g){if(!ag){aa=ai}ad=ad.replace(I.match[ab],"");if(!T){return[]}break}}}if(ad==V){if(T==null){throw"Syntax error, unrecognized expression: "+ad}else{break}}V=ad}return aa};var I=F.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(T){return T.getAttribute("href")}},relative:{"+":function(aa,T,Z){var X=typeof T==="string",ab=X&&!/\W/.test(T),Y=X&&!ab;if(ab&&!Z){T=T.toUpperCase()}for(var W=0,V=aa.length,U;W<V;W++){if((U=aa[W])){while((U=U.previousSibling)&&U.nodeType!==1){}aa[W]=Y||U&&U.nodeName===T?U||false:U===T}}if(Y){F.filter(T,aa,true)}},">":function(Z,U,aa){var X=typeof U==="string";if(X&&!/\W/.test(U)){U=aa?U:U.toUpperCase();for(var V=0,T=Z.length;V<T;V++){var Y=Z[V];if(Y){var W=Y.parentNode;Z[V]=W.nodeName===U?W:false}}}else{for(var V=0,T=Z.length;V<T;V++){var Y=Z[V];if(Y){Z[V]=X?Y.parentNode:Y.parentNode===U}}if(X){F.filter(U,Z,true)}}},"":function(W,U,Y){var V=L++,T=S;if(!U.match(/\W/)){var X=U=Y?U:U.toUpperCase();T=P}T("parentNode",U,V,W,X,Y)},"~":function(W,U,Y){var V=L++,T=S;if(typeof U==="string"&&!U.match(/\W/)){var X=U=Y?U:U.toUpperCase();T=P}T("previousSibling",U,V,W,X,Y)}},find:{ID:function(U,V,W){if(typeof V.getElementById!=="undefined"&&!W){var T=V.getElementById(U[1]);return T?[T]:[]}},NAME:function(V,Y,Z){if(typeof Y.getElementsByName!=="undefined"){var U=[],X=Y.getElementsByName(V[1]);for(var W=0,T=X.length;W<T;W++){if(X[W].getAttribute("name")===V[1]){U.push(X[W])}}return U.length===0?null:U}},TAG:function(T,U){return U.getElementsByTagName(T[1])}},preFilter:{CLASS:function(W,U,V,T,Z,aa){W=" "+W[1].replace(/\\/g,"")+" ";if(aa){return W}for(var X=0,Y;(Y=U[X])!=null;X++){if(Y){if(Z^(Y.className&&(" "+Y.className+" ").indexOf(W)>=0)){if(!V){T.push(Y)}}else{if(V){U[X]=false}}}}return false},ID:function(T){return T[1].replace(/\\/g,"")},TAG:function(U,T){for(var V=0;T[V]===false;V++){}return T[V]&&Q(T[V])?U[1]:U[1].toUpperCase()},CHILD:function(T){if(T[1]=="nth"){var U=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(T[2]=="even"&&"2n"||T[2]=="odd"&&"2n+1"||!/\D/.test(T[2])&&"0n+"+T[2]||T[2]);T[2]=(U[1]+(U[2]||1))-0;T[3]=U[3]-0}T[0]=L++;return T},ATTR:function(X,U,V,T,Y,Z){var W=X[1].replace(/\\/g,"");if(!Z&&I.attrMap[W]){X[1]=I.attrMap[W]}if(X[2]==="~="){X[4]=" "+X[4]+" "}return X},PSEUDO:function(X,U,V,T,Y){if(X[1]==="not"){if(X[3].match(R).length>1||/^\w/.test(X[3])){X[3]=F(X[3],null,null,U)}else{var W=F.filter(X[3],U,V,true^Y);if(!V){T.push.apply(T,W)}return false}}else{if(I.match.POS.test(X[0])||I.match.CHILD.test(X[0])){return true}}return X},POS:function(T){T.unshift(true);return T}},filters:{enabled:function(T){return T.disabled===false&&T.type!=="hidden"},disabled:function(T){return T.disabled===true},checked:function(T){return T.checked===true},selected:function(T){T.parentNode.selectedIndex;return T.selected===true},parent:function(T){return !!T.firstChild},empty:function(T){return !T.firstChild},has:function(V,U,T){return !!F(T[3],V).length},header:function(T){return/h\d/i.test(T.nodeName)},text:function(T){return"text"===T.type},radio:function(T){return"radio"===T.type},checkbox:function(T){return"checkbox"===T.type},file:function(T){return"file"===T.type},password:function(T){return"password"===T.type},submit:function(T){return"submit"===T.type},image:function(T){return"image"===T.type},reset:function(T){return"reset"===T.type},button:function(T){return"button"===T.type||T.nodeName.toUpperCase()==="BUTTON"},input:function(T){return/input|select|textarea|button/i.test(T.nodeName)}},setFilters:{first:function(U,T){return T===0},last:function(V,U,T,W){return U===W.length-1},even:function(U,T){return T%2===0},odd:function(U,T){return T%2===1},lt:function(V,U,T){return U<T[3]-0},gt:function(V,U,T){return U>T[3]-0},nth:function(V,U,T){return T[3]-0==U},eq:function(V,U,T){return T[3]-0==U}},filter:{PSEUDO:function(Z,V,W,aa){var U=V[1],X=I.filters[U];if(X){return X(Z,W,V,aa)}else{if(U==="contains"){return(Z.textContent||Z.innerText||"").indexOf(V[3])>=0}else{if(U==="not"){var Y=V[3];for(var W=0,T=Y.length;W<T;W++){if(Y[W]===Z){return false}}return true}}}},CHILD:function(T,W){var Z=W[1],U=T;switch(Z){case"only":case"first":while(U=U.previousSibling){if(U.nodeType===1){return false}}if(Z=="first"){return true}U=T;case"last":while(U=U.nextSibling){if(U.nodeType===1){return false}}return true;case"nth":var V=W[2],ac=W[3];if(V==1&&ac==0){return true}var Y=W[0],ab=T.parentNode;if(ab&&(ab.sizcache!==Y||!T.nodeIndex)){var X=0;for(U=ab.firstChild;U;U=U.nextSibling){if(U.nodeType===1){U.nodeIndex=++X}}ab.sizcache=Y}var aa=T.nodeIndex-ac;if(V==0){return aa==0}else{return(aa%V==0&&aa/V>=0)}}},ID:function(U,T){return U.nodeType===1&&U.getAttribute("id")===T},TAG:function(U,T){return(T==="*"&&U.nodeType===1)||U.nodeName===T},CLASS:function(U,T){return(" "+(U.className||U.getAttribute("class"))+" ").indexOf(T)>-1},ATTR:function(Y,W){var V=W[1],T=I.attrHandle[V]?I.attrHandle[V](Y):Y[V]!=null?Y[V]:Y.getAttribute(V),Z=T+"",X=W[2],U=W[4];return T==null?X==="!=":X==="="?Z===U:X==="*="?Z.indexOf(U)>=0:X==="~="?(" "+Z+" ").indexOf(U)>=0:!U?Z&&T!==false:X==="!="?Z!=U:X==="^="?Z.indexOf(U)===0:X==="$="?Z.substr(Z.length-U.length)===U:X==="|="?Z===U||Z.substr(0,U.length+1)===U+"-":false},POS:function(X,U,V,Y){var T=U[2],W=I.setFilters[T];if(W){return W(X,V,U,Y)}}}};var M=I.match.POS;for(var O in I.match){I.match[O]=RegExp(I.match[O].source+/(?![^\[]*\])(?![^\(]*\))/.source)}var E=function(U,T){U=Array.prototype.slice.call(U);if(T){T.push.apply(T,U);return T}return U};try{Array.prototype.slice.call(document.documentElement.childNodes)}catch(N){E=function(X,W){var U=W||[];if(H.call(X)==="[object Array]"){Array.prototype.push.apply(U,X)}else{if(typeof X.length==="number"){for(var V=0,T=X.length;V<T;V++){U.push(X[V])}}else{for(var V=0;X[V];V++){U.push(X[V])}}}return U}}var G;if(document.documentElement.compareDocumentPosition){G=function(U,T){var V=U.compareDocumentPosition(T)&4?-1:U===T?0:1;if(V===0){hasDuplicate=true}return V}}else{if("sourceIndex" in document.documentElement){G=function(U,T){var V=U.sourceIndex-T.sourceIndex;if(V===0){hasDuplicate=true}return V}}else{if(document.createRange){G=function(W,U){var V=W.ownerDocument.createRange(),T=U.ownerDocument.createRange();V.selectNode(W);V.collapse(true);T.selectNode(U);T.collapse(true);var X=V.compareBoundaryPoints(Range.START_TO_END,T);if(X===0){hasDuplicate=true}return X}}}}(function(){var U=document.createElement("form"),V="script"+(new Date).getTime();U.innerHTML="<input name='"+V+"'/>";var T=document.documentElement;T.insertBefore(U,T.firstChild);if(!!document.getElementById(V)){I.find.ID=function(X,Y,Z){if(typeof Y.getElementById!=="undefined"&&!Z){var W=Y.getElementById(X[1]);return W?W.id===X[1]||typeof W.getAttributeNode!=="undefined"&&W.getAttributeNode("id").nodeValue===X[1]?[W]:g:[]}};I.filter.ID=function(Y,W){var X=typeof Y.getAttributeNode!=="undefined"&&Y.getAttributeNode("id");return Y.nodeType===1&&X&&X.nodeValue===W}}T.removeChild(U)})();(function(){var T=document.createElement("div");T.appendChild(document.createComment(""));if(T.getElementsByTagName("*").length>0){I.find.TAG=function(U,Y){var X=Y.getElementsByTagName(U[1]);if(U[1]==="*"){var W=[];for(var V=0;X[V];V++){if(X[V].nodeType===1){W.push(X[V])}}X=W}return X}}T.innerHTML="<a href='#'></a>";if(T.firstChild&&typeof T.firstChild.getAttribute!=="undefined"&&T.firstChild.getAttribute("href")!=="#"){I.attrHandle.href=function(U){return U.getAttribute("href",2)}}})();if(document.querySelectorAll){(function(){var T=F,U=document.createElement("div");U.innerHTML="<p class='TEST'></p>";if(U.querySelectorAll&&U.querySelectorAll(".TEST").length===0){return}F=function(Y,X,V,W){X=X||document;if(!W&&X.nodeType===9&&!Q(X)){try{return E(X.querySelectorAll(Y),V)}catch(Z){}}return T(Y,X,V,W)};F.find=T.find;F.filter=T.filter;F.selectors=T.selectors;F.matches=T.matches})()}if(document.getElementsByClassName&&document.documentElement.getElementsByClassName){(function(){var T=document.createElement("div");T.innerHTML="<div class='test e'></div><div class='test'></div>";if(T.getElementsByClassName("e").length===0){return}T.lastChild.className="e";if(T.getElementsByClassName("e").length===1){return}I.order.splice(1,0,"CLASS");I.find.CLASS=function(U,V,W){if(typeof V.getElementsByClassName!=="undefined"&&!W){return V.getElementsByClassName(U[1])}}})()}function P(U,Z,Y,ad,aa,ac){var ab=U=="previousSibling"&&!ac;for(var W=0,V=ad.length;W<V;W++){var T=ad[W];if(T){if(ab&&T.nodeType===1){T.sizcache=Y;T.sizset=W}T=T[U];var X=false;while(T){if(T.sizcache===Y){X=ad[T.sizset];break}if(T.nodeType===1&&!ac){T.sizcache=Y;T.sizset=W}if(T.nodeName===Z){X=T;break}T=T[U]}ad[W]=X}}}function S(U,Z,Y,ad,aa,ac){var ab=U=="previousSibling"&&!ac;for(var W=0,V=ad.length;W<V;W++){var T=ad[W];if(T){if(ab&&T.nodeType===1){T.sizcache=Y;T.sizset=W}T=T[U];var X=false;while(T){if(T.sizcache===Y){X=ad[T.sizset];break}if(T.nodeType===1){if(!ac){T.sizcache=Y;T.sizset=W}if(typeof Z!=="string"){if(T===Z){X=true;break}}else{if(F.filter(Z,[T]).length>0){X=T;break}}}T=T[U]}ad[W]=X}}}var K=document.compareDocumentPosition?function(U,T){return U.compareDocumentPosition(T)&16}:function(U,T){return U!==T&&(U.contains?U.contains(T):true)};var Q=function(T){return T.nodeType===9&&T.documentElement.nodeName!=="HTML"||!!T.ownerDocument&&Q(T.ownerDocument)};var J=function(T,aa){var W=[],X="",Y,V=aa.nodeType?[aa]:aa;while((Y=I.match.PSEUDO.exec(T))){X+=Y[0];T=T.replace(I.match.PSEUDO,"")}T=I.relative[T]?T+"*":T;for(var Z=0,U=V.length;Z<U;Z++){F(T,V[Z],W)}return F.filter(X,W)};o.find=F;o.filter=F.filter;o.expr=F.selectors;o.expr[":"]=o.expr.filters;F.selectors.filters.hidden=function(T){return T.offsetWidth===0||T.offsetHeight===0};F.selectors.filters.visible=function(T){return T.offsetWidth>0||T.offsetHeight>0};F.selectors.filters.animated=function(T){return o.grep(o.timers,function(U){return T===U.elem}).length};o.multiFilter=function(V,T,U){if(U){V=":not("+V+")"}return F.matches(V,T)};o.dir=function(V,U){var T=[],W=V[U];while(W&&W!=document){if(W.nodeType==1){T.push(W)}W=W[U]}return T};o.nth=function(X,T,V,W){T=T||1;var U=0;for(;X;X=X[V]){if(X.nodeType==1&&++U==T){break}}return X};o.sibling=function(V,U){var T=[];for(;V;V=V.nextSibling){if(V.nodeType==1&&V!=U){T.push(V)}}return T};return;l.Sizzle=F})();o.event={add:function(I,F,H,K){if(I.nodeType==3||I.nodeType==8){return}if(I.setInterval&&I!=l){I=l}if(!H.guid){H.guid=this.guid++}if(K!==g){var G=H;H=this.proxy(G);H.data=K}var E=o.data(I,"events")||o.data(I,"events",{}),J=o.data(I,"handle")||o.data(I,"handle",function(){return typeof o!=="undefined"&&!o.event.triggered?o.event.handle.apply(arguments.callee.elem,arguments):g});J.elem=I;o.each(F.split(/\s+/),function(M,N){var O=N.split(".");N=O.shift();H.type=O.slice().sort().join(".");var L=E[N];if(o.event.specialAll[N]){o.event.specialAll[N].setup.call(I,K,O)}if(!L){L=E[N]={};if(!o.event.special[N]||o.event.special[N].setup.call(I,K,O)===false){if(I.addEventListener){I.addEventListener(N,J,false)}else{if(I.attachEvent){I.attachEvent("on"+N,J)}}}}L[H.guid]=H;o.event.global[N]=true});I=null},guid:1,global:{},remove:function(K,H,J){if(K.nodeType==3||K.nodeType==8){return}var G=o.data(K,"events"),F,E;if(G){if(H===g||(typeof H==="string"&&H.charAt(0)==".")){for(var I in G){this.remove(K,I+(H||""))}}else{if(H.type){J=H.handler;H=H.type}o.each(H.split(/\s+/),function(M,O){var Q=O.split(".");O=Q.shift();var N=RegExp("(^|\\.)"+Q.slice().sort().join(".*\\.")+"(\\.|$)");if(G[O]){if(J){delete G[O][J.guid]}else{for(var P in G[O]){if(N.test(G[O][P].type)){delete G[O][P]}}}if(o.event.specialAll[O]){o.event.specialAll[O].teardown.call(K,Q)}for(F in G[O]){break}if(!F){if(!o.event.special[O]||o.event.special[O].teardown.call(K,Q)===false){if(K.removeEventListener){K.removeEventListener(O,o.data(K,"handle"),false)}else{if(K.detachEvent){K.detachEvent("on"+O,o.data(K,"handle"))}}}F=null;delete G[O]}}})}for(F in G){break}if(!F){var L=o.data(K,"handle");if(L){L.elem=null}o.removeData(K,"events");o.removeData(K,"handle")}}},trigger:function(I,K,H,E){var G=I.type||I;if(!E){I=typeof I==="object"?I[h]?I:o.extend(o.Event(G),I):o.Event(G);if(G.indexOf("!")>=0){I.type=G=G.slice(0,-1);I.exclusive=true}if(!H){I.stopPropagation();if(this.global[G]){o.each(o.cache,function(){if(this.events&&this.events[G]){o.event.trigger(I,K,this.handle.elem)}})}}if(!H||H.nodeType==3||H.nodeType==8){return g}I.result=g;I.target=H;K=o.makeArray(K);K.unshift(I)}I.currentTarget=H;var J=o.data(H,"handle");if(J){J.apply(H,K)}if((!H[G]||(o.nodeName(H,"a")&&G=="click"))&&H["on"+G]&&H["on"+G].apply(H,K)===false){I.result=false}if(!E&&H[G]&&!I.isDefaultPrevented()&&!(o.nodeName(H,"a")&&G=="click")){this.triggered=true;try{H[G]()}catch(L){}}this.triggered=false;if(!I.isPropagationStopped()){var F=H.parentNode||H.ownerDocument;if(F){o.event.trigger(I,K,F,true)}}},handle:function(K){var J,E;K=arguments[0]=o.event.fix(K||l.event);K.currentTarget=this;var L=K.type.split(".");K.type=L.shift();J=!L.length&&!K.exclusive;var I=RegExp("(^|\\.)"+L.slice().sort().join(".*\\.")+"(\\.|$)");E=(o.data(this,"events")||{})[K.type];for(var G in E){var H=E[G];if(J||I.test(H.type)){K.handler=H;K.data=H.data;var F=H.apply(this,arguments);if(F!==g){K.result=F;if(F===false){K.preventDefault();K.stopPropagation()}}if(K.isImmediatePropagationStopped()){break}}}},props:"altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target toElement view wheelDelta which".split(" "),fix:function(H){if(H[h]){return H}var F=H;H=o.Event(F);for(var G=this.props.length,J;G;){J=this.props[--G];H[J]=F[J]}if(!H.target){H.target=H.srcElement||document}if(H.target.nodeType==3){H.target=H.target.parentNode}if(!H.relatedTarget&&H.fromElement){H.relatedTarget=H.fromElement==H.target?H.toElement:H.fromElement}if(H.pageX==null&&H.clientX!=null){var I=document.documentElement,E=document.body;H.pageX=H.clientX+(I&&I.scrollLeft||E&&E.scrollLeft||0)-(I.clientLeft||0);H.pageY=H.clientY+(I&&I.scrollTop||E&&E.scrollTop||0)-(I.clientTop||0)}if(!H.which&&((H.charCode||H.charCode===0)?H.charCode:H.keyCode)){H.which=H.charCode||H.keyCode}if(!H.metaKey&&H.ctrlKey){H.metaKey=H.ctrlKey}if(!H.which&&H.button){H.which=(H.button&1?1:(H.button&2?3:(H.button&4?2:0)))}return H},proxy:function(F,E){E=E||function(){return F.apply(this,arguments)};E.guid=F.guid=F.guid||E.guid||this.guid++;return E},special:{ready:{setup:B,teardown:function(){}}},specialAll:{live:{setup:function(E,F){o.event.add(this,F[0],c)},teardown:function(G){if(G.length){var E=0,F=RegExp("(^|\\.)"+G[0]+"(\\.|$)");o.each((o.data(this,"events").live||{}),function(){if(F.test(this.type)){E++}});if(E<1){o.event.remove(this,G[0],c)}}}}}};o.Event=function(E){if(!this.preventDefault){return new o.Event(E)}if(E&&E.type){this.originalEvent=E;this.type=E.type}else{this.type=E}this.timeStamp=e();this[h]=true};function k(){return false}function u(){return true}o.Event.prototype={preventDefault:function(){this.isDefaultPrevented=u;var E=this.originalEvent;if(!E){return}if(E.preventDefault){E.preventDefault()}E.returnValue=false},stopPropagation:function(){this.isPropagationStopped=u;var E=this.originalEvent;if(!E){return}if(E.stopPropagation){E.stopPropagation()}E.cancelBubble=true},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=u;this.stopPropagation()},isDefaultPrevented:k,isPropagationStopped:k,isImmediatePropagationStopped:k};var a=function(F){var E=F.relatedTarget;while(E&&E!=this){try{E=E.parentNode}catch(G){E=this}}if(E!=this){F.type=F.data;o.event.handle.apply(this,arguments)}};o.each({mouseover:"mouseenter",mouseout:"mouseleave"},function(F,E){o.event.special[E]={setup:function(){o.event.add(this,F,a,E)},teardown:function(){o.event.remove(this,F,a)}}});o.fn.extend({bind:function(F,G,E){return F=="unload"?this.one(F,G,E):this.each(function(){o.event.add(this,F,E||G,E&&G)})},one:function(G,H,F){var E=o.event.proxy(F||H,function(I){o(this).unbind(I,E);return(F||H).apply(this,arguments)});return this.each(function(){o.event.add(this,G,E,F&&H)})},unbind:function(F,E){return this.each(function(){o.event.remove(this,F,E)})},trigger:function(E,F){return this.each(function(){o.event.trigger(E,F,this)})},triggerHandler:function(E,G){if(this[0]){var F=o.Event(E);F.preventDefault();F.stopPropagation();o.event.trigger(F,G,this[0]);return F.result}},toggle:function(G){var E=arguments,F=1;while(F<E.length){o.event.proxy(G,E[F++])}return this.click(o.event.proxy(G,function(H){this.lastToggle=(this.lastToggle||0)%F;H.preventDefault();return E[this.lastToggle++].apply(this,arguments)||false}))},hover:function(E,F){return this.mouseenter(E).mouseleave(F)},ready:function(E){B();if(o.isReady){E.call(document,o)}else{o.readyList.push(E)}return this},live:function(G,F){var E=o.event.proxy(F);E.guid+=this.selector+G;o(document).bind(i(G,this.selector),this.selector,E);return this},die:function(F,E){o(document).unbind(i(F,this.selector),E?{guid:E.guid+this.selector+F}:null);return this}});function c(H){var E=RegExp("(^|\\.)"+H.type+"(\\.|$)"),G=true,F=[];o.each(o.data(this,"events").live||[],function(I,J){if(E.test(J.type)){var K=o(H.target).closest(J.data)[0];if(K){F.push({elem:K,fn:J})}}});F.sort(function(J,I){return o.data(J.elem,"closest")-o.data(I.elem,"closest")});o.each(F,function(){if(this.fn.call(this.elem,H,this.fn.data)===false){return(G=false)}});return G}function i(F,E){return["live",F,E.replace(/\./g,"`").replace(/ /g,"|")].join(".")}o.extend({isReady:false,readyList:[],ready:function(){if(!o.isReady){o.isReady=true;if(o.readyList){o.each(o.readyList,function(){this.call(document,o)});o.readyList=null}o(document).triggerHandler("ready")}}});var x=false;function B(){if(x){return}x=true;if(document.addEventListener){document.addEventListener("DOMContentLoaded",function(){document.removeEventListener("DOMContentLoaded",arguments.callee,false);o.ready()},false)}else{if(document.attachEvent){document.attachEvent("onreadystatechange",function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",arguments.callee);o.ready()}});if(document.documentElement.doScroll&&l==l.top){(function(){if(o.isReady){return}try{document.documentElement.doScroll("left")}catch(E){setTimeout(arguments.callee,0);return}o.ready()})()}}}o.event.add(l,"load",o.ready)}o.each(("blur,focus,load,resize,scroll,unload,click,dblclick,mousedown,mouseup,mousemove,mouseover,mouseout,mouseenter,mouseleave,change,select,submit,keydown,keypress,keyup,error").split(","),function(F,E){o.fn[E]=function(G){return G?this.bind(E,G):this.trigger(E)}});o(l).bind("unload",function(){for(var E in o.cache){if(E!=1&&o.cache[E].handle){o.event.remove(o.cache[E].handle.elem)}}});(function(){o.support={};var F=document.documentElement,G=document.createElement("script"),K=document.createElement("div"),J="script"+(new Date).getTime();K.style.display="none";K.innerHTML='   <link/><table></table><a href="/a" style="color:red;float:left;opacity:.5;">a</a><select><option>text</option></select><object><param/></object>';var H=K.getElementsByTagName("*"),E=K.getElementsByTagName("a")[0];if(!H||!H.length||!E){return}o.support={leadingWhitespace:K.firstChild.nodeType==3,tbody:!K.getElementsByTagName("tbody").length,objectAll:!!K.getElementsByTagName("object")[0].getElementsByTagName("*").length,htmlSerialize:!!K.getElementsByTagName("link").length,style:/red/.test(E.getAttribute("style")),hrefNormalized:E.getAttribute("href")==="/a",opacity:E.style.opacity==="0.5",cssFloat:!!E.style.cssFloat,scriptEval:false,noCloneEvent:true,boxModel:null};G.type="text/javascript";try{G.appendChild(document.createTextNode("window."+J+"=1;"))}catch(I){}F.insertBefore(G,F.firstChild);if(l[J]){o.support.scriptEval=true;delete l[J]}F.removeChild(G);if(K.attachEvent&&K.fireEvent){K.attachEvent("onclick",function(){o.support.noCloneEvent=false;K.detachEvent("onclick",arguments.callee)});K.cloneNode(true).fireEvent("onclick")}o(function(){var L=document.createElement("div");L.style.width=L.style.paddingLeft="1px";document.body.appendChild(L);o.boxModel=o.support.boxModel=L.offsetWidth===2;document.body.removeChild(L).style.display="none"})})();var w=o.support.cssFloat?"cssFloat":"styleFloat";o.props={"for":"htmlFor","class":"className","float":w,cssFloat:w,styleFloat:w,readonly:"readOnly",maxlength:"maxLength",cellspacing:"cellSpacing",rowspan:"rowSpan",tabindex:"tabIndex"};o.fn.extend({_load:o.fn.load,load:function(G,J,K){if(typeof G!=="string"){return this._load(G)}var I=G.indexOf(" ");if(I>=0){var E=G.slice(I,G.length);G=G.slice(0,I)}var H="GET";if(J){if(o.isFunction(J)){K=J;J=null}else{if(typeof J==="object"){J=o.param(J);H="POST"}}}var F=this;o.ajax({url:G,type:H,dataType:"html",data:J,complete:function(M,L){if(L=="success"||L=="notmodified"){F.html(E?o("<div/>").append(M.responseText.replace(/<script(.|\s)*?\/script>/g,"")).find(E):M.responseText)}if(K){F.each(K,[M.responseText,L,M])}}});return this},serialize:function(){return o.param(this.serializeArray())},serializeArray:function(){return this.map(function(){return this.elements?o.makeArray(this.elements):this}).filter(function(){return this.name&&!this.disabled&&(this.checked||/select|textarea/i.test(this.nodeName)||/text|hidden|password|search/i.test(this.type))}).map(function(E,F){var G=o(this).val();return G==null?null:o.isArray(G)?o.map(G,function(I,H){return{name:F.name,value:I}}):{name:F.name,value:G}}).get()}});o.each("ajaxStart,ajaxStop,ajaxComplete,ajaxError,ajaxSuccess,ajaxSend".split(","),function(E,F){o.fn[F]=function(G){return this.bind(F,G)}});var r=e();o.extend({get:function(E,G,H,F){if(o.isFunction(G)){H=G;G=null}return o.ajax({type:"GET",url:E,data:G,success:H,dataType:F})},getScript:function(E,F){return o.get(E,null,F,"script")},getJSON:function(E,F,G){return o.get(E,F,G,"json")},post:function(E,G,H,F){if(o.isFunction(G)){H=G;G={}}return o.ajax({type:"POST",url:E,data:G,success:H,dataType:F})},ajaxSetup:function(E){o.extend(o.ajaxSettings,E)},ajaxSettings:{url:location.href,global:true,type:"GET",contentType:"application/x-www-form-urlencoded",processData:true,async:true,xhr:function(){return l.ActiveXObject?new ActiveXObject("Microsoft.XMLHTTP"):new XMLHttpRequest()},accepts:{xml:"application/xml, text/xml",html:"text/html",script:"text/javascript, application/javascript",json:"application/json, text/javascript",text:"text/plain",_default:"*/*"}},lastModified:{},ajax:function(M){M=o.extend(true,M,o.extend(true,{},o.ajaxSettings,M));var W,F=/=\?(&|$)/g,R,V,G=M.type.toUpperCase();if(M.data&&M.processData&&typeof M.data!=="string"){M.data=o.param(M.data)}if(M.dataType=="jsonp"){if(G=="GET"){if(!M.url.match(F)){M.url+=(M.url.match(/\?/)?"&":"?")+(M.jsonp||"callback")+"=?"}}else{if(!M.data||!M.data.match(F)){M.data=(M.data?M.data+"&":"")+(M.jsonp||"callback")+"=?"}}M.dataType="json"}if(M.dataType=="json"&&(M.data&&M.data.match(F)||M.url.match(F))){W="jsonp"+r++;if(M.data){M.data=(M.data+"").replace(F,"="+W+"$1")}M.url=M.url.replace(F,"="+W+"$1");M.dataType="script";l[W]=function(X){V=X;I();L();l[W]=g;try{delete l[W]}catch(Y){}if(H){H.removeChild(T)}}}if(M.dataType=="script"&&M.cache==null){M.cache=false}if(M.cache===false&&G=="GET"){var E=e();var U=M.url.replace(/(\?|&)_=.*?(&|$)/,"$1_="+E+"$2");M.url=U+((U==M.url)?(M.url.match(/\?/)?"&":"?")+"_="+E:"")}if(M.data&&G=="GET"){M.url+=(M.url.match(/\?/)?"&":"?")+M.data;M.data=null}if(M.global&&!o.active++){o.event.trigger("ajaxStart")}var Q=/^(\w+:)?\/\/([^\/?#]+)/.exec(M.url);if(M.dataType=="script"&&G=="GET"&&Q&&(Q[1]&&Q[1]!=location.protocol||Q[2]!=location.host)){var H=document.getElementsByTagName("head")[0];var T=document.createElement("script");T.src=M.url;if(M.scriptCharset){T.charset=M.scriptCharset}if(!W){var O=false;T.onload=T.onreadystatechange=function(){if(!O&&(!this.readyState||this.readyState=="loaded"||this.readyState=="complete")){O=true;I();L();T.onload=T.onreadystatechange=null;H.removeChild(T)}}}H.appendChild(T);return g}var K=false;var J=M.xhr();if(M.username){J.open(G,M.url,M.async,M.username,M.password)}else{J.open(G,M.url,M.async)}try{if(M.data){J.setRequestHeader("Content-Type",M.contentType)}if(M.ifModified){J.setRequestHeader("If-Modified-Since",o.lastModified[M.url]||"Thu, 01 Jan 1970 00:00:00 GMT")}J.setRequestHeader("X-Requested-With","XMLHttpRequest");J.setRequestHeader("Accept",M.dataType&&M.accepts[M.dataType]?M.accepts[M.dataType]+", */*":M.accepts._default)}catch(S){}if(M.beforeSend&&M.beforeSend(J,M)===false){if(M.global&&!--o.active){o.event.trigger("ajaxStop")}J.abort();return false}if(M.global){o.event.trigger("ajaxSend",[J,M])}var N=function(X){if(J.readyState==0){if(P){clearInterval(P);P=null;if(M.global&&!--o.active){o.event.trigger("ajaxStop")}}}else{if(!K&&J&&(J.readyState==4||X=="timeout")){K=true;if(P){clearInterval(P);P=null}R=X=="timeout"?"timeout":!o.httpSuccess(J)?"error":M.ifModified&&o.httpNotModified(J,M.url)?"notmodified":"success";if(R=="success"){try{V=o.httpData(J,M.dataType,M)}catch(Z){R="parsererror"}}if(R=="success"){var Y;try{Y=J.getResponseHeader("Last-Modified")}catch(Z){}if(M.ifModified&&Y){o.lastModified[M.url]=Y}if(!W){I()}}else{o.handleError(M,J,R)}L();if(X){J.abort()}if(M.async){J=null}}}};if(M.async){var P=setInterval(N,13);if(M.timeout>0){setTimeout(function(){if(J&&!K){N("timeout")}},M.timeout)}}try{J.send(M.data)}catch(S){o.handleError(M,J,null,S)}if(!M.async){N()}function I(){if(M.success){M.success(V,R)}if(M.global){o.event.trigger("ajaxSuccess",[J,M])}}function L(){if(M.complete){M.complete(J,R)}if(M.global){o.event.trigger("ajaxComplete",[J,M])}if(M.global&&!--o.active){o.event.trigger("ajaxStop")}}return J},handleError:function(F,H,E,G){if(F.error){F.error(H,E,G)}if(F.global){o.event.trigger("ajaxError",[H,F,G])}},active:0,httpSuccess:function(F){try{return !F.status&&location.protocol=="file:"||(F.status>=200&&F.status<300)||F.status==304||F.status==1223}catch(E){}return false},httpNotModified:function(G,E){try{var H=G.getResponseHeader("Last-Modified");return G.status==304||H==o.lastModified[E]}catch(F){}return false},httpData:function(J,H,G){var F=J.getResponseHeader("content-type"),E=H=="xml"||!H&&F&&F.indexOf("xml")>=0,I=E?J.responseXML:J.responseText;if(E&&I.documentElement.tagName=="parsererror"){throw"parsererror"}if(G&&G.dataFilter){I=G.dataFilter(I,H)}if(typeof I==="string"){if(H=="script"){o.globalEval(I)}if(H=="json"){I=l["eval"]("("+I+")")}}return I},param:function(E){var G=[];function H(I,J){G[G.length]=encodeURIComponent(I)+"="+encodeURIComponent(J)}if(o.isArray(E)||E.jquery){o.each(E,function(){H(this.name,this.value)})}else{for(var F in E){if(o.isArray(E[F])){o.each(E[F],function(){H(F,this)})}else{H(F,o.isFunction(E[F])?E[F]():E[F])}}}return G.join("&").replace(/%20/g,"+")}});var m={},n,d=[["height","marginTop","marginBottom","paddingTop","paddingBottom"],["width","marginLeft","marginRight","paddingLeft","paddingRight"],["opacity"]];function t(F,E){var G={};o.each(d.concat.apply([],d.slice(0,E)),function(){G[this]=F});return G}o.fn.extend({show:function(J,L){if(J){return this.animate(t("show",3),J,L)}else{for(var H=0,F=this.length;H<F;H++){var E=o.data(this[H],"olddisplay");this[H].style.display=E||"";if(o.css(this[H],"display")==="none"){var G=this[H].tagName,K;if(m[G]){K=m[G]}else{var I=o("<"+G+" />").appendTo("body");K=I.css("display");if(K==="none"){K="block"}I.remove();m[G]=K}o.data(this[H],"olddisplay",K)}}for(var H=0,F=this.length;H<F;H++){this[H].style.display=o.data(this[H],"olddisplay")||""}return this}},hide:function(H,I){if(H){return this.animate(t("hide",3),H,I)}else{for(var G=0,F=this.length;G<F;G++){var E=o.data(this[G],"olddisplay");if(!E&&E!=="none"){o.data(this[G],"olddisplay",o.css(this[G],"display"))}}for(var G=0,F=this.length;G<F;G++){this[G].style.display="none"}return this}},_toggle:o.fn.toggle,toggle:function(G,F){var E=typeof G==="boolean";return o.isFunction(G)&&o.isFunction(F)?this._toggle.apply(this,arguments):G==null||E?this.each(function(){var H=E?G:o(this).is(":hidden");o(this)[H?"show":"hide"]()}):this.animate(t("toggle",3),G,F)},fadeTo:function(E,G,F){return this.animate({opacity:G},E,F)},animate:function(I,F,H,G){var E=o.speed(F,H,G);return this[E.queue===false?"each":"queue"](function(){var K=o.extend({},E),M,L=this.nodeType==1&&o(this).is(":hidden"),J=this;for(M in I){if(I[M]=="hide"&&L||I[M]=="show"&&!L){return K.complete.call(this)}if((M=="height"||M=="width")&&this.style){K.display=o.css(this,"display");K.overflow=this.style.overflow}}if(K.overflow!=null){this.style.overflow="hidden"}K.curAnim=o.extend({},I);o.each(I,function(O,S){var R=new o.fx(J,K,O);if(/toggle|show|hide/.test(S)){R[S=="toggle"?L?"show":"hide":S](I)}else{var Q=S.toString().match(/^([+-]=)?([\d+-.]+)(.*)$/),T=R.cur(true)||0;if(Q){var N=parseFloat(Q[2]),P=Q[3]||"px";if(P!="px"){J.style[O]=(N||1)+P;T=((N||1)/R.cur(true))*T;J.style[O]=T+P}if(Q[1]){N=((Q[1]=="-="?-1:1)*N)+T}R.custom(T,N,P)}else{R.custom(T,S,"")}}});return true})},stop:function(F,E){var G=o.timers;if(F){this.queue([])}this.each(function(){for(var H=G.length-1;H>=0;H--){if(G[H].elem==this){if(E){G[H](true)}G.splice(H,1)}}});if(!E){this.dequeue()}return this}});o.each({slideDown:t("show",1),slideUp:t("hide",1),slideToggle:t("toggle",1),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"}},function(E,F){o.fn[E]=function(G,H){return this.animate(F,G,H)}});o.extend({speed:function(G,H,F){var E=typeof G==="object"?G:{complete:F||!F&&H||o.isFunction(G)&&G,duration:G,easing:F&&H||H&&!o.isFunction(H)&&H};E.duration=o.fx.off?0:typeof E.duration==="number"?E.duration:o.fx.speeds[E.duration]||o.fx.speeds._default;E.old=E.complete;E.complete=function(){if(E.queue!==false){o(this).dequeue()}if(o.isFunction(E.old)){E.old.call(this)}};return E},easing:{linear:function(G,H,E,F){return E+F*G},swing:function(G,H,E,F){return((-Math.cos(G*Math.PI)/2)+0.5)*F+E}},timers:[],fx:function(F,E,G){this.options=E;this.elem=F;this.prop=G;if(!E.orig){E.orig={}}}});o.fx.prototype={update:function(){if(this.options.step){this.options.step.call(this.elem,this.now,this)}(o.fx.step[this.prop]||o.fx.step._default)(this);if((this.prop=="height"||this.prop=="width")&&this.elem.style){this.elem.style.display="block"}},cur:function(F){if(this.elem[this.prop]!=null&&(!this.elem.style||this.elem.style[this.prop]==null)){return this.elem[this.prop]}var E=parseFloat(o.css(this.elem,this.prop,F));return E&&E>-10000?E:parseFloat(o.curCSS(this.elem,this.prop))||0},custom:function(I,H,G){this.startTime=e();this.start=I;this.end=H;this.unit=G||this.unit||"px";this.now=this.start;this.pos=this.state=0;var E=this;function F(J){return E.step(J)}F.elem=this.elem;if(F()&&o.timers.push(F)&&!n){n=setInterval(function(){var K=o.timers;for(var J=0;J<K.length;J++){if(!K[J]()){K.splice(J--,1)}}if(!K.length){clearInterval(n);n=g}},13)}},show:function(){this.options.orig[this.prop]=o.attr(this.elem.style,this.prop);this.options.show=true;this.custom(this.prop=="width"||this.prop=="height"?1:0,this.cur());o(this.elem).show()},hide:function(){this.options.orig[this.prop]=o.attr(this.elem.style,this.prop);this.options.hide=true;this.custom(this.cur(),0)},step:function(H){var G=e();if(H||G>=this.options.duration+this.startTime){this.now=this.end;this.pos=this.state=1;this.update();this.options.curAnim[this.prop]=true;var E=true;for(var F in this.options.curAnim){if(this.options.curAnim[F]!==true){E=false}}if(E){if(this.options.display!=null){this.elem.style.overflow=this.options.overflow;this.elem.style.display=this.options.display;if(o.css(this.elem,"display")=="none"){this.elem.style.display="block"}}if(this.options.hide){o(this.elem).hide()}if(this.options.hide||this.options.show){for(var I in this.options.curAnim){o.attr(this.elem.style,I,this.options.orig[I])}}this.options.complete.call(this.elem)}return false}else{var J=G-this.startTime;this.state=J/this.options.duration;this.pos=o.easing[this.options.easing||(o.easing.swing?"swing":"linear")](this.state,J,0,1,this.options.duration);this.now=this.start+((this.end-this.start)*this.pos);this.update()}return true}};o.extend(o.fx,{speeds:{slow:600,fast:200,_default:400},step:{opacity:function(E){o.attr(E.elem.style,"opacity",E.now)},_default:function(E){if(E.elem.style&&E.elem.style[E.prop]!=null){E.elem.style[E.prop]=E.now+E.unit}else{E.elem[E.prop]=E.now}}}});if(document.documentElement.getBoundingClientRect){o.fn.offset=function(){if(!this[0]){return{top:0,left:0}}if(this[0]===this[0].ownerDocument.body){return o.offset.bodyOffset(this[0])}var G=this[0].getBoundingClientRect(),J=this[0].ownerDocument,F=J.body,E=J.documentElement,L=E.clientTop||F.clientTop||0,K=E.clientLeft||F.clientLeft||0,I=G.top+(self.pageYOffset||o.boxModel&&E.scrollTop||F.scrollTop)-L,H=G.left+(self.pageXOffset||o.boxModel&&E.scrollLeft||F.scrollLeft)-K;return{top:I,left:H}}}else{o.fn.offset=function(){if(!this[0]){return{top:0,left:0}}if(this[0]===this[0].ownerDocument.body){return o.offset.bodyOffset(this[0])}o.offset.initialized||o.offset.initialize();var J=this[0],G=J.offsetParent,F=J,O=J.ownerDocument,M,H=O.documentElement,K=O.body,L=O.defaultView,E=L.getComputedStyle(J,null),N=J.offsetTop,I=J.offsetLeft;while((J=J.parentNode)&&J!==K&&J!==H){M=L.getComputedStyle(J,null);N-=J.scrollTop,I-=J.scrollLeft;if(J===G){N+=J.offsetTop,I+=J.offsetLeft;if(o.offset.doesNotAddBorder&&!(o.offset.doesAddBorderForTableAndCells&&/^t(able|d|h)$/i.test(J.tagName))){N+=parseInt(M.borderTopWidth,10)||0,I+=parseInt(M.borderLeftWidth,10)||0}F=G,G=J.offsetParent}if(o.offset.subtractsBorderForOverflowNotVisible&&M.overflow!=="visible"){N+=parseInt(M.borderTopWidth,10)||0,I+=parseInt(M.borderLeftWidth,10)||0}E=M}if(E.position==="relative"||E.position==="static"){N+=K.offsetTop,I+=K.offsetLeft}if(E.position==="fixed"){N+=Math.max(H.scrollTop,K.scrollTop),I+=Math.max(H.scrollLeft,K.scrollLeft)}return{top:N,left:I}}}o.offset={initialize:function(){if(this.initialized){return}var L=document.body,F=document.createElement("div"),H,G,N,I,M,E,J=L.style.marginTop,K='<div style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;"><div></div></div><table style="position:absolute;top:0;left:0;margin:0;border:5px solid #000;padding:0;width:1px;height:1px;" cellpadding="0" cellspacing="0"><tr><td></td></tr></table>';M={position:"absolute",top:0,left:0,margin:0,border:0,width:"1px",height:"1px",visibility:"hidden"};for(E in M){F.style[E]=M[E]}F.innerHTML=K;L.insertBefore(F,L.firstChild);H=F.firstChild,G=H.firstChild,I=H.nextSibling.firstChild.firstChild;this.doesNotAddBorder=(G.offsetTop!==5);this.doesAddBorderForTableAndCells=(I.offsetTop===5);H.style.overflow="hidden",H.style.position="relative";this.subtractsBorderForOverflowNotVisible=(G.offsetTop===-5);L.style.marginTop="1px";this.doesNotIncludeMarginInBodyOffset=(L.offsetTop===0);L.style.marginTop=J;L.removeChild(F);this.initialized=true},bodyOffset:function(E){o.offset.initialized||o.offset.initialize();var G=E.offsetTop,F=E.offsetLeft;if(o.offset.doesNotIncludeMarginInBodyOffset){G+=parseInt(o.curCSS(E,"marginTop",true),10)||0,F+=parseInt(o.curCSS(E,"marginLeft",true),10)||0}return{top:G,left:F}}};o.fn.extend({position:function(){var I=0,H=0,F;if(this[0]){var G=this.offsetParent(),J=this.offset(),E=/^body|html$/i.test(G[0].tagName)?{top:0,left:0}:G.offset();J.top-=j(this,"marginTop");J.left-=j(this,"marginLeft");E.top+=j(G,"borderTopWidth");E.left+=j(G,"borderLeftWidth");F={top:J.top-E.top,left:J.left-E.left}}return F},offsetParent:function(){var E=this[0].offsetParent||document.body;while(E&&(!/^body|html$/i.test(E.tagName)&&o.css(E,"position")=="static")){E=E.offsetParent}return o(E)}});o.each(["Left","Top"],function(F,E){var G="scroll"+E;o.fn[G]=function(H){if(!this[0]){return null}return H!==g?this.each(function(){this==l||this==document?l.scrollTo(!F?H:o(l).scrollLeft(),F?H:o(l).scrollTop()):this[G]=H}):this[0]==l||this[0]==document?self[F?"pageYOffset":"pageXOffset"]||o.boxModel&&document.documentElement[G]||document.body[G]:this[0][G]}});o.each(["Height","Width"],function(I,G){var E=I?"Left":"Top",H=I?"Right":"Bottom",F=G.toLowerCase();o.fn["inner"+G]=function(){return this[0]?o.css(this[0],F,false,"padding"):null};o.fn["outer"+G]=function(K){return this[0]?o.css(this[0],F,false,K?"margin":"border"):null};var J=G.toLowerCase();o.fn[J]=function(K){return this[0]==l?document.compatMode=="CSS1Compat"&&document.documentElement["client"+G]||document.body["client"+G]:this[0]==document?Math.max(document.documentElement["client"+G],document.body["scroll"+G],document.documentElement["scroll"+G],document.body["offset"+G],document.documentElement["offset"+G]):K===g?(this.length?o.css(this[0],J):null):this.css(J,typeof K==="string"?K:K+"px")}})})();ISO_3166 = {
	"1_ALPHA_3": {
		"name2iso": {
			"Afghanistan": "AFG",
			"&Aring;land Islands": "ALA",
			"Albania": "ALB",
			"Algeria": "DZA",
			"American Samoa": "ASM",
			"Andorra": "AND",
			"Angola": "AGO",
			"Anguilla": "AIA",
			"Antarctica": "ATA",
			"Antigua and Barbuda": "ATG",
			"Argentina": "ARG",
			"Armenia": "ARM",
			"Aruba": "ABW",
			"Australia": "AUS",
			"Austria": "AUT",
			"Azerbaijan": "AZE",
			"Bahamas": "BHS",
			"Bahrain": "BHR",
			"Bangladesh": "BGD",
			"Barbados": "BRB",
			"Belarus": "BLR",
			"Belgium": "BEL",
			"Belize": "BLZ",
			"Benin": "BEN",
			"Bermuda": "BMU",
			"Bhutan": "BTN",
			"Bolivia, Plurinational State of": "BOL",
			"Bosnia and Herzegovina": "BIH",
			"Botswana": "BWA",
			"Bouvet Island": "BVT",
			"Brazil": "BRA",
			"British Indian Ocean Territory": "IOT",
			"Brunei Darussalam": "BRN",
			"Bulgaria": "BGR",
			"Burkina Faso": "BFA",
			"Burundi": "BDI",
			"Cambodia": "KHM",
			"Cameroon": "CMR",
			"Canada": "CAN",
			"Cape Verde": "CPV",
			"Cayman Islands": "CYM",
			"Central African Republic": "CAF",
			"Chad": "TCD",
			"Chile": "CHL",
			"China": "CHN",
			"Christmas Island": "CXR",
			"Cocos (Keeling) Islands": "CCK",
			"Colombia": "COL",
			"Comoros": "COM",
			"Congo": "COG",
			"Congo, the Democratic Republic of the": "COD",
			"Cook Islands": "COK",
			"Costa Rica": "CRI",
			"C&ocirc;te d'Ivoire": "CIV",
			"Croatia": "HRV",
			"Cuba": "CUB",
			"Cyprus": "CYP",
			"Czech Republic": "CZE",
			"Denmark": "DNK",
			"Djibouti": "DJI",
			"Dominica": "DMA",
			"Dominican Republic": "DOM",
			"Ecuador": "ECU",
			"Egypt": "EGY",
			"El Salvador": "SLV",
			"Equatorial Guinea": "GNQ",
			"Eritrea": "ERI",
			"Estonia": "EST",
			"Ethiopia": "ETH",
			"Falkland Islands (Malvinas)": "FLK",
			"Faroe Islands": "FRO",
			"Fiji": "FJI",
			"Finland": "FIN",
			"France": "FRA",
			"French Guiana": "GUF",
			"French Polynesia": "PYF",
			"French Southern Territories": "ATF",
			"Gabon": "GAB",
			"Gambia": "GMB",
			"Georgia": "GEO",
			"Germany": "DEU",
			"Ghana": "GHA",
			"Gibraltar": "GIB",
			"Greece": "GRC",
			"Greenland": "GRL",
			"Grenada": "GRD",
			"Guadeloupe": "GLP",
			"Guam": "GUM",
			"Guatemala": "GTM",
			"Guernsey": "GGY",
			"Guinea": "GIN",
			"Guinea-Bissau": "GNB",
			"Guyana": "GUY",
			"Haiti": "HTI",
			"Heard Island and McDonald Islands": "HMD",
			"Holy See (Vatican City State)": "VAT",
			"Honduras": "HND",
			"Hong Kong": "HKG",
			"Hungary": "HUN",
			"Iceland": "ISL",
			"India": "IND",
			"Indonesia": "IDN",
			"Iran, Islamic Republic of": "IRN",
			"Iraq": "IRQ",
			"Ireland": "IRL",
			"Isle of Man": "IMN",
			"Israel": "ISR",
			"Italy": "ITA",
			"Jamaica": "JAM",
			"Japan": "JPN",
			"Jersey": "JEY",
			"Jordan": "JOR",
			"Kazakhstan": "KAZ",
			"Kenya": "KEN",
			"Kiribati": "KIR",
			"Kuwait": "KWT",
			"Kyrgyzstan": "KGZ",
			"Lao People's Democratic Republic": "LAO",
			"Latvia": "LVA",
			"Lebanon": "LBN",
			"Lesotho": "LSO",
			"Liberia": "LBR",
			"Libyan Arab Jamahiriya": "LBY",
			"Liechtenstein": "LIE",
			"Lithuania": "LTU",
			"Luxembourg": "LUX",
			"Macao": "MAC",
			"Macedonia, the former Yugoslav Republic of": "MKD",
			"Madagascar": "MDG",
			"Malawi": "MWI",
			"Malaysia": "MYS",
			"Maldives": "MDV",
			"Mali": "MLI",
			"Malta": "MLT",
			"Marshall Islands": "MHL",
			"Martinique": "MTQ",
			"Mauritania": "MRT",
			"Mauritius": "MUS",
			"Mayotte": "MYT",
			"Mexico": "MEX",
			"Micronesia, Federated States of": "FSM",
			"Moldova, Republic of": "MDA",
			"Monaco": "MCO",
			"Mongolia": "MNG",
			"Montenegro": "MNE",
			"Montserrat": "MSR",
			"Morocco": "MAR",
			"Mozambique": "MOZ",
			"Myanmar": "MMR",
			"Namibia": "NAM",
			"Nauru": "NRU",
			"Nepal": "NPL",
			"Netherlands": "NLD",
			"Netherlands Antilles": "ANT",
			"New Caledonia": "NCL",
			"New Zealand": "NZL",
			"Nicaragua": "NIC",
			"Niger": "NER",
			"Nigeria": "NGA",
			"Niue": "NIU",
			"Norfolk Island": "NFK",
			//"Korea, Democratic People's Republic of": "PRK",
			"North Korea": "PRK",
			"Northern Mariana Islands": "MNP",
			"Norway": "NOR",
			"Oman": "OMN",
			"Pakistan": "PAK",
			"Palau": "PLW",
			"Palestinian Territory, Occupied": "PSE",
			"Panama": "PAN",
			"Papua New Guinea": "PNG",
			"Paraguay": "PRY",
			"Peru": "PER",
			"Philippines": "PHL",
			"Pitcairn": "PCN",
			"Poland": "POL",
			"Portugal": "PRT",
			"Puerto Rico": "PRI",
			"Qatar": "QAT",
			"R&eacute;union": "REU",
			"Romania": "ROU",
			"Russian Federation": "RUS",
			"Rwanda": "RWA",
			"Saint Barth&eacute;lemy": "BLM",
			"Saint Helena": "SHN",
			"Saint Kitts and Nevis": "KNA",
			"Saint Lucia": "LCA",
			"Saint Martin (French part)": "MAF",
			"Saint Pierre and Miquelon": "SPM",
			"Saint Vincent and the Grenadines": "VCT",
			"Samoa": "WSM",
			"San Marino": "SMR",
			"Sao Tome and Principe": "STP",
			"Saudi Arabia": "SAU",
			"Senegal": "SEN",
			"Serbia": "SRB",
			"Seychelles": "SYC",
			"Sierra Leone": "SLE",
			"Singapore": "SGP",
			"Slovakia": "SVK",
			"Slovenia": "SVN",
			"Solomon Islands": "SLB",
			"Somalia": "SOM",
			"South Africa": "ZAF",
			"South Georgia and the South Sandwich Islands": "SGS",
			//"Korea, Republic of": "KOR",
			"South Korea": "KOR",
			"Spain": "ESP",
			"Sri Lanka": "LKA",
			"Sudan": "SDN",
			"Suriname": "SUR",
			"Svalbard and Jan Mayen": "SJM",
			"Swaziland": "SWZ",
			"Sweden": "SWE",
			"Switzerland": "CHE",
			"Syrian Arab Republic": "SYR",
			"Taiwan, Province of China": "TWN",
			"Tajikistan": "TJK",
			"Tanzania, United Republic of": "TZA",
			"Thailand": "THA",
			"Timor-Leste": "TLS",
			"Togo": "TGO",
			"Tokelau": "TKL",
			"Tonga": "TON",
			"Trinidad and Tobago": "TTO",
			"Tunisia": "TUN",
			"Turkey": "TUR",
			"Turkmenistan": "TKM",
			"Turks and Caicos Islands": "TCA",
			"Tuvalu": "TUV",
			"Uganda": "UGA",
			"Ukraine": "UKR",
			"United Arab Emirates": "ARE",
			"United Kingdom": "GBR",
			"United States": "USA",
			"United States Minor Outlying Islands": "UMI",
			"Uruguay": "URY",
			"Uzbekistan": "UZB",
			"Vanuatu": "VUT",
			"Venezuela, Bolivarian Republic of": "VEN",
			"Viet Nam": "VNM",
			"Virgin Islands, British": "VGB",
			"Virgin Islands, U.S.": "VIR",
			"Wallis and Futuna": "WLF",
			"Western Sahara": "ESH",
			"Yemen": "YEM",
			"Zambia": "ZMB",
			"Zimbabwe": "ZWE"
		},
		"iso2name": {
			"ABW": "Aruba",
			"AFG": "Afghanistan",
			"AGO": "Angola",
			"AIA": "Anguilla",
			"ALA": "&Aring;land Islands",
			"ALB": "Albania",
			"AND": "Andorra",
			"ANT": "Netherlands Antilles",
			"ARE": "United Arab Emirates",
			"ARG": "Argentina",
			"ARM": "Armenia",
			"ASM": "American Samoa",
			"ATA": "Antarctica",
			"ATF": "French Southern Territories",
			"ATG": "Antigua and Barbuda",
			"AUS": "Australia",
			"AUT": "Austria",
			"AZE": "Azerbaijan",
			"BDI": "Burundi",
			"BEL": "Belgium",
			"BEN": "Benin",
			"BFA": "Burkina Faso",
			"BGD": "Bangladesh",
			"BGR": "Bulgaria",
			"BHR": "Bahrain",
			"BHS": "Bahamas",
			"BIH": "Bosnia and Herzegovina",
			"BLM": "Saint Barth&eacute;lemy",
			"BLR": "Belarus",
			"BLZ": "Belize",
			"BMU": "Bermuda",
			"BOL": "Bolivia, Plurinational State of",
			"BRA": "Brazil",
			"BRB": "Barbados",
			"BRN": "Brunei Darussalam",
			"BTN": "Bhutan",
			"BVT": "Bouvet Island",
			"BWA": "Botswana",
			"CAF": "Central African Republic",
			"CAN": "Canada",
			"CCK": "Cocos (Keeling) Islands",
			"CHE": "Switzerland",
			"CHL": "Chile",
			"CHN": "China",
			"CIV": "C&ocirc;te d'Ivoire",
			"CMR": "Cameroon",
			"COD": "Congo, the Democratic Republic of the",
			"COG": "Congo",
			"COK": "Cook Islands",
			"COL": "Colombia",
			"COM": "Comoros",
			"CPV": "Cape Verde",
			"CRI": "Costa Rica",
			"CUB": "Cuba",
			"CXR": "Christmas Island",
			"CYM": "Cayman Islands",
			"CYP": "Cyprus",
			"CZE": "Czech Republic",
			"DEU": "Germany",
			"DJI": "Djibouti",
			"DMA": "Dominica",
			"DNK": "Denmark",
			"DOM": "Dominican Republic",
			"DZA": "Algeria",
			"ECU": "Ecuador",
			"EGY": "Egypt",
			"ERI": "Eritrea",
			"ESH": "Western Sahara",
			"ESP": "Spain",
			"EST": "Estonia",
			"ETH": "Ethiopia",
			"FIN": "Finland",
			"FJI": "Fiji",
			"FLK": "Falkland Islands (Malvinas)",
			"FRA": "France",
			"FRO": "Faroe Islands",
			"FSM": "Micronesia, Federated States of",
			"GAB": "Gabon",
			"GBR": "United Kingdom",
			"GEO": "Georgia",
			"GGY": "Guernsey",
			"GHA": "Ghana",
			"GIB": "Gibraltar",
			"GIN": "Guinea",
			"GLP": "Guadeloupe",
			"GMB": "Gambia",
			"GNB": "Guinea-Bissau",
			"GNQ": "Equatorial Guinea",
			"GRC": "Greece",
			"GRD": "Grenada",
			"GRL": "Greenland",
			"GTM": "Guatemala",
			"GUF": "French Guiana",
			"GUM": "Guam",
			"GUY": "Guyana",
			"HKG": "Hong Kong",
			"HMD": "Heard Island and McDonald Islands",
			"HND": "Honduras",
			"HRV": "Croatia",
			"HTI": "Haiti",
			"HUN": "Hungary",
			"IDN": "Indonesia",
			"IMN": "Isle of Man",
			"IND": "India",
			"IOT": "British Indian Ocean Territory",
			"IRL": "Ireland",
			"IRN": "Iran, Islamic Republic of",
			"IRQ": "Iraq",
			"ISL": "Iceland",
			"ISR": "Israel",
			"ITA": "Italy",
			"JAM": "Jamaica",
			"JEY": "Jersey",
			"JOR": "Jordan",
			"JPN": "Japan",
			"KAZ": "Kazakhstan",
			"KEN": "Kenya",
			"KGZ": "Kyrgyzstan",
			"KHM": "Cambodia",
			"KIR": "Kiribati",
			"KNA": "Saint Kitts and Nevis",
			"KOR": "Korea, Republic of",
			"KWT": "Kuwait",
			"LAO": "Lao People's Democratic Republic",
			"LBN": "Lebanon",
			"LBR": "Liberia",
			"LBY": "Libyan Arab Jamahiriya",
			"LCA": "Saint Lucia",
			"LIE": "Liechtenstein",
			"LKA": "Sri Lanka",
			"LSO": "Lesotho",
			"LTU": "Lithuania",
			"LUX": "Luxembourg",
			"LVA": "Latvia",
			"MAC": "Macao",
			"MAF": "Saint Martin (French part)",
			"MAR": "Morocco",
			"MCO": "Monaco",
			"MDA": "Moldova, Republic of",
			"MDG": "Madagascar",
			"MDV": "Maldives",
			"MEX": "Mexico",
			"MHL": "Marshall Islands",
			"MKD": "Macedonia, the former Yugoslav Republic of",
			"MLI": "Mali",
			"MLT": "Malta",
			"MMR": "Myanmar",
			"MNE": "Montenegro",
			"MNG": "Mongolia",
			"MNP": "Northern Mariana Islands",
			"MOZ": "Mozambique",
			"MRT": "Mauritania",
			"MSR": "Montserrat",
			"MTQ": "Martinique",
			"MUS": "Mauritius",
			"MWI": "Malawi",
			"MYS": "Malaysia",
			"MYT": "Mayotte",
			"NAM": "Namibia",
			"NCL": "New Caledonia",
			"NER": "Niger",
			"NFK": "Norfolk Island",
			"NGA": "Nigeria",
			"NIC": "Nicaragua",
			"NIU": "Niue",
			"NLD": "Netherlands",
			"NOR": "Norway",
			"NPL": "Nepal",
			"NRU": "Nauru",
			"NZL": "New Zealand",
			"OMN": "Oman",
			"PAK": "Pakistan",
			"PAN": "Panama",
			"PCN": "Pitcairn",
			"PER": "Peru",
			"PHL": "Philippines",
			"PLW": "Palau",
			"PNG": "Papua New Guinea",
			"POL": "Poland",
			"PRI": "Puerto Rico",
			"PRK": "Korea, Democratic People's Republic of",
			"PRT": "Portugal",
			"PRY": "Paraguay",
			"PSE": "Palestinian Territory, Occupied",
			"PYF": "French Polynesia",
			"QAT": "Qatar",
			"REU": "R&eacute;union",
			"ROU": "Romania",
			"RUS": "Russian Federation",
			"RWA": "Rwanda",
			"SAU": "Saudi Arabia",
			"SDN": "Sudan",
			"SEN": "Senegal",
			"SGP": "Singapore",
			"SGS": "South Georgia and the South Sandwich Islands",
			"SHN": "Saint Helena",
			"SJM": "Svalbard and Jan Mayen",
			"SLB": "Solomon Islands",
			"SLE": "Sierra Leone",
			"SLV": "El Salvador",
			"SMR": "San Marino",
			"SOM": "Somalia",
			"SPM": "Saint Pierre and Miquelon",
			"SRB": "Serbia",
			"STP": "Sao Tome and Principe",
			"SUR": "Suriname",
			"SVK": "Slovakia",
			"SVN": "Slovenia",
			"SWE": "Sweden",
			"SWZ": "Swaziland",
			"SYC": "Seychelles",
			"SYR": "Syrian Arab Republic",
			"TCA": "Turks and Caicos Islands",
			"TCD": "Chad",
			"TGO": "Togo",
			"THA": "Thailand",
			"TJK": "Tajikistan",
			"TKL": "Tokelau",
			"TKM": "Turkmenistan",
			"TLS": "Timor-Leste",
			"TON": "Tonga",
			"TTO": "Trinidad and Tobago",
			"TUN": "Tunisia",
			"TUR": "Turkey",
			"TUV": "Tuvalu",
			"TWN": "Taiwan, Province of China",
			"TZA": "Tanzania, United Republic of",
			"UGA": "Uganda",
			"UKR": "Ukraine",
			"UMI": "United States Minor Outlying Islands",
			"URY": "Uruguay",
			"USA": "United States",
			"UZB": "Uzbekistan",
			"VAT": "Holy See (Vatican City State)",
			"VCT": "Saint Vincent and the Grenadines",
			"VEN": "Venezuela, Bolivarian Republic of",
			"VGB": "Virgin Islands, British",
			"VIR": "Virgin Islands, U.S.",
			"VNM": "Viet Nam",
			"VUT": "Vanuatu",
			"WLF": "Wallis and Futuna",
			"WSM": "Samoa",
			"YEM": "Yemen",
			"ZAF": "South Africa",
			"ZMB": "Zambia",
			"ZWE": "Zimbabwe"
		}
	},
	"2:AU": {
		"name2iso": {
			"Australian Capital Territory": "ACT",
			"New South Wales": "NSW",
			"Northern Territory": "NT",
			"Queensland": "QLD",
			"South Australia": "SA",
			"Tasmania": "TAS",
			"Victoria": "VIC",
			"Western Australia": "WA"
		},
		"iso2name": {
			"ACT": "Australian Capital Territory",
			"NSW": "New South Wales",
			"NT": "Northern Territory",
			"QLD": "Queensland",
			"SA": "South Australia",
			"TAS": "Tasmania",
			"VIC": "Victoria",
			"WA": "Western Australia"
		}
	},
	"2:CA": {
		"iso2name": {
			"AB": "Alberta",
			"BC": "British Columbia",
			"MB": "Manitoba",
			"NB": "New Brunswick",
			"NL": "Newfoundland and Labrador",
			"NS": "Nova Scotia",
			"NT": "Northwest Territories",
			"NU": "Nunavut",
			"ON": "Ontario",
			"PE": "Prince Edward Island",
			"QC": "Quebec",
			"SK": "Saskatchewan",
			"YT": "Yukon"
		},
		"name2iso": {
			"Alberta": "AB",
			"British Columbia": "BC",
			"Manitoba": "MB",
			"New Brunswick": "NB",
			"Newfoundland and Labrador": "NL",
			"Northwest Territories": "NT",
			"Nova Scotia": "NS",
			"Nunavut": "NU",
			"Ontario": "ON",
			"Prince Edward Island": "PE",
			"Quebec": "QC",
			"Saskatchewan": "SK",
			"Yukon": "YT"
		}
	},
	"2:US": {
		"name2iso": {
			"Alabama": "AL",
			"Alaska": "AK",
			"Arizona": "AZ",
			"Arkansas": "AR",
			"California": "CA",
			"Colorado": "CO",
			"Connecticut": "CT",
			"Delaware": "DE",
			"District of Columbia": "DC",
			"Florida": "FL",
			"Georgia": "GA",
			"Hawaii": "HI",
			"Idaho": "ID",
			"Illinois": "IL",
			"Indiana": "IN",
			"Iowa": "IA",
			"Kansas": "KS",
			"Kentucky": "KY",
			"Louisiana": "LA",
			"Maine": "ME",
			"Maryland": "MD",
			"Massachusetts": "MA",
			"Michigan": "MI",
			"Minnesota": "MN",
			"Mississippi": "MS",
			"Missouri": "MO",
			"Montana": "MT",
			"Nebraska": "NE",
			"Nevada": "NV",
			"New Hampshire": "NH",
			"New Jersey": "NJ",
			"New Mexico": "NM",
			"New York": "NY",
			"North Carolina": "NC",
			"North Dakota": "ND",
			"Ohio": "OH",
			"Oklahoma": "OK",
			"Oregon": "OR",
			"Pennsylvania": "PA",
			"Rhode Island and Providence Plantations": "RI",
			"South Carolina": "SC",
			"South Dakota": "SD",
			"Tennessee": "TN",
			"Texas": "TX",
			"Utah": "UT",
			"Vermont": "VT",
			"Virginia": "VA",
			"Washington": "WA",
			"West Virginia": "WV",
			"Wisconsin": "WI",
			"Wyoming": "WY"
		},
		"iso2name": {
			"AK": "Alaska",
			"AL": "Alabama",
			"AR": "Arkansas",
			"AZ": "Arizona",
			"CA": "California",
			"CO": "Colorado",
			"CT": "Connecticut",
			"DC": "District of Columbia",
			"DE": "Delaware",
			"FL": "Florida",
			"GA": "Georgia",
			"HI": "Hawaii",
			"IA": "Iowa",
			"ID": "Idaho",
			"IL": "Illinois",
			"IN": "Indiana",
			"KS": "Kansas",
			"KY": "Kentucky",
			"LA": "Louisiana",
			"MA": "Massachusetts",
			"MD": "Maryland",
			"ME": "Maine",
			"MI": "Michigan",
			"MN": "Minnesota",
			"MO": "Missouri",
			"MS": "Mississippi",
			"MT": "Montana",
			"NC": "North Carolina",
			"ND": "North Dakota",
			"NE": "Nebraska",
			"NH": "New Hampshire",
			"NJ": "New Jersey",
			"NM": "New Mexico",
			"NV": "Nevada",
			"NY": "New York",
			"OH": "Ohio",
			"OK": "Oklahoma",
			"OR": "Oregon",
			"PA": "Pennsylvania",
			"RI": "Rhode Island and Providence Plantations",
			"SC": "South Carolina",
			"SD": "South Dakota",
			"TN": "Tennessee",
			"TX": "Texas",
			"UT": "Utah",
			"VA": "Virginia",
			"VT": "Vermont",
			"WA": "Washington",
			"WI": "Wisconsin",
			"WV": "West Virginia",
			"WY": "Wyoming"
		}
	}
};
// some aliases
ISO_3166.countries = ISO_3166["1_ALPHA_3"];
ISO_3166.usa = ISO_3166["2:US"];// bug in IE when using replaceWith - duplicates content, lose event handlers
// this from http://dev.jquery.com/ticket/2697
$.fn.replaceWith = function(value) {
	return this.each(function() {
		var e = $(this);
		var s = e.next();
		var p = e.parent();
		e.remove();
		if (s.size())
			s.before(value);
		else
			p.append(value);
	});
}
DependentInputs = {
	rows: [],
	values: {},
	dependencies: [],
	decoyValue: "Please select...",
	rowClass: "advSearchLine",
	fieldClass: "advSearchLineField",
	valClass: "advSearchLineValue",
	addDependency: function(f) {
		this.dependencies.push(f);
	},
	makeSelect: function($container,values,attrs,addDecoy) {
		var $select = $("<select></select>");
		if(addDecoy) {
			$select.append($("<option>"+this.decoyValue+"</option>"));
		}
		for(var i=0; i<values.length; i++) {
			$select.append($("<option>"+values[i]+"</option>"));
		}
		if(addDecoy) {
			$select.append($("<option></option>"));
		}
		if(attrs) {
			$select.attr(attrs);
		}
		if($container) {
			$container.append($select);
		}
		return $select;
	},
	makeInput: function($container,attrs) {
		var $input = $('<input type="text" />').appendTo($container);
		if(attrs) {
			$input.attr(attrs);
		}
		return $input;
	},
	addChangeHandler: function($select,i) {
		var getChanged = function(event) {
			var $target = $(event.target);
			var changed;
			if($target.hasClass(DependentInputs.fieldClass)) {
				changed = "field";
			} else if ($target.hasClass(DependentInputs.valClass)) {
				changed = "value";
			} else {
				throw new Error("something changed other than field or value in row, index "+i+", class: "+$target.className);
			}
			DependentInputs.checkAll(i,changed);
		};
		$select.change(getChanged);
	},
	addRow: function(container,field,val,i) {
		i = i || 0;
		var $field = $(container).find(field).eq(i);
		var $val = $(container).find(val).eq(i);
		return this.convert($field,$val);
	},
	addRows: function(container,field,val,rowSelector) {
		var $fields = $(container).find(field);
		var $vals = $(container).find(val);
		var $rowShells;
		if(rowSelector) {
			$rowShells = $(container).find(rowSelector);
		}
		return this.convert($fields,$vals,$rowShells);
	},
	convert: function($fields,$vals,$rowShells) {
		if($fields.length!==$vals.length) {
			throw new Error("error when converting rows - fields and vals not the same length - fields: "+$fields.length+", vals: "+$vals.length);
		} else if($rowShells && $rowShells.length!==$vals.length) {
			throw new Error("error when converting rows - rowShells and row-pairs not the same length - rowShells: "+$rowShells.length+", row-pairs: "+$vals.length);
		}
		var $field, $val, $rowShell;
		var $row;
		var n;
		for(var i=0;i<$fields.length;i++) {
			$field = $($fields[i]);
			$val = $($vals[i]);
			if($rowShells) {
				$rowShell = $($rowShells[i]);
			}
			$row = $rowShell || $field.parent();
			$row.field = $field;
			$row.field.addClass(this.fieldClass);
			if(!$row.field.val() && $row.field.get(0).innerHTML) {
				// field is static, not an input
				$row.field.val($row.field.get(0).innerHTML);
			}
			$row.val = $val;
			$row.val.addClass(this.valClass);
			n = DependentInputs.rows.push($row)-1;
			this.addChangeHandler($row,n);
		}
		this.checkAll(n,"field");
		return n;
	},
	createRow: function(container) {
		var $container = $(container);
		var $row = $("<div></div>").appendTo($container);
		var i = this.rows.push($row)-1;
		$row.addClass(this.rowClass);
		$row.field = this.makeSelect($row,this.fields,{
			"name":"adv_"+i+"_field"
		});
		$row.field.addClass(this.fieldClass);
		$row.val = this.makeInput($row, {
			"name":"adv_"+i+"_value",
			"size":"35"
		});
		$row.val.addClass(this.valClass);
		$row.button = $("<button>-</button>").appendTo($row).click(function() {
			// have to figure out i again, as it might have changed
			var i = $('.'+DependentInputs.rowClass).index($(this).parent());
			DependentInputs.rows.splice(i,1);
			var name;
			$container.find('.'+DependentInputs.rowClass+':gt('+i+')').each(function(n) {
				$(this).find(':input:not(button)').each(function() {
					name = $(this).attr('name').replace(i+1+n,i+n);
					$(this).attr('name',name);
				});
			});
			$row.remove();
			DependentInputs.checkAll(0,"field");
		});
		this.addChangeHandler($row.field,i);
		this.checkAll(i,"field");
		return i;
	},
	setDecoy: function() {
		var oldSetDecoy = this.setDecoy;
		var cancelDecoys = function() {
			$(this).find('select').each(function(i) {
				if($(this).val()===DependentInputs.decoyValue) {
					$(this).val("");
				}
			});
		};
		var $row = this.rows[0];
		$row.closest('form').submit(cancelDecoys);
		this.setDecoy = function() {
			return false;
		};
		this.setDecoy.restore = function() {
			DependentInputs.setDecoy = oldSetDecoy;
			$row.closest('form').unbind('submit',cancelDecoys);
		};
	},
	replaceValues: function(i,values) {
		// JRL: note - should only create hidden drop-down if there is a $row.valueMap, otherwise it's not needed - the mechanism to update such a thing is currently in the added dependencies - might want to think about bringing that in
		var $row = this.rows[i];
		// prep the form for throwing away decoy values on submission
		this.setDecoy();
		$row.values = values;
		var className = $row.val.get(0).className;
		var inputName = $row.val.attr('name');
		var currVal = $row.val.val();
		var $hid = $('<input type="hidden" />');
		$hid.attr({
			"name":inputName
		});
		var $select = this.makeSelect(null,values,null,true);
		$row.val.replaceWith($select);
		$row.val = $select;
		this.addChangeHandler($row.val,i);
		$row.val.attr("name","_ignore_"+inputName);
		$row.val.after($hid);
		$row.val.get(0).className = className;
		if(currVal) {
			if($row.valueMap) {
				for(var i in $row.valueMap) {
					if($row.valueMap[i]===currVal) {
						currVal = i; // the map is a reverse map in this context
					}
				}
			}
			$row.val.val(currVal);
			$row.val.trigger("change");
		}
	},
	checkAll: function(i,changed) {
		// JRL: I am not convinced that checking the 'ith' row first makes any difference to the outcome, nor that this 'i' is updated when rows are removed - suggest removing this use of 'i'
		if(this.rows.length) {
			DependentInputs.checkRow(i,changed);
			for(var j=0;j<DependentInputs.rows.length;j++) {
				if(j!==i) {
					// all other lines are candidates for changing their values, so check their dependencies as if they'd just changed their field to its current value
					DependentInputs.checkRow(j,"field");
				}
			}
		}
	},
	checkRow: function(i,changed) {
		var $row = this.rows[i];
		var matched = false;
		var values;
		for(var d=0; d<this.dependencies.length; d++) {
			values = this.dependencies[d]($row,changed);
			if(values) {
				matched = true;
				if($row.values!==values) {
					this.replaceValues(i,values);
					if($row.button) {
						$row.button.appendTo($row);
					}
				}
				//break;
			}
		}
		// if there are no dependencies matched and we're a drop-down, it's time to change back to an input
		if(!matched && $row.values && changed==="field") {
			delete $row.values;
			delete $row.valuesMap;
			var $hid = $row.find('input:hidden').remove();
			var className = $row.val.get(0).className;
			var $inp = this.makeInput(null, {
				name: $hid.attr('name'),
				"size":"35"
			});
			$row.val.replaceWith($inp);
			$row.val = $inp;
			$row.val.addClass(className);
			if($row.button) {
				$row.button.appendTo($row);
			}
		}
	}
};

DependentInputs.values.countries = (function() {
	var countries = [];
	for(var i in ISO_3166.countries.name2iso) {
		countries.push(i);
	}
	return countries;
})();

DependentInputs.values.us_states = (function() {
	var states = [];
	for(var i in ISO_3166.usa.name2iso) {
		states.push(i);
	}
	return states;
})();

DependentInputs.values.aus_states = (function() {
	var states = [];
	for(var i in ISO_3166["2:AU"].name2iso) {
		states.push(i);
	}
	return states;
})();

DependentInputs.values.ca_states = (function() {
	var states = [];
	for(var i in ISO_3166["2:CA"].name2iso) {
		states.push(i);
	}
	return states;
})();

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational Country") {
		$row.valueMap = ISO_3166.countries.name2iso;
		return DependentInputs.values.countries;
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Registered Country") {
		$row.valueMap = ISO_3166.countries.name2iso;
		return DependentInputs.values.countries;
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Operational Country" && $r.val.val()==="United States") {
				$row.valueMap = ISO_3166.usa.name2iso;
				return DependentInputs.values.us_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Registered State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Registered Country" && $r.val.val()==="United States") {
				$row.valueMap = ISO_3166.usa.name2iso;
				return DependentInputs.values.us_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Operational Country" && $r.val.val()==="Australia") {
				$row.valueMap = ISO_3166["2:AU"].name2iso;
				return DependentInputs.values.aus_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Registered State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Registered Country" && $r.val.val()==="Australia") {
				$row.valueMap = ISO_3166["2:AU"].name2iso;
				return DependentInputs.values.aus_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Operational State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Operational Country" && $r.val.val()==="Canada") {
				$row.valueMap = ISO_3166["2:CA"].name2iso;
				return DependentInputs.values.ca_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="field" && $row.field.val()==="Registered State") {
		var $r;
		for(var i=0;i<DependentInputs.rows.length;i++) {
			$r = DependentInputs.rows[i];
			if($r.field.val()==="Registered Country" && $r.val.val()==="Canada") {
				$row.valueMap = ISO_3166["2:CA"].name2iso;
				return DependentInputs.values.ca_states;
			}
		}
	}
});

DependentInputs.addDependency(function($row,changed) {
	if(changed==="value") {
		var inpVal = $row.val.val();
		var mappedVal = $row.valueMap[inpVal] || "";
		$row.find('input:hidden').eq(0).val(mappedVal);
	}
});

DependentInputs.fields = [
	'Legal Name',
	'Previous Name_s_',
	'Trades As Name_s_',
	'Trading Status',
	'Company Website',
	'Registered Country',
	'Operational PO Box',
	'Operational Floor',
	'Operational Building',
	'Operational Street 1',
	'Operational Street 2',
	'Operational Street 3',
	'Operational City',
	'Operational State',
	'Operational Country',
	'Operational Postcode'
];/* app.js */
// override search links to use ajax_search as soon as possible
/* disabled until ajax_search fixed for logged-in people - JS error
$('a[href^="/search"]').each(function() {
	var href = $(this).attr('href');
	$(this).attr('href', href.replace("/search", "/pages/ajax_search"));
});*/
function parseQueryString(q) {
	var params = {};
	if(q.charAt(0)==="?") {
		q=q.substring(1);
	}
	q=q.replace(/\+/g," ");
	var pairs = q.split("&");
	var pair, key, value;
	for(var i=0; i<pairs.length; i++) {
		pair = decodeURIComponent(pairs[i]).split("=");
		key = pair[0];
		value = pair[1];
		if(value!=="") {
			if(!params[key]) {
				params[key] = [];
			}
			params[key].push(value);
		}
	}
	return params;
}
function addAdvSearchLine() {
	try {
	var container = '#advancedSearchContainer';
	
	var i = DependentInputs.createRow(container);
	var $row = DependentInputs.rows[i];
	
	var filterOnChange = function(elem,selectedIndex) {
		selectedIndex = selectedIndex || $row.field.get(0).selectedIndex;
		/* restore these lines when we can support "Any Field"
		if(selectedIndex===0) { // "Any Field"
			oTable.fnFilter(this.value);
		} else {
			// filter on columns assuming the select input doesn't include the AVID field
			oTable.fnFilter(this.value,selectedIndex);
		}*/
		if(oTable) {
			oTable.fnFilter(elem ? elem.value : "",selectedIndex+1);
			oTable.fixedHeader.fnUpdate(true);
		}
	};
	
	$row.change(function(event) {
		filterOnChange(event.target);
	});
	$row.keyup(function(event) {
		if($(event.target).is("input")) {
			filterOnChange(event.target);
		}
	});
	// reveal if not shown
	var $container = $(container);
	if($container.css('display')==="none") {
		$container.slideDown(250);
		/* have to put this here until FixedHeader can cope with the page changing length after it's been initialised - it's after a timeout because the revealAdvancedSearch function takes that long to complete */
		window.setTimeout(function() {
			if(oTable && oTable.fixedHeader) {
				oTable.fixedHeader.fnUpdate(true);
			}
		}, 300);
	}
	return $row;
	} catch(ex) {
		console.log(ex);
	}
}
$(document).ready(function() {
	// set advanced search on a slider
	$('#search .advanced').css('cursor','pointer').click(function() {
		addAdvSearchLine();
	});
	$('#tableinfo .filter a').click(function() {
		addAdvSearchLine();
	});
	// fill in search box and filters with current query
	var q = window.location.search;
	if(q) {
		var params = parseQueryString(q);
		if(params.q) {
			$('#company_search_box').val(params.q.join(" "));
		}
		for(var i in params) {
			if(i.match(/adv_\d{1,2}_field/)) {
				var val = params[i.replace('_field', '_value')];
				if(val && val[0]) {
					addAdvSearchLine()
						.find('input')
						.val(val[0])
						.prev()
						.val(params[i].join(" "))
						.change();
				}
			}
		}
	}
	if($('.operational_country, .operational_state, .registered_country, .registered_state').length) {
		var replaceCode = function(elem,code) {
			if(code) {
				var stateMap;
				stateMap = ISO_3166[code.toLowerCase()] || ISO_3166["2:"+code];
				if(stateMap) {
					$(elem).text(stateMap.iso2name[$(elem).text()]);
				}
			}
		};
		$('.operational_state').each(function() {
			var code = $.trim($('.operational_country').text());
			replaceCode(this,code);
		});
		$('.registered_state').each(function() {
			var code = $.trim($('.registered_country').text());
			replaceCode(this,code);
		});
		$('.operational_country, .registered_country').each(function(i) {
			$(this).text(ISO_3166.countries.iso2name[$(this).text()]);
		});
	}
	if($('#suggest_new, #challenge, #request').length!==0) {
		DependentInputs.addDependency(function($row,changed) {
			if(changed==="field" && $row.field.attr("for")==="country") {
				$row.valueMap = ISO_3166.countries.name2iso;
				return DependentInputs.values.countries;
			}
		});
		if($('table.fields').length) {
			DependentInputs.addRows('table.fields',"label",":input","tr");
		}
		DependentInputs.addRow('div.right',"label[for=country]","label[for=country]+input");
		var $hiddenWhileRendering = $('table.fields, div.right');
		if($hiddenWhileRendering.length) {
			$hiddenWhileRendering.css("visibility","visible");
		}
	}
	if($('#backnav').length) {
		$('#backnav').click(function() {
			window.history.go(-1);
			return false;
		});
	}
	// now show hidden things
	$('.onlyjs').css('visibility','visible');
});
/* to move tabs into a clickable tab interface */
$(document).ready(function() {
	var tabWidth, tabMargin, newWidth;
	var $companyDiv = $('#recordcontainer');
	if($companyDiv.length) {
		$('#recordcontainer .record').each(function() {
			var $elem = $(this);
			$elem.css({'float':'left'});
			$('.entitycontent', $elem).css({
				"position":"absolute",
				"left":"0"
			});
			if(!$elem.hasClass("selected")) {
				$('.entitycontent',$elem).hide();
			}
		});
		$('#recordcontainer .tab').click(function() {
			var i = $('#recordcontainer .tab').index(this);
			$('#recordcontainer .record.selected').removeClass('selected').find('.entitycontent').hide();
			var $entitycontent = $(this).parent().addClass('selected').end().next();
			if(i>0) {
				$entitycontent.css({
					"left": -($(this).width()*i + 5*(i-1))
				});
			}
			$entitycontent.show();
			var origHeight = $('#recordcontainer').height();
			var overlap = origHeight+$companyDiv.offset().top - ($entitycontent.height()+$entitycontent.offset().top);
			/* 24 is entitycontent padding; 10 is added spacing around alt-buttons */
			$('#recordcontainer').height(origHeight-overlap+24+$('.alt-buttons:eq(0)').height()+10);
			/* that calculation is not efficient, but more understandable than removing origHeight from equation */
		}).each(function(i) {
			if(i!==0) {
				$(this).css("margin-left","5px");
			}
		});
		$companyDiv.removeClass('hide').css("visibility", "visible");
		$('#recordcontainer .tab').eq(0).click();
		var addressText = $.trim((//$companyDiv.find('.adr .street-address').text() + " " +
			$companyDiv.find('.adr .locality').text() + " " +
			$companyDiv.find('.adr .region').text() + " " +
			$companyDiv.find('.adr .country-name').text() + " " +
			$companyDiv.find('.adr .postal-code').text()).replace(/[\n|\r]/g,"").replace(/(\s)+/g," "));
		window.gMaps.op_address = addressText;
	}
});/*
 * File:        jquery.dataTables.js
 * Version:     1.5.1
 * CVS:         $Id$
 * Description: Paginate, search and sort HTML tables
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Created:     28/3/2008
 * Modified:    $Date$ by $Author$
 * Language:    Javascript
 * License:     GPL v2 or BSD 3 point style
 * Project:     Mtaala
 * Contact:     allan.jardine@sprymedia.co.uk
 * 
 * Copyright 2008-2009 Allan Jardine, all rights reserved.
 *
 * This source file is free software, under either the GPL v2 license or a
 * BSD style license, as supplied with this software.
 * 
 * This source file is distributed in the hope that it will be useful, but 
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY 
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 * 
 * For details pleease refer to: http://www.datatables.net
 */

/*
 * When considering jsLint, we need to allow eval() as it it is used for reading cookies and 
 * building the dynamic multi-column sort functions.
 */
/*jslint evil: true, undef: true, browser: true */
/*globals $, jQuery,_fnReadCookie,_fnProcessingDisplay,_fnDraw,_fnSort,_fnReDraw,_fnDetectType,_fnSortingClasses,_fnSettingsFromNode,_fnBuildSearchArray,_fnCalculateEnd,_fnFeatureHtmlProcessing,_fnFeatureHtmlPaginate,_fnFeatureHtmlInfo,_fnFeatureHtmlFilter,_fnFilter,_fnSaveState,_fnFilterColumn,_fnEscapeRegex,_fnFilterComplete,_fnFeatureHtmlLength,_fnGetDataMaster,_fnVisibleToColumnIndex,_fnDrawHead,_fnAddData,_fnGetTrNodes,_fnColumnIndexToVisible,_fnCreateCookie,_fnAddOptionsHtml,_fnMap,_fnClearTable,_fnDataToSearch,_fnReOrderIndex,_fnFilterCustom,_fnVisbleColumns,_fnAjaxUpdate,_fnAjaxUpdateDraw,_fnColumnOrdering,fnGetMaxLenString*/

(function($) {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * DataTables variables
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Variable: dataTableSettings
	 * Purpose:  Store the settings for each dataTables instance
	 * Scope:    jQuery.fn
	 */
	$.fn.dataTableSettings = [];
	
	/*
	 * Variable: dataTableExt
	 * Purpose:  Container for customisable parts of DataTables
	 * Scope:    jQuery.fn
	 */
	$.fn.dataTableExt = {};
	var _oExt = $.fn.dataTableExt; /* Short reference for fast internal lookup */
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * DataTables extensible objects
	 * 
	 * The _oExt object is used to provide an area where user dfined plugins can be 
	 * added to DataTables. The following properties of the object are used:
	 *   oApi - Plug-in API functions
	 *   aTypes - Auto-detection of types
	 *   oSort - Sorting functions used by DataTables (based on the type)
	 *   oPagination - Pagination functions for different input styles
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Variable: sVersion
	 * Purpose:  Version string for plug-ins to check compatibility
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.sVersion = "1.5.1";
	
	/*
	 * Variable: iApiIndex
	 * Purpose:  Index for what 'this' index API functions should use
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.iApiIndex = 0;
	
	/*
	 * Variable: oApi
	 * Purpose:  Container for plugin API functions
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.oApi = { };
	
	/*
	 * Variable: aFiltering
	 * Purpose:  Container for plugin filtering functions
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.afnFiltering = [ ];
	
	/*
	 * Variable: aoFeatures
	 * Purpose:  Container for plugin function functions
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    Array of objects with the following parameters:
	 *   fnInit: Function for initialisation of Feature. Takes oSettings and returns node
	 *   cFeature: Character that will be matched in sDom - case sensitive
	 *   sFeature: Feature name - just for completeness :-)
	 */
	_oExt.aoFeatures = [ ];
	
	/*
	 * Variable: ofnSearch
	 * Purpose:  Container for custom filtering functions
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    This is an object (the name should match the type) for custom filtering function,
	 *   which can be used for live DOM checking or formatted text filtering
	 */
	_oExt.ofnSearch = { };
	
	/*
	 * Variable: oPagination
	 * Purpose:  Container for the various type of pagination that dataTables supports
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt.oPagination = {
		/*
		 * Variable: two_button
		 * Purpose:  Standard two button (forward/back) pagination
	 	 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"two_button": {
			/*
			 * Function: oPagination.two_button.fnInit
			 * Purpose:  Initalise dom elements required for pagination with forward/back buttons only
			 * Returns:  -
	 		 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, fnCallbackDraw )
			{
				var nPaging = oSettings.anFeatures.p;
				
				/* Store the next and previous elements in the oSettings object as they can be very
				 * usful for automation - particularly testing
				 */
				oSettings.nPrevious = document.createElement( 'div' );
				oSettings.nNext = document.createElement( 'div' );
				
				if ( oSettings.sTableId !== '' )
				{
					nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
					oSettings.nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					oSettings.nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
				}
				
				oSettings.nPrevious.className = "paginate_disabled_previous";
				oSettings.nNext.className = "paginate_disabled_next";
				
				oSettings.nPrevious.title = oSettings.oLanguage.oPaginate.sPrevious;
				oSettings.nNext.title = oSettings.oLanguage.oPaginate.sNext;
				
				nPaging.appendChild( oSettings.nPrevious );
				nPaging.appendChild( oSettings.nNext );
				$(nPaging).insertAfter( oSettings.nTable );
				
				$(oSettings.nPrevious).click( function() {
					oSettings._iDisplayStart -= oSettings._iDisplayLength;
					
					/* Correct for underrun */
					if ( oSettings._iDisplayStart < 0 )
					{
					  oSettings._iDisplayStart = 0;
					}
					
					fnCallbackDraw( oSettings );
				} );
				
				$(oSettings.nNext).click( function() {
					/* Make sure we are not over running the display array */
					if ( oSettings._iDisplayStart + oSettings._iDisplayLength < oSettings.fnRecordsDisplay() )
					{
						oSettings._iDisplayStart += oSettings._iDisplayLength;
					}
					
					fnCallbackDraw( oSettings );
				} );
				
				/* Take the brutal approach to cancelling text selection */
				$(oSettings.nPrevious).bind( 'selectstart', function () { return false; } );
				$(oSettings.nNext).bind( 'selectstart', function () { return false; } );
			},
			
			/*
			 * Function: oPagination.two_button.fnUpdate
			 * Purpose:  Update the two button pagination at the end of the draw
			 * Returns:  -
	 		 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.anFeatures.p )
				{
					return;
				}
				
				oSettings.nPrevious.className = 
					( oSettings._iDisplayStart === 0 ) ? 
					"paginate_disabled_previous" : "paginate_enabled_previous";
				
				oSettings.nNext.className = 
					( oSettings.fnDisplayEnd() == oSettings.fnRecordsDisplay() ) ? 
					"paginate_disabled_next" : "paginate_enabled_next";
			}
		},
		
		
		/*
		 * Variable: iFullNumbersShowPages
		 * Purpose:  Change the number of pages which can be seen
	 	 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"iFullNumbersShowPages": 5,
		
		/*
		 * Variable: full_numbers
		 * Purpose:  Full numbers pagination
	 	 * Scope:    jQuery.fn.dataTableExt.oPagination
		 */
		"full_numbers": {
			/*
			 * Function: oPagination.full_numbers.fnInit
			 * Purpose:  Initalise dom elements required for pagination with a list of the pages
			 * Returns:  -
	 		 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnInit": function ( oSettings, fnCallbackDraw )
			{
				var nPaging = oSettings.anFeatures.p;
				var nFirst = document.createElement( 'span' );
				var nPrevious = document.createElement( 'span' );
				var nList = document.createElement( 'span' );
				var nNext = document.createElement( 'span' );
				var nLast = document.createElement( 'span' );
				
				nFirst.innerHTML = oSettings.oLanguage.oPaginate.sFirst;
				nPrevious.innerHTML = oSettings.oLanguage.oPaginate.sPrevious;
				nNext.innerHTML = oSettings.oLanguage.oPaginate.sNext;
				nLast.innerHTML = oSettings.oLanguage.oPaginate.sLast;
				
				nFirst.className = "paginate_button first";
				nPrevious.className = "paginate_button previous";
				nNext.className="paginate_button next";
				nLast.className = "paginate_button last";
				
				if ( oSettings.sTableId !== '' )
				{
					nPaging.setAttribute( 'id', oSettings.sTableId+'_paginate' );
					nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					nPrevious.setAttribute( 'id', oSettings.sTableId+'_previous' );
					nNext.setAttribute( 'id', oSettings.sTableId+'_next' );
					nLast.setAttribute( 'id', oSettings.sTableId+'_last' );
				}
				
				nPaging.appendChild( nFirst );
				nPaging.appendChild( nPrevious );
				nPaging.appendChild( nList );
				nPaging.appendChild( nNext );
				nPaging.appendChild( nLast );
				
				$(nFirst).click( function () {
					oSettings._iDisplayStart = 0;
					fnCallbackDraw( oSettings );
				} );
				
				$(nPrevious).click( function() {
					oSettings._iDisplayStart -= oSettings._iDisplayLength;
					
					/* Correct for underrun */
					if ( oSettings._iDisplayStart < 0 )
					{
					  oSettings._iDisplayStart = 0;
					}
					
					fnCallbackDraw( oSettings );
				} );
				
				$(nNext).click( function() {
					/* Make sure we are not over running the display array */
					if ( oSettings._iDisplayStart + oSettings._iDisplayLength < oSettings.fnRecordsDisplay() )
					{
						oSettings._iDisplayStart += oSettings._iDisplayLength;
					}
					
					fnCallbackDraw( oSettings );
				} );
				
				$(nLast).click( function() {
					var iPages = parseInt( (oSettings.fnRecordsDisplay()-1) / oSettings._iDisplayLength, 10 ) + 1;
					oSettings._iDisplayStart = (iPages-1) * oSettings._iDisplayLength;
					
					fnCallbackDraw( oSettings );
				} );
				
				/* Take the brutal approach to cancelling text selection */
				$('span', nPaging).bind( 'mousedown', function () { return false; } );
				$('span', nPaging).bind( 'selectstart', function () { return false; } );
				
				oSettings.nPaginateList = nList;
			},
			
			/*
			 * Function: oPagination.full_numbers.fnUpdate
			 * Purpose:  Update the list of page buttons shows
			 * Returns:  -
	 		 * Inputs:   object:oSettings - dataTables settings object
			 *           function:fnCallbackDraw - draw function which must be called on update
			 */
			"fnUpdate": function ( oSettings, fnCallbackDraw )
			{
				if ( !oSettings.anFeatures.p )
				{
					return;
				}
				
				var iPageCount = jQuery.fn.dataTableExt.oPagination.iFullNumbersShowPages;
				var iPageCountHalf = Math.floor(iPageCount / 2);
				var iPages = Math.ceil((oSettings.fnRecordsDisplay()) / oSettings._iDisplayLength);
				var iCurrentPage = Math.ceil(oSettings._iDisplayStart / oSettings._iDisplayLength) + 1;
				var sList = "";
				var iStartButton;
				var iEndButton;
				
				if (iPages < iPageCount)
				{
					iStartButton = 1;
					iEndButton = iPages;
				}
				else
				{
					if (iCurrentPage <= iPageCountHalf)
					{
						iStartButton = 1;
						iEndButton = iPageCount;
					}
					else
					{
						if (iCurrentPage >= (iPages - iPageCountHalf))
						{
							iStartButton = iPages - iPageCount + 1;
							iEndButton = iPages;
						}
						else
						{
							iStartButton = iCurrentPage - Math.ceil(iPageCount / 2) + 1;
							iEndButton = iStartButton + iPageCount - 1;
						}
					}
				}
				
				for ( var i=iStartButton ; i<=iEndButton ; i++ )
				{
					if ( iCurrentPage != i )
					{
						sList += '<span class="paginate_button">'+i+'</span>';
					}
					else
					{
						sList += '<span class="paginate_active">'+i+'</span>';
					}
				}
				
				oSettings.nPaginateList.innerHTML = sList;
				
				/* Take the brutal approach to cancelling text selection */
				$('span', oSettings.nPaginateList).bind( 'mousedown', function () { return false; } );
				$('span', oSettings.nPaginateList).bind( 'selectstart', function () { return false; } );
				
				$('span', oSettings.nPaginateList).click( function() {
					var iTarget = (this.innerHTML * 1) - 1;
					oSettings._iDisplayStart = iTarget * oSettings._iDisplayLength;
					
					fnCallbackDraw( oSettings );
					return false;
				} );
			}
		}
	};
	
	/*
	 * Variable: oSort
	 * Purpose:  Wrapper for the sorting functions that can be used in DataTables
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    The functions provided in this object are basically standard javascript sort
	 *   functions - they expect two inputs which they then compare and then return a priority
	 *   result. For each sort method added, two functions need to be defined, an ascending sort and
	 *   a descending sort.
	 */
	_oExt.oSort = {
		/*
		 * text sorting
		 */
		"string-asc": function ( a, b )
		{
			var x = a.toLowerCase();
			var y = b.toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"string-desc": function ( a, b )
		{
			var x = a.toLowerCase();
			var y = b.toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * html sorting (ignore html tags)
		 */
		"html-asc": function ( a, b )
		{
			var x = a.replace( /<.*?>/g, "" ).toLowerCase();
			var y = b.replace( /<.*?>/g, "" ).toLowerCase();
			return ((x < y) ? -1 : ((x > y) ? 1 : 0));
		},
		
		"html-desc": function ( a, b )
		{
			var x = a.replace( /<.*?>/g, "" ).toLowerCase();
			var y = b.replace( /<.*?>/g, "" ).toLowerCase();
			return ((x < y) ? 1 : ((x > y) ? -1 : 0));
		},
		
		
		/*
		 * date sorting
		 */
		"date-asc": function ( a, b )
		{
			var x = Date.parse( a );
			var y = Date.parse( b );
			
			if ( isNaN( x ) )
			{
    		x = Date.parse( "01/01/1970 00:00:00" );
			}
			if ( isNaN( y ) )
			{
				y =	Date.parse( "01/01/1970 00:00:00" );
			}
			
			return x - y;
		},
		
		"date-desc": function ( a, b )
		{
			var x = Date.parse( a );
			var y = Date.parse( b );
			
			if ( isNaN( x ) )
			{
    		x = Date.parse( "01/01/1970 00:00:00" );
			}
			if ( isNaN( y ) )
			{
				y =	Date.parse( "01/01/1970 00:00:00" );
			}
			
			return y - x;
		},
		
		
		/*
		 * numerical sorting
		 */
		"numeric-asc": function ( a, b )
		{
			var x = a == "-" ? 0 : a;
			var y = b == "-" ? 0 : b;
			return x - y;
		},
		
		"numeric-desc": function ( a, b )
		{
			var x = a == "-" ? 0 : a;
			var y = b == "-" ? 0 : b;
			return y - x;
		}
	};
	
	
	/*
	 * Variable: aTypes
	 * Purpose:  Container for the various type of type detection that dataTables supports
	 * Scope:    jQuery.fn.dataTableExt
	 * Notes:    The functions in this array are expected to parse a string to see if it is a data
	 *   type that it recognises. If so then the function should return the name of the type (a
	 *   corresponding sort function should be defined!), if the type is not recognised then the
	 *   function should return null such that the parser and move on to check the next type.
	 *   Note that ordering is important in this array - the functions are processed linearly,
	 *   starting at index 0.
	 */
	_oExt.aTypes = [
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is numeric
		 * Returns:  string:'numeric' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			/* Snaity check that we are dealing with a string or quick return for a number */
			if ( typeof sData == 'number' )
			{
				return 'numeric';
			}
			else if ( typeof sData.charAt != 'function' )
			{
				return null;
			}
			
			var sValidFirstChars = "0123456789-";
			var sValidChars = "0123456789.";
			var Char;
			var bDecimal = false;
			
			/* Check for a valid first char (no period and allow negatives) */
			Char = sData.charAt(0); 
			if (sValidFirstChars.indexOf(Char) == -1) 
			{
				return null;
			}
			
			/* Check all the other characters are valid */
			for ( var i=1 ; i<sData.length ; i++ ) 
			{
				Char = sData.charAt(i); 
				if (sValidChars.indexOf(Char) == -1) 
				{
					return null;
				}
				
				/* Only allowed one decimal place... */
				if ( Char == "." )
				{
					if ( bDecimal )
					{
						return null;
					}
					bDecimal = true;
				}
			}
			
			return 'numeric';
		},
		
		/*
		 * Function: -
		 * Purpose:  Check to see if a string is actually a formatted date
		 * Returns:  string:'date' or null
		 * Inputs:   string:sText - string to check
		 */
		function ( sData )
		{
			var iParse = Date.parse(sData);
			if ( iParse !== null && !isNaN(iParse) )
			{
				return 'date';
			}
			return null;
		}
	];
	
	
	/*
	 * Variable: _oExternConfig
	 * Purpose:  Store information for DataTables to access globally about other instances
	 * Scope:    jQuery.fn.dataTableExt
	 */
	_oExt._oExternConfig = {
		/* int:iNextUnique - next unique number for an instance */
		"iNextUnique": 0
	};
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * DataTables prototype
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	
	/*
	 * Function: dataTable
	 * Purpose:  DataTables information
	 * Returns:  -
	 * Inputs:   object:oInit - initalisation options for the table
	 */
	$.fn.dataTable = function( oInit )
	{
		/*
		 * Variable: _aoSettings
		 * Purpose:  Easy reference to data table settings
		 * Scope:    jQuery.dataTable
		 */
		var _aoSettings = $.fn.dataTableSettings;
		
		/*
		 * Function: classSettings
		 * Purpose:  Settings container function for all 'class' properties which are required
		 *   by dataTables
		 * Returns:  -
		 * Inputs:   -
		 */
		function classSettings ()
		{
			this.fnRecordsTotal = function ()
			{
				if ( this.oFeatures.bServerSide ) {
					return this._iRecordsTotal;
				} else {
					return this.aiDisplayMaster.length;
				}
			};
			
			this.fnRecordsDisplay = function ()
			{
				if ( this.oFeatures.bServerSide ) {
					return this._iRecordsDisplay;
				} else {
					return this.aiDisplay.length;
				}
			};
			
			this.fnDisplayEnd = function ()
			{
				if ( this.oFeatures.bServerSide ) {
					return this._iDisplayStart + this.aiDisplay.length;
				} else {
					return this._iDisplayEnd;
				}
			};
			
			/*
			 * Variable: sInstance
			 * Purpose:  Unique idendifier for each instance of the DataTables object
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.sInstance = null;
			
			/*
			 * Variable: oFeatures
			 * Purpose:  Indicate the enablement of key dataTable features
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.oFeatures = {
				"bPaginate": true,
				"bLengthChange": true,
				"bFilter": true,
				"bSort": true,
				"bInfo": true,
				"bAutoWidth": true,
				"bProcessing": false,
				"bSortClasses": true,
				"bStateSave": false,
				"bServerSide": false
			};
			
			/*
			 * Variable: anFeatures
			 * Purpose:  Array referencing the nodes which are used for the features
			 * Scope:    jQuery.dataTable.classSettings 
			 * Notes:    The parameters of this object match what is allowed by sDom - i.e.
			 *   'l' - Length changing
			 *   'f' - Filtering input
			 *   't' - The table!
			 *   'i' - Information
			 *   'p' - Pagination
			 *   'r' - pRocessing
			 */
			this.anFeatures = [];
			
			/*
			 * Variable: oLanguage
			 * Purpose:  Store the language strings used by dataTables
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    The words in the format _VAR_ are variables which are dynamically replaced
			 *   by javascript
			 */
			this.oLanguage = {
				"sProcessing": "Processing...",
				"sLengthMenu": "Show _MENU_ entries",
				"sZeroRecords": "No matching records found",
				"sInfo": "Showing _START_ to _END_ of _TOTAL_ entries",
				"sInfoEmpty": "Showing 0 to 0 of 0 entries",
				"sInfoFiltered": "(filtered from _MAX_ total entries)",
				"sInfoPostFix": "",
				"sSearch": "Search:",
				"sUrl": "",
				"oPaginate": {
					"sFirst":    "First",
					"sPrevious": "Previous",
					"sNext":     "Next",
					"sLast":     "Last"
				}
			};
			
			/*
			 * Variable: aoData
			 * Purpose:  Store data information
			 * Scope:    jQuery.dataTable.classSettings 
			 * Notes:    This is an array of objects with the following parameters:
			 *   int: _iId - internal id for tracking
			 *   array: _aData - internal data - used for sorting / filtering etc
			 *   node: nTr - display node
			 *   array node: _anHidden - hidden TD nodes
			 */
			this.aoData = [];
			
			/*
			 * Variable: aiDisplay
			 * Purpose:  Array of indexes which are in the current display (after filtering etc)
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aiDisplay = [];
			
			/*
			 * Variable: aiDisplayMaster
			 * Purpose:  Array of indexes for display - no filtering
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aiDisplayMaster = [];
							
			/*
			 * Variable: aoColumns
			 * Purpose:  Store information about each column that is in use
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.aoColumns = [];
			
			/*
			 * Variable: iNextId
			 * Purpose:  Store the next unique id to be used for a new row
			 * Scope:    jQuery.dataTable.classSettings 
			 */
			this.iNextId = 0;
			
			/*
			 * Variable: asDataSearch
			 * Purpose:  Search data array for regular expression searching
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.asDataSearch = [];
			
			/*
			 * Variable: oPreviousSearch
			 * Purpose:  Store the previous search incase we want to force a re-search
			 *   or compare the old search to a new one
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.oPreviousSearch = {
				"sSearch": "",
				"bEscapeRegex": true
			};
			
			/*
			 * Variable: aoPreSearchCols
			 * Purpose:  Store the previous search for each column
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aoPreSearchCols = [];
			
			/*
			 * Variable: aaSorting
			 * Purpose:  Sorting information
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aaSorting = [ [0, 'asc'] ];
			
			/*
			 * Variable: aaSortingFixed
			 * Purpose:  Sorting information that is always applied
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.aaSortingFixed = null;
			
			/*
			 * Variable: asStripClasses
			 * Purpose:  Classes to use for the striping of a table
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.asStripClasses = [ 'odd', 'even' ];
			
			/*
			 * Variable: fnRowCallback
			 * Purpose:  Call this function every time a row is inserted (draw)
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnRowCallback = null;
			
			/*
			 * Variable: fnHeaderCallback
			 * Purpose:  Callback function for the header on each draw
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnHeaderCallback = null;
			
			/*
			 * Variable: fnFooterCallback
			 * Purpose:  Callback function for the footer on each draw
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnFooterCallback = null;
			
			/*
			 * Variable: fnDrawCallback
			 * Purpose:  Callback function for the whole table on each draw
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnDrawCallback = null;
			
			/*
			 * Variable: fnInitComplete
			 * Purpose:  Callback function for when the table has been initalised
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnInitComplete = null;
			
			/*
			 * Variable: sTableId
			 * Purpose:  Cache the table ID for quick access
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sTableId = "";
			
			/*
			 * Variable: nTable
			 * Purpose:  Cache the table node for quick access
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.nTable = null;
			
			/*
			 * Variable: iDefaultSortIndex
			 * Purpose:  Sorting index which will be used by default
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.iDefaultSortIndex = 0;
			
			/*
			 * Variable: bInitialised
			 * Purpose:  Indicate if all required information has been read in
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bInitialised = false;
			
			/*
			 * Variable: aoOpenRows
			 * Purpose:  Information about open rows
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    Has the parameters 'nTr' and 'nParent'
			 */
			this.aoOpenRows = [];
			
			/*
			 * Variable: sDomPositioning
			 * Purpose:  Dictate the positioning that the created elements will take
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    The following syntax is expected:
			 *   'l' - Length changing
			 *   'f' - Filtering input
			 *   't' - The table!
			 *   'i' - Information
			 *   'p' - Pagination
			 *   'r' - pRocessing
			 *   '<' and '>' - div elements
			 *   '<"class" and '>' - div with a class
			 *    Examples: '<"wrapper"flipt>', '<lf<t>ip>'
			 */
			this.sDomPositioning = 'lfrtip';
			
			/*
			 * Variable: sPaginationType
			 * Purpose:  Note which type of sorting should be used
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sPaginationType = "two_button";
			
			/*
			 * Variable: iCookieDuration
			 * Purpose:  The cookie duration (for bStateSave) in seconds - default 2 hours
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.iCookieDuration = 60 * 60 * 2;
			
			/*
			 * Variable: sAjaxSource
			 * Purpose:  Source url for AJAX data for the table
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.sAjaxSource = null;
			
			/*
			 * Variable: bAjaxDataGet
			 * Purpose:  Note if draw should be blocked while getting data
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.bAjaxDataGet = true;
			
			/*
			 * Variable: fnServerData
			 * Purpose:  Function to get the server-side data - can be overruled by the developer
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.fnServerData = $.getJSON;
			
			/*
			 * Variable: iServerDraw
			 * Purpose:  Counter and tracker for server-side processing draws
			 * Scope:    jQuery.dataTable.classSettings
			 */
			this.iServerDraw = 0;
			
			/*
			 * Variable: _iDisplayLength, _iDisplayStart, _iDisplayEnd
			 * Purpose:  Display length variables
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    These variable must NOT be used externally to get the data length. Rather, use
			 *   the fnRecordsTotal() (etc) functions.
			 */
			this._iDisplayLength = 10;
			this._iDisplayStart = 0;
			this._iDisplayEnd = 10;
			
			/*
			 * Variable: _iRecordsTotal, _iRecordsDisplay
			 * Purpose:  Display length variables used for server side processing
			 * Scope:    jQuery.dataTable.classSettings
			 * Notes:    These variable must NOT be used externally to get the data length. Rather, use
			 *   the fnRecordsTotal() (etc) functions.
			 */
			this._iRecordsTotal = 0;
			this._iRecordsDisplay = 0;
		}
		
		/*
		 * Variable: oApi
		 * Purpose:  Container for publicly exposed 'private' functions
		 * Scope:    jQuery.dataTable
		 */
		this.oApi = {};
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * API functions
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
		
		/*
		 * Function: fnDraw
		 * Purpose:  Redraw the table
		 * Returns:  -
		 * Inputs:   -
		 */
		this.fnDraw = function()
		{
			_fnReDraw( _fnSettingsFromNode( this[_oExt.iApiIndex] ) );
		};
		
		/*
		 * Function: fnFilter
		 * Purpose:  Filter the input based on data
		 * Returns:  -
		 * Inputs:   string:sInput - string to filter the table on
		 *           int:iColumn - optional - column to limit filtering to
		 *           bool:bEscapeRegex - optional - escape regex characters or not - default true
		 */
		this.fnFilter = function( sInput, iColumn, bEscapeRegex )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			if ( typeof bEscapeRegex == 'undefined' )
			{
				bEscapeRegex = true;
			}
			
			if ( typeof iColumn == "undefined" || iColumn === null )
			{
				/* Global filter */
				_fnFilterComplete( oSettings, {"sSearch":sInput, "bEscapeRegex": bEscapeRegex}, 1 );
			}
			else
			{
				/* Single column filter */
				oSettings.aoPreSearchCols[ iColumn ].sSearch = sInput;
				oSettings.aoPreSearchCols[ iColumn ].bEscapeRegex = bEscapeRegex;
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
		};
		
		/*
		 * Function: fnSettings
		 * Purpose:  Get the settings for a particular table for extern. manipulation
		 * Returns:  -
		 * Inputs:   -
		 */
		this.fnSettings = function( nNode  )
		{
			return _fnSettingsFromNode( this[_oExt.iApiIndex] );
		};
		
		/*
		 * Function: fnSort
		 * Purpose:  Sort the table by a particular row
		 * Returns:  -
		 * Inputs:   int:iCol - the data index to sort on. Note that this will
		 *   not match the 'display index' if you have hidden data entries
		 */
		this.fnSort = function( aaSort )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			oSettings.aaSorting = aaSort;
			_fnSort( oSettings );
		};
		
		/*
		 * Function: fnAddData
		 * Purpose:  Add new row(s) into the table
		 * Returns:  array int: array of indexes (aoData) which have been added (zero length on error)
		 * Inputs:   array:mData - the data to be added. The length must match
		 *               the original data from the DOM
		 *             or
		 *             array array:mData - 2D array of data to be added
		 *           bool:bRedraw - redraw the table or not - default true
		 * Notes:    Warning - the refilter here will cause the table to redraw
		 *             starting at zero
		 * Notes:    Thanks to Yekimov Denis for contributing the basis for this function!
		 */
		this.fnAddData = function( mData, bRedraw )
		{
			var aiReturn = [];
			var iTest;
			if ( typeof bRedraw == 'undefined' )
			{
				bRedraw = true;
			}
			
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			/* Check if we want to add multiple rows or not */
			if ( typeof mData[0] == "object" )
			{
				for ( var i=0 ; i<mData.length ; i++ )
				{
					iTest = _fnAddData( oSettings, mData[i] );
					if ( iTest == -1 )
					{
						return aiReturn;
					}
					aiReturn.push( iTest );
				}
			}
			else
			{
				iTest = _fnAddData( oSettings, mData );
				if ( iTest == -1 )
				{
					return aiReturn;
				}
				aiReturn.push( iTest );
			}
			
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			/* Rebuild the search */
			_fnBuildSearchArray( oSettings, 1 );
			
			if ( bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return aiReturn;
		};
		
		/*
		 * Function: fnDeleteRow
		 * Purpose:  Remove a row for the table
		 * Returns:  array:aReturn - the row that was deleted
		 * Inputs:   int:iIndex - index of aoData to be deleted
		 *           function:fnCallBack - callback function - default null
		 *           bool:bNullRow - remove the row information from aoData by setting the value to
		 *             null - default false
		 * Notes:    This function requires a little explanation - we don't actually delete the data
		 *   from aoData - rather we remove it's references from aiDisplayMastr and aiDisplay. This
		 *   in effect prevnts DataTables from drawing it (hence deleting it) - it could be restored
		 *   if you really wanted. The reason for this is that actually removing the aoData object
		 *   would mess up all the subsequent indexes in the display arrays (they could be ajusted - 
		 *   but this appears to do what is required).
		 */
		this.fnDeleteRow = function( iAODataIndex, fnCallBack, bNullRow )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var i;
			
			/* Delete from the display master */
			for ( i=0 ; i<oSettings.aiDisplayMaster.length ; i++ )
			{
				if ( oSettings.aiDisplayMaster[i] == iAODataIndex )
				{
					oSettings.aiDisplayMaster.splice( i, 1 );
					break;
				}
			}
			
			/* Delete from the current display index */
			for ( i=0 ; i<oSettings.aiDisplay.length ; i++ )
			{
				if ( oSettings.aiDisplay[i] == iAODataIndex )
				{
					oSettings.aiDisplay.splice( i, 1 );
					break;
				}
			}
			
			/* Rebuild the search */
			_fnBuildSearchArray( oSettings, 1 );
			
			/* If there is a user callback function - call it */
			if ( typeof fnCallBack == "function" )
			{
				fnCallBack.call( this );
			}
			
			/* Check for an 'overflow' they case for dislaying the table */
			if ( oSettings._iDisplayStart >= oSettings.aiDisplay.length )
			{
				oSettings._iDisplayStart -= oSettings._iDisplayLength;
				if ( oSettings._iDisplayStart < 0 )
				{
					oSettings._iDisplayStart = 0;
				}
			}
			
			_fnCalculateEnd( oSettings );
			_fnDraw( oSettings );
			
			/* Return the data array from this row */
			var aData = oSettings.aoData[iAODataIndex]._aData.slice();
			
			if ( typeof bNullRow != "undefined" && bNullRow === true )
			{
				oSettings.aoData[iAODataIndex] = null;
			}
			
			return aData;
		};
		
		/*
		 * Function: fnClearTable
		 * Purpose:  Quickly and simply clear a table
		 * Returns:  -
		 * Inputs:   bool:bRedraw - redraw the table or not - default true
		 * Notes:    Thanks to Yekimov Denis for contributing the basis for this function!
		 */
		this.fnClearTable = function( bRedraw )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			_fnClearTable( oSettings );
			
			if ( typeof bRedraw == 'undefined' || bRedraw )
			{
				_fnDraw( oSettings );
			}
		};
		
		/*
		 * Function: fnOpen
		 * Purpose:  Open a display row (append a row after the row in question)
		 * Returns:  -
		 * Inputs:   node:nTr - the table row to 'open'
		 *           string:sHtml - the HTML to put into the row
		 *           string:sClass - class to give the new cell
		 */
		this.fnOpen = function( nTr, sHtml, sClass )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			/* the old open one if there is one */
			this.fnClose( nTr );
			
			
			var nNewRow = document.createElement("tr");
			var nNewCell = document.createElement("td");
			nNewRow.appendChild( nNewCell );
			nNewCell.className = sClass;
			nNewCell.colSpan = _fnVisbleColumns( oSettings );
			nNewCell.innerHTML = sHtml;
			
			$(nNewRow).insertAfter(nTr);
			
			/* No point in storing the row if using server-side processing since the nParent will be
			 * nuked on a re-draw anyway
			 */
			if ( !oSettings.oFeatures.bServerSide )
			{
				oSettings.aoOpenRows.push( {
					"nTr": nNewRow,
					"nParent": nTr
				} );
			}
		};
		
		/*
		 * Function: fnClose
		 * Purpose:  Close a display row
		 * Returns:  int: 0 (success) or 1 (failed)
		 * Inputs:   node:nTr - the table row to 'close'
		 */
		this.fnClose = function( nTr )
		{
			/* Find settings from table node */
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			for ( var i=0 ; i<oSettings.aoOpenRows.length ; i++ )
			{
				if ( oSettings.aoOpenRows[i].nParent == nTr )
				{
					var nTrParent = oSettings.aoOpenRows[i].nTr.parentNode;
					if ( nTrParent )
					{
						/* Remove it if it is currently on display */
						nTrParent.removeChild( oSettings.aoOpenRows[i].nTr );
					}
					oSettings.aoOpenRows.splice( i, 1 );
					return 0;
				}
			}
			return 1;
		};
		
		/*
		 * Function: fnGetData
		 * Purpose:  Return an array with the data which is used to make up the table
		 * Returns:  array array string: 2d data array ([row][column]) or array string: 1d data array
		 *           or
		 *           array string (if iRow specified)
		 * Inputs:   int:iRow - optional - if present then the array returned will be the data for
		 *             the row with the index 'iRow'
		 */
		this.fnGetData = function( iRow )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			if ( typeof iRow != 'undefined' )
			{
				return oSettings.aoData[iRow]._aData;
			}
			return _fnGetDataMaster( oSettings );
		};
		
		/*
		 * Function: fnGetNodes
		 * Purpose:  Return an array with the TR nodes used for drawing the table
		 * Returns:  array node: TR elements
		 *           or
		 *           node (if iRow specified)
		 * Inputs:   int:iRow - optional - if present then the array returned will be the node for
		 *             the row with the index 'iRow'
		 */
		this.fnGetNodes = function( iRow )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			
			if ( typeof iRow != 'undefined' )
			{
				return oSettings.aoData[iRow].nTr;
			}
			return _fnGetTrNodes( oSettings );
		};
		
		/*
		 * Function: fnGetPosition
		 * Purpose:  Get the array indexes of a particular cell from it's DOM element
		 * Returns:  int: - row index, or array[ int, int ]: - row index and column index
		 * Inputs:   node:nNode - this can either be a TR or a TD in the table, the return is
		 *             dependent on this input
		 */
		this.fnGetPosition = function( nNode )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var i;
			
			if ( nNode.nodeName == "TR" )
			{
				for ( i=0 ; i<oSettings.aoData.length ; i++ )
				{
					if ( oSettings.aoData[i].nTr == nNode )
					{
						return i;
					}
				}
			}
			else if ( nNode.nodeName == "TD" )
			{
				for ( i=0 ; i<oSettings.aoData.length ; i++ )
				{
					var iCorrector = 0;
					for ( var j=0 ; j<oSettings.aoColumns.length ; j++ )
					{
						if ( oSettings.aoColumns[j].bVisible )
						{
							//$('>td', oSettings.aoData[i].nTr)[j-iCorrector] == nNode )
							if ( oSettings.aoData[i].nTr.getElementsByTagName('td')[j-iCorrector] == nNode )
							{
								return [ i, j-iCorrector, j ];
							}
						}
						else
						{
							iCorrector++;
						}
					}
				}
			}
			return null;
		};
		
		/*
		 * Function: fnUpdate
		 * Purpose:  Update a table cell or row
		 * Returns:  int: 0 okay, 1 error
		 * Inputs:   array string 'or' string:mData - data to update the cell/row with
		 *           int:iRow - the row (from aoData) to update
		 *           int:iColumn - the column to update
		 *           bool:bRedraw - redraw the table or not - default true
		 */
		this.fnUpdate = function( mData, iRow, iColumn, bRedraw )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var iVisibleColumn;
			var sDisplay;
			if ( typeof bRedraw == 'undefined' )
			{
				bRedraw = true;
			}
			
			if ( typeof mData != 'object' )
			{
				sDisplay = mData;
				oSettings.aoData[iRow]._aData[iColumn] = sDisplay;
				
				if ( oSettings.aoColumns[iColumn].fnRender !== null )
				{
					sDisplay = oSettings.aoColumns[iColumn].fnRender( {
						"iDataRow": iRow,
						"iDataColumn": iColumn,
						"aData": oSettings.aoData[iRow]._aData
					} );
					
					if ( oSettings.aoColumns[iColumn].bUseRendered )
					{
						oSettings.aoData[iRow]._aData[iColumn] = sDisplay;
					}
				}
				
				iVisibleColumn = _fnColumnIndexToVisible( oSettings, iColumn );
				if ( iVisibleColumn !== null )
				{
					oSettings.aoData[iRow].nTr.getElementsByTagName('td')[iVisibleColumn].innerHTML = 
						sDisplay;
				}
			}
			else
			{
				if ( mData.length != oSettings.aoColumns.length )
				{
					alert( 'Warning: An array passed to fnUpdate must have the same number of columns as '+
						'the table in question - in this case '+oSettings.aoColumns.length );
					return 1;
				}
				
				for ( var i=0 ; i<mData.length ; i++ )
				{
					sDisplay = mData[i];
					oSettings.aoData[iRow]._aData[i] = sDisplay;
					
					if ( oSettings.aoColumns[i].fnRender !== null )
					{
						sDisplay = oSettings.aoColumns[i].fnRender( {
							"iDataRow": iRow,
							"iDataColumn": i,
							"aData": oSettings.aoData[iRow]._aData
						} );
						
						if ( oSettings.aoColumns[i].bUseRendered )
						{
							oSettings.aoData[iRow]._aData[i] = sDisplay;
						}
					}
					
					iVisibleColumn = _fnColumnIndexToVisible( oSettings, i );
					if ( iVisibleColumn !== null )
					{
						oSettings.aoData[iRow].nTr.getElementsByTagName('td')[iVisibleColumn].innerHTML = 
							sDisplay;
					}
				}
			}
			
			/* Update the search array */
			_fnBuildSearchArray( oSettings, 1 );
			
			/* Redraw the table */
			if ( bRedraw )
			{
				_fnReDraw( oSettings );
			}
			return 0;
		};
		
		
		/*
		 * Function: fnShowColoumn
		 * Purpose:  Show a particular column
		 * Returns:  -
		 * Inputs:   int:iCol - the column whose display should be changed
		 *           bool:bShow - show (true) or hide (false) the column
		 */
		this.fnSetColumnVis = function ( iCol, bShow )
		{
			var oSettings = _fnSettingsFromNode( this[_oExt.iApiIndex] );
			var i, iLen;
			var iColumns = oSettings.aoColumns.length;
			var nTd;
			
			/* No point in doing anything if we are requesting what is already true */
			if ( oSettings.aoColumns[iCol].bVisible == bShow )
			{
				return;
			}
			
			var nTrHead = $('thead tr', oSettings.nTable)[0];
			var nTrFoot = $('tfoot tr', oSettings.nTable)[0];
			var anTheadTh = [];
			var anTfootTh = [];
			for ( i=0 ; i<iColumns ; i++ )
			{
				anTheadTh.push( oSettings.aoColumns[i].nTh );
				anTfootTh.push( oSettings.aoColumns[i].nTf );
			}
			
			/* Show the column */
			if ( bShow )
			{
				var iInsert = 0;
				for ( i=0 ; i<iCol ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						iInsert++;
					}
				}
				
				/* Need to decide if we should use appendChild or insertBefore */
				if ( iInsert >= _fnVisbleColumns( oSettings ) )
				{
					nTrHead.appendChild( anTheadTh[iCol] );
					if ( nTrFoot )
					{
						nTrFoot.appendChild( anTfootTh[iCol] );
					}
					
					for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
					{
						nTd = oSettings.aoData[i]._anHidden[iCol];
						oSettings.aoData[i].nTr.appendChild( nTd );
					}
				}
				else
				{
					/* Which coloumn should we be inserting before? */
					var iBefore;
					for ( i=iCol ; i<iColumns ; i++ )
					{
						iBefore = _fnColumnIndexToVisible( oSettings, i );
						if ( iBefore !== null )
						{
							break;
						}
					}
					
					nTrHead.insertBefore( anTheadTh[iCol], nTrHead.getElementsByTagName('th')[iBefore] );
					if ( nTrFoot )
					{
						nTrFoot.insertBefore( anTfootTh[iCol], nTrFoot.getElementsByTagName('th')[iBefore] );
					}
					
					for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
					{
						nTd = oSettings.aoData[i]._anHidden[iCol];
						oSettings.aoData[i].nTr.insertBefore( nTd, oSettings.aoData[i].nTr.getElementsByTagName('td')[iBefore] );
					}
				}
				
				oSettings.aoColumns[iCol].bVisible = true;
			}
			else
			{
				/* Remove a column from display */
				nTrHead.removeChild( anTheadTh[iCol] );
				if ( nTrFoot )
				{
					nTrFoot.removeChild( anTfootTh[iCol] );
				}
				
				var iVisCol = _fnColumnIndexToVisible(oSettings, iCol);
				for ( i=0, iLen=oSettings.aoData.length ; i<iLen ; i++ )
				{
					nTd = oSettings.aoData[i].nTr.getElementsByTagName('td')[ iVisCol ];
					oSettings.aoData[i]._anHidden[iCol] = nTd;
					nTd.parentNode.removeChild( nTd );
				}
				
				oSettings.aoColumns[iCol].bVisible = false;
			}
			
			/* If there are any 'open' rows, then we need to alter the colspan for this col change */
			for ( i=0, iLen=oSettings.aoOpenRows.length ; i<iLen ; i++ )
			{
				oSettings.aoOpenRows[i].nTr.colSpan = _fnVisbleColumns( oSettings );
			}
			
			/* Since there is no redraw done here, we need to save the state manually */
			_fnSaveState( oSettings );
		};
		
		
		/*
		 * Plugin API functions
		 * 
		 * This call will add the functions which are defined in _oExt.oApi to the
		 * DataTables object, providing a rather nice way to allow plug-in API functions. Note that
		 * this is done here, so that API function can actually override the built in API functions if
		 * required for a particular purpose.
		 */
		
		/*
		 * Function: _fnExternApiFunc
		 * Purpose:  Create a wrapper function for exporting an internal func to an external API func
		 * Returns:  function: - wrapped function
		 * Inputs:   string:sFunc - API function name
		 */
		function _fnExternApiFunc (sFunc)
		{
			return function() {
					var aArgs = [_fnSettingsFromNode(this[_oExt.iApiIndex])].concat( 
						Array.prototype.slice.call(arguments) );
					return _oExt.oApi[sFunc].apply( this, aArgs );
				};
		}
		
		for ( var sFunc in _oExt.oApi )
		{
			if ( sFunc )
			{
				/*
				 * Function: anon
				 * Purpose:  Wrap the plug-in API functions in order to provide the settings as 1st arg 
				 *   and execute in this scope
				 * Returns:  -
				 * Inputs:   -
				 */
				this[sFunc] = _fnExternApiFunc(sFunc);
			}
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Local functions
		 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Initalisation
		 */
		
		/*
		 * Function: _fnInitalise
		 * Purpose:  Draw the table for the first time, adding all required features
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnInitalise ( oSettings )
		{
			/* Ensure that the table data is fully initialised */
			if ( oSettings.bInitialised === false )
			{
				setTimeout( function(){ _fnInitalise( oSettings ); }, 200 );
				return;
			}
			
			/* Show the display HTML options */
			_fnAddOptionsHtml( oSettings );
			
			/* Draw the headers for the table */
			_fnDrawHead( oSettings );
			
			/* If there is default sorting required - let's do it. The sort function
			 * will do the drawing for us. Otherwise we draw the table
			 */
			if ( oSettings.oFeatures.bSort )
			{
				_fnSort( oSettings, false );
				/*
				 * Add the sorting classes to the header and the body (if needed).
				 * Reason for doing it here after the first draw is to stop classes being applied to the
				 * 'static' table.
				 */
				_fnSortingClasses( oSettings );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
			
			/* if there is an ajax source */
			if ( oSettings.sAjaxSource !== null && !oSettings.oFeatures.bServerSide )
			{
				_fnProcessingDisplay( oSettings, true );
				// JRL: added use of fnServerData to get the data if present
				var callback = function(json) {
					/* Got the data - add it to the table */
					for ( var i=0 ; i<json.aaData.length ; i++ )
					{
						_fnAddData( oSettings, json.aaData[i] );
					}
					
					if ( oSettings.oFeatures.bSort )
					{
						_fnSort( oSettings );
					}
					else
					{
						oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
						_fnCalculateEnd( oSettings );
						_fnDraw( oSettings );
					}
					_fnProcessingDisplay( oSettings, false );
					
					/* Run the init callback if there is one */
					if ( typeof oSettings.fnInitComplete == 'function' )
					{
						oSettings.fnInitComplete( oSettings, json );
					}
				};
				if(oSettings.fnServerData) {
					oSettings.fnServerData( oSettings.sAjaxSource, null, callback);
				} else {
					$.getJSON( oSettings.sAjaxSource, null, callback );
				}
				return;
			}
			
			/* Run the init callback if there is one */
			if ( typeof oSettings.fnInitComplete == 'function' )
			{
				oSettings.fnInitComplete( oSettings );
			}
			_fnProcessingDisplay( oSettings, false );
		}
		
		/*
		 * Function: _fnLanguageProcess
		 * Purpose:  Copy language variables from remote object to a local one
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oLanguage - Language information
		 *           bool:bInit - init once complete
		 */
		function _fnLanguageProcess( oSettings, oLanguage, bInit )
		{
			_fnMap( oSettings.oLanguage, oLanguage, 'sProcessing' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sLengthMenu' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sZeroRecords' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfo' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfoEmpty' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfoFiltered' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sInfoPostFix' );
			_fnMap( oSettings.oLanguage, oLanguage, 'sSearch' );
			
			if ( typeof oLanguage.oPaginate != 'undefined' )
			{
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sFirst' );
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sPrevious' );
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sNext' );
				_fnMap( oSettings.oLanguage.oPaginate, oLanguage.oPaginate, 'sLast' );
			}
			
			if ( bInit )
			{
				_fnInitalise( oSettings );
			}
		}
		
		/*
		 * Function: _fnAddColumn
		 * Purpose:  Add a column to the list used for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oOptions - object with sType, bVisible and bSearchable
		 *           node:nTh - the th element for this column
		 * Notes:    All options in enter column can be over-ridden by the user
		 *   initialisation of dataTables
		 */
		function _fnAddColumn( oSettings, oOptions, nTh )
		{
			oSettings.aoColumns[ oSettings.aoColumns.length++ ] = {
				"sType": null,
				"_bAutoType": true,
				"bVisible": true,
				"bSearchable": true,
				"bSortable": true,
				"sTitle": nTh ? nTh.innerHTML : '',
				"sName": '',
				"sWidth": null,
				"sClass": null,
				"fnRender": null,
				"bUseRendered": true,
				"iDataSort": oSettings.aoColumns.length-1,
				"nTh": nTh ? nTh : document.createElement('th'),
				"nTf": null
			};
			
			/* User specified column options */
			var iLength = oSettings.aoColumns.length-1;
			if ( typeof oOptions != 'undefined' && oOptions !== null )
			{
				var oCol = oSettings.aoColumns[ iLength ];
				
				if ( typeof oOptions.sType != 'undefined' )
				{
					oCol.sType = oOptions.sType;
					oCol._bAutoType = false;
				}
				
				_fnMap( oCol, oOptions, "bVisible" );
				_fnMap( oCol, oOptions, "bSearchable" );
				_fnMap( oCol, oOptions, "bSortable" );
				_fnMap( oCol, oOptions, "sTitle" );
				_fnMap( oCol, oOptions, "sName" );
				_fnMap( oCol, oOptions, "sWidth" );
				_fnMap( oCol, oOptions, "sClass" );
				_fnMap( oCol, oOptions, "fnRender" );
				_fnMap( oCol, oOptions, "bUseRendered" );
				_fnMap( oCol, oOptions, "iDataSort" );
			}
			
			/* Add a column specific filter */
			if ( typeof oSettings.aoPreSearchCols[ iLength ] == 'undefined' ||
			     oSettings.aoPreSearchCols[ iLength ] === null )
			{
				oSettings.aoPreSearchCols[ iLength ] = {
					"sSearch": "",
					"bEscapeRegex": true
				};
			}
			else if ( typeof oSettings.aoPreSearchCols[ iLength ].bEscapeRegex == 'undefined' )
			{
				/* Don't require that the user must specify bEscapeRegex */
				oSettings.aoPreSearchCols[ iLength ].bEscapeRegex = true;
			}
		}
		
		/*
		 * Function: _fnAddData
		 * Purpose:  Add a data array to the table, creating DOM node etc
		 * Returns:  int: - >=0 if successful (index of new aoData entry), -1 if failed
		 * Inputs:   object:oSettings - dataTables settings object
		 *           array:aData - data array to be added
		 */
		function _fnAddData ( oSettings, aData )
		{
			/* Sanity check the length of the new array */
			if ( aData.length != oSettings.aoColumns.length )
			{
				alert( "Warning - added data does not match known column length" );
				return -1;
			}
			
			/* Create the object for storing information about this new row */
			var iThisIndex = oSettings.aoData.length;
			oSettings.aoData.push( {
				"_iId": oSettings.iNextId++,
				"_aData": aData.slice(),
				"nTr": document.createElement('tr'),
				"_anHidden": []
			} );
			
			/* Create the cells */
			var nTd;
			for ( var i=0 ; i<aData.length ; i++ )
			{
				nTd = document.createElement('td');
				
				if ( typeof oSettings.aoColumns[i].fnRender == 'function' )
				{
					var sRendered = oSettings.aoColumns[i].fnRender( {
							"iDataRow": iThisIndex,
							"iDataColumn": i,
							"aData": aData
						} );
					nTd.innerHTML = sRendered;
					if ( oSettings.aoColumns[i].bUseRendered )
					{
						/* Use the rendered data for filtering/sorting */
						oSettings.aoData[iThisIndex]._aData[i] = sRendered;
					}
				}
				else
				{
					nTd.innerHTML = aData[i];
				}
				
				if ( oSettings.aoColumns[i].sClass !== null )
				{
					nTd.className = oSettings.aoColumns[i].sClass;
				}
				
				/* See if we should auto-detect the column type */
				if ( oSettings.aoColumns[i]._bAutoType && oSettings.aoColumns[i].sType != 'string' )
				{
					/* Attempt to auto detect the type - same as _fnGatherData() */
					if ( oSettings.aoColumns[i].sType === null )
					{
						oSettings.aoColumns[i].sType = _fnDetectType( aData[i] );
					}
					else if ( oSettings.aoColumns[i].sType == "date" || 
					          oSettings.aoColumns[i].sType == "numeric" )
					{
						oSettings.aoColumns[i].sType = _fnDetectType( aData[i] );
					}
				}
					
				if ( oSettings.aoColumns[i].bVisible )
				{
					oSettings.aoData[iThisIndex].nTr.appendChild( nTd );
				}
				else
				{
					oSettings.aoData[iThisIndex]._anHidden[i] = nTd;
				}
			}
			
			/* Add to the display array */
			oSettings.aiDisplayMaster.push( iThisIndex );
			return iThisIndex;
		}
		
		/*
		 * Function: _fnGatherData
		 * Purpose:  Read in the data from the target table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnGatherData( oSettings )
		{
			var iLoop;
			var i, j;
			
			/*
			 * Process by row first
			 * Add the data object for the whole table - storing the tr node. Note - no point in getting
			 * DOM based data if we are going to go and replace it with Ajax source data.
			 */
			if ( oSettings.sAjaxSource === null )
			{
				$('tbody:eq(0)>tr', oSettings.nTable).each( function() {
					var iThisIndex = oSettings.aoData.length;
					oSettings.aoData.push( {
						"_iId": oSettings.iNextId++,
						"_aData": [],
						"nTr": this,
						"_anHidden": []
					} );
					
					oSettings.aiDisplayMaster.push( iThisIndex );
					
					/* Add the data for this column */
					var aLocalData = oSettings.aoData[iThisIndex]._aData;
					$('td', this).each( function( i ) {
						aLocalData[i] = this.innerHTML;
					} );
				} );
			}
			
			/*
			 * Now process by column
			 */
			var iCorrector = 0;
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				/* Get the title of the column - unless there is a user set one */
				if ( oSettings.aoColumns[i].sTitle === null )
				{
					oSettings.aoColumns[i].sTitle = oSettings.aoColumns[i].nTh.innerHTML;
				}
				
				var bAutoType = oSettings.aoColumns[i]._bAutoType;
				var bRender = typeof oSettings.aoColumns[i].fnRender == 'function';
				var bClass = oSettings.aoColumns[i].sClass !== null;
				var bVisible = oSettings.aoColumns[i].bVisible;
				
				/* A single loop to rule them all (and be more efficient) */
				if ( bAutoType || bRender || bClass || !bVisible )
				{
					iLoop = oSettings.aoData.length;
					for ( j=0 ; j<iLoop ; j++ )
					{
						var nCellNode = oSettings.aoData[j].nTr.getElementsByTagName('td')[ i-iCorrector ];
						
						if ( bAutoType )
						{
							if ( oSettings.aoColumns[i].sType === null )
							{
								oSettings.aoColumns[i].sType = _fnDetectType( oSettings.aoData[j]._aData[i] );
							}
							else if ( oSettings.aoColumns[i].sType == "date" || 
							          oSettings.aoColumns[i].sType == "numeric" )
							{
								/* If type is date or numeric - ensure that all collected data
								 * in the column is of the same type
								 */
								oSettings.aoColumns[i].sType = _fnDetectType( oSettings.aoData[j]._aData[i] );
							}
							/* The else would be 'type = string' we don't want to do anything
							 * if that is the case
							 */
						}
						
						if ( bRender )
						{
							var sRendered = oSettings.aoColumns[i].fnRender( {
									"iDataRow": j,
									"iDataColumn": i,
									"aData": oSettings.aoData[j]._aData
								} );
							nCellNode.innerHTML = sRendered;
							if ( oSettings.aoColumns[i].bUseRendered )
							{
								/* Use the rendered data for filtering/sorting */
								oSettings.aoData[j]._aData[i] = sRendered;
							}
						}
						
						if ( bClass )
						{
							nCellNode.className += ' '+oSettings.aoColumns[i].sClass;
						}
						
						if ( !bVisible )
						{
							oSettings.aoData[j]._anHidden[i] = nCellNode;
							nCellNode.parentNode.removeChild( nCellNode );
						}
					}
					
					/* Keep an index corrector for the next loop */
					if ( !bVisible )
					{
						iCorrector++;
					}
				}
			}	
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Drawing functions
		 */
		
		/*
		 * Function: _fnDrawHead
		 * Purpose:  Create the HTML header for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnDrawHead( oSettings )
		{
			var i, nTh, iLen;
			var iThs = oSettings.nTable.getElementsByTagName('thead')[0].getElementsByTagName('th').length;
			var iCorrector = 0;
			
			/* If there is a header in place - then use it - otherwise it's going to get nuked... */
			if ( iThs !== 0 )
			{
				/* We've got a thead from the DOM, so remove hidden columns and apply width to vis cols */
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					//oSettings.aoColumns[i].nTh = nThs[i];
					nTh = oSettings.aoColumns[i].nTh;
					
					if ( oSettings.aoColumns[i].bVisible )
					{
						/* Set width */
						if ( oSettings.aoColumns[i].sWidth !== null )
						{
							nTh.style.width = oSettings.aoColumns[i].sWidth;
						}
						
						/* Set the title of the column if it is user defined (not what was auto detected) */
						if ( oSettings.aoColumns[i].sTitle != nTh.innerHTML )
						{
							nTh.innerHTML = oSettings.aoColumns[i].sTitle;
						}
					}
					else
					{
						nTh.parentNode.removeChild( nTh );
						iCorrector++;
					}
				}
			}
			else
			{
				/* We don't have a header in the DOM - so we are going to have to create one */
				var nTr = document.createElement( "tr" );
				
				for ( i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						nTh = oSettings.aoColumns[i].nTh;
						
						if ( oSettings.aoColumns[i].sClass !== null )
						{
							nTh.className = oSettings.aoColumns[i].sClass;
						}
						
						if ( oSettings.aoColumns[i].sWidth !== null )
						{
							nTh.style.width = oSettings.aoColumns[i].sWidth;
						}
						
						nTh.innerHTML = oSettings.aoColumns[i].sTitle;
						nTr.appendChild( nTh );
					}
				}
				$('thead', oSettings.nTable).html( '' )[0].appendChild( nTr );
			}
			
			
			/* Add sort listener */
			if ( oSettings.oFeatures.bSort )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					if ( oSettings.aoColumns[i].bSortable === false )
					{
						continue;
					}
					
					$(oSettings.aoColumns[i].nTh).click( function (e) {
						$('body').prepend('clicked header '); //JRL: debug
						var iDataIndex;
						/* Find which column we are sorting on - can't use index() due to colspan etc */
						for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
						{
							if ( oSettings.aoColumns[i].nTh == this )
							{
								iDataIndex = i;
								break;
							}
						}
						
						/* If the column is not sortable - don't to anything */
						if ( oSettings.aoColumns[iDataIndex].bSortable === false )
						{
							return;
						}
						
						/*
						 * This is a little bit odd I admit... I declare a temporary function inside the scope of
						 * _fnDrawHead and the click handler in order that the code presented here can be used 
						 * twice - once for when bProcessing is enabled, and another time for when it is 
						 * disabled, as we need to perform slightly different actions.
						 *   Basically the issue here is that the Javascript engine in modern browsers don't 
						 * appear to allow the rendering engine to update the display while it is still excuting
						 * it's thread (well - it does but only after long intervals). This means that the 
						 * 'processing' display doesn't appear for a table sort. To break the js thread up a bit
						 * I force an execution break by using setTimeout - but this breaks the expected 
						 * thread continuation for the end-developer's point of view (their code would execute
						 * too early), so we on;y do it when we absolutely have to.
						 */
						var fnInnerSorting = function () {
							if ( e.shiftKey )
							{
								/* If the shift key is pressed then we are multipe column sorting */
								var bFound = false;
								for ( var i=0 ; i<oSettings.aaSorting.length ; i++ )
								{
									if ( oSettings.aaSorting[i][0] == iDataIndex )
									{
										if ( oSettings.aaSorting[i][1] == "asc" )
										{
											oSettings.aaSorting[i][1] = "desc";
										}
										else
										{
											oSettings.aaSorting.splice( i, 1 );
										}
										bFound = true;
										break;
									}
								}
								
								if ( bFound === false )
								{
									oSettings.aaSorting.push( [ iDataIndex, "asc" ] );
								}
							}
							else
							{
								/* If no shift key then single column sort */
								if ( oSettings.aaSorting.length == 1 && oSettings.aaSorting[0][0] == iDataIndex )
								{
									oSettings.aaSorting[0][1] = oSettings.aaSorting[0][1]=="asc" ? "desc" : "asc";
								}
								else
								{
									oSettings.aaSorting.splice( 0, oSettings.aaSorting.length );
									oSettings.aaSorting.push( [ iDataIndex, "asc" ] );
								}
							}
							
							/* Run the sort */
							_fnSort( oSettings );
						}; /* /fnInnerSorting */
						
						if ( !oSettings.oFeatures.bProcessing )
						{
							fnInnerSorting();
						}
						else
						{
							_fnProcessingDisplay( oSettings, true );
							setTimeout( function() {
								fnInnerSorting();
								if ( !oSettings.oFeatures.bServerSide )
								{
									_fnProcessingDisplay( oSettings, false );
								}
							}, 0 );
						}
					} ); /* /click */
				} /* For each column */
				
				/* Take the brutal approach to cancelling text selection due to the shift key */
				$('thead th', oSettings.nTable).mousedown( function (e) {
					if ( e.shiftKey )
					{
						this.onselectstart = function() { return false; };
						return false;
					}
				} );
			} /* /if feature sort */
			
			/* Set an absolute width for the table such that pagination doesn't
			 * cause the table to resize
			 */
			if ( oSettings.oFeatures.bAutoWidth )
			{
				oSettings.nTable.style.width = oSettings.nTable.offsetWidth+"px";
			}
			
			/* Cache the footer elements */
			var nTfoot = oSettings.nTable.getElementsByTagName('tfoot');
			if ( nTfoot.length !== 0 )
			{
				iCorrector = 0;
				var nTfs = nTfoot[0].getElementsByTagName('th');
				for ( i=0, iLen=nTfs.length ; i<iLen ; i++ )
				{
					oSettings.aoColumns[i].nTf = nTfs[i-iCorrector];
					if ( !oSettings.aoColumns[i].bVisible )
					{
						nTfs[i-iCorrector].parentNode.removeChild( nTfs[i-iCorrector] );
						iCorrector++;
					}
				}
			}
		}
		
		/*
		 * Function: _fnDraw
		 * Purpose:  Insert the required TR nodes into the table for display
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnDraw( oSettings )
		{
			var i;
			var anRows = [];
			var iRowCount = 0;
			var bRowError = false;
			var iStrips = oSettings.asStripClasses.length;
			var iOpenRows = oSettings.aoOpenRows.length;
			
			/* If we are dealing with Ajax - do it here */
			if ( oSettings.oFeatures.bServerSide && 
			     !_fnAjaxUpdate( oSettings ) )
			{
				return;
			}
			
			if ( oSettings.aiDisplay.length !== 0 )
			{
				var iStart = oSettings._iDisplayStart;
				var iEnd = oSettings._iDisplayEnd;
				
				if ( oSettings.oFeatures.bServerSide )
				{
					iStart = 0;
					iEnd = oSettings.aoData.length;
				}
				
				for ( var j=iStart ; j<iEnd ; j++ )
				{
					var nRow = oSettings.aoData[ oSettings.aiDisplay[j] ].nTr;
					
					/* Remove any old stripping classes and then add the new one */
					if ( iStrips !== 0 )
					{
						$(nRow).removeClass( oSettings.asStripClasses.join(' ') );
						$(nRow).addClass( oSettings.asStripClasses[ iRowCount % iStrips ] );
					}
					
					/* Custom row callback function - might want to manipule the row */
					if ( typeof oSettings.fnRowCallback == "function" )
					{
						nRow = oSettings.fnRowCallback( nRow, 
							oSettings.aoData[ oSettings.aiDisplay[j] ]._aData, iRowCount, j );
						if ( !nRow && !bRowError )
						{
							alert( "Error: A node was not returned by fnRowCallback" );
							bRowError = true;
						}
					}
					
					anRows.push( nRow );
					iRowCount++;
					
					/* If there is an open row - and it is attached to this parent - attach it on redraw */
					if ( iOpenRows !== 0 )
					{
						for ( var k=0 ; k<iOpenRows ; k++ )
						{
							if ( nRow == oSettings.aoOpenRows[k].nParent )
							{
								anRows.push( oSettings.aoOpenRows[k].nTr );
							}
						}
					}
				}
			}
			else
			{
				/* Table is empty - create a row with an empty message in it */
				anRows[ 0 ] = document.createElement( 'tr' );
				
				if ( typeof oSettings.asStripClasses[0] != 'undefined' )
				{
					anRows[ 0 ].className = oSettings.asStripClasses[0];
				}
				
				var nTd = document.createElement( 'td' );
				nTd.setAttribute( 'valign', "top" );
				nTd.colSpan = oSettings.aoColumns.length;
				nTd.className = 'dataTables_empty';
				nTd.innerHTML = oSettings.oLanguage.sZeroRecords;
				
				anRows[ iRowCount ].appendChild( nTd );
			}
			
			/* Callback the header and footer custom funcation if there is one */
			if ( typeof oSettings.fnHeaderCallback == 'function' )
			{
				oSettings.fnHeaderCallback( $('thead tr', oSettings.nTable)[0], 
					_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(),
					oSettings.aiDisplay );
			}
			
			if ( typeof oSettings.fnFooterCallback == 'function' )
			{
				oSettings.fnFooterCallback( $('tfoot tr', oSettings.nTable)[0], 
					_fnGetDataMaster( oSettings ), oSettings._iDisplayStart, oSettings.fnDisplayEnd(),
					oSettings.aiDisplay );
			}
			
			/* 
			 * Need to remove any old row from the display - note we can't just empty the tbody using
			 * .html('') since this will unbind the jQuery event handlers (even although the node still
			 * exists!) - note the initially odd ':eq(0)>tr' expression. This basically ensures that we
			 * only get tr elements of the tbody that the data table has been initialised on. If there
			 * are nested tables then we don't want to remove those elements.
			 */
			var nTrs = $('tbody:eq(0)>tr', oSettings.nTable);
			for ( i=0 ; i<nTrs.length ; i++ )
			{
				nTrs[i].parentNode.removeChild( nTrs[i] );
			}
			
			/* Put the draw table into the dom */
			var nBody = $('tbody:eq(0)', oSettings.nTable);
			if ( nBody[0] )
			{
				for ( i=0 ; i<anRows.length ; i++ )
				{
					nBody[0].appendChild( anRows[i] );
				}
			}
			
			/* Update the pagination display buttons */
			if ( oSettings.oFeatures.bPaginate )
			{
				_oExt.oPagination[ oSettings.sPaginationType ].fnUpdate( oSettings, function( oSettings ) {
					_fnCalculateEnd( oSettings );
					_fnDraw( oSettings );
				} );
			}
			
			/* Show information about the table */
			if ( oSettings.oFeatures.bInfo && oSettings.anFeatures.i )
			{
				/* Update the information */
				if ( oSettings.fnRecordsDisplay() === 0 && 
					   oSettings.fnRecordsDisplay() == oSettings.fnRecordsTotal() )
				{
					oSettings.anFeatures.i.innerHTML = 
						oSettings.oLanguage.sInfoEmpty+ oSettings.oLanguage.sInfoPostFix;
				}
				else if ( oSettings.fnRecordsDisplay() === 0 )
				{
					oSettings.anFeatures.i.innerHTML = oSettings.oLanguage.sInfoEmpty +' '+ 
						oSettings.oLanguage.sInfoFiltered.replace('_MAX_', 
							oSettings.fnRecordsTotal())+ oSettings.oLanguage.sInfoPostFix;
				}
				else if ( oSettings.fnRecordsDisplay() == oSettings.fnRecordsTotal() )
				{
					oSettings.anFeatures.i.innerHTML = 
						oSettings.oLanguage.sInfo.
							replace('_START_',oSettings._iDisplayStart+1).
							replace('_END_',oSettings.fnDisplayEnd()).
							replace('_TOTAL_',oSettings.fnRecordsDisplay())+ 
						oSettings.oLanguage.sInfoPostFix;
				}
				else
				{
					oSettings.anFeatures.i.innerHTML = 
						oSettings.oLanguage.sInfo.
							replace('_START_',oSettings._iDisplayStart+1).
							replace('_END_',oSettings.fnDisplayEnd()).
							replace('_TOTAL_',oSettings.fnRecordsDisplay()) +' '+ 
						oSettings.oLanguage.sInfoFiltered.replace('_MAX_', oSettings.fnRecordsTotal())+ 
						oSettings.oLanguage.sInfoPostFix;
				}
			}
			
			/* Alter the sorting classes to take account of the changes */
			if ( oSettings.oFeatures.bServerSide && oSettings.oFeatures.bSort )
			{
				_fnSortingClasses( oSettings );
			}
			
			/* Save the table state on each draw */
			_fnSaveState( oSettings );
			
			/* Drawing is finished - call the callback if there is one */
			if ( typeof oSettings.fnDrawCallback == 'function' )
			{
				oSettings.fnDrawCallback( oSettings );
			}
		}
		
		/*
		 * Function: _fnReDraw
		 * Purpose:  Redraw the table - taking account of the various features which are enabled
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnReDraw( oSettings )
		{
			if ( oSettings.oFeatures.bSort )
			{
				/* Sorting will refilter and draw for us */
				_fnSort( oSettings, oSettings.oPreviousSearch );
			}
			else if ( oSettings.oFeatures.bFilter )
			{
				/* Filtering will redraw for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch );
			}
			else
			{
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}
		
		/*
		 * Function: _fnAjaxUpdate
		 * Purpose:  Update the table using an Ajax call
		 * Returns:  bool: block the table drawing or not
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnAjaxUpdate( oSettings )
		{
			if ( oSettings.bAjaxDataGet )
			{
				_fnProcessingDisplay( oSettings, true );
				var iColumns = oSettings.aoColumns.length;
				var aoData = [];
				var i;
				
				/* Paging and general */
				oSettings.iServerDraw++;
				aoData.push( { "name": "sEcho",          "value": oSettings.iServerDraw } );
				aoData.push( { "name": "iColumns",       "value": iColumns } );
				aoData.push( { "name": "sColumns",       "value": _fnColumnOrdering(oSettings) } );
				aoData.push( { "name": "iDisplayStart",  "value": oSettings._iDisplayStart } );
				aoData.push( { "name": "iDisplayLength", "value": oSettings.oFeatures.bPaginate !== false ?
					oSettings._iDisplayLength : -1 } );
				
				/* Filtering */
				if ( oSettings.oFeatures.bFilter !== false )
				{
					aoData.push( { "name": "sSearch",        "value": oSettings.oPreviousSearch.sSearch } );
					aoData.push( { "name": "bEscapeRegex",   "value": oSettings.oPreviousSearch.bEscapeRegex } );
					for ( i=0 ; i<iColumns ; i++ )
					{
						aoData.push( { "name": "sSearch_"+i,      "value": oSettings.aoPreSearchCols[i].sSearch } );
						aoData.push( { "name": "bEscapeRegex_"+i, "value": oSettings.aoPreSearchCols[i].bEscapeRegex } );
					}
				}
				
				/* Sorting */
				if ( oSettings.oFeatures.bSort !== false )
				{
					var iFixed = oSettings.aaSortingFixed !== null ? oSettings.aaSortingFixed.length : 0;
					var iUser = oSettings.aaSorting.length;
					aoData.push( { "name": "iSortingCols",   "value": iFixed+iUser } );
					for ( i=0 ; i<iFixed ; i++ )
					{
						aoData.push( { "name": "iSortCol_"+i,  "value": oSettings.aaSortingFixed[i][0] } );
						aoData.push( { "name": "iSortDir_"+i,  "value": oSettings.aaSortingFixed[i][1] } );
					}
					
					for ( i=0 ; i<iUser ; i++ )
					{
						aoData.push( { "name": "iSortCol_"+(i+iFixed),  "value": oSettings.aaSorting[i][0] } );
						aoData.push( { "name": "iSortDir_"+(i+iFixed),  "value": oSettings.aaSorting[i][1] } );
					}
				}
				
				oSettings.fnServerData( oSettings.sAjaxSource, aoData, function(json) {
					_fnAjaxUpdateDraw( oSettings, json );
				} );
				return false;
			}
			else
			{
				return true;
			}
		}
		
		/*
		 * Function: _fnAjaxUpdateDraw
		 * Purpose:  Data the data from the server (nuking the old) and redraw the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:json - json data return from the server.
		 *             The following must be defined:
		 *               iTotalRecords, iTotalDisplayRecords, aaData
		 *             The following may be defined:
		 *               sColumns
		 */
		function _fnAjaxUpdateDraw ( oSettings, json )
		{
			if ( typeof json.sEcho != 'undefined' )
			{
				/* Protect against old returns over-writing a new one. Possible when you get
				 * very fast interaction, and later queires are completed much faster
				 */
				if ( json.sEcho*1 < oSettings.iServerDraw )
				{
					return;
				}
				else
				{
					oSettings.iServerDraw = json.sEcho * 1;
				}
			}
			
			_fnClearTable( oSettings );
			oSettings._iRecordsTotal = json.iTotalRecords;
			oSettings._iRecordsDisplay = json.iTotalDisplayRecords;
			
			/* Determine if reordering is required */
			var sOrdering = _fnColumnOrdering(oSettings);
			var bReOrder = (json.sColumns != 'undefined' && sOrdering !== "" && json.sColumns != sOrdering );
			if ( bReOrder )
			{
				var aiIndex = _fnReOrderIndex( oSettings, json.sColumns );
			}
			
			for ( var i=0, iLen=json.aaData.length ; i<iLen ; i++ )
			{
				if ( bReOrder )
				{
					/* If we need to re-order, then create a new array with the correct order and add it */
					var aData = [];
					for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
					{
						aData.push( json.aaData[i][ aiIndex[j] ] );
					}
					_fnAddData( oSettings, aData );
				}
				else
				{
					/* No re-order required, sever got it "right" - just straight add */
					_fnAddData( oSettings, json.aaData[i] );
				}
			}
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			oSettings.bAjaxDataGet = false;
			_fnDraw( oSettings );
			oSettings.bAjaxDataGet = true;
			_fnProcessingDisplay( oSettings, false );
		}
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Options (features) HTML
		 */
		
		/*
		 * Function: _fnAddOptionsHtml
		 * Purpose:  Add the options to the page HTML for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnAddOptionsHtml ( oSettings )
		{
			/*
			 * Create a temporary, empty, div which we can later on replace with what we have generated
			 * we do it this way to rendering the 'options' html offline - speed :-)
			 */
			var nHolding = document.createElement( 'div' );
			oSettings.nTable.parentNode.insertBefore( nHolding, oSettings.nTable );
			
			/* 
			 * All DataTables are wrapped in a div - this is not currently optional - backwards 
			 * compatability. It can be removed if you don't want it.
			 */
			var nWrapper = document.createElement( 'div' );
			nWrapper.className = "dataTables_wrapper";
			if ( oSettings.sTableId !== '' )
			{
				nWrapper.setAttribute( 'id', oSettings.sTableId+'_wrapper' );
			}
			
			/* Track where we want to insert the option */
			var nInsertNode = nWrapper;
			
			/* IE don't treat strings as arrays */
			var sDom = oSettings.sDomPositioning.split('');
			
			/* Loop over the user set positioning and place the elements as needed */
			var nTmp;
			for ( var i=0 ; i<sDom.length ; i++ )
			{
				var cOption = sDom[i];
				
				if ( cOption == '<' )
				{
					/* New container div */
					var nNewNode = document.createElement( 'div' );
					
					/* Check to see if we should append a class name to the container */
					var cNext = sDom[i+1];
					if ( cNext == "'" || cNext == '"' )
					{
						var sClass = "";
						var j = 2;
						while ( sDom[i+j] != cNext )
						{
							sClass += sDom[i+j];
							j++;
						}
						nNewNode.className = sClass;
						i += j; /* Move along the position array */
					}
					
					nInsertNode.appendChild( nNewNode );
					nInsertNode = nNewNode;
				}
				else if ( cOption == '>' )
				{
					/* End container div */
					nInsertNode = nInsertNode.parentNode;
				}
				else if ( cOption == 'l' && oSettings.oFeatures.bPaginate && oSettings.oFeatures.bLengthChange )
				{
					/* Length */
					nTmp = _fnFeatureHtmlLength( oSettings );
					oSettings.anFeatures[cOption] = nTmp;
					nInsertNode.appendChild( nTmp );
				}
				else if ( cOption == 'f' && oSettings.oFeatures.bFilter )
				{
					/* Filter */
					nTmp = _fnFeatureHtmlFilter( oSettings );
					oSettings.anFeatures[cOption] = nTmp;
					nInsertNode.appendChild( nTmp );
				}
				else if ( cOption == 'r' && oSettings.oFeatures.bProcessing )
				{
					/* pRocessing */
					nTmp = _fnFeatureHtmlProcessing( oSettings );
					oSettings.anFeatures[cOption] = nTmp;
					nInsertNode.appendChild( nTmp );
				}
				else if ( cOption == 't' )
				{
					/* Table */
					oSettings.anFeatures[cOption] = oSettings.nTable;
					nInsertNode.appendChild( oSettings.nTable );
				}
				else if ( cOption ==  'i' && oSettings.oFeatures.bInfo )
				{
					/* Info */
					nTmp = _fnFeatureHtmlInfo( oSettings );
					oSettings.anFeatures[cOption] = nTmp;
					nInsertNode.appendChild( nTmp );
				}
				else if ( cOption == 'p' && oSettings.oFeatures.bPaginate )
				{
					/* Pagination */
					nTmp = _fnFeatureHtmlPaginate( oSettings );
					oSettings.anFeatures[cOption] = nTmp;
					nInsertNode.appendChild( nTmp );
				}
				else if ( _oExt.aoFeatures.length !== 0 )
				{
					var aoFeatures = _oExt.aoFeatures;
					for ( var k=0, kLen=aoFeatures.length ; k<kLen ; k++ )
					{
						if ( cOption == aoFeatures[k].cFeature )
						{
							nTmp = aoFeatures[k].fnInit( oSettings );
							oSettings.anFeatures[cOption] = nTmp;
							nInsertNode.appendChild( nTmp );
							break;
						}
					}
				}
			}
			
			/* Built our DOM structure - replace the holding div with what we want */
			nHolding.parentNode.replaceChild( nWrapper, nHolding );
		}
		
		/*
		 * Function: _fnFeatureHtmlFilter
		 * Purpose:  Generate the node required for filtering text
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlFilter ( oSettings )
		{
			var nFilter = document.createElement( 'div' );
			if ( oSettings.sTableId !== '' )
			{
				nFilter.setAttribute( 'id', oSettings.sTableId+'_filter' );
			}
			nFilter.className = "dataTables_filter";
			var sSpace = oSettings.oLanguage.sSearch==="" ? "" : " ";
			nFilter.innerHTML = oSettings.oLanguage.sSearch+sSpace+'<input type="text" />';
			
			var jqFilter = $("input", nFilter);
			jqFilter.val( oSettings.oPreviousSearch.sSearch.replace('"','&quot;') );
			jqFilter.keyup( function(e) {
				_fnFilterComplete( oSettings, { 
					"sSearch": this.value, 
					"bEscapeRegex": oSettings.oPreviousSearch.bEscapeRegex 
				} );
				
				/* Prevent default */
				return false;
			} );
			
			return nFilter;
		}
		
		/*
		 * Function: _fnFeatureHtmlInfo
		 * Purpose:  Generate the node required for the info display
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlInfo ( oSettings )
		{
			var nInfo = document.createElement( 'div' );
			if ( oSettings.sTableId !== '' )
			{
				nInfo.setAttribute( 'id', oSettings.sTableId+'_info' );
			}
			nInfo.className = "dataTables_info";
			return nInfo;
		}
		
		/*
		 * Function: _fnFeatureHtmlPaginate
		 * Purpose:  Generate the node required for default pagination
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlPaginate ( oSettings )
		{
			var nPaginate = document.createElement( 'div' );
			nPaginate.className = "dataTables_paginate paging_"+oSettings.sPaginationType;
			oSettings.anFeatures.p = nPaginate; /* Need this stored in order to call paging plug-ins */
			
			_oExt.oPagination[ oSettings.sPaginationType ].fnInit( oSettings, function( oSettings ) {
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			} );
			return nPaginate;
		}
		
		/*
		 * Function: _fnFeatureHtmlLength
		 * Purpose:  Generate the node required for user display length changing
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlLength ( oSettings )
		{
			/* This can be overruled by not using the _MENU_ var/macro in the language variable */
			var sName = (oSettings.sTableId === "") ? "" : 'name="'+oSettings.sTableId+'_length"';
			var sStdMenu = 
				'<select size="1" '+sName+'>'+
					'<option value="10">10</option>'+
					'<option value="25">25</option>'+
					'<option value="50">50</option>'+
					'<option value="100">100</option>'+
				'</select>';
			
			var nLength = document.createElement( 'div' );
			if ( oSettings.sTableId !== '' )
			{
				nLength.setAttribute( 'id', oSettings.sTableId+'_length' );
			}
			nLength.className = "dataTables_length";
			nLength.innerHTML = oSettings.oLanguage.sLengthMenu.replace( '_MENU_', sStdMenu );
			
			/*
			 * Set the length to the current display length - thanks to Andrea Pavlovic for this fix,
			 * and Stefan Skopnik for fixing the fix!
			 */
			$('select option[value="'+oSettings._iDisplayLength+'"]',nLength).attr("selected",true);
			
			$('select', nLength).change( function(e) {
				oSettings._iDisplayLength = parseInt($(this).val(), 10);
				
				_fnCalculateEnd( oSettings );
				
				/* If we have space to show extra rows (backing up from the end point - then do so */
				if ( oSettings._iDisplayEnd == oSettings.aiDisplay.length )
				{
					oSettings._iDisplayStart = oSettings._iDisplayEnd - oSettings._iDisplayLength;
					if ( oSettings._iDisplayStart < 0 )
					{
						oSettings._iDisplayStart = 0;
					}
				}
				
				if ( oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayStart = 0;
				}
				
				_fnDraw( oSettings );
			} );
			
			return nLength;
		}
		
		/*
		 * Function: _fnFeatureHtmlProcessing
		 * Purpose:  Generate the node required for the processing node
		 * Returns:  node
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFeatureHtmlProcessing ( oSettings )
		{
			var nProcessing = document.createElement( 'div' );
			
			if ( oSettings.sTableId !== '' )
			{
				nProcessing.setAttribute( 'id', oSettings.sTableId+'_processing' );
			}
			nProcessing.innerHTML = oSettings.oLanguage.sProcessing;
			nProcessing.className = "dataTables_processing";
			oSettings.nTable.parentNode.insertBefore( nProcessing, oSettings.nTable );
			
			return nProcessing;
		}
		
		/*
		 * Function: _fnProcessingDisplay
		 * Purpose:  Display or hide the processing indicator
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           bool:
		 *   true - show the processing indicator
		 *   false - don't show
		 */
		function _fnProcessingDisplay ( oSettings, bShow )
		{
			if ( oSettings.oFeatures.bProcessing )
			{
				oSettings.anFeatures.r.style.visibility = bShow ? "visible" : "hidden";
			}
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Filtering
		 */
		
		/*
		 * Function: _fnFilterComplete
		 * Purpose:  Filter the table using both the global filter and column based filtering
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oSearch: search information
		 *           int:iForce - optional - force a research of the master array (1) or not (undefined or 0)
		 */
		function _fnFilterComplete ( oSettings, oInput, iForce )
		{
			/* Filter on everything */
			_fnFilter( oSettings, oInput.sSearch, iForce, oInput.bEscapeRegex );
			
			/* Now do the individual column filter */
			for ( var i=0 ; i<oSettings.aoPreSearchCols.length ; i++ )
			{
				_fnFilterColumn( oSettings, oSettings.aoPreSearchCols[i].sSearch, i, 
					oSettings.aoPreSearchCols[i].bEscapeRegex );
			}
			
			/* Custom filtering */
			if ( _oExt.afnFiltering.length !== 0 )
			{
				_fnFilterCustom( oSettings );
			}
			
			/* Redraw the table */
			if ( typeof oSettings.iInitDisplayStart != 'undefined' && oSettings.iInitDisplayStart != -1 )
			{
				oSettings._iDisplayStart = oSettings.iInitDisplayStart;
				oSettings.iInitDisplayStart = -1;
			}
			else
			{
				oSettings._iDisplayStart = 0;
			}
			_fnCalculateEnd( oSettings );
			_fnDraw( oSettings );
			
			/* Rebuild search array 'offline' */
			_fnBuildSearchArray( oSettings, 0 );
		}
		
		/*
		 * Function: _fnFilterCustom
		 * Purpose:  Apply custom filtering functions
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnFilterCustom( oSettings )
		{
			var afnFilters = _oExt.afnFiltering;
			for ( var i=0, iLen=afnFilters.length ; i<iLen ; i++ )
			{
				var iCorrector = 0;
				for ( var j=0, jLen=oSettings.aiDisplay.length ; j<jLen ; j++ )
				{
					var iDisIndex = oSettings.aiDisplay[j-iCorrector];
					
					/* Check if we should use this row based on the filtering function */
					if ( !afnFilters[i]( oSettings, oSettings.aoData[iDisIndex]._aData, iDisIndex ) )
					{
						oSettings.aiDisplay.splice( j-iCorrector, 1 );
						iCorrector++;
					}
				}
			}
		}
		
		/*
		 * Function: _fnFilterColumn
		 * Purpose:  Filter the table on a per-column basis
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           string:sInput - string to filter on
		 *           int:iColumn - column to filter
		 *           bool:bEscapeRegex - escape regex or not
		 */
		function _fnFilterColumn ( oSettings, sInput, iColumn, bEscapeRegex )
		{
			if ( sInput === "" )
			{
				return;
			}
			
			var iIndexCorrector = 0;
			var sRegexMatch = bEscapeRegex ? _fnEscapeRegex( sInput ) : sInput;
			var rpSearch = new RegExp( sRegexMatch, "i" );
			
			for ( var i=oSettings.aiDisplay.length-1 ; i>=0 ; i-- )
			{
				var sData = _fnDataToSearch( oSettings.aoData[ oSettings.aiDisplay[i] ]._aData[iColumn],
					oSettings.aoColumns[iColumn].sType );
				if ( ! rpSearch.test( sData ) )
				{
					oSettings.aiDisplay.splice( i, 1 );
					iIndexCorrector++;
				}
			}
		}
		
		/*
		 * Function: _fnFilter
		 * Purpose:  Filter the data table based on user input and draw the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           string:sInput - string to filter on
		 *           int:iForce - optional - force a research of the master array (1) or not (undefined or 0)
		 *           bool:bEscapeRegex - escape regex or not
		 */
		function _fnFilter( oSettings, sInput, iForce, bEscapeRegex )
		{
			var i;
			
			/* Check if we are forcing or not - optional parameter */
			if ( typeof iForce == 'undefined' || iForce === null )
			{
				iForce = 0;
			}
			
			/* Need to take account of custom filtering functions always */
			if ( _oExt.afnFiltering.length !== 0 )
			{
				iForce = 1;
			}
			
			/* Generate the regular expression to use. Something along the lines of:
			 * ^(?=.*?\bone\b)(?=.*?\btwo\b)(?=.*?\bthree\b).*$
			 */
			var asSearch = bEscapeRegex ?
				_fnEscapeRegex( sInput ).split( ' ' ) :
				sInput.split( ' ' );
			var sRegExpString = '^(?=.*?'+asSearch.join( ')(?=.*?' )+').*$';
			var rpSearch = new RegExp( sRegExpString, "i" ); /* case insensitive */
			
			/*
			 * If the input is blank - we want the full data set
			 */
			if ( sInput.length <= 0 )
			{
				oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			}
			else
			{
				/*
				 * We are starting a new search or the new search string is smaller 
				 * then the old one (i.e. delete). Search from the master array
			 	 */
				if ( oSettings.aiDisplay.length == oSettings.aiDisplayMaster.length ||
					   oSettings.oPreviousSearch.sSearch.length > sInput.length || iForce == 1 ||
					   sInput.indexOf(oSettings.oPreviousSearch.sSearch) !== 0 )
				{
					/* Nuke the old display array - we are going to rebuild it */
					oSettings.aiDisplay.splice( 0, oSettings.aiDisplay.length);
					
					/* Force a rebuild of the search array */
					_fnBuildSearchArray( oSettings, 1 );
					
					/* Search through all records to populate the search array
					 * The the oSettings.aiDisplayMaster and asDataSearch arrays have 1 to 1 
					 * mapping
					 */
					for ( i=0 ; i<oSettings.aiDisplayMaster.length ; i++ )
					{
						if ( rpSearch.test(oSettings.asDataSearch[i]) )
						{
							oSettings.aiDisplay.push( oSettings.aiDisplayMaster[i] );
						}
					}
			  }
			  else
				{
			  	/* Using old search array - refine it - do it this way for speed
			  	 * Don't have to search the whole master array again
			 		 */
			  	var iIndexCorrector = 0;
			  	
			  	/* Search the current results */
			  	for ( i=0 ; i<oSettings.asDataSearch.length ; i++ )
					{
			  		if ( ! rpSearch.test(oSettings.asDataSearch[i]) )
						{
			  			oSettings.aiDisplay.splice( i-iIndexCorrector, 1 );
			  			iIndexCorrector++;
			  		}
			  	}
			  }
			}
			oSettings.oPreviousSearch.sSearch = sInput;
			oSettings.oPreviousSearch.bEscapeRegex = bEscapeRegex;
		}
		
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Sorting
		 */
		
		/*
	 	 * Function: _fnSort
		 * Purpose:  Change the order of the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           bool:bApplyClasses - optional - should we apply classes or not
		 * Notes:    We always sort the master array and then apply a filter again
		 *   if it is needed. This probably isn't optimal - but atm I can't think
		 *   of any other way which is (each has disadvantages)
		 */
		function _fnSort ( oSettings, bApplyClasses )
		{
			/*
			 * Funny one this - we want to sort aiDisplayMaster - but according to aoData[]._aData
			 *
			 * function _fnSortText ( a, b )
			 * {
			 * 	var iTest;
			 * 	var oSort = _oExt.oSort;
			 * 	
			 * 	iTest = oSort['string-asc']( aoData[ a ]._aData[ COL ], aoData[ b ]._aData[ COL ] );
			 * 	if ( iTest === 0 )
			 * 		...
			 * }
			 */
			
			/* Here is what we are looking to achieve here (custom sort functions add complication...)
			 * function _fnSortText ( a, b )
			 * {
			 * 	var iTest;
			 *  var oSort = _oExt.oSort;
			 * 	iTest = oSort['string-asc']( a[0], b[0] );
			 * 	if ( iTest === 0 )
			 * 		iTest = oSort['string-asc']( a[1], b[1] );
			 * 		if ( iTest === 0 )
			 * 			iTest = oSort['string-asc']( a[2], b[2] );
			 * 	
			 * 	return iTest;
			 * }
			 */
			var aaSort = [];
			var oSort = _oExt.oSort;
			var aoData = oSettings.aoData;
			var iDataSort;
			var iDataType;
			var i;
			
			if ( oSettings.aaSorting.length !== 0 || oSettings.aaSortingFixed !== null )
			{
				if ( oSettings.aaSortingFixed !== null )
				{
					aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
				}
				else
				{
					aaSort = oSettings.aaSorting.slice();
				}
				if ( !window.runtime )
				{
					var fnLocalSorting;
					var sDynamicSort = "fnLocalSorting = function(a,b){"+
						"var iTest;";
					
					for ( i=0 ; i<aaSort.length-1 ; i++ )
					{
						iDataSort = oSettings.aoColumns[ aaSort[i][0] ].iDataSort;
						// JRL:  replacing commented line below with same lookup as for iDataSort - can't see why iDataSort would be different from the column index
						iDataType = oSettings.aoColumns[ aaSort[i][0] ].sType;
						//iDataType = oSettings.aoColumns[ iDataSort ].sType;
						sDynamicSort += "iTest = oSort['"+iDataType+"-"+aaSort[i][1]+"']"+
							"( aoData[a]._aData["+iDataSort+"], aoData[b]._aData["+iDataSort+"] ); if ( iTest === 0 )";
					}
					
					iDataSort = oSettings.aoColumns[ aaSort[aaSort.length-1][0] ].iDataSort;
					// JRL: as above
					iDataType = oSettings.aoColumns[ aaSort[i][0] ].sType;
					//iDataType = oSettings.aoColumns[ iDataSort ].sType;
					sDynamicSort += "iTest = oSort['"+iDataType+"-"+aaSort[aaSort.length-1][1]+"']"+
						"( aoData[a]._aData["+iDataSort+"], aoData[b]._aData["+iDataSort+"] ); return iTest;}";
					
					/* The eval has to be done to a variable for IE */
					eval( sDynamicSort );
					oSettings.aiDisplayMaster.sort( fnLocalSorting );
				}
				else
				{
					/*
					 * Support for Adobe AIR - AIR doesn't allow eval with a function
					 * Note that for reasonable sized data sets this method is around 1.5 times slower than
					 * the eval above (hence why it is not used all the time). Oddly enough, it is ever so
					 * slightly faster for very small sets (presumably the eval has overhead).
					 *   Single column (1083 records) - eval: 32mS   AIR: 38mS
					 *   Two columns (1083 records) -   eval: 55mS   AIR: 66mS
					 */
					
					/* Build a cached array so the sort doesn't have to process this stuff on every call */
					var aAirSort = [];
					var iLen = aaSort.length;
					for ( i=0 ; i<iLen ; i++ )
					{
						iDataSort = oSettings.aoColumns[ aaSort[i][0] ].iDataSort;
						aAirSort.push( [
							iDataSort,
							oSettings.aoColumns[ iDataSort ].sType+'-'+aaSort[i][1]
						] );
					}
					
					oSettings.aiDisplayMaster.sort( function (a,b) {
						var iTest;
						for ( var i=0 ; i<iLen ; i++ )
						{
							iTest = oSort[ aAirSort[i][1] ]( aoData[a]._aData[aAirSort[i][0]], aoData[b]._aData[aAirSort[i][0]] );
							if ( iTest !== 0 )
							{
								return iTest;
							}
						}
						return 0;
					} );
				}
			}
			
			/* Alter the sorting classes to take account of the changes */
			if ( typeof bApplyClasses == 'undefined' || bApplyClasses )
			{
				_fnSortingClasses( oSettings );
			}
			
			/* Copy the master data into the draw array and re-draw */
			if ( oSettings.oFeatures.bFilter )
			{
				/* _fnFilter() will redraw the table for us */
				_fnFilterComplete( oSettings, oSettings.oPreviousSearch, 1 );
			}
			else
			{
				oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
				oSettings._iDisplayStart = 0; /* reset display back to page 0 */
				_fnCalculateEnd( oSettings );
				_fnDraw( oSettings );
			}
		}
		
		/*
		 * Function: _fnSortingClasses
		 * Purpose:  Set the sortting classes on the header
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnSortingClasses( oSettings )
		{
			var i;
			var aaSort;
			var iColumns = oSettings.aoColumns.length;
			for ( i=0 ; i<iColumns ; i++ )
			{
				$(oSettings.aoColumns[i].nTh).removeClass( "sorting_asc sorting_desc sorting" );
			}
			
			if ( oSettings.aaSortingFixed !== null )
			{
				aaSort = oSettings.aaSortingFixed.concat( oSettings.aaSorting );
			}
			else
			{
				aaSort = oSettings.aaSorting.slice();
			}
			
			/* Apply the required classes to the header */
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bSortable && oSettings.aoColumns[i].bVisible )
				{
					var sClass = "sorting";
					for ( var j=0 ; j<aaSort.length ; j++ )
					{
						if ( aaSort[j][0] == i )
						{
							sClass = ( aaSort[j][1] == "asc" ) ?
								"sorting_asc" : "sorting_desc";
							break;
						}
					}
					$(oSettings.aoColumns[i].nTh).addClass( sClass );
				}
			}
			
			/* 
			 * Apply the required classes to the table body
			 * Note that this is given as a feature switch since it can significantly slow down a sort
			 * on large data sets (adding and removing of classes is always slow at the best of times..)
			 */
			if ( oSettings.oFeatures.bSortClasses )
			{
				var nTrs = _fnGetTrNodes( oSettings );
				$('td', nTrs).removeClass( 'sorting_1 sorting_2 sorting_3' );
				
				var iClass = 1;
				for ( i=0 ; i<aaSort.length ; i++ )
				{
					var iVis = _fnColumnIndexToVisible(oSettings, aaSort[i][0]);
					if ( iVis !== null )
					{
						/* Limit the number of classes to three */
						if ( iClass <= 2 )
						{
							$('td:eq('+iVis+')', nTrs).addClass( 'sorting_'+iClass );
						}
						else
						{
							$('td:eq('+iVis+')', nTrs).addClass( 'sorting_3' );
						}
						iClass++;
					}
				}
			}
		}
		
		/*
		 * Function: _fnVisibleToColumnIndex
		 * Purpose:  Covert the index of a visible column to the index in the data array (take account
		 *   of hidden columns)
		 * Returns:  int:i - the data index
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnVisibleToColumnIndex( oSettings, iMatch )
		{
			var iColumn = -1;
			
			for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === true )
				{
					iColumn++;
				}
				
				if ( iColumn == iMatch )
				{
					return i;
				}
			}
			
			return null;
		}
		
		/*
		 * Function: _fnColumnIndexToVisible
		 * Purpose:  Covert the index of an index in the data array and convert it to the visible
		 *   column index (take account of hidden columns)
		 * Returns:  int:i - the data index
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnColumnIndexToVisible( oSettings, iMatch )
		{
			var iVisible = -1;
			for ( var i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible === true )
				{
					iVisible++;
				}
				
				if ( i == iMatch )
				{
					return oSettings.aoColumns[i].bVisible === true ? iVisible : null;
				}
			}
			
			return null;
		}
		
		/*
		 * Function: _fnVisbleColumns
		 * Purpose:  Get the number of visible columns
		 * Returns:  int:i - the number of visible columns
		 * Inputs:   object:oS - dataTables settings object
		 */
		function _fnVisbleColumns( oS )
		{
			var iVis = 0;
			for ( var i=0 ; i<oS.aoColumns.length ; i++ )
			{
				if ( oS.aoColumns[i].bVisible === true )
				{
					iVis++;
				}
			}
			return iVis;
		}
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Support functions
		 */
		
		/*
		 * Function: _fnBuildSearchArray
		 * Purpose:  Create an array which can be quickly search through
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iMaster - use the master data array - optional
		 */
		function _fnBuildSearchArray ( oSettings, iMaster )
		{
			/* Clear out the old data */
			oSettings.asDataSearch.splice( 0, oSettings.asDataSearch.length );
			
			var aArray = (typeof iMaster != 'undefined' && iMaster == 1) ?
			 	oSettings.aiDisplayMaster : oSettings.aiDisplay;
			
			for ( var i=0, iLen=aArray.length ; i<iLen ; i++ )
			{
				oSettings.asDataSearch[i] = '';
				for ( var j=0, jLen=oSettings.aoColumns.length ; j<jLen ; j++ )
				{
					if ( oSettings.aoColumns[j].bSearchable )
					{
						var sData = oSettings.aoData[ aArray[i] ]._aData[j];
						oSettings.asDataSearch[i] += _fnDataToSearch( sData, oSettings.aoColumns[j].sType )+' ';
					}
				}
			}
		}
		
		/*
		 * Function: _fnDataToSearch
		 * Purpose:  Convert raw data into something that the user can search on
		 * Returns:  string: - search string
		 * Inputs:   string:sData - data to be modified
		 *           string:sType - data type
		 */
		function _fnDataToSearch ( sData, sType )
		{
			
			if ( typeof _oExt.ofnSearch[sType] == "function" )
			{
				return _oExt.ofnSearch[sType]( sData );
			}
			else if ( sType == "html" )
			{
				return sData.replace(/\n/g," ").replace( /<.*?>/g, "" );
			}
			else if ( typeof sData == "string" )
			{
				return sData.replace(/\n/g," ");
			}
			return sData;
		}
		
		/*
		 * Function: _fnCalculateEnd
		 * Purpose:  Rcalculate the end point based on the start point
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnCalculateEnd( oSettings )
		{
			if ( oSettings.oFeatures.bPaginate === false )
			{
				oSettings._iDisplayEnd = oSettings.aiDisplay.length;
			}
			else
			{
				/* Set the end point of the display - based on how many elements there are
				 * still to display
				 */
				if ( oSettings._iDisplayStart + oSettings._iDisplayLength > oSettings.aiDisplay.length ||
					   oSettings._iDisplayLength == -1 )
				{
					oSettings._iDisplayEnd = oSettings.aiDisplay.length;
				}
				else
				{
					oSettings._iDisplayEnd = oSettings._iDisplayStart + oSettings._iDisplayLength;
				}
			}
		}
		
		/*
		 * Function: _fnConvertToWidth
		 * Purpose:  Convert a CSS unit width to pixels (e.g. 2em)
		 * Returns:  int:iWidth - width in pixels
		 * Inputs:   string:sWidth - width to be converted
		 *           node:nParent - parent to get the with for (required for
		 *             relative widths) - optional
		 */
		function _fnConvertToWidth ( sWidth, nParent )
		{
			if ( !sWidth || sWidth === null || sWidth === '' )
			{
				return 0;
			}
			
			if ( typeof nParent == "undefined" )
			{
				nParent = document.getElementsByTagName('body')[0];
			}
			
			var iWidth;
			var nTmp = document.createElement( "div" );
			nTmp.style.width = sWidth;
			
			nParent.appendChild( nTmp );
			iWidth = nTmp.offsetWidth;
			nParent.removeChild( nTmp );
			
			return ( iWidth );
		}
		
		/*
		 * Function: _fnCalculateColumnWidths
		 * Purpose:  Calculate the width of columns for the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnCalculateColumnWidths ( oSettings )
		{
			var iTableWidth = oSettings.nTable.offsetWidth;
			var iTotalUserIpSize = 0;
			var iTmpWidth;
			var iVisibleColumns = 0;
			var iColums = oSettings.aoColumns.length;
			var i;
			var oHeaders = $('thead th', oSettings.nTable);
			
			/* Convert any user input sizes into pixel sizes */
			for ( i=0 ; i<iColums ; i++ )
			{
				if ( oSettings.aoColumns[i].bVisible )
				{
					iVisibleColumns++;
					
					if ( oSettings.aoColumns[i].sWidth !== null )
					{
						iTmpWidth = _fnConvertToWidth( oSettings.aoColumns[i].sWidth, 
							oSettings.nTable.parentNode );
						
						/* Total up the user defined widths for later calculations */
						iTotalUserIpSize += iTmpWidth;
						
						oSettings.aoColumns[i].sWidth = iTmpWidth+"px";
					}
				}
			}
			
			/* If the number of columns in the DOM equals the number that we
			 * have to process in dataTables, then we can use the offsets that are
			 * created by the web-browser. No custom sizes can be set in order for
			 * this to happen
			 */
			if ( iColums == oHeaders.length && iTotalUserIpSize === 0 && iVisibleColumns == iColums )
			{
				for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
				{
					oSettings.aoColumns[i].sWidth = oHeaders[i].offsetWidth+"px";
				}
			}
			else
			{
				/* Otherwise we are going to have to do some calculations to get
				 * the width of each column. Construct a 1 row table with the maximum
				 * string sizes in the data, and any user defined widths
				 */
				var nCalcTmp = oSettings.nTable.cloneNode( false );
				nCalcTmp.setAttribute( "id", '' );
				
				var sTableTmp = '<table class="'+nCalcTmp.className+'">';
				var sCalcHead = "<tr>";
				var sCalcHtml = "<tr>";
				
				/* Construct a tempory table which we will inject (invisibly) into
				 * the dom - to let the browser do all the hard word
				 */
				for ( i=0 ; i<iColums ; i++ )
				{
					if ( oSettings.aoColumns[i].bVisible )
					{
						sCalcHead += '<th>'+oSettings.aoColumns[i].sTitle+'</th>';
						
						if ( oSettings.aoColumns[i].sWidth !== null )
						{
							var sWidth = '';
							if ( oSettings.aoColumns[i].sWidth !== null )
							{
								sWidth = ' style="width:'+oSettings.aoColumns[i].sWidth+';"';
							}
							
							sCalcHtml += '<td'+sWidth+' tag_index="'+i+'">'+fnGetMaxLenString( oSettings, i)+'</td>';
						}
						else
						{
							sCalcHtml += '<td tag_index="'+i+'">'+fnGetMaxLenString( oSettings, i)+'</td>';
						}
					}
				}
				
				sCalcHead += "</tr>";
				sCalcHtml += "</tr>";
				
				/* Create the tmp table node (thank you jQuery) */
				nCalcTmp = $( sTableTmp + sCalcHead + sCalcHtml +'</table>' )[0];
				nCalcTmp.style.width = iTableWidth + "px";
				nCalcTmp.style.visibility = "hidden";
				nCalcTmp.style.position = "absolute"; /* Try to aviod scroll bar */
				
				oSettings.nTable.parentNode.appendChild( nCalcTmp );
				
				var oNodes = $("td", nCalcTmp);
				var iIndex;
				
				/* Gather in the browser calculated widths for the rows */
				for ( i=0 ; i<oNodes.length ; i++ )
				{
					iIndex = oNodes[i].getAttribute('tag_index');
					
					oSettings.aoColumns[iIndex].sWidth = $("td", nCalcTmp)[i].offsetWidth +"px";
				}
				
				oSettings.nTable.parentNode.removeChild( nCalcTmp );
			}
		}
		
		/*
		 * Function: fnGetMaxLenString
		 * Purpose:  Get the maximum strlen for each data column
		 * Returns:  string: - max strlens for each column
		 * Inputs:   object:oSettings - dataTables settings object
		 *           int:iCol - column of interest
		 */
		function fnGetMaxLenString( oSettings, iCol )
		{
			var iMax = 0;
			var iMaxIndex = -1;
			
			for ( var i=0 ; i<oSettings.aoData.length ; i++ )
			{
				if ( oSettings.aoData[i]._aData[iCol].length > iMax )
				{
					iMax = oSettings.aoData[i]._aData[iCol].length;
					iMaxIndex = i;
				}
			}
			
			if ( iMaxIndex >= 0 )
			{
				return oSettings.aoData[iMaxIndex]._aData[iCol];
			}
			return '';
		}
		
		/*
		 * Function: _fnArrayCmp
		 * Purpose:  Compare two arrays
		 * Returns:  0 if match, 1 if length is different, 2 if no match
		 * Inputs:   array:aArray1 - first array
		 *           array:aArray2 - second array
		 */
		function _fnArrayCmp( aArray1, aArray2 )
		{
			if ( aArray1.length != aArray2.length )
			{
				return 1;
			}
			
			for ( var i=0 ; i<aArray1.length ; i++ )
			{
				if ( aArray1[i] != aArray2[i] )
				{
					return 2;
				}
			}
			
			return 0;
		}
		
		/*
		 * Function: _fnDetectType
		 * Purpose:  Get the sort type based on an input string
		 * Returns:  string: - type (defaults to 'string' if no type can be detected)
		 * Inputs:   string:sData - data we wish to know the type of
		 * Notes:    This function makes use of the DataTables plugin objct _oExt 
		 *   (.aTypes) such that new types can easily be added.
		 */
		function _fnDetectType( sData )
		{
			var aTypes = _oExt.aTypes;
			var iLen = aTypes.length;
			
			for ( var i=0 ; i<iLen ; i++ )
			{
				var sType = aTypes[i]( sData );
				if ( sType !== null )
				{
					return sType;
				}
			}
			
			return 'string';
		}
		
		/*
		 * Function: _fnSettingsFromNode
		 * Purpose:  Return the settings object for a particular table
		 * Returns:  object: Settings object - or null if not found
		 * Inputs:   node:nTable - table we are using as a dataTable
		 */
		function _fnSettingsFromNode ( nTable )
		{
			for ( var i=0 ; i<_aoSettings.length ; i++ )
			{
				if ( _aoSettings[i].nTable == nTable )
				{
					return _aoSettings[i];
				}
			}
			
			return null;
		}
		
		/*
		 * Function: _fnGetDataMaster
		 * Purpose:  Return an array with the full table data
		 * Returns:  array array:aData - Master data array
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnGetDataMaster ( oSettings )
		{
			var aData = [];
			var iLen = oSettings.aoData.length;
			for ( var i=0 ; i<iLen; i++ )
			{
				aData.push( oSettings.aoData[i]._aData );
			}
			return aData;
		}
		
		/*
		 * Function: _fnGetTrNodes
		 * Purpose:  Return an array with the TR nodes for the table
		 * Returns:  array array:aData - TR array
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnGetTrNodes ( oSettings )
		{
			var aNodes = [];
			var iLen = oSettings.aoData.length;
			for ( var i=0 ; i<iLen ; i++ )
			{
				aNodes.push( oSettings.aoData[i].nTr );
			}
			return aNodes;
		}
		
		/*
		 * Function: _fnEscapeRegex
		 * Purpose:  scape a string stuch that it can be used in a regular expression
		 * Returns:  string: - escaped string
		 * Inputs:   string:sVal - string to escape
		 */
		function _fnEscapeRegex ( sVal )
		{
			var acEscape = [ '/', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '\\', '$', '^' ];
		  var reReplace = new RegExp( '(\\' + acEscape.join('|\\') + ')', 'g' );
		  return sVal.replace(reReplace, '\\$1');
		}
		
		/*
		 * Function: _fnReOrderIndex
		 * Purpose:  Figure out how to reorder a display list
		 * Returns:  array int:aiReturn - index list for reordering
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnReOrderIndex ( oSettings, sColumns )
		{
			var aColumns = sColumns.split(',');
			var aiReturn = [];
			
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				for ( var j=0 ; j<iLen ; j++ )
				{
					if ( oSettings.aoColumns[i].sName == aColumns[j] )
					{
						aiReturn.push( j );
						break;
					}
				}
			}
			
			return aiReturn;
		}
		
		/*
		 * Function: _fnColumnOrdering
		 * Purpose:  Get the column ordering that DataTables expects
		 * Returns:  string: - comma separated list of names
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnColumnOrdering ( oSettings )
		{
			var sNames = '';
			for ( var i=0, iLen=oSettings.aoColumns.length ; i<iLen ; i++ )
			{
				sNames += oSettings.aoColumns[i].sName+',';
			}
			if ( sNames.length == iLen )
			{
				return "";
			}
			return sNames.slice(0, -1);
		}
		
		/*
		 * Function: _fnClearTable
		 * Purpose:  Nuke the table
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnClearTable( oSettings )
		{
			oSettings.aoData.length = 0;
			oSettings.aiDisplayMaster.length = 0;
			oSettings.aiDisplay.length = 0;
			_fnCalculateEnd( oSettings );
		}
		
		/*
		 * Function: _fnSaveState
		 * Purpose:  Save the state of a table in a cookie such that the page can be reloaded
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 */
		function _fnSaveState ( oSettings )
		{
			if ( !oSettings.oFeatures.bStateSave )
			{
				return;
			}
			
			/* Store the interesting variables */
			var i;
			var sValue = "{";
			sValue += '"iStart": '+oSettings._iDisplayStart+',';
			sValue += '"iEnd": '+oSettings._iDisplayEnd+',';
			sValue += '"iLength": '+oSettings._iDisplayLength+',';
			sValue += '"sFilter": "'+oSettings.oPreviousSearch.sSearch.replace('"','\\"')+'",';
			sValue += '"sFilterEsc": '+oSettings.oPreviousSearch.bEscapeRegex+',';
			
			sValue += '"aaSorting": [ ';
			for ( i=0 ; i<oSettings.aaSorting.length ; i++ )
			{
				sValue += "["+oSettings.aaSorting[i][0]+",'"+oSettings.aaSorting[i][1]+"'],";
			}
			sValue = sValue.substring(0, sValue.length-1);
			sValue += "],";
			
			sValue += '"aaSearchCols": [ ';
			for ( i=0 ; i<oSettings.aoPreSearchCols.length ; i++ )
			{
				sValue += "['"+oSettings.aoPreSearchCols[i].sSearch.replace("'","\'")+
					"',"+oSettings.aoPreSearchCols[i].bEscapeRegex+"],";
			}
			sValue = sValue.substring(0, sValue.length-1);
			sValue += "],";
			
			sValue += '"abVisCols": [ ';
			for ( i=0 ; i<oSettings.aoColumns.length ; i++ )
			{
				sValue += oSettings.aoColumns[i].bVisible+",";
			}
			sValue = sValue.substring(0, sValue.length-1);
			sValue += "]";
			
			sValue += "}";
			_fnCreateCookie( "SpryMedia_DataTables_"+oSettings.sInstance, sValue, 
				oSettings.iCookieDuration );
		}
		
		/*
		 * Function: _fnLoadState
		 * Purpose:  Attempt to load a saved table state from a cookie
		 * Returns:  -
		 * Inputs:   object:oSettings - dataTables settings object
		 *           object:oInit - DataTables init object so we can override settings
		 */
		function _fnLoadState ( oSettings, oInit )
		{
			if ( !oSettings.oFeatures.bStateSave )
			{
				return;
			}
			
			var oData;
			var sData = _fnReadCookie( "SpryMedia_DataTables_"+oSettings.sInstance );
			if ( sData !== null && sData !== '' )
			{
				/* Try/catch the JSON eval - if it is bad then we ignore it */
				try
				{
					/* Use the JSON library for safety - if it is available */
					if ( typeof JSON == 'object' && typeof JSON.parse == 'function' )
					{
						/* DT 1.4.0 used single quotes for a string - JSON.parse doesn't allow this and throws
						 * an error. So for now we can do this. This can be removed in future it is just to
						 * allow the tranfrer to 1.4.1+ to occur
						 */
						oData = JSON.parse( sData.replace(/'/g, '"') );
					}
					else
					{
						oData = eval( '('+sData+')' );
					}
				}
				catch( e )
				{
					return;
				}
				
				/* Restore key features */
				oSettings._iDisplayStart = oData.iStart;
				oSettings.iInitDisplayStart = oData.iStart;
				oSettings._iDisplayEnd = oData.iEnd;
				oSettings._iDisplayLength = oData.iLength;
				oSettings.oPreviousSearch.sSearch = oData.sFilter;
				oSettings.aaSorting = oData.aaSorting.slice();
				
				/* Search filtering - global reference added in 1.4.1 */
				if ( typeof oData.sFilterEsc != 'undefined' )
				{
					oSettings.oPreviousSearch.bEscapeRegex = oData.sFilterEsc;
				}
				
				/* Column filtering - added in 1.5.0 beta 6 */
				if ( typeof oData.aaSearchCols != 'undefined' )
				{
					for ( var i=0 ; i<oData.aaSearchCols.length ; i++ )
					{
						oSettings.aoPreSearchCols[i] = {
							"sSearch": oData.aaSearchCols[i][0],
							"bEscapeRegex": oData.aaSearchCols[i][1]
						};
					}
				}
				
				/* Column visibility state - added in 1.5.0 beta 10 */
				if ( typeof oData.abVisCols != 'undefined' )
				{
					/* We need to override the settings in oInit for this */
					if ( typeof oInit.aoColumns == 'undefined' )
					{
						oInit.aoColumns = [];
					}
					
					for ( i=0 ; i<oData.abVisCols.length ; i++ )
					{
						if ( typeof oInit.aoColumns[i] == 'undefined' || oInit.aoColumns[i] === null )
						{
							oInit.aoColumns[i] = {};
						}
						
						oInit.aoColumns[i].bVisible = oData.abVisCols[i];
					}
				}
			}
		}
		
		/*
		 * Function: _fnCreateCookie
		 * Purpose:  Create a new cookie with a value to store the state of a table
		 * Returns:  -
		 * Inputs:   string:sName - name of the cookie to create
		 *           string:sValue - the value the cookie should take
		 *           int:iSecs - duration of the cookie
		 */
		function _fnCreateCookie ( sName, sValue, iSecs )
		{
			var date = new Date();
			date.setTime( date.getTime()+(iSecs*1000) );
			
			/* 
			 * Shocking but true - it would appear IE has major issues with having the path being
			 * set to anything but root. We need the cookie to be available based on the path, so we
			 * have to append the pathname to the cookie name. Appalling.
			 */
			sName += '_'+window.location.pathname.replace(/[\/:]/g,"").toLowerCase();
			
			document.cookie = sName+"="+sValue+"; expires="+date.toGMTString()+"; path=/";
		}
		
		/*
		 * Function: _fnReadCookie
		 * Purpose:  Read an old cookie to get a cookie with an old table state
		 * Returns:  string: - contents of the cookie - or null if no cookie with that name found
		 * Inputs:   string:sName - name of the cookie to read
		 */
		function _fnReadCookie ( sName )
		{
			var sNameEQ = sName +'_'+ window.location.pathname.replace(/[\/:]/g,"").toLowerCase() + "=";
			var sCookieContents = document.cookie.split(';');
			
			for( var i=0 ; i<sCookieContents.length ; i++ )
			{
				var c = sCookieContents[i];
				
				while (c.charAt(0)==' ')
				{
					c = c.substring(1,c.length);
				}
				
				if (c.indexOf(sNameEQ) === 0)
				{
					return c.substring(sNameEQ.length,c.length);
				}
			}
			return null;
		}
		
		/*
		 * Function: _fnGetUniqueThs
		 * Purpose:  Get an array of unique th elements, one for each column
		 * Returns:  array node:aReturn - list of unique ths
		 * Inputs:   node:nThead - The thead element for the table
		 */
		function _fnGetUniqueThs ( nThead )
		{
			var nTrs = nThead.getElementsByTagName('tr');
			
			/* Nice simple case */
			if ( nTrs.length == 1 )
			{
				return nTrs[0].getElementsByTagName('th');
			}
			
			/* Otherwise we need to figure out the layout array to get the nodes */
			var aLayout = [], aReturn = [];
			var ROWSPAN = 2, COLSPAN = 3;
			var i, j, k, iLen, jLen, iColumnShifted;
			var fnShiftCol = function ( a, i, j ) {
				while ( typeof a[i][j] != 'undefined' ) {
					j++;
				}
				return j;
			};
			var fnAddRow = function ( i ) {
				if ( typeof aLayout[i] == 'undefined' ) {
					aLayout[i] = [];
				}
			};
			
			/* Calculate a layout array */
			for ( i=0, iLen=nTrs.length ; i<iLen ; i++ )
			{
				fnAddRow( i );
				var iColumn = 0;
				var nTds = nTrs[i].getElementsByTagName('th');
				
				for ( j=0, jLen=nTds.length ; j<jLen ; j++ )
				{
					var iColspan = nTds[j].getAttribute('colspan') * 1;
					var iRowspan = nTds[j].getAttribute('rowspan') * 1;
					
					if ( !iColspan || iColspan===0 || iColspan===1 )
					{
						iColumnShifted = fnShiftCol( aLayout, i, iColumn );
						aLayout[i][iColumnShifted] = nTds[j];
						if ( iRowspan || iRowspan===0 || iRowspan===1 )
						{
							for ( k=1 ; k<iRowspan ; k++ )
							{
								fnAddRow( i+k );
								aLayout[i+k][iColumnShifted] = ROWSPAN;
							}
						}
						iColumn++;
					}
					else
					{
						iColumnShifted = fnShiftCol( aLayout, i, iColumn );
						for ( k=0 ; k<iColspan ; k++ )
						{
							aLayout[i][iColumnShifted+k] = COLSPAN;
						}
						iColumn += iColspan;
					}
				}
			}
			
			/* Convert the layout array into a node array
			 * Note the use of aLayout[0] in the outloop, we want the outer loop to occur the same
			 * number of times as there are columns. Unusual having nested loops this way around
			 * but is what we need here.
			 */
			for ( i=0, iLen=aLayout[0].length ; i<iLen ; i++ )
			{
				for ( j=0, jLen=aLayout.length ; j<jLen ; j++ )
				{
					if ( typeof aLayout[j][i] == 'object' )
					{
						aReturn.push( aLayout[j][i] );
					}
				}
			}
			
			return aReturn;
		}
		
		/*
		 * Function: _fnMap
		 * Purpose:  See if a property is defined on one object, if so assign it to the other object
		 * Returns:  - (done by reference)
		 * Inputs:   object:oRet - target object
		 *           object:oSrc - source object
		 *           string:sName - property
		 *           string:sMappedName - name to map too - optional, sName used if not given
		 */
		function _fnMap( oRet, oSrc, sName, sMappedName )
		{
			if ( typeof sMappedName == 'undefined' )
			{
				sMappedName = sName;
			}
			if ( typeof oSrc[sName] != 'undefined' )
			{
				oRet[sMappedName] = oSrc[sName];
			}
		}
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * API
		 * 
		 * I'm not overly happy with this solution - I'd much rather that there was a way of getting
		 * a list of all the private functions and do what we need to dynamically - but that doesn't
		 * appear to be possible. Bonkers. A better solution would be to provide a 'bind' type object
		 * To do - bind type method in DTs 1.6.
		 */
		this.oApi._fnInitalise = _fnInitalise;
		this.oApi._fnLanguageProcess = _fnLanguageProcess;
		this.oApi._fnAddColumn = _fnAddColumn;
		this.oApi._fnAddData = _fnAddData;
		this.oApi._fnGatherData = _fnGatherData;
		this.oApi._fnDrawHead = _fnDrawHead;
		this.oApi._fnDraw = _fnDraw;
		this.oApi._fnAjaxUpdate = _fnAjaxUpdate;
		this.oApi._fnAddOptionsHtml = _fnAddOptionsHtml;
		this.oApi._fnFeatureHtmlFilter = _fnFeatureHtmlFilter;
		this.oApi._fnFeatureHtmlInfo = _fnFeatureHtmlInfo;
		this.oApi._fnFeatureHtmlPaginate = _fnFeatureHtmlPaginate;
		this.oApi._fnFeatureHtmlLength = _fnFeatureHtmlLength;
		this.oApi._fnFeatureHtmlProcessing = _fnFeatureHtmlProcessing;
		this.oApi._fnProcessingDisplay = _fnProcessingDisplay;
		this.oApi._fnFilterComplete = _fnFilterComplete;
		this.oApi._fnFilterColumn = _fnFilterColumn;
		this.oApi._fnFilter = _fnFilter;
		this.oApi._fnSortingClasses = _fnSortingClasses;
		this.oApi._fnVisibleToColumnIndex = _fnVisibleToColumnIndex;
		this.oApi._fnColumnIndexToVisible = _fnColumnIndexToVisible;
		this.oApi._fnVisbleColumns = _fnVisbleColumns;
		this.oApi._fnBuildSearchArray = _fnBuildSearchArray;
		this.oApi._fnDataToSearch = _fnDataToSearch;
		this.oApi._fnCalculateEnd = _fnCalculateEnd;
		this.oApi._fnConvertToWidth = _fnConvertToWidth;
		this.oApi._fnCalculateColumnWidths = _fnCalculateColumnWidths;
		this.oApi._fnArrayCmp = _fnArrayCmp;
		this.oApi._fnDetectType = _fnDetectType;
		this.oApi._fnGetDataMaster = _fnGetDataMaster;
		this.oApi._fnGetTrNodes = _fnGetTrNodes;
		this.oApi._fnEscapeRegex = _fnEscapeRegex;
		this.oApi._fnReOrderIndex = _fnReOrderIndex;
		this.oApi._fnColumnOrdering = _fnColumnOrdering;
		this.oApi._fnClearTable = _fnClearTable;
		this.oApi._fnSaveState = _fnSaveState;
		this.oApi._fnLoadState = _fnLoadState;
		this.oApi._fnCreateCookie = _fnCreateCookie;
		this.oApi._fnReadCookie = _fnReadCookie;
		this.oApi._fnGetUniqueThs = _fnGetUniqueThs;
		
		/* Want to be able to reference "this" inside the this.each function */
		var _that = this;
		
		
		/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
		 * Constructor
		 */
		return this.each(function()
		{
			/* Make a complete and independent copy of the settings object */
			var oSettings = new classSettings();
			_aoSettings.push( oSettings );
			
			var i=0, iLen;
			var bInitHandedOff = false;
			var bUsePassedData = false;
			
			/* Set the id */
			var sId = this.getAttribute( 'id' );
			if ( sId !== null )
			{
				oSettings.sTableId = sId;
				oSettings.sInstance = sId;
			}
			else
			{
				oSettings.sInstance = _oExt._oExternConfig.iNextUnique ++;
			}
			
			/* Set the table node */
			oSettings.nTable = this;
			
			/* Bind the API functions to the settings, so we can perform actions whenever oSettings is
			 * available
			 */
			oSettings.oApi = _that.oApi;
			
			/* Store the features that we have available */
			if ( typeof oInit != 'undefined' && oInit !== null )
			{
				_fnMap( oSettings.oFeatures, oInit, "bPaginate" );
				_fnMap( oSettings.oFeatures, oInit, "bLengthChange" );
				_fnMap( oSettings.oFeatures, oInit, "bFilter" );
				_fnMap( oSettings.oFeatures, oInit, "bSort" );
				_fnMap( oSettings.oFeatures, oInit, "bInfo" );
				_fnMap( oSettings.oFeatures, oInit, "bProcessing" );
				_fnMap( oSettings.oFeatures, oInit, "bAutoWidth" );
				_fnMap( oSettings.oFeatures, oInit, "bSortClasses" );
				_fnMap( oSettings.oFeatures, oInit, "bServerSide" );
				_fnMap( oSettings, oInit, "asStripClasses" );
				_fnMap( oSettings, oInit, "fnRowCallback" );
				_fnMap( oSettings, oInit, "fnHeaderCallback" );
				_fnMap( oSettings, oInit, "fnFooterCallback" );
				_fnMap( oSettings, oInit, "fnDrawCallback" );
				_fnMap( oSettings, oInit, "fnInitComplete" );
				_fnMap( oSettings, oInit, "fnServerData" );
				_fnMap( oSettings, oInit, "aaSorting" );
				_fnMap( oSettings, oInit, "aaSortingFixed" );
				_fnMap( oSettings, oInit, "sPaginationType" );
				_fnMap( oSettings, oInit, "sAjaxSource" );
				_fnMap( oSettings, oInit, "sDom", "sDomPositioning" );
				_fnMap( oSettings, oInit, "oSearch", "oPreviousSearch" );
				_fnMap( oSettings, oInit, "aoSearchCols", "aoPreSearchCols" );
				_fnMap( oSettings, oInit, "iDisplayLength", "_iDisplayLength" );
				
				if ( typeof oInit.iDisplayStart != 'undefined' && 
				     typeof oSettings.iInitDisplayStart == 'undefined' ) {
					/* Display start point, taking into account the save saving */
					oSettings.iInitDisplayStart = oInit.iDisplayStart;
					oSettings._iDisplayStart = oInit.iDisplayStart;
				}
				
				/* Must be done after everything which can be overridden by a cookie! */
				if ( typeof oInit.bStateSave != 'undefined' )
				{
					oSettings.oFeatures.bStateSave = oInit.bStateSave;
					_fnLoadState( oSettings, oInit );
				}
				
				
				if ( typeof oInit.aaData != 'undefined' ) {
					bUsePassedData = true;
				}
				
				/* Backwards compatability */
				/* aoColumns / aoData - remove at some point... */
				if ( typeof oInit != 'undefined' && typeof oInit.aoData != 'undefined' )
				{
					oInit.aoColumns = oInit.aoData;
				}
				
				/* Language definitions */
				if ( typeof oInit.oLanguage != 'undefined' )
				{
					if ( typeof oInit.oLanguage.sUrl != 'undefined' && oInit.oLanguage.sUrl !== "" )
					{
						/* Get the language definitions from a file */
						oSettings.oLanguage.sUrl = oInit.oLanguage.sUrl;
						$.getJSON( oSettings.oLanguage.sUrl, null, function( json ) { 
							_fnLanguageProcess( oSettings, json, true ); } );
						bInitHandedOff = true;
					}
					else
					{
						_fnLanguageProcess( oSettings, oInit.oLanguage, false );
					}
				}
				/* Warning: The _fnLanguageProcess function is async to the remainder of this function due
				 * to the XHR. We use _bInitialised in _fnLanguageProcess() to check this the processing 
				 * below is complete. The reason for spliting it like this is optimisation - we can fire
				 * off the XHR (if needed) and then continue processing the data.
				 */
			}
			
			/* See if we should load columns automatically or use defined ones - a bit messy this... */
			var nThead = this.getElementsByTagName('thead');
			var nThs = nThead.length===0 ? null : _fnGetUniqueThs( nThead[0] );
			var bUseCols = typeof oInit != 'undefined' && typeof oInit.aoColumns != 'undefined';
			for ( i=0, iLen=bUseCols ? oInit.aoColumns.length : nThs.length ; i<iLen ; i++ )
			{
				var col = bUseCols ? oInit.aoColumns[i] : null;
				var n = nThs ? nThs[i] : null;
				_fnAddColumn( oSettings, col, n );
			}
			
			/* Sanity check that there is a thead and tfoot. If not let's just create them */
			if ( this.getElementsByTagName('thead').length === 0 )
			{
				this.appendChild( document.createElement( 'thead' ) );
			}
			
			if ( this.getElementsByTagName('tbody').length === 0 )
			{
				this.appendChild( document.createElement( 'tbody' ) );
			}
			
			/* Check if there is data passing into the constructor */
			if ( bUsePassedData )
			{
				for ( i=0 ; i<oInit.aaData.length ; i++ )
				{
					_fnAddData( oSettings, oInit.aaData[ i ] );
				}
			}
			else
			{
				/* Grab the data from the page */
				_fnGatherData( oSettings );
			}
			
			/* Copy the data index array */
			oSettings.aiDisplay = oSettings.aiDisplayMaster.slice();
			
			/* Calculate sizes for columns */
			if ( oSettings.oFeatures.bAutoWidth )
			{
				_fnCalculateColumnWidths( oSettings );
			}
			
			/* Initialisation complete - table can be drawn */
			oSettings.bInitialised = true;
			
			/* Check if we need to initialise the table (it might not have been handed off to the
			 * language processor)
			 */
			if ( bInitHandedOff === false )
			{
				_fnInitalise( oSettings );
			}
		});
	};
})(jQuery);
/*
Author: Jonathan Lister (jnthnlstr [at] googlemail [dot] com)
License: BSD
Version: 0.3

not done:
 - figure z-index of dragCol out automatically
 - column classes not getting copied across
 - if a sorted column is moved, it doesn't remain registered as sorted, so you have to click twice to sort differently; the column that moved into the vacated place is treated as sorted
*/
(function($) {

$.fn.dragColumns = function(selector) {

	var $table = $(selector);
	var $wrapper = $table.parent();
	var $thead = $table.find('thead tr');
	var from, to;
	var $dragCol;
	var isMoved = false;
	
	// stealing from FixedHeader here
	if($wrapper.css("position")!="absolute") {
		$wrapper.css("position","relative");
	}
	var findTargetCol = function(event) {
		var xPos = event.pageX;
		var target;
		var left, right;
		var index;
		$thead.find('th').each(function(i) {
			left = $(this).offset().left;
			right = left+$(this).width();
			if(left<xPos && right>=xPos) {
				target = this;
				index = i;
			}
		});
		return {
			index:index,
			elem:target
		};
	};
	var setupDragCol = function(index,elem) {
		from = index;
		var pos = $(elem).position();
		var $cloneTable = $($table[0].cloneNode(false));
		var getStyle = function(elem,styleProp) {
			var style;
			if (elem.currentStyle) {
				var regexp = new RegExp(/-(\w)/);
				var matches = regexp.exec(styleProp);
				if(matches) {
					styleProp = styleProp.replace(matches[0],matches[1].toUpperCase());
				}
				style = elem.currentStyle[styleProp];
			} else if (window.getComputedStyle) {
				style = document.defaultView.getComputedStyle(elem,null).getPropertyValue(styleProp);
			}
			return style;
		};
		var colWidth;
		var copySection = function(sectionSelector,elemType) {
			var section = $cloneTable[0].appendChild($table.find(sectionSelector)[0].cloneNode(false));
			$table.find(sectionSelector+' tr').each(function() {
				var row = section.appendChild(this.cloneNode(false));
				var rowHeight = this.offsetHeight;
				var cellPadding, $newCell;
				var it;
				$(this).find(elemType).each(function(i) {
					if(i===from) {
						if(!colWidth) {
							colWidth = this.offsetWidth;
						}
						$newCell = $(this.cloneNode(true));
						cellPadding = {
							left: parseInt(getStyle(this,"padding-left"),10),
							right: parseInt(getStyle(this,"padding-right"),10)
						};
						if($.browser.msie) { // IE box-model fix
							cellPadding.top = parseInt(getStyle(this,"padding-top"),10);
							cellPadding.bottom = parseInt(getStyle(this,"padding-bottom"),10);
							$newCell.height(rowHeight - cellPadding.top - cellPadding.bottom);
						}
						$newCell.css('width',colWidth - cellPadding.left - cellPadding.right);
						row.appendChild($newCell[0]);
					}
				});
				$(row).height(rowHeight);
			});
		};
		copySection('thead','th');
		copySection('tfoot','th');
		copySection('tbody','td');
		$dragCol = $("<div></div>").append($cloneTable).css({
			'position': 'absolute',
			'top': "0px",
			'left': pos.left,
			'opacity': 0.7,
			'zIndex':"2" // TO-DO: would be good to figure this out automatically
		});
		$wrapper.append($dragCol);
	};
	var updateDataTables = function(targetObj) {
		to = targetObj.index;
		var updateDataTable = function(fromCol,toCol) {
			var settings = oTable.fnSettings();
			var columns = settings.aoColumns;
			var visible = [];
			for(var i=0; i<columns.length; i++) {
				if(columns[i].bVisible===true) {
					visible.push(i);
				}
			}
			fromCol = visible[fromCol];
			toCol = visible[toCol];
			var col = columns.splice(fromCol,1);
			columns.splice(toCol,0,col[0]);
			visible = [];
			for(var i=0; i<columns.length; i++) {
				if(columns[i].bVisible===true) {
					visible.push(i);
				}
			}
			var $ths = $table.find('thead th');
			var $tfs = $table.find('tfoot th');
			var visTh, visTf;
			for(i=0; i<visible.length; i++) {
				visTh = $ths.get(i);
				visTf = $tfs.get(i);
				columns[visible[i]].nTh = visTh;
				columns[visible[i]].nTf = visTf;
				columns[visible[i]].iDataSort = visible[i]; // this hard-codes the sorting to the column itself (so you'd need to change this if you were sorting on the contents of other columns)
				visTh.innerHTML = columns[visible[i]].sTitle;
			}
			var rowData = settings.aoData;
			var row, r, h;
			for(i=0; i<rowData.length; i++) {
				row = rowData[i];
				r = row._aData.splice(fromCol,1);
				row._aData.splice(toCol,0,r[0]);
				h = row._anHidden.splice(fromCol,1);
				row._anHidden.splice(toCol,0,h[0]);
			}
			var rowOrder = settings.aiDisplay;
			var $tds;
			var j;
			for(i=0;i<rowOrder.length;i++) {
				$tds = $(rowData[rowOrder[i]].nTr).find('td');
				for(j=0;j<visible.length;j++) {
					$tds.eq(j)[0].innerHTML = rowData[rowOrder[i]]._aData[visible[j]];
				}
			}
		};
		updateDataTable(from,to);
		// update FixedHeader - should probably just call an event FixedHeader listens to
		if(oTable.fixedHeader) {
			oTable.fixedHeader.fnUpdate();
		}
	};
	var cancelDrag = function() {
		isMoved = false;
		$wrapper.unbind("mousemove");
		$wrapper.unbind("mouseup", endDrag).unbind("mouseleave");
		if($dragCol) {
			$dragCol.remove();
		}
	};
	var endDrag = function(event) {
		if(isMoved) {
			var targetObj = findTargetCol(event);
			updateDataTables(targetObj);
		}
		cancelDrag();
	};
	$(document).ready(function() {
		$wrapper.mousedown(function(event) {
			event.preventDefault();
			if (jQuery.browser.msie) { // IE triggers text-select on selectstart not mousedown
			    $(document).bind('selectstart', function () { return false; });
			    $(document).one("mouseup", function() {
			    	$(document).unbind("selectstart");
			    });
		    }
			var origEvent = event;
			$wrapper.one("mousemove", function(event) {
				isMoved = true;
				var targetObj = findTargetCol(origEvent);
				setupDragCol(targetObj.index,targetObj.elem);
				var eventPos = {
					pageX: origEvent.pageX,
					pageY: origEvent.pageY
				};
				var origPos = $dragCol.position();
				$wrapper.mousemove(function(event) {
					var xMoved = event.pageX - eventPos.pageX;
					$dragCol.css({
						"left": origPos.left+xMoved
					});
				});
				$wrapper.mouseleave(function(event) {
					cancelDrag();
				});
			}).one("mouseup", endDrag);
		});
	});
};

})(jQuery);/*
 * File:        FixedHeader.js
 * Version:     1.0.2
 * CVS:         $Id$
 * Description: "Fix" a header at the top of the table, so it scrolls with the table
 * Author:      Allan Jardine (www.sprymedia.co.uk)
 * Created:     Wed 16 Sep 2009 19:46:30 BST
 * Modified:    $Date$ by $Author$
 * Language:    Javascript
 * License:     LGPL
 * Project:     Just a little bit of fun :-)
 * Contact:     www.sprymedia.co.uk/contact
 * 
 * Copyright 2009 Allan Jardine, all rights reserved.
 *
 */


(function($) {

/*
 * Function: $.fn.dataTableExt.FixedHeader
 * Purpose:  FixedHeader "class"
 * Returns:  same as _fnInit
 * Inputs:   same as _fnInit
 */
$.fn.dataTableExt.FixedHeader = function ( oTable )
{
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public functions
	 */
	
	/*
	 * Function: fnUpdate
	 * Purpose:  Update the floating header from the current state of the DataTable
	 * Returns:  -
	 * Inputs:   bool:bUpdateDom - Update offset information (provided for speed options) - default true
	 * Notes:    This would be used when the DataTables state is changed. For example using 
	 *   fnSetColumnVis() to change the number of visible columns.
	 */
	this.fnUpdate = function ( bUpdateDom )
	{
		if ( typeof bUpdateDom == 'undefined' )
		{
			bUpdateDom = true;
		}
		
		_fnCloneThead();
		
		if ( bUpdateDom )
		{
			_iStart = $(_oSettings.nTable).offset().top;
			_iStartLeft = $(_oSettings.nTable).offset().left;
		}
	};
	
	
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private variables
	 */
	
	/* The DataTables object */
	var _oTable;
	
	/* The DataTables settings object - easy access */
	var _oSettings;
	
	/* The cloned table node */
	var _nCTable;
	
	/* The starting x-position of the table on the document */
	var _iStart;
	
	/* The starting x-position of the table relative to it's parent */
	var _iOffset;
	
	/* Current display information, cached so we don't have to query the DOM */
	var _oCache = {
		"sPosition": "",
		"sTop": "",
		"sLeft": ""
	};
	
	var _bIsIE6;
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private functions
	 */
	
	/*
	 * Function: _fnUpdateCache
	 * Purpose:  Check the cache and update cache and value if needed
	 * Returns:  -
	 * Inputs:   string:sCache - cache property
	 *           string:sSet - value to set
	 *           string:sProperty - object property to set
	 *           object:oObj - object to update
	 */
	function _fnUpdateCache ( sCache, sSet, sProperty, oObj )
	{
		if ( _oCache[sCache] != sSet )
		{
			oObj[sProperty] = sSet;
			_oCache[sCache] = sSet;
		}
	}
	
	/*
	 * Function: _fnCloneTable
	 * Purpose:  Clone the table node and do basic initialisation
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnCloneTable ()
	{
		var nOrigTable = _oSettings.nTable;
		
		/* We know that the table _MUST_ has a DIV wrapped around it, because this is simply how
		 * DataTables works. Therefore, we can set this to be relatively position (if it is not
		 * alreadu absolute, and use this as the base point for the cloned header
		 */
		if ( $(nOrigTable.parentNode).css('position') != "absolute" )
		{
			nOrigTable.parentNode.style.position = "relative";
		}
		
		/* Need to know the table's position relative to the other elements */
		_iOffset = nOrigTable.offsetTop;
		
		/* Just a shallow clone will do - we only want the table node */
		_nCTable = nOrigTable.cloneNode( false );
		_nCTable.style.position = "absolute";
		_nCTable.style.top = _iOffset+"px";
		_nCTable.style.left = nOrigTable.offsetLeft+"px";
		_nCTable.className += " FixedHeader_Cloned";
		_nCTable.id += "_Cloned";
		
		/* Insert the newly cloned table into the DOM, on top of the "real" header */
		nOrigTable.parentNode.insertBefore( _nCTable, nOrigTable );
		
		/* Dev note: for some mental reason we can't use the offset of '_nCTable' in IE. The original
		 * table will do us nicely though
		 */
		_iStart = $(_oSettings.nTable).offset().top;
		_iStartLeft = $(_oSettings.nTable).offset().left;
		
		/* Add the scroll event handler to move the table header */
		$(window).scroll( function () {
			var iWindow = $(window).scrollTop();
			var iNew, iTbodyHeight;
			
			if(1) //JRL: disabling pos:fixed to see if it helps with overflow problem // if ( _bIsIE6 )
			{
				if ( _iStart < iWindow )
				{
					iNew = iWindow-_iStart+_iOffset;
					iTbodyHeight = _oSettings.nTable.getElementsByTagName('tbody')[0].offsetHeight;
					
					if ( iNew < _iOffset+iTbodyHeight )
					{
						/* In the middle of the table */
						_fnUpdateCache( 'sTop', iNew+"px", 'top', _nCTable.style );
					}
					else
					{
						/* At the bottom of the table */
						_fnUpdateCache( 'sTop', (_iOffset+iTbodyHeight)+"px", 'top', _nCTable.style );
					}
				}
				else
				{
					/* Above the table */
					_fnUpdateCache( 'sTop', _iOffset+"px", 'top', _nCTable.style );
				}
			}
			else
			{
				if ( _iStart < iWindow )
				{
					iNew = iWindow-_iStart+_iOffset;
					iTbodyHeight = _oSettings.nTable.getElementsByTagName('tbody')[0].offsetHeight;
					if ( iNew < _iOffset+iTbodyHeight )
					{
						/* In the middle of the table */
						_fnUpdateCache( 'sPosition', 'fixed',          'position', _nCTable.style );
						_fnUpdateCache( 'sTop',      "0px",            'top',      _nCTable.style );
						_fnUpdateCache( 'sLeft',     _iStartLeft+"px", 'left',     _nCTable.style );
					}
					else
					{
						/* At the bottom of the table */
						_fnUpdateCache( 'sPosition', 'absolute',                 'position', _nCTable.style );
						_fnUpdateCache( 'sTop',      _iOffset+iTbodyHeight+"px", 'top',      _nCTable.style );
						_fnUpdateCache( 'sLeft',     "0px",                      'left',     _nCTable.style );
					}
				}
				else
				{
					/* Above the table */
					_fnUpdateCache( 'sPosition', 'absolute',    'position', _nCTable.style );
					_fnUpdateCache( 'sTop',      _iOffset+"px", 'top',      _nCTable.style );
					_fnUpdateCache( 'sLeft',     "0px",         'left',     _nCTable.style );
				}
			}
		} );
	}
	
	/*
	 * Function: _fnCloneThead
	 * Purpose:  Clone the THEAD element used in the DataTable and add required event listeners
	 * Returns:  -
	 * Inputs:   -
	 */
	function _fnCloneThead ()
	{
		/* Remove any children the cloned table has */
		while ( _nCTable.childNodes.length > 0 )
		{
			$('thead th', _nCTable).unbind( 'click' );
			_nCTable.removeChild( _nCTable.childNodes[0] );
		}
		
		/* Clone the DataTables header */
		var nThead = $('thead', _oSettings.nTable).clone(false)[0];
		_nCTable.appendChild( nThead );
		
		/* JRL: set width of cloned table in case original table has grown */
		$(_nCTable).width( $(_oSettings.nTable).width() );
		
		/* Copy the widths across - apparently a clone isn't good enough for this */
		$("thead:eq(0)>tr th", _oSettings.nTable).each( function (i) {
			$("thead:eq(0)>tr th:eq("+i+")", _nCTable).width( $(this).width() );
		} );
		
		$("thead:eq(0)>tr td", _oSettings.nTable).each( function (i) {
			$("thead:eq(0)>tr th:eq("+i+")", _nCTable)[0].style.width( $(this).width() );
		} );
		
		/* Add the event handlers for sorting */
		$('thead th', _nCTable).click( function (e) {
			/* Don't try and do the sort ourselves - let DataTables take care of the logic */
			var iTrigger = $('thead th', _nCTable).index(this);
			$('thead th:eq('+iTrigger+')', _oSettings.nTable).click();
			_fnCloneThead();
		} );
	}
	
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Initialisation
	 */
	_oTable = oTable;
	_oSettings = _oTable.fnSettings();
	
	//_bIsIE6 = ($.browser.msie && $.browser.version=="6.0");
	_bIsIE6 = ($.browser.msie && ($.browser.version=="6.0"||$.browser.version=="7.0"));
	
	_fnCloneTable();
	_fnCloneThead();
};

})(jQuery);
/* records.js */
var oTable;
var defaultView = [
	"avid",
	"legal_name",
	"trading_status",
	"registered_country",
	"operational_street_1",
	"operational_city",
	"operational_state",
	"operational_country",
	"operational_postcode"	
];
var aoColumnsRenderMap = {
	"registered_country": function(data) {
		return ISO_3166.countries.iso2name[data.aData[data.iDataColumn]] || "";
	},
	"operational_state": function(data) {
		var country = ISO_3166.countries.iso2name[data.aData[14]]; // 14 is the operational_country
		var mapping;
		var state;
		switch(country) {
			case "Australia":
				mapping = ISO_3166["2:AU"];
				break;
			case "Canada":
				mapping = ISO_3166["2:CA"];
				break;
			case "United States":
				mapping = ISO_3166.usa;
				break;
			default:
				// nothing
				break;
		}
		state = mapping ? mapping.iso2name[data.aData[data.iDataColumn]] : data.aData[data.iDataColumn];
		return state;
	},
	"operational_country": function(data) {
		return ISO_3166.countries.iso2name[data.aData[data.iDataColumn]] || "";
	}
};
$(document).ready(function() {
	// set up records table
	var aoColumns = [];
	var field, options;
	aoColumns.push({}); // AVID
	for(var i=0, il=recordFields.length; i<il; i++) {
		field = recordFields[i][0];
		options = {};
		if($.inArray(field,defaultView)===-1) {
			options.bVisible = false;
		}
		if(field in aoColumnsRenderMap) {
			options.fnRender = aoColumnsRenderMap[field];
		}
		aoColumns.push(options);
	}
	aoColumns.push(
		{ sClass: "center" }, // challenge
		{ sClass: "center" }  // request more information
	);
	var $table = $('#recordsTable');
	if($table.length!==0) {
		options = {
			bAutoWidth: false,
			bPaginate: false,
			bSortClasses: false,
			bInfo: false,
			aaSorting: [[1, 'asc']],
			aoColumns: aoColumns,
			sDom: 't'
		};
		
		var setUpTable = function() {
			var columns;
			function getTitles() {
				var titles = [];
				for(var i=0;i<columns.length;i++) {
					titles.push(columns[i].sTitle);
				}
				return titles;
			}
			function hideColumn(col) {
				if(columns[col].bVisible) {
					oTable.fnSetColumnVis(col, false);
				}
				oTable.fixedHeader.fnUpdate();
			}
			function showColumn(col) {
				if(!columns[col].bVisible) {
					oTable.fnSetColumnVis(col, true);
				}
				oTable.fixedHeader.fnUpdate();
			}
			$('#table').css('visibility',"visible");
			$.fn.dragColumns('#recordsTable');
			oTable.fixedHeader = new $.fn.dataTableExt.FixedHeader(oTable);
			columns = oTable.fnSettings().aoColumns;
			$('#recordsTable tfoot th').live("click",function() {
				var i = $('#recordsTable tfoot th').index(this);
				var head = $('#recordsTable thead th')[i];
				var title = head.innerHTML;
				var titles = getTitles();
				var pos = $.inArray(title, titles);
				hideColumn(pos);
				return false;
			});
			var $labels = $('#columnPicker span.label');
			var $controls = $('#columnPicker span.controls');
			var updateControlList = function() {
				var titles = getTitles();
				$labels.each(function(i) {
					$(this).text(titles[i]);
				});
				$controls.each(function(i) {
					if(!columns[i].bVisible) {
						$(this).addClass("invisible");
						$(this).removeClass("visible");
					} else {
						$(this).removeClass("invisible");
						$(this).addClass("visible");
					}
				});
			};
			$('#columnPicker .hideControl').click(function() {
				var i = $('#columnPicker .hideControl').index(this);
				var label = $labels[i].innerHTML;
				var titles = getTitles();
				var pos = $.inArray(label, titles);
				hideColumn(pos);
				updateControlList();
				return false;
			});
			$('#columnPicker .showControl').click(function() {
				var i = $('#columnPicker .showControl').index(this);
				var label = $labels[i].innerHTML;
				var titles = getTitles();
				var pos = $.inArray(label, titles);
				showColumn(pos);
				updateControlList();
				return false;
			});
			var colToggle = function() {
				updateControlList();
				$('#columnPicker #cols').toggle();
			};
			$('#pickerControl').click(colToggle);
		};
		
		if(window.asyncSearch) {
			var q = window.location.search;
			options.sAjaxSource = "/search.json"+q;
			options.fnInitComplete = setUpTable;
			options.fnServerData = function(url, data, callback) {
				var mapToDataTables = function(json) {
					var mapped = {"aaData":[]};
					var tiddler, fields;
					var count = json.length;
					var row;
					for(var i=0; i<count; i++) {
						tiddler = json[i];
						fields = tiddler.fields;
						row = [];
						row.push('<a href="/bags/avox/tiddlers/'+tiddler.title+'.html">'+tiddler.title+'</a>'); // AVID
						for(var j=0, jl=recordFields.length; j<jl; j++) {
							field = recordFields[j][0];
							row.push(fields[field] || "");
						}
						row.push('<a href="/bags/avox/tiddlers/'+tiddler.title+'.challenge">go</a>');
						row.push('<a href="/bags/avox/tiddlers/'+tiddler.title+'.request">go</a>');
						mapped.aaData.push(row);
					}
					var str = 'There are '+count+' results';
					switch(count) {
						case 0:
							str = 'There are no results - try <span class="filter"><a href="#">adding a filter</a></span> to include other fields in your search or <a href="/pages/suggest_new">suggest a new record</a>';
							break;
						case 1:
							str = 'There is 1 result';
							// deliberate fall-through
						case 51:
							str = 'There are more than 50 results, only showing the first 50';
							// deliberate fall-through
						default:
							str += ' - <span class="filter"><a href="javascript:;">add a filter</a>?</span>';
							break;
					}
					$('#results_count').html(str);
					callback(mapped);
				};
				$.getJSON(url, data, mapToDataTables);
			};
		}
		oTable = $table.dataTable(options);
		if(!window.asyncSearch) {
			setUpTable();
		}
	}
});
$(document).ready(function() {
	var gMapsHost = window.gMaps ? "http://www.google.com/jsapi?key="+window.gMaps.apiKey : "";
	if(gMapsHost) {
		function gLoad() {
			google.load("maps", "2", {
				"callback" : function() {
					var map;
					var op_company = window.gMaps.op_company;
					var op_address = window.gMaps.op_address;
					var addToMap = function(response) {
						// Retrieve the object
						var place = response.Placemark[0];
						// Retrieve the latitude and longitude
						var point = new google.maps.LatLng(place.Point.coordinates[1],
						                  place.Point.coordinates[0]);
						// Center the map on this point
						map.setCenter(point, 3);
						map.setZoom(14);
						// Create a marker
						var marker = new google.maps.Marker(point);
						// Add the marker to map
						map.addOverlay(marker);
						// Add address information to marker
						marker.openInfoWindowHtml(company);
					};
					// Create new map object
					map = new google.maps.Map2(document.getElementById("operational_map"));
					map.addControl(new google.maps.SmallMapControl());
					map.addControl(new google.maps.MapTypeControl());
					// Create new geocoding object
					var geocoder = new google.maps.ClientGeocoder();
					// Retrieve location information, pass it to addToMap()
					var company = op_company + "<br/>"+ op_address;
					geocoder.getLocations(op_address, addToMap);
				}
			});
		}
		window.mapsInitialize = function() {
			if($('#operational_map').is(":visible")) {
				gLoad();
			} else {
				window.setTimeout(window.mapsInitialize,1000);
			}
		};
		gMapsHost += "&callback=mapsInitialize";
		$.getScript(gMapsHost);
	}
});/* Google Analytics */
$(document).ready(function() {
	var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
	gaJsHost += "google-analytics.com/ga.js";
	var track = function() {
		if(document.location.hostname!=="localhost") {
			try {
				var pageTracker = _gat._getTracker("UA-7537948-1");
				pageTracker._trackPageview();
			} 
			catch(err) {}
		};
	};
	var callback = function() {
		window.setTimeout(track, 100); // Safari 2 and earlier cannot create _gat synchronously
	};
	$.getScript(gaJsHost, callback);
});
