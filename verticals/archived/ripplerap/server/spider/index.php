<?php
/*
 *  add key press for the spider
 *
 *  Form parameters:
 *    - digit - key pressed on the phone
 *
 */

    if (!isset($_POST['digit'])) {
?><html>
<body>
<h3>Control Boris the Spider</h3>

    <form method="POST" action="<?php echo $_SERVER['REQUEST_URI']  ?>">
        <label for="digit">digit:</label>
        <input type="text" id="digit" name="digit" value="" />
        <br/>
	<input type='submit' value='Submit'/>
   </form>

</body>
</html>
<?php 
	exit(0);
}
        $digit = $_POST['digit'];

	$fp = fopen("digits.txt", "a");
	fwrite($fp, $digit);
	fclose($fp);
?>
