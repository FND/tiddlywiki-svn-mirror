<?php
#
# Copyright (c) 2008, British Telecommunications plc
#
# All rights reserved.
#
# Redistribution, copy, create derivative works, distribute, issue, perform,
# assisting performance, broadcast, adapt, possess, display, make, sell, offer
# to sell and import in source and binary forms, with or without modification,
# are permitted provided that the following conditions are met:
#
# Redistributions of source code must retain the above copyright notice, this
# list of conditions and the following disclaimer. * Redistributions in binary
# form must reproduce the above copyright notice, this list of conditions and
# the following disclaimer in the documentation and/or other materials provided
# with the distribution. * Neither the name of the British Telecommunications
# plc nor the names of its contributors may be used to endorse or promote
# products derived from this software without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY OR SATISFACTORY QUALITY AND FITNESS FOR
# A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
# CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
# EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
# PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
# BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
# IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#

require_once(dirname(__FILE__) . '/../../web21c.php');
require_once(dirname(__FILE__) . '/../../config.php');

$keyword = "";

$web21c = new Web21c($applicationName, $environment);

$sms = $web21c->MessagingInbound();
$r = $sms->getReceivedMessages($keyword);
$a = $r->messages->message;

//print_r($r);


foreach($a as $key => $value)
{
	
	//	echo "{'".$value->messageId."'":
	//	echo "{'text':'".$value->messageText."'";
	//	echo "'id':'".$value->messageId."'";
	//	echo "'keyword':'".$value->keyword."'";	
	//	echo "'destination':'".$value->destinationUri."'";
	//	echo "'sender':'".$value->senderUri."'";
	//	echo "'recieved':'".$value->receiveTime."'";			
	
		echo "<div title='".$value->messageId."' modifier='".$value->senderUri."' received='".$value->receiveTime."' sender='".$value->senderUri."'   destination='".$value->destinationUri."' tags='sms'>\n<pre>\n";
		echo $value->messageText;
		echo "\n</pre>\n</div>\n";			
	

}
//$arr = array("tel:447918880749");
//$r = $sms->sendMessage($arr, 'test'); 
//dumps the response after sending the text. 
// //var_dump($r);



?>