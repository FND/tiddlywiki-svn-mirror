<?php

if ($_GET['uri']) 
{
	header('Content-Type: application/pdf');
	passthru("./html2pdf.sh '" . $_GET['uri'] . "'");
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
