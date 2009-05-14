<html>
<head>
<meta http-equiv="refresh" content="30" >
<style>
#count {
        text-align: center;
        width: 60%;
        font-size: 20em;
        font-weight: bolder;
        color: #fff;
        background-color: #0248C4;
        margin: 20px auto 0 auto;
        border: 5px solid black;
}
</style>
</head>
<body>
<div id="count">
<?php

$logdir='/home/pauldowney/logs/mediawikiunplugged.com/http/';
system('cat '.$logdir.'access.log '.$logdir.'access.log.20* | awk \'$7 == "/MediaWikiUnplugged.zip" { print $9 }\' | grep 200 | wc -l');

?>
<div>
</body>
</html>

