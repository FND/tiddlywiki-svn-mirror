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

#  depends upon PHP's SoapClient and openssl (builtin PHP 5.x):
#     http://uk.php.net/soap
#     http://uk2.php.net/openssl
#
#  and upon the OpenSSO xmlseclibs (PHP 5.1): 
#     https://opensso.dev.java.net/source/browse/opensso/lightbulb/php/direct/
#
require_once(dirname(__FILE__) . '/xmlseclibs.php');

#
#   Exceptions
#
class Web21cException extends Exception { }
class Web21cPermissionDeniedException extends Exception { }

#
#   Factory Base class
#   - stores application context cached certificates, keys and tokens
#   - manages user contexts
#
class Web21cBase {

    private $hostnames = array(
	'unittest' => "localhost",		# unit testing SDK
	'sandbox' => "acorn.ws.bt.com",		# new sandbox
	'production' => "oaktree.ws.bt.com",	# production, you need a production certificate
	'development' => "acorntest.ws.bt.com" # internal BT testing box
    );

    private $applicationName = NULL;
    private $environment = NULL;
    private $hostname = NULL;
    private $certificateFile = NULL;
    private $privateKeyFile = NULL;
    private $stashDir = NULL;
    private $certificate = NULL;
    private $privateKey = NULL;
    private $fileno = 0;

    public $mockPhonesHost = "mockphones.nat.bt.com:5660";

    #
    #  application name
    #
    public function __construct($applicationName, $environment="sandbox") {
	$this->applicationName = $applicationName;
	$this->environment = strtolower($environment);
	$this->checkDependencies('5.1.0', array('openssl', 'soap'));
    }

    #
    #  check PHP dependencies
    #
    public function checkDependencies($expectedVersion, $requiredExtensions) {

	$version = phpversion();

	if (version_compare($version, $expectedVersion) < 0) {
	    trigger_error("PHP version $expectedVersion or later required, this is PHP version $version");
	}

	foreach ($requiredExtensions as $extension) {

	    if (!extension_loaded($extension)) {
		trigger_error("the required builtin module \"$extension\" is missing from the PHP interpreter");
	   }
	}
    }


    #
    #  registered application name
    #
    public function applicationName($applicationName=NULL) {
	if (!is_null($applicationName)) {
	    $this->applicationName = $applicationName;
	}
	if (is_null($this->applicationName)) {
	    throw new Web21cException("unknown applicationName");
	}
	return $this->applicationName;
    }

    #
    #  environment 
    #  - sandbox, live, etc 
    #  - default is sandbox
    #
    public function environment($environment=NULL) {
	if (!is_null($environment)) {
	    $this->environment = $environment;
	}
	if (is_null($this->environment)) {
	    $this->environment = "sandbox";
	}
	return $this->environment;
    }

    public function hostname($hostname=NULL) {
	if (!is_null($hostname)) {
	    $this->hostname = $hostname;
	}
	if (is_null($this->hostname)) {
	    $this->hostname = $this->hostnames[$this->environment()];
        }
	if (is_null($this->hostname)) {
	    throw new Web21cException("unknown hostname");
	}
	return $this->hostname;
    }

    #
    #  stash directory
    #  - a place to store certificates and tokens
    #  - ideally keep this outside of your web server directory
    #
    public function stashDir($stashDir=NULL) {
	if (!is_null($stashDir)) {
	    $this->stashDir = $stashDir;
	}
        if (is_null($this->stashDir)) {
	    $this->stashDir = realpath(dirname(__FILE__) . "/../keys");
	}
	return $this->stashDir;
    }

    #
    #  stash filename
    #
    public function stashFilename($filename) {
	return $this->stashDir() . "/" . $filename;
    }

    #
    #  cache registered application's certificate .pem file
    #
    public function certificate($certificateFile=NULL) {
	if (!is_null($certificateFile)) {
	    $this->certificateFile = $certificateFile;
	    $this->certificate = NULL;
	}
	if (is_null($this->certificateFile)) {
	    $this->certificateFile = $this->stashFilename(
		$this->applicationName()."_".ucfirst($this->environment())."_"."SignedCert.pem");
	}
	if (is_null($this->certificate)) {
	    $this->certificate = XMLSecurityDSig::get509XCert(file_get_contents($this->certificateFile), true);
	}
	return $this->certificate;
    }

    #
    #  cache registered application's unencrypted private key .pem file
    #
    public function privateKey($privateKeyFile=NULL) {
	if (!is_null($privateKeyFile)) {
	    $this->privateKeyFile = $privateKeyFile;
	    $this->privateKey = NULL;
	}
	if (is_null($this->privateKeyFile)) {
	    $this->privateKeyFile = $this->stashFilename(
		$this->applicationName()."_".ucfirst($this->environment())."_"."PrivateKey.pem");
	}
	if (is_null($this->privateKey)) {
	    $this->privateKey = new XMLSecurityKey(XMLSecurityKey::RSA_SHA1, array('type'=>'private'));
	    $this->privateKey->loadKey($this->privateKeyFile, TRUE);
	}
	return $this->privateKey;
    }

    #
    #   dump 
    #
    public function dumpMessage($name, $msg) {
	$filename = "dump-" . ++$this->fileno . "-" . $name . ".xml";
	$f = fopen($filename, "w");
	print "dumping to $filename\n";
	fwrite($f, $msg, strlen($msg));
	fclose($f);
    }

    #
    #   mock phones
    #
    public function mockPhone($name, $delays=null) {

	$delay = "";

	if (isset($delays))
	    $delay = join("-", $delays) . "-";

        $id = md5(uniqid(rand(), true));

        return "sip:" . $name . "-" . $delay . $id . "@" . $this->mockPhonesHost;
    }
}


#
#  wrap for SoapClient to inject headers
#
class Web21cSoapClient extends SoapClient {

    public $debug = false;
    public $dump = false;
    public $stub = NULL;
    public $wsdl = NULL;
    public $location = NULL;
    public $connection_timeout = 5;
    public $response_timeout = 5;
    public $proxy_host = NULL;
    public $proxy_port = NULL;
    public $proxy_user = NULL;
    public $proxy_pass = NULL;

    public $web21c = NULL;
    public $web21cResponse = NULL;
    public $web21cUser = NULL;

    public function __construct($web21c) {

	$this->web21c = $web21c;

	if (is_null($this->location)) {
	    $this->location = "https://" . $this->web21c->hostname() .  '/' . $this->web21cLocation;
	}

	if (is_null($this->wsdl)) {
	    $this->wsdl = dirname(__FILE__) . "/../wsdl/" . $this->web21cWsdl;
	}

	return parent::__construct($this->wsdl);
    }

    function web21cBase($web21c=NULL) {
	if (!is_null($web21c)) {
	    $this->web21c = $web21c;
	}
	return $this->web21c;
    }

    function __doRequest($request, $location, $saction, $version) {
	
		//HUGE HACK START - xfire can't handle the callflow xml without specifically specifying that it is of xsi:type xsd:string
		$replace = "xmlns:ns1=\"http://sdk.bt.com/2007/04/OutboundCallFlow\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">";
		$request = str_replace("xmlns:ns1=\"http://sdk.bt.com/2007/04/OutboundCallFlow\">", $replace, $request);
		$request = str_replace("<ns1:callFlow>", "<ns1:callFlow xsi:type='xsd:string'>", $request);
		//HUGE HACK END
		
        $soap = new Web21cSoapHeaders($this->web21c, $request);
        $soap->addHeaders($this->web21cPolicy, $saction, $this->web21cUser);
        $request = $soap->saveXML();

	ini_set("default_socket_timeout", $this->response_timeout);

	if ($this->dump) {
	    $this->web21c->dumpMessage("req", $request);
	}

	if ($this->debug) {
	    print "web21cSoapClient request::\n";
	    var_dump($request);
	    print "location: " . $location ."\n";
	    print "saction: " . $saction ."\n";
	    print "version: " . $version ."\n";
	}

	if (!is_null($this->stub)) {
	    return call_user_func($this->stub, $request, $location, $saction, $version);
	}

	$response = parent::__doRequest($request, $location, $saction, $version);

	if ($this->dump) {
	    $this->web21c->dumpMessage("rsp", $response);
	}

	if ($this->debug) {
	    var_dump($request);
		echo "\n\n";
		var_dump($response);
	}

	#
	#  save response XML
	#
        $this->web21cResponse = $response;
	return $response;
    }

    function web21cSoapCall($operation, $params) {
	if ($this->debug) {
	    print "operation: " . $operation ."\n";
	    var_dump($params);
        }

	try {
	    $response = $this->__soapCall($operation, $params);
	} catch (SoapFault $fault) {
	    if (ereg(".*:PermissionDeniedException", $fault->faultcode))
		throw new Web21cPermissionDeniedException($fault->getMessage(), $fault->getCode());
	    throw $fault;
	}

	if ($this->debug) {
	    print "response: ";
	    var_dump($response);
        }

        #
	#  authentication service login response
	#  - store SAML Assertion
	#
        if ($operation == "login" && $response->samlAssertion) {
	    $dom = new DOMDocument();
	    $dom->loadXML($this->web21cResponse);
	    $xpath = new DOMXPath($dom);
	    $uri = "urn:oasis:names:tc:SAML:1.0:assertion";
	    $prefix = "saml";
	    $xpath->registerNamespace($prefix, $uri);
	    $this->web21cUser = $xpath->query('//saml:Assertion')->item(0);
	    if ($this->dump) {
		$this->web21c->dumpMessage("saml", $dom->saveXML($this->web21cUser, LIBXML_NOEMPTYTAG));
	    }
	}

	return $response;
    }
}


#
#  add WS-Addressing, WSS and other SOAP headers    
#
class Web21cSoapHeaders {

    #
    #  namespaces
    #
    public $xmlns = array( 
        'soap' => 'http://schemas.xmlsoap.org/soap/envelope/',
	'wsa' => 'http://schemas.xmlsoap.org/ws/2004/08/addressing',
	'wsse' => 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd',
	'wsu' => 'http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd',
	'ds' => 'http://www.w3.org/2000/09/xmldsig#',
	'xsi'=> 'http://www.w3.org/2001/XMLSchema-instance',
	'xsd'=> 'http://www.w3.org/2001/XMLSchema',
	'sdk1' => 'http://sdk.bt.com/2007/04/SDK'
    );

    public $wssType = array( 
	'token' => "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-x509-token-profile-1.0#X509v3",
	'encoding' => "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary"
    );

    #
    #  time to live
    #
    public $expirySecs = 3600;

    private $web21c = NULL;
    private $dom = NULL;
    private $xpath = NULL;
    private $envNode = NULL;
    private $headNode = NULL;
    private $bodyNode = NULL;
    private $securityNode = NULL;
    
    public function __construct($web21c, $request) {
        if (is_null($web21c)) {
	    throw new Web21cException("unknown application context");
        }

	$this->web21c = $web21c;
        $this->dom = $dom = new DOMDocument();
		        
		$this->dom->loadXML($request);
        $this->envNode = $dom->documentElement;
        $this->xpath = new DOMXPath($dom);

        foreach ($this->xmlns as $prefix => $uri) {
	    $this->xpath->registerNamespace($prefix, $uri);
	    $this->envNode->setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:".$prefix, $uri);
        }

	$this->envNode = $this->xpath->query('/soap:Envelope')->item(0);
	$this->headNode = $this->xpath->query('/soap:Envelope/soap:Header')->item(0);

	if (!$this->headNode) {
	    $this->headNode = $this->dom->createElement('soap:Header');
	    $this->envNode->insertBefore($this->headNode, $this->envNode->firstChild);
	}

	$this->wsseNode = $this->xpath->query('/soap:Envelope/soap:Header/wsse:Security')->item(0);

	if (!$this->wsseNode) {
	    $this->wsseNode = $this->dom->createElement('wsse:Security');
	    $this->headNode->appendChild($this->wsseNode);
	}

	$this->bodyNode = $this->xpath->query('/soap:Envelope/soap:Body')->item(0);
    }

    public function saveXML() {
	return $this->dom->saveXML($this->dom->documentElement, LIBXML_NOEMPTYTAG);
    }

    private function UUID() {
        $uuid = md5(uniqid(rand(), true));
        $guid =  'urn:uuid:'.
	    substr($uuid, 0, 8)."-".
	    substr($uuid, 8, 4)."-".
	    substr($uuid, 12, 4)."-".
	    substr($uuid, 16, 4)."-".
	    substr($uuid, 20, 12);
        return $guid;
    }

    public function sdkAgent() {
        $node = $this->dom->createElement('sdk1:agent', phpversion());
	$node->setAttribute("language", 'PHP5');
	$node->setAttribute("version", '@SDKVERSIONCODE@');
        $this->headNode->appendChild($node);
    }

    public function wsaMessageID($uri=NULL) {
	if (is_null($uri)) {
	    $uri = $this->UUID();
        }
        $node = $this->dom->createElement('wsa:MessageID', $uri);
        $this->headNode->appendChild($node);
    }

    public function wsaAction($uri) {
        $node = $this->dom->createElement('wsa:Action', $uri);
        $this->headNode->appendChild($node);
    }

    public function wsuTimestampNode($node, $name, $time) {
        $datestr = gmdate("Y-m-d\TH:i:s", $time).'Z';
	$child = $this->dom->createElement($name, $datestr);
        $node->appendChild($child);
    }

    public function wsuTimestamp() {
        $now = time();

        $node = $this->dom->createElement('wsu:Timestamp');
        $this->wsuTimestampNode($node, 'wsu:Created', $now);
        $this->wsuTimestampNode($node, 'wsu:Expires', $now + $this->expirySecs);
        $this->wsseNode->appendChild($node);
    }

    public function wsseSamlToken($samlToken) {
	if (is_null($samlToken)) {
	    throw new Web21cException("missing web21cUser");
	}
        $node = $this->wsseNode->appendChild($this->dom->importNode($samlToken, true));
    }

    public function wsseBinaryToken() {
        $node = $this->dom->createElement('wsse:BinarySecurityToken', $this->web21c->certificate());
        $this->wsseNode->appendChild($node);

	$node->setAttribute("EncodingType", $this->wssType['encoding']);
	$node->setAttribute("ValueType", $this->wssType['token']);
	$node->setAttribute("wsu:Id", 'CERTID');

        $dsig = new XMLSecurityDSig();
        $sigNode = $dsig->locateSignature($this->dom);

	$tokenURI = '#'.$node->getAttributeNS($this->xmlns['wsu'], "Id");

	$keyInfo = $dsig->createNewSignNode('KeyInfo');
	$sigNode->appendChild($keyInfo);
	
	$tokenRef = $this->dom->createElement('wsse:SecurityTokenReference');
	$keyInfo->appendChild($tokenRef);

	$reference = $this->dom->createElement('wsse:Reference');
	$reference->setAttribute("URI", $tokenURI);
	$tokenRef->appendChild($reference);
    }   

    public function wsseSignMessage() {
        $dsig = new XMLSecurityDSig();
        $dsig->setCanonicalMethod(XMLSecurityDSig::EXC_C14N);

        $nodes = array();
        foreach ($this->wsseNode->childNodes AS $node) {
            if ($node->nodeType == XML_ELEMENT_NODE) {
                $nodes[] = $node;
            }
        }
	$nodes[] = $this->bodyNode;

        $dsig->addReferenceList($nodes, XMLSecurityDSig::SHA1, NULL, 
		array('prefix' => 'wsu', 'prefix_ns' => $this->xmlns['wsu']));

        $dsig->sign($this->web21c->privateKey());
        $dsig->appendSignature($this->wsseNode, TRUE);
    }

    public function addHeaders($web21cPolicy, $saction, $samlToken=NULL) {
        $this->sdkAgent();
        $this->wsaAction($saction);
        $this->wsaMessageID();
	$this->wsuTimestamp();
        $this->wsseSignMessage();

	if ($web21cPolicy == "UserContextPolicy") {
	    $this->wsseSamlToken($samlToken);
	}
        $this->wsseBinaryToken();
	return;
    }
}

?>
