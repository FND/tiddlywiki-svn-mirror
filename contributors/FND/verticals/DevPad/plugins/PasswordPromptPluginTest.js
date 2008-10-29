//{{{
passwordPrompt.handler("test", passwordPromptTest);

function passwordPromptTest(inputs) {
	if(inputs === null)
		alert("'inputs' is null");
	else if(inputs === "")
		alert("'inputs' is empty");
	else
		alert("'inputs' is\n" + inputs);
}
//}}}