<?php

if ($_GET['uri']) 
{
	$host  = $_SERVER['HTTP_HOST'];
	$uri   = rtrim(dirname($_SERVER['PHP_SELF']), '/\\');
	$file = exec("./html2pdf.sh '" . $_GET['uri'] . "'");
	header("Location: http://$host$uri/$file",TRUE,302);
	exit(0);
} else {
?>
	<form method="GET" action="<?php echo $_SERVER['REQUEST_URI']; ?>">
		<label for="uri">HTML URI:</label>
		<input type="text" size="80" name="uri" value='http://wiki.osmosoft.com/tiddlerTree2/uploads/documents/bid1.html'>
		<input id="submit" type="submit" value="Generate PDF"/>
	</form>
	<p>
		<a href="http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/server/html2pdf/">source code</a><br>
	</p>
<?php
}

?>
