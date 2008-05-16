<?php
#
#  PHP module to call BT Web21C Capabilities, see:
#
#    http://web21c.bt.com
#
#  generated 2008-04-29 13:53:38
#
#  Copyright (c) BT 2007. All rights reserved.
#
#
require_once(dirname(__FILE__) . '/lib/web21clibs.php');


#
#   Service Factory
#
class Web21c extends Web21cBase {

    function MessagingInbound() {
	return new Web21c_2007_07_MessagingInbound($this);
    }

    function MessagingOneWay() {
	return new Web21c_2007_07_MessagingOneWay($this);
    }

    function CallFlowProvisioning() {
	return new Web21c_2007_04_CallFlowProvisioning($this);
    }

    function InboundCallFlow() {
	return new Web21c_2008_04_InboundCallFlow($this);
    }

    function OutboundCallFlow() {
	return new Web21c_2007_04_OutboundCallFlow($this);
    }

    function SessionConferencing() {
	return new Web21c_2007_10_SessionConferencing($this);
    }

    function SessionThirdPartyCall() {
	return new Web21c_2007_10_SessionThirdPartyCall($this);
    }

    function WhiteLabelAuthentication() {
	return new Web21c_2007_01_WhiteLabelAuthentication($this);
    }

}

/*
 *  Messaging/Inbound
 *
 * This service requires sign-up. This service allows you to send an SMS to a GSM device and gather information about its delivery. It also stores and allows the application to retrieve SMS replies/messages sent to the application 
 */
class Web21c_2007_07_MessagingInbound extends Web21cSoapClient {

    public $web21cWsdl = "2007/07/Messaging/Inbound.wsdl";
    public $web21cLocation = "endpoint/Messaging/Inbound/2007/07";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Returns the status of a sent SMS message 
     */
    function getMessageDeliveryStatuses($messageId) {
	return $this->web21cSoapCall('getMessageDeliveryStatuses', 
	    array('parameters' => array(
		'messageId' => $messageId)));
    }

    /*
     * Get all stored SMS messages which have been sent to this application 
     */
    function getReceivedMessages($keyword) {
	return $this->web21cSoapCall('getReceivedMessages', 
	    array('parameters' => array(
		'keyword' => $keyword)));
    }

    /*
     * Sends an SMS message to a GSM device 
     */
    function sendMessage($recipientUris, $messageText) {
	return $this->web21cSoapCall('sendMessage', 
	    array('parameters' => array(
		'recipientUris' => $recipientUris, 
		'messageText' => $messageText)));
    }

    /*
     * Sends an SMS message to a GSM device and sends event updates to url entered 
     */
    function sendMessageWithEventing($recipientUris, $messageText, $url) {
	return $this->web21cSoapCall('sendMessageWithEventing', 
	    array('parameters' => array(
		'recipientUris' => $recipientUris, 
		'messageText' => $messageText, 
		'url' => $url)));
    }

    /*
     * Delete all stored SMS messages which have been sent to this application 
     */
    function clearReceivedMessages($messageIds) {
	return $this->web21cSoapCall('clearReceivedMessages', 
	    array('parameters' => array(
		'messageIds' => $messageIds)));
    }

}

/*
 *  Messaging/OneWay
 *
 * This service allows you to send an SMS to a GSM device and gather information about its delivery 
 */
class Web21c_2007_07_MessagingOneWay extends Web21cSoapClient {

    public $web21cWsdl = "2007/07/Messaging/OneWay.wsdl";
    public $web21cLocation = "endpoint/Messaging/OneWay/2007/07";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Returns the status of a sent SMS message 
     */
    function getMessageDeliveryStatuses($messageId) {
	return $this->web21cSoapCall('getMessageDeliveryStatuses', 
	    array('parameters' => array(
		'messageId' => $messageId)));
    }

    /*
     * Sends an SMS message to a GSM device 
     */
    function sendMessage($recipientUris, $from, $messageText) {
	return $this->web21cSoapCall('sendMessage', 
	    array('parameters' => array(
		'recipientUris' => $recipientUris, 
		'from' => $from, 
		'messageText' => $messageText)));
    }

    /*
     * Sends an SMS message to a GSM device and sends event updates to url entered 
     */
    function sendMessageWithEventing($recipientUris, $from, $messageText, $url) {
	return $this->web21cSoapCall('sendMessageWithEventing', 
	    array('parameters' => array(
		'recipientUris' => $recipientUris, 
		'from' => $from, 
		'messageText' => $messageText, 
		'url' => $url)));
    }

}

/*
 *  CallFlowProvisioning
 *
 * This service allows you to manage file resources used by the CallFlow service 
 */
class Web21c_2007_04_CallFlowProvisioning extends Web21cSoapClient {

    public $web21cWsdl = "2007/04/CallFlowProvisioning/CallFlowProvisioning.wsdl";
    public $web21cLocation = "endpoint/CallFlowProvisioning/2007/04";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Provision a file 
     */
    function putFile($name, $fileContent, $overwrite) {
	return $this->web21cSoapCall('putFile', 
	    array('parameters' => array(
		'name' => $name, 
		'fileContent' => $fileContent, 
		'overwrite' => $overwrite)));
    }

    /*
     * List provisioned files for an application 
     */
    function listFiles() {
	return $this->web21cSoapCall('listFiles', 
	    array('parameters' => array(
		)));
    }

    /*
     * Delete a provisioned file 
     */
    function deleteFile($name) {
	return $this->web21cSoapCall('deleteFile', 
	    array('parameters' => array(
		'name' => $name)));
    }

    /*
     * Generates a speech wav file for the supplied text 
     */
    function generateSpeech($name, $text, $voice, $overwrite) {
	return $this->web21cSoapCall('generateSpeech', 
	    array('parameters' => array(
		'name' => $name, 
		'text' => $text, 
		'voice' => $voice, 
		'overwrite' => $overwrite)));
    }

    /*
     * Retrieve a provisioned file 
     */
    function getFile($name) {
	return $this->web21cSoapCall('getFile', 
	    array('parameters' => array(
		'name' => $name)));
    }

}

/*
 *  InboundCallFlow
 *
 * This service facilitates the management of inbound interactive voice calls 
 */
class Web21c_2008_04_InboundCallFlow extends Web21cSoapClient {

    public $web21cWsdl = "2008/04/InboundCallFlow/InboundCallFlow.wsdl";
    public $web21cLocation = "endpoint/InboundCallFlow/2008/04";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Maps an inbound number or SIP URI to a call flow definition 
     */
    function addInboundCallMapping($destinationUri, $name) {
	return $this->web21cSoapCall('addInboundCallMapping', 
	    array('parameters' => array(
		'destinationUri' => $destinationUri, 
		'name' => $name)));
    }

    /*
     * Lists mappings between inbound numbers or SIP URIs and call flow definitions 
     */
    function listInboundCallMappings() {
	return $this->web21cSoapCall('listInboundCallMappings', 
	    array('parameters' => array(
		)));
    }

    /*
     * Removes mapping between an inbound number or SIP URI and a call flow definition 
     */
    function removeInboundCallMapping($destinationUri) {
	return $this->web21cSoapCall('removeInboundCallMapping', 
	    array('parameters' => array(
		'destinationUri' => $destinationUri)));
    }

    /*
     * Retrieves information about recently executed inbound call flows 
     */
    function getCallFlowInformations($destinationUris, $callIds, $timeWindowMins) {
	return $this->web21cSoapCall('getCallFlowInformations', 
	    array('parameters' => array(
		'destinationUris' => $destinationUris, 
		'callIds' => $callIds, 
		'timeWindowMins' => $timeWindowMins)));
    }

}

/*
 *  OutboundCallFlow
 *
 * This service facilitates the placement and management of application originated interactive voice calls 
 */
class Web21c_2007_04_OutboundCallFlow extends Web21cSoapClient {

    public $web21cWsdl = "2007/04/OutboundCallFlow/OutboundCallFlow.wsdl";
    public $web21cLocation = "endpoint/OutboundCallFlow/2007/04";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Initiates the execution of the given call flow 
     */
    function startCallFlow($callFlow) {
	return $this->web21cSoapCall('startCallFlow', 
	    array('parameters' => array(
		'callFlow' => $callFlow)));
    }

    /*
     * Terminates execution of a call flow 
     */
    function stopCallFlow($callId) {
	return $this->web21cSoapCall('stopCallFlow', 
	    array('parameters' => array(
		'callId' => $callId)));
    }

    /*
     * Returns information about a given call flow 
     */
    function getCallFlowInformation($callId) {
	return $this->web21cSoapCall('getCallFlowInformation', 
	    array('parameters' => array(
		'callId' => $callId)));
    }

}

/*
 *  Session/Conferencing
 *
 * Conference call offers a convenient way for two or more people to talk with each other at the same time. You initiate a call, bring people onto a call and remove people from the call, programmatically. 
 */
class Web21c_2007_10_SessionConferencing extends Web21cSoapClient {

    public $web21cWsdl = "2007/10/Session/Conferencing.wsdl";
    public $web21cLocation = "endpoint/Session/Conferencing/2007/10";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Creates a new conference, and optionally sends event updates to url entered. This must be called first before inviting participants. 
     */
    function createConference($eventUrl) {
	return $this->web21cSoapCall('createConference', 
	    array('parameters' => array(
		'eventUrl' => $eventUrl)));
    }

    /*
     * Removes a participant from the conference. The participant's call will be hung up. 
     */
    function disconnectParticipant($participantId) {
	return $this->web21cSoapCall('disconnectParticipant', 
	    array('parameters' => array(
		'participantId' => $participantId)));
    }

    /*
     * Closes the conference call. Any active participants will be hung up. 
     */
    function endConference($conferenceId) {
	return $this->web21cSoapCall('endConference', 
	    array('parameters' => array(
		'conferenceId' => $conferenceId)));
    }

    /*
     * Returns status information about the requested conference. 
     */
    function getConferenceInfo($conferenceId) {
	return $this->web21cSoapCall('getConferenceInfo', 
	    array('parameters' => array(
		'conferenceId' => $conferenceId)));
    }

    /*
     * Returns status information about a conference participant. 
     */
    function getParticipantInfo($participantId) {
	return $this->web21cSoapCall('getParticipantInfo', 
	    array('parameters' => array(
		'participantId' => $participantId)));
    }

    /*
     * Returns status information about all the participants associated with this conference. This includes all participants that have been on the conference i.e. it includes participants who have either left the call or have been disconnected. 
     */
    function getParticipants($conferenceId) {
	return $this->web21cSoapCall('getParticipants', 
	    array('parameters' => array(
		'conferenceId' => $conferenceId)));
    }

    /*
     * Invite a new participant to the conference. This causes the participant to be called. If they answer the call they will be joined to the conference call. 
     */
    function inviteParticipant($conferenceId, $participantUri, $announcementType) {
	return $this->web21cSoapCall('inviteParticipant', 
	    array('parameters' => array(
		'conferenceId' => $conferenceId, 
		'participantUri' => $participantUri, 
		'announcementType' => $announcementType)));
    }

}

/*
 *  Session/ThirdPartyCall
 *
 *  
 */
class Web21c_2007_10_SessionThirdPartyCall extends Web21cSoapClient {

    public $web21cWsdl = "2007/10/Session/ThirdPartyCall.wsdl";
    public $web21cLocation = "endpoint/Session/ThirdPartyCall/2007/10";
    public $web21cPolicy = "CommonCapabilityPolicy";
    
    /*
     * Terminates a call. If the call is active then both parties will be hung up. If the call is in the process of being set-up then any connected party will be hung up and no further action taken. 
     */
    function endCall($callId) {
	return $this->web21cSoapCall('endCall', 
	    array('parameters' => array(
		'callId' => $callId)));
    }

    /*
     * Returns status information about the requested call. 
     */
    function getCallInformation($callId) {
	return $this->web21cSoapCall('getCallInformation', 
	    array('parameters' => array(
		'callId' => $callId)));
    }

    /*
     * Causes a call to be setup between two parties, and optionally sends event updates to url entered. The calling party will be rung first. Once the calling party has answered then the called party will be rung. Once the called party has answered a call is setup between the two parties. 
     */
    function makeCall($callingParty, $calledParty, $dialTimeoutSec, $announcementType, $eventUrl) {
	return $this->web21cSoapCall('makeCall', 
	    array('parameters' => array(
		'callingParty' => $callingParty, 
		'calledParty' => $calledParty, 
		'dialTimeoutSec' => $dialTimeoutSec, 
		'announcementType' => $announcementType, 
		'eventUrl' => $eventUrl)));
    }

}

/*
 *  WhiteLabelAuthentication
 *
 * A service that provides basic user and group management for an application. 
 */
class Web21c_2007_01_WhiteLabelAuthentication extends Web21cSoapClient {

    public $web21cWsdl = "2007/01/WhiteLabelAuthentication/WhiteLabelAuthentication.wsdl";
    public $web21cLocation = "endpoint/WhiteLabelAuthentication/2007/01";
    public $web21cPolicy = "WLAPolicy";
    
    /*
     * Logs the user on to the WhiteLabelAuthentication service. 
     */
    function login($userName, $password) {
	return $this->web21cSoapCall('login', 
	    array('parameters' => array(
		'userName' => $userName, 
		'password' => $password)));
    }

    /*
     * Creates a new user.  An email containing the user's password will be sent to the user. 
     */
    function addUser($userName) {
	return $this->web21cSoapCall('addUser', 
	    array('parameters' => array(
		'userName' => $userName)));
    }

    /*
     * Returns the user with the given user name. 
     */
    function getUser($userName) {
	return $this->web21cSoapCall('getUser', 
	    array('parameters' => array(
		'userName' => $userName)));
    }

    /*
     * Returns a list of all users. 
     */
    function getAllUsers() {
	return $this->web21cSoapCall('getAllUsers', 
	    array('parameters' => array(
		)));
    }

    /*
     * Changes the password for the given user. 
     */
    function changeUserPassword($userName, $oldPassword, $newPassword) {
	return $this->web21cSoapCall('changeUserPassword', 
	    array('parameters' => array(
		'userName' => $userName, 
		'oldPassword' => $oldPassword, 
		'newPassword' => $newPassword)));
    }

    /*
     * Removes the given user. 
     */
    function removeUser($userName) {
	return $this->web21cSoapCall('removeUser', 
	    array('parameters' => array(
		'userName' => $userName)));
    }

    /*
     * Creates a new user attribute for the given user. 
     */
    function addUserAttributes($userName, $userAttributes) {
	return $this->web21cSoapCall('addUserAttributes', 
	    array('parameters' => array(
		'userName' => $userName, 
		'userAttributes' => $userAttributes)));
    }

    /*
     * Removes an attribute for the given user.  
     */
    function removeUserAttributes($userName, $attributeNames) {
	return $this->web21cSoapCall('removeUserAttributes', 
	    array('parameters' => array(
		'userName' => $userName, 
		'attributeNames' => $attributeNames)));
    }

    /*
     * Updates an attribute for the given user. 
     */
    function updateUserAttribute($userName, $attributeName, $attributeValue) {
	return $this->web21cSoapCall('updateUserAttribute', 
	    array('parameters' => array(
		'userName' => $userName, 
		'attributeName' => $attributeName, 
		'attributeValue' => $attributeValue)));
    }

    /*
     * Returns a list of all groups. 
     */
    function getGroups() {
	return $this->web21cSoapCall('getGroups', 
	    array('parameters' => array(
		)));
    }

    /*
     * Creates a new group with the given name. 
     */
    function addGroup($groupName) {
	return $this->web21cSoapCall('addGroup', 
	    array('parameters' => array(
		'groupName' => $groupName)));
    }

    /*
     * Updates the name of the group. 
     */
    function updateGroup($oldGroupName, $newGroupName) {
	return $this->web21cSoapCall('updateGroup', 
	    array('parameters' => array(
		'oldGroupName' => $oldGroupName, 
		'newGroupName' => $newGroupName)));
    }

    /*
     * Removes the given group. 
     */
    function removeGroup($groupName) {
	return $this->web21cSoapCall('removeGroup', 
	    array('parameters' => array(
		'groupName' => $groupName)));
    }

    /*
     * Adds users to the given group. 
     */
    function addUsersToGroup($groupName, $userNames) {
	return $this->web21cSoapCall('addUsersToGroup', 
	    array('parameters' => array(
		'groupName' => $groupName, 
		'userNames' => $userNames)));
    }

    /*
     * Removes a collection of users from a given group. 
     */
    function removeUsersFromGroup($groupName, $userNames) {
	return $this->web21cSoapCall('removeUsersFromGroup', 
	    array('parameters' => array(
		'groupName' => $groupName, 
		'userNames' => $userNames)));
    }

    /*
     * Returns a list of all users in the given group. 
     */
    function getUsersInGroup($groupName) {
	return $this->web21cSoapCall('getUsersInGroup', 
	    array('parameters' => array(
		'groupName' => $groupName)));
    }

    /*
     * Resets the password for the given user. An email containing the user's password will be sent to the user. 
     */
    function resetUserPassword($userName) {
	return $this->web21cSoapCall('resetUserPassword', 
	    array('parameters' => array(
		'userName' => $userName)));
    }

}

?>
