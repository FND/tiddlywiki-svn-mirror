/***
|Name|SplashScreenPlugin|
|Created by|SaqImtiaz|
|Location|http://lewcid.googlepages.com/lewcid.html#SplashScreenPlugin|
|Version|0.21 |
|Requires|~TW2.08+|

!Code
***/
//{{{
var old_lewcid_splash_restart=restart;

restart = function()
{   if (document.getElementById("SplashScreen"))
        document.getElementById("SplashScreen").style.display = "none";
      if (document.getElementById("contentWrapper"))
        document.getElementById("contentWrapper").style.display = "block";
    
    old_lewcid_splash_restart();
}
//}}}