<?php
/***
 * upload_test.php - a simple php script to validate the server php environment 
 *	for using store.php
 * version :1.0.0 - 2007/02/02 - BidiX@BidiX.info
 * usage :
 *	- install in your webserver directory
 *	- point your browser to its URL
 *	- You should be able to upload a file and display the Uploaded file
 ***/

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
?>
<html>
	<body>
		<a href="http://tiddlywiki.bidix.info/#[[upload_test.php]]">upload_test.php</a> (v1.0.0)<p>
		<form enctype="multipart/form-data" action="<?=$_SERVER[REQUEST_URI]?>" method="post">
		 	Send this file: <input name="userfile" type="file">
			<input value="Send File" type="submit">
		</form>
	</body>
</html>
<?php
	exit;
}
if (is_uploaded_file($_FILES['userfile']['tmp_name'])) {
	echo "File ". $_FILES['userfile']['name'] ." uploaded successfully.\n";
	echo "Displaying contents\n<XMP>";
	readfile($_FILES['userfile']['tmp_name']);
} else {
	echo "Possible file upload attack: ";
	echo "filename '". $_FILES['userfile']['tmp_name'] . "'.";
}
?>
