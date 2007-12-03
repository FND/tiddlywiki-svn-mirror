<?php
/*
 *  create WebDAV user directory for ripplerap
 *
 *  - username should be WikiFormatName
 *  - password cannot be recovered, but can be reasserted with:
 *    $ htpasswd conf/passwd username password
 */

    if (!isset($_POST['username']) || !isset($_POST['password'])) {
?><html>
<body>
<h3>Add a RippleRap User</h3>

    <form method="POST" action="<?php echo $_SERVER['REQUEST_URI']  ?>">
        <label for="username">username:</label>
        <input type="text" id="username" name="username" value="" />
        <br/>
        <label for="password">password:</label>
        <input type="text" id="password" name="password" value="" />
	<br/>
	<input type='submit' value='Submit'/>
   </form>

</body>
</html>
<?php 
	exit(0);
}

        $username = $_POST['username'];
        $password = $_POST['password'];

	#
	#  root installation directory
	#
	$root = dirname(__FILE__);

	#
	#  check only contains unicode letters
	#
	if (preg_match('#[^\p{L}\p{N}]+#u', $username)) {
	    header("HTTP/1.0 400 Bad Request");
	    print "<html><body>username contains punctuation</body></html>";
	    exit(0);
	}

	#
	#  create directory
	#  - TBD: permissions need reviewing
	#
        $userDir = "$root/users/$username";
        if (!mkdir("$userDir", 0777)) {
	    header("HTTP/1.0 409 Conflict");
	    print "<html><body>username already exists</body></html>";
	    exit(0);
	}

	#
	#  add user/pass to passwd file
        #
	$f = fopen("$userDir/.htpasswd", 'a') or die("can't open the passwd file: ");
	fwrite($f, "$username:" .  crypt($password, base64_encode($password)) . "\n");
	fclose($f);	

	#
	#  create user's .htaccess file
	#
	$f = fopen($userDir."/.htaccess", 'w') or die("can't open users' .htaccess file");
	fwrite($f, "AuthType Basic\n");
	fwrite($f, "AuthName 'TiddleLeWeb'\n");
	fwrite($f, "AuthUserFile .htpasswd\n");
	fwrite($f, "Require user $username\n");
	fclose($f);	

	print "created user";

	exit(0);
?>
