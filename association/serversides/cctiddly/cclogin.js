/***
|''Name:''|ccLogin|
|''Description:''|Login Plugin for ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.2.6|
|''Browser:''| Firefox |
***/

//{{{

config.backstageTasks.push("login");
merge(config.tasks,{
    login: {text: "login", tooltip: "Login to your TiddlyWiki", content: '<<ccLogin>>'},

});


// Returns output var with output.txtUsername and output.sessionToken



function findToken(cookieStash) {
    var output = {};
    var cookies =cookieStash.split("\n");
    for(var c=0; c< cookies.length; c++) {
        var cl = cookies[c].split(";");
        for(var e=0; e<cl.length; e++) {
            var p = cl[e].indexOf("=");
            if(p != -1) {
                var name = cl[e].substr(0,p).trim();
                var value = cl[e].substr(p+1).trim();        
                if (name== 'txtUserName') {
                    output.txtUserName = value;
                }
                if (name== 'sessionToken') {
                    output.sessionToken = value;
                }
            }
        }
    }
    return output;
}

config.macros.ccLogin = {

    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
        var img = createTiddlyElement(place,"img");
        img.src = 'http://www.cot.org.uk/designforliving/companies/logos/bt.jpg ';
        var loginDiv = createTiddlyElement(place,"div",null,"loginDiv",null);
        this.refresh(loginDiv);
    },

    refresh: function(place, errorMsg) {
          var loginDivRef = document.getElementById ("LoginDiv");
        removeChildren(loginDivRef);
         var wrapper = createTiddlyElement(place,"div");
        var cookieValues = findToken(document.cookie);
        if ( cookieValues.sessionToken != 'invalid' && cookieValues.sessionToken && cookieValues.txtUserName) {
            // user is logged in
            displayMessage('login is ok and we are refreshing');
            var msg = createTiddlyElement(wrapper,"div");
            wikify("You are logged in as " + cookieValues.txtUserName, msg);
            var frm = createTiddlyElement(wrapper,"form",null,null);
            frm.onsubmit = this.logoutOnSubmit;
            var btn = createTiddlyElement(frm,"input",null);
            btn.setAttribute("type","submit");
            btn.value = "Logout";        
        } else {
            //user not logged in.
            var frm = createTiddlyElement(wrapper,"form",null,null);
            frm.onsubmit = this.loginOnSubmit;
            createTiddlyElement(frm,"h1", null, null,  "Login is Required");
            if (errorMsg !=null) {
                createTiddlyElement(frm,"h1", null, null,  "Login Failed because : "+errorMsg);
            }
            createTiddlyText(frm,"Username");

            var txtuser = createTiddlyElement(frm,"input","cctuser", "cctuser");



            if (cookieValues.txtUserName !=null)
{
txtuser.value =cookieValues.txtUserName;
}
            createTiddlyElement(frm,"br");
            createTiddlyText(frm,"Password");
            var txtpass = createTiddlyElement(frm,"input", 'cctpass','cctpass');
txtpass.type='password';
            createTiddlyElement(frm,"br");
            var btn = createTiddlyElement(frm,"input",this.prompt);
            btn.setAttribute("type","submit");
            btn.value = "Login";
        }
     },

    killLoginCookie: function() {
        var c = 'sessionToken=';
        c+= "; expires=Fri, 1 Jan 1811 12:00:00 UTC; path=/";
        document.cookie = c;
        },

    logoutOnSubmit: function() {
        var loginDivRef = findRelated(this,"loginDiv","className","parentNode");
        removeChildren(loginDivRef);
        document.cookie = "sessionToken=invalid;   expires=15/02/2009 00:00:00";
        config.macros.ccLogin.refresh(loginDivRef);
        return false;
    },


    loginOnSubmit: function() {
        var user = document.getElementById('cctuser').value;
        var pass = document.getElementById('cctpass').value;
        var params = {};  
        params.origin = this;
displayMessage(Crypto.hexSha1Str('password'));
        var loginResp = doHttp('POST', 'http://127.0.0.1/cctiddly/msghandle.php', "cctuser=" + encodeURIComponent(user)+"&cctpass="+encodeURIComponent(pass),null,null,null, config.macros.ccLogin.loginCallback,params);




        return false;
    },

loginCallback: function(status,params,responseText,uri,xhr) {




if (status==true)
{
displayMessage('COONECTION was ok ');
} else {
displayMessage('no connection');
}

    var cookie = xhr.getResponseHeader("Set-Cookie");
    var cookieValues = this.findToken(cookie);
displayMessage('you have been called back'+cookieValues.sessionToken);

if (cookieValues.sessionToken == 'invalid') {
        var errorMsg = 'Login Failed - invalid session token';
    }

    config.macros.ccLogin.saveCookie(cookieValues);
    var loginDivRef = findRelated( params.origin,"loginDiv","className","parentNode");
    removeChildren(loginDivRef);
    if (!errorMsg) {
        var errorMsg = '';
    }
    config.macros.ccLogin.refresh (loginDivRef, errorMsg);
  
return false;
},

    logoutCallback: function(status,params,responseText,uri,xhr) {
        // return true
},

    saveCookie: function(cookieValues) {
        // Save the session token in cookie.
        var c = 'sessionToken' + "=" + cookieValues.sessionToken;
        c+= "; expires=Fri, 1 Jan 2811 12:00:00 UTC; path=/";
        document.cookie = c;
        // Save the txtUserName in the normal tiddlywiki format
        config.options.txtUserName = cookieValues.txtUserName;
        saveOptionCookie("txtUserName");
    }

}
//}}}








