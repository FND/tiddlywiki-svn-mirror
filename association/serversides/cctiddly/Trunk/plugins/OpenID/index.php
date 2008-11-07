<?php
$p = new Plugin('OpenID Plugin','0.1','simonmcmanus.com');
$p->addEvent("postSetLoginPerm", './plugins/OpenID/files/openid/common.php');
$data['tags'] = 'SSSystemLogin';
$p->addTiddler('/Applications/xampp/xamppfiles/htdocs/plugins/OpenID/files/OpenID.js', $data);
?>