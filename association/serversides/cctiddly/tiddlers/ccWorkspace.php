<div title="ccWorkspace" modifier="ccTiddly"  tags="systemConfig excludeLists excludeSearch" >
<pre>	/***
|''Name:''|ccCreateWorkspace|
|''Description:''|Allows users to create workspaces in ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.6|
|''Browser:''| Firefox |
***/
//{{{

var url = "<?php echo $scheme;?>://<?php echo $_SERVER['SERVER_NAME'].str_replace('/index.php', '',  $_SERVER['SCRIPT_NAME']);?>";
	var workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";
	var workspacePermission =  {};
	
		<?php
	
if ($workspace_create == "A" &&  $tiddlyCfg['allow_workspace_creation'] ==1)
{
echo "workspacePermission.create = 1;";
}


?>

config.backstageTasks.push(&quot;create&quot;);
merge(config.tasks,{
    create: {text: &quot;create&quot;, tooltip: &quot;Create new workspace&quot;, content:'&lt;&lt;ccCreateWorkspace&gt;&gt;'}});


config.macros.ccCreateWorkspace = {

	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
	// When we server this tiddler it need to know the URL of the server to post back to
	//this value is currently set in index.php, should be index.php?action=createWorkspace to prepare for modulation
		//form heading
		
		
		if (workspacePermission.create != 1)
		{
			createTiddlyElement(place,&quot;div&quot;, null, "annotation",  &quot;You do not have permissions to create a workspace. &quot;);
			return null;
		}
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.onsubmit = this.createWorkspaceOnSubmit;
		createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Create new workspace &quot;);
		createTiddlyElement(frm,&quot;br&quot;);
		createTiddlyText(frm, "You can get your own TiddlyWiki workspace by filling in the form below.");
		createTiddlyElement(frm,&quot;br&quot;);
		createTiddlyElement(frm,&quot;br&quot;);
		
		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		
		//form content
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
		
		//form workspace name/url
		createTiddlyText(step,url+"/");
		var workspaceName = createTiddlyElement(step,&quot;input&quot;,&quot;ccWorkspaceName&quot;, &quot;ccWorkspaceName&quot;)				
		workspaceName.value = workspace;
		workspaceName.size = 15;
		workspaceName.name = 'ccWorkspaceName';
		createTiddlyElement(step,&quot;br&quot;);

		//privilege form
		createTiddlyElement(step,&quot;h4&quot;, null, null,  &quot;Anonymous Users Can :  &quot;);
	//	var anC = createTiddlyCheckbox(null, &quot;Create Tiddlers&quot;, 0);
		
		
		
		
		
		 var anC = createTiddlyElement(null,&quot;input&quot;, &quot;anC&quot;,&quot;anC&quot;);
	     anC.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anC);
		 createTiddlyText(step, "Create Tiddlers");
		 createTiddlyElement(step,&quot;br&quot;);
		 
		  var anR = createTiddlyElement(null,&quot;input&quot;, &quot;anR&quot;,&quot;anR&quot;);
	     anR.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
		anR.setAttribute(&quot;checked&quot;,&quot;checked&quot;);
	    step.appendChild(anR);
		 createTiddlyText(step, "Read Tiddlers");
	createTiddlyElement(step,&quot;br&quot;);
		 
		  var anU = createTiddlyElement(null,&quot;input&quot;, &quot;anU&quot;,&quot;anU&quot;);
	     anU.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anU);
		 createTiddlyText(step, "Update Tiddlers");
	createTiddlyElement(step,&quot;br&quot;);
		 
		  var anD = createTiddlyElement(null,&quot;input&quot;, &quot;anD&quot;,&quot;anD&quot;);
	     anD.setAttribute(&quot;type&quot;,&quot;checkbox&quot;);
	     step.appendChild(anD);
		 createTiddlyText(step, "Delete Tiddlers");
		createTiddlyElement(step,&quot;br&quot;);
		
		
	
//		anC.id='anC';
//		frm.appendChild(anC);
//		createTiddlyElement(step,&quot;br&quot;);
//	var  anR = createTiddlyCheckbox(step, &quot;Read Tiddler&quot;, 1);
	//	anR.id = 'anR';
	//	createTiddlyElement(step,&quot;br&quot;);
	//	var anU = createTiddlyCheckbox(step, &quot;Updates Tiddlers &quot;, 0);
	//	anU.id = 'anU';
	//	createTiddlyElement(step,&quot;br&quot;);
	//	var anD = createTiddlyCheckbox(step, &quot;Delete Tiddlers&quot;, 0);
	//	anD.id = 'anD';
		createTiddlyElement(step,&quot;br&quot;);
		createTiddlyElement(frm,&quot;br&quot;);
		
		var btn = createTiddlyElement(null,&quot;input&quot;,this.prompt,&quot;button&quot;);
		btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		btn.value = &quot;Create workspace&quot;
	    step.appendChild(btn);

	 	//createTiddlyElement(frm,&quot;br&quot;);
		//createTiddlyElement(frm,&quot;br&quot;);
		//createTiddlyElement(step,&quot;h2&quot;, null, null,  &quot;Registered Users  Can:  &quot;);
		//var usC = createTiddlyCheckbox(frm, &quot;Create Tiddlers&quot;, 1);
		//usC.id = 'usC';
		//createTiddlyElement(frm,&quot;br&quot;);
		//var usR = createTiddlyCheckbox(frm, &quot;Read Tiddler&quot;, 1);
		//usR.id = 'usR';
		//createTiddlyElement(frm,&quot;br&quot;);
		//var usU = createTiddlyCheckbox(frm, &quot;Updates Tiddlers &quot;, 1);
		//usU.id = 'usU';
		//createTiddlyElement(frm,&quot;br&quot;);
		//var usD = createTiddlyCheckbox(frm, &quot;Delete Tiddlers&quot;, 1);
		//usD.id='usD';
		//createTiddlyElement(frm,&quot;br&quot;);
		//createTiddlyElement(frm,&quot;hr&quot;);
		//createTiddlyText(frm,&quot;As the Workspace owner you will have all the above permissions&quot;);
		//createTiddlyElement(frm,&quot;br&quot;);
	},
	createWorkspaceOnSubmit: function() {
		var trueStr = "A";
		var falseStr = "D";
		// build up string with permissions values
		var anon=(this.anR.checked?trueStr:falseStr);
		anon+=(this.anC.checked?trueStr:falseStr);
		anon+=(this.anU.checked?trueStr:falseStr);
		anon+=(this.anD.checked?trueStr:falseStr);
		//var user=(this.usC.checked?trueStr:falseStr);
		//user+=(this.usR.checked?trueStr:falseStr);
		//user+=(this.usU.checked?trueStr:falseStr);
		//user+=(this.usD.checked?trueStr:falseStr);
		var params = {}; 
		params.url = url+'/'+this.ccWorkspaceName.value;
		var loginResp = doHttp('POST', url+'/'+this.ccWorkspaceName.value, &quot;ccCreateWorkspace=&quot; + encodeURIComponent(this.ccWorkspaceName.value)+&quot;&amp;ccAnonPerm=&quot;+encodeURIComponent(anon),null,null,null, config.macros.ccCreateWorkspace.createWorkspaceCallback,params);

		return false; 

	},
	createWorkspaceCallback: function(status,params,responseText,uri,xhr) {
	//	displayMessage(xhr.status);
		if(xhr.status==201) {
			window.location = params.url;
			//displayMessage('workspace crated');				
		} else if (xhr.status == 200) {
			displayMessage("Workspace name is already in use.");
		} else if (xhr.status == 403) {
			displayMessage("Permission denied, the ability to create new workspaces may have been disabled by you systems administrator.");	
		} else {
			displayMessage(responseText);	
		}

	}

}


 	config.macros.ccListWorkspaces = {
 	        handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
 	                // When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
 	                <?php
 	                $result = db_workspace_selectAllPublic();
 	                while ($row = db_fetch_assoc($result))
 	                {
 	                        echo "var item = createTiddlyElement(place, 'A', null, null,  &quot;".$row['name']."&quot;);\n";
 	                        if( $tiddlyCfg['use_mod_rewrite']==1 ) {
 	                                echo "item.href= url+'/".$row['name']."';\n";
 	                        }else{
 	                                echo "item.href= url+'?workspace=".$row['name']."';\n";
 	                        }
 	                        echo "createTiddlyElement(place,&quot;br&quot;);";
 	                }
 	                ?>
 	                createTiddlyText(place, "\n Total Number of workspaces : <?php echo  db_num_rows($result)-1;?>");
 	        }
 	}



 	config.macros.ccListMyWorkspaces = {
 	        handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
 	                // When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
 	                <?php
 	                $result =  db_workspace_selectOwnedBy($user['username']);
 	                while ($row = db_fetch_assoc($result))
 	                {
 	                        echo "var item = createTiddlyElement(place, 'A', null, null,  &quot;".$row['workspace_name']."&quot;);\n";
 	                        if( $tiddlyCfg['use_mod_rewrite']==1 ) {
 	                                echo "item.href= url+'/".$row['workspace_name']."';\n";
 	                        }else{
 	                                echo "item.href= url+'?workspace=".$row['workspace_name']."';\n";
 	                        }
 	                        echo "createTiddlyElement(place,&quot;br&quot;);";
 	                }
 	                ?>
 	                createTiddlyText(place, "\n Your workspaces : <?php echo  db_num_rows($result);?>");
 	        }
 	}


config.macros.ccEditWorkspace = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.onsubmit = this.createWorkspaceOnSubmit;
		createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Edit Workspace Permissions :  &quot;);
		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
	
		createTiddlyElement(step,&quot;h4&quot;, null, null,  &quot;Anonymous Users Can :  &quot;);
		var anC = createTiddlyCheckbox(step, &quot;Create Tiddlers&quot;, 0);
		anC.id='anC';
		createTiddlyElement(step,&quot;br&quot;);
		var  anR = createTiddlyCheckbox(step, &quot;Read Tiddler&quot;, 1);
		anR.id = 'anR';
		createTiddlyElement(step,&quot;br&quot;);
		var anU = createTiddlyCheckbox(step, &quot;Updates Tiddlers &quot;, 0);
		anU.id = 'anU';
		createTiddlyElement(step,&quot;br&quot;);
		var anD = createTiddlyCheckbox(step, &quot;Delete Tiddlers&quot;, 0);
		anD.id = 'anD';
		createTiddlyElement(step,&quot;br&quot;);
		
		createTiddlyElement(frm,&quot;br&quot;);
		var btn = createTiddlyElement(frm,&quot;input&quot;,this.prompt,"button", "button");
		 btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		 btn.value = &quot;edit workspace permissions&quot;
		createTiddlyElement(frm,&quot;br&quot;);
		createTiddlyElement(frm,&quot;br&quot;);
			}
}
//}}}
</pre>
</div>