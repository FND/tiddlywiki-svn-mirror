/***

http://en.wikipedia.org/w/index.php?title=MediaWiki:Monobook.css&action=raw&ctype=text/css
==CSS for Monobook skin only==

'''Notice to Administrators!'''

Any changes to [[Mediawiki:Monobook.css|Monobook.css]] or [[MediaWiki:Common.css|Common.css]] should be first proposed to [[Wikipedia:Village Pump]].  

Furthermore, changes should probably be made in 
[[MediaWiki:Common.css]] rather than this page, unless there is no effect in 
[[MediaWiki:Common.css]].  

Testing can be done on your own user Monobook.css.  
(In [[Mozilla]] and [[Opera (web browser)|Opera]], you can also test style changes dynamically with the [http://www.squarefree.com/bookmarklets/webdevel.html test styles] bookmarklet from squarefree.com.  It pops up a window for adding style rules, and updates the page as you type.)

Always check with the [http://jigsaw.w3.org/css-validator/validator?uri=http%3A%2F%2Fen.wikipedia.org%2Fw%2Findex.php%3Ftitle%3DMediaWiki%3AMonobook.css%26action%3Draw%26ctype%3Dtext%2Fcss&usermedium=all W3C CSS Validation Service] after any changes.

Thank you.
{{interwiki-all}}

***/

/*{{{*/

 /* Donations link to be uncommented during fundraising drives  */
 #siteNotice {
     margin-top:5px;
     padding-left: 4px;
     font-style: italic;
     text-align: center;
 }
 
 /*
 #fundraising {
  text-align: center;
  border: 1px solid gray;
  padding: 5px;
 }
 */
 
 /****************************/
 /* BEGIN LIGHT BLUE SECTION */
 /****************************/
 /* Make all non-namespace pages have a light blue content area. This is done by
    setting the background color for all #content areas to light blue and then
    overriding it for any #content enclosed in a .ns-0 (main namespace). I then
    do the same for the "tab" background colors. --Lupo */
 
 #content {
     background: #F8FCFF; /* a light blue */
 }
 
 #content div.thumb {
     border-color: #F8FCFF;
 }
 
 .ns-0 * #content {
     background: white;
 }
 
 #mytabs li {
     background: #F8FCFF;
 }
 
 .ns-0 * #mytabs li {
     background: white;
 }
 
 #mytabs li a {
     background-color: #F8FCFF;
 }
 
 .ns-0 * #mytabs li a {
     background-color: white;
 }
 
 #p-cactions li a, #p-cactions li a:hover, #p-cactions li.selected a {
     background-color: #F8FCFF;
 }
 
 .ns-0 * #p-cactions li a {
     background-color: #fbfbfb;
 }
 
 .ns-0 * #p-cactions li.selected a, .ns-0 * #p-cactions li a:hover {
     background-color: white;
 }
 
 .ns-0 * #content div.thumb {
     border-color: white;
 }
 
 /**************************/
 /* END LIGHT BLUE SECTION */
 /**************************/
 
 /* block quotations */
 #content blockquote {
     font-size: 93.75%; /* equivalent of 15px in 16px default */
     margin: 1em 1.6em; /* same indent as an unordered list */
 }
 #content blockquote p {
     line-height:inherit;
 }
 
 /* Display "From Wikipedia, the free encyclopedia" */
 #siteSub {
     display: inline;
     font-size: 92%;
     font-weight: normal;
 }
 
 #bodyContent #siteSub a {
     color: #000;
     text-decoration: none;
     background-color: transparent;
     background-image: none;
     padding-right: 0;
 }
 
 /* Bold 'edit this page' link to encourage newcomers */
 #ca-edit a { font-weight: bold !important; }
 
 /* Display "User $1, you are already logged in!"
    ([[MediaWiki:Alreadyloggedin]]) in red and bold */
 div.alreadyloggedin { color: red; font-weight: bold; }
 
 @media print {
     /* Do not print edit link in templates using Template:Ed
        Do not print certain classes that shouldn't appear on paper */
     .editlink, .noprint, .metadata, .dablink { display: none }
     #content { background: #FFFFFF; } /* white background on print */
 }
 
 
 /* Accessibility experiment: make diff changes not just colour-based */ 
 
 .diffchange {
     font-weight: bold;
     background-color: inherit;
 }
 
 td.diff-addedline, td.diff-deletedline, td.diff-context {
     font-size: 85%;
     color: inherit;
 }
 
 #pt-login {
   font-weight: bold;
   font-size: 110%;
 }
 
 form#userlogin {
   float: left;
   padding: 1em 1em .7em 1em;
   background-color: #ffffe6;
   border: 2px solid #fc6;
   color: #000;
   margin-right: 2em;
 }
 
 form#userlogin table {
   float: left;
   background-color: #ffffe6;
   color: #000;
 }
 
 p.error {
   font-weight: bold;
 }
 
 /* Class styles */
 
 /* .toccolours added here because version in 
    monobook/main.css wasn't being used by the print style */
 .toccolours { 
    border:1px solid #aaaaaa;
    background-color:#f9f9f9;
    padding:5px;
    font-size: 95%;
 }
 
 /* Remove padding from external links displayed without icon */
 #bodyContent .plainlinks a {padding: 0 !important}
 
 
 #p-nav h5 {
    display: none;
 }
 
 .portlet a {
    text-decoration: none;
 }
 
 .portlet a:hover {
    text-decoration: underline;
 }
 
 #p-nav .pBody {
    padding-right: 0;
 }
 
 #p-nav a {
    display: block;
    width: 100%;
 }
 
 /* Special characters list below edit window works better without underlining */
 #editpage-specialchars a { text-decoration: none; }
 #editpage-specialchars a:hover { text-decoration: underline; }
 
 /* If you don't want to see special characters list at all,
    put the following line in your User:You/monobook.css file
   (and remove the slash-asterisk comments) */
 /* #editpage-specialchars { display: none; } */
 
 /* Makes the background of a framed image white instead of gray. */
 /* Only visible with transparent images. */
 /* See #Framed_image_background_color */
 div.thumb div a img {
     background-color:#ffffff;
 }
 
 /* For positioning icons at top-right, used in Templates
    "Spoken Article" and "Featured Article" */
 
 div.topicon {
   position:absolute; 
   z-index:100; 
   top:10px;
   display: block !important;
 }
 
 /* try adding here, this had no effect in [[MediaWiki:Common.css]] */
 .plainlinksneverexpand a.external.text:after {
  display: none !important
 }
 
 /* Standard Navigationsleisten, aka box hiding thingy from .de.*/
 
 div.Boxmerge,
 div.NavFrame {
         margin: 0px;
         padding: 2px;
         border: 1px solid #aaaaaa;
         text-align: center;
         border-collapse: collapse;
         font-size: 95%;
 }
 div.Boxmerge div.NavFrame {
         border-style: none;
         border-style: hidden;
 }
 div.NavFrame + div.NavFrame {
         border-top-style: none;
         border-top-style: hidden;
 }
 div.NavPic {
         background-color: #ffffff;
         margin: 0px;
         padding: 2px;
         float: left;
 }
 div.NavFrame div.NavHead {
         height: 1.6em;
         font-weight: bold;
         font-size: 100%;
         background-color: #efefef;
         position:relative;
 }
 div.NavFrame p {
         font-size: 100%;
 }
 div.NavFrame div.NavContent {
         font-size: 100%;
 }
 div.NavFrame div.NavContent p {
         font-size: 100%;
 }
 div.NavEnd {
         margin: 0px;
         padding: 0px;
         line-height: 1px;
         clear: both;
 }
 a.NavToggle {
         position:absolute;
         top:0px;
         right:3px;
         font-weight:normal;
         font-size:smaller;
 }
 
 #coordinates {  
  position:absolute;
  z-index:1;
  border:none;
  background:none;
  right:30px;
  top:3.7em;
  float:right;
  margin:0.0em;
  padding:0.0em;
  line-height:1.5em;
  text-align:right;
  text-indent:0;
  font-size:85%;
  text-transform:none;
  white-space:nowrap;
 }
/*}}}*/