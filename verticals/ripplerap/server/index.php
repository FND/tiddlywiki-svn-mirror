<?php

$title = "LeWeb";

function list_filename($f, $n="") 
{
    if (file_exists($f)) {
	print date("Y-m-d H:i:s", filemtime($f));
    } else {
	print "*none*";
    }
    if (!strcmp($n,"")) $n = $f;
    print " : " . '<a href="'.$f.'">'.$n.'</a>';
    print "<br/>";
}

?>
<head>
<title>RippleRap : <?php echo $title ?></title>
</head>
<body>
<h1>RippleRap : <?php echo $title ?></h1>

<a href="#feeds">Feeds</a> 
<a href="#users">Users</a> 
<a href="#notes">Notes</a> 
<?php
    list_filename("notes/.lasttime", "lasttime");
?>


<h2 id='feeds'>Feeds:</h2>
<?php

    foreach(scandir("feeds") as $feed) {
	if (strcmp(".", substr($feed, 0, 1))) {
	    list_filename("feeds/$feed", $feed);
	}
    }

?>

<h2 id='users'>Users:</h2>
<?php

    foreach(scandir("users") as $user) {
	if (strcmp(".", substr($user, 0, 1))) {
	    list_filename("users/$user/index.xml", $user);
	}
    }

?>

<h2 id='notes'>Notes:</h2>
<?php

    foreach(scandir("notes") as $note) {
	if (strcmp(".", substr($note, 0, 1))) {
	    list_filename("notes/".$note, $note);
	}
    }
?>
</body>
</html>
