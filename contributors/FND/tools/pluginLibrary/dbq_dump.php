<?php

require "dbq.php";

?>

<?php

$sql = new dbq();
$sql->connectToDB();

?>

<?php
/*

$sql = new dbq();
$sql->connectToDB();
$out = $sql->updateFieldValue("plugins", "modifier", "foo", "ID", "4");
print_r($out); // DEBUG

*/
?>

<?php
/*

$query_insert = <<<EOT
INSERT INTO pluginLibrary.plugins (
	ID ,
	repository_ID ,
	available ,
	title ,
	text ,
	created ,
	modified ,
	modifier ,
	updated ,
	documentation ,
	views ,
	annotation
)
VALUES (
	NULL ,
	'1',
	'1',
	'SampleMacro',
	'|''''Name:''''|SampleMacro|
foo bar baz lorem
ipsum dolor sit amet',
	'2008-05-11', 
	'2008-05-11', 
	'FND', '2008-05-11', 
	'lorem ipsum dolor sit amet',
	 '0',
	 NULL
);
EOT;

$query_update = <<<EOT
UPDATE pluginLibrary.plugins SET
	name = 'Foo',
	available = '0',
	title = 'foo',
	text = 'foo',
	created = '2008-05-11',
	modified = '2008-05-11',
	modifier = 'bar',
	updated = '2008-05-11',
	documentation = 'foo'
	WHERE plugins.ID = 4 LIMIT 1 ;
EOT;

$sql = new dbq();
$sql->connectToDB();
$out = $sql->insertDB($query_insert);
print_r($out); // DEBUG

*/
?>

<?php
/*

echo "<pre>"; // DEBUG
$sql = new dbq();
$sql->connectToDB();
$out = $sql->queryDB("SELECT * FROM repositories");
print_r($out);
echo "</pre>"; // DEBUG

*/
?>
