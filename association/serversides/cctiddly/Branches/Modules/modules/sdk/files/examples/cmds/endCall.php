#!/usr/bin/env php
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

    /*
     *  make third party call
     */
    $web21c = new Web21c($applicationName, $environment);

    $voice = $web21c->SessionThirdPartyCall();
    $voice->debug = 0;

    /*
     *  parties can be "tel:+12345678" format numbers
     *  - but here we test with the mock phones
     */
    $calling = $web21c->mockPhone("happy");
    $called = $web21c->mockPhone("happy");

    print "calling: " . $calling . "\n";
    print "called:  " . $called . "\n";

    $r = $voice->makeCall($calling, $called, 30);

    $callId = $r->callId;

    print "call made as : " . $callId . "\n";

    /*
     *  monitor the call
     */
    do  {

	print "get call info ..\n" ;

	$r = $voice->getCallInformation($callId);
	$info = $r->callInformation;

	print "info:" 
            . " " . $info->callStatus 
	    . " " . $info->startTime 
	    . " " . $info->duration 
	    . " " . $info->callTerminationCause 
	    .  "\n";

	sleep(1);

	if ($info->duration > 3 && $info->callTerminationCause == "CallNotTerminated") {
	    print "ending call ..\n";
	    $voice->endCall($callId);
	}

    } while ($info->callTerminationCause == "CallNotTerminated");

?>
