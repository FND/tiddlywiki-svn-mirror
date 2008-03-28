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

var url = "<?php echo getURL();?>";
	var workspace = "<?php echo $tiddlyCfg['workspace_name'];?>";
	var workspacePermission =  {};
	
		<?php
	
	

if ($workspace_create == "A" &&  $tiddlyCfg['allow_workspace_creation'] ==1)
{
	echo "workspacePermission.create = 1;\n";
}

if (user_isAdmin($user['username'], $tiddlyCfg['workspace_name']))
{
	echo "workspacePermission.upload = 1;";
	echo "workspacePermission.owner = 1;";
}


$anonPerm  = stringToPerm($tiddlyCfg['default_anonymous_perm']);


?>


workspacePermission.anonC = <?php echo permToBinary($anonPerm['create']); ?> ;
workspacePermission.anonR = <?php echo permToBinary($anonPerm['read']); ?>; 
workspacePermission.anonU = <?php echo permToBinary($anonPerm['update']); ?>;
workspacePermission.anonD = <?php echo permToBinary($anonPerm['delete']); ?>; 


config.backstageTasks.push('create');
merge(config.tasks,{
    create: {text: 'create', tooltip: 'Create new workspace', content:'&lt;&lt;ccCreateWorkspace&gt;&gt;'}});


config.macros.ccCreateWorkspace = {

	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
	// When we server this tiddler it need to know the URL of the server to post back to
	//this value is currently set in index.php, should be index.php?action=createWorkspace to prepare for modulation
		//form heading
		
		
		if (workspacePermission.create != 1)
		{
			createTiddlyElement(place,'div', null, "annotation",  'You do not have permissions to create a workspace. ');
			return null;
		}
		var frm = createTiddlyElement(place,'form',null,"wizard");
		frm.onsubmit = this.createWorkspaceOnSubmit;
		createTiddlyElement(frm,'br');
		createTiddlyElement(frm,'h1', null, null,  'Create new workspace ');
		createTiddlyElement(frm,'br');
		createTiddlyText(frm, "You can get your own TiddlyWiki workspace by filling in the form below.");
		createTiddlyElement(frm,'br');
		createTiddlyElement(frm,'br');
		
		var body = createTiddlyElement(frm,'div',null, "wizardBody");
		
		//form content
		var step = createTiddlyElement(body,'div',null, "wizardStep");
				createTiddlyElement(step, "br");
		//form workspace name/url
		var url_label = createTiddlyElement(step, "label", null, "label", url);
	 	url_label.setAttribute("for","ccWorkspaceName");
		var workspaceName = createTiddlyElement(step,'input','ccWorkspaceName', 'input')				
		workspaceName.value = workspace;
		workspaceName.size = 15;
		workspaceName.name = 'ccWorkspaceName';
		createTiddlyElement(step,'br');

		//privilege form
		createTiddlyElement(step,'h4', null, null,  'Anonymous Users Can :  ');
	//	var anC = createTiddlyCheckbox(null, 'Create Tiddlers', 0);
		var span = createTiddlyElement(step, 'span', null, "checkContainer")
		 var anC = createTiddlyElement(null,'input', 'anC','checkInput');
	     anC.setAttribute('type','checkbox');
		if (workspacePermission.anonC==1)
			anC.setAttribute('checked','checked');    
	 span.appendChild(anC);
		var anC_label = createTiddlyElement(step, "label", null, "checkLabel", "Create Tiddlers");
	 	anC_label.setAttribute("for","anC");
		 createTiddlyElement(step,'br');
		 
				var span = createTiddlyElement(step, 'span', null, "checkContainer")
		  var anR = createTiddlyElement(null,'input', 'anR','checkInput');
	     anR.setAttribute('type','checkbox');
		if (workspacePermission.anonR  == 1)
			anR.setAttribute('checked','checked');
	    span.appendChild(anR);
		var anR_label = createTiddlyElement(step, "label", null, "checkLabel", "Read Tiddlers");
	 	anR_label.setAttribute("for","anR");
	createTiddlyElement(step,'br');
		 
				var span = createTiddlyElement(step, 'span', null, "checkContainer")
		  var anU = createTiddlyElement(null,'input', 'anU','checkInput');
	     anU.setAttribute('type','checkbox');
		if (workspacePermission.anonU  == 1)
			anU.setAttribute('checked','checked');
	     span.appendChild(anU);
		var anU_label = createTiddlyElement(step, "label", null, "checkLabel", "Update Tiddlers");
	 	anU_label.setAttribute("for","anU");
	createTiddlyElement(step,'br');
		 
				var span = createTiddlyElement(step, 'span', null, "checkContainer")
		  var anD = createTiddlyElement(null,'input', 'anD','checkInput');
	     anD.setAttribute('type','checkbox');
		if (workspacePermission.anonD  == 1)
			anD.setAttribute('checked','checked');
	     span.appendChild(anD);
		var anD_label = createTiddlyElement(step, "label", null, "checkLabel", "Delete Tiddlers");
	 	anD_label.setAttribute("for","anD");
		createTiddlyElement(step,'br');
		
		
	
			

		createTiddlyElement(step,'br');
		createTiddlyElement(frm,'br');
		
		var btn = createTiddlyElement(null,'input',this.prompt,'button');
		btn.setAttribute('type','submit');
		btn.value = 'Create Workspace'
	    frm.appendChild(btn);
		createTiddlyElement(frm,'br');
		createTiddlyElement(frm,'br');
		

	},
	createWorkspaceOnSubmit: function() {
		var trueStr = "A";
		var falseStr = "D";
		// build up string with permissions values
		var anon=(this.anR.checked?trueStr:falseStr);
		anon+=(this.anC.checked?trueStr:falseStr);
		anon+=(this.anU.checked?trueStr:falseStr);
		anon+=(this.anD.checked?trueStr:falseStr);
		var params = {}; 
		params.url = url+this.ccWorkspaceName.value;
		var loginResp = doHttp('POST', url+this.ccWorkspaceName.value, 'ccCreateWorkspace=' + encodeURIComponent(this.ccWorkspaceName.value)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null, config.macros.ccCreateWorkspace.createWorkspaceCallback,params);
		return false; 

	},
	createWorkspaceCallback: function(status,params,responseText,uri,xhr) {
	//	displayMessage(xhr.status);
		if(xhr.status==201) {
			window.location = params.url;
			//displayMessage('workspace crated');				
		} else if (xhr.status == 200) {
			displayMessage("Workspace name is already in use."+responseText);
		} else if (xhr.status == 403) {
			displayMessage("Permission denied, the ability to create new workspaces may have been disabled by you systems administrator.");	
		} else {
			displayMessage(responseText);	
		}

	}

}

config.macros.ccEditWorkspace = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
		
		if (workspacePermission.owner != 1)
		{
			createTiddlyElement(place,'div', null, "annotation",  'You do not have permissions to edit this workspaces permission. ');
			return null;
		}
		// When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
		var frm = createTiddlyElement(place,'form',null,"wizard");
		frm.onsubmit = this.editWorkspaceOnSubmit;
		createTiddlyElement(frm, "br");
		createTiddlyElement(frm,'h1', null, null,  'Edit Workspace Permissions');
		createTiddlyElement(frm, "br");
		var body = createTiddlyElement(frm,'div',null, "wizardBody");
		var step = createTiddlyElement(body,'div',null, "wizardStep");
		createTiddlyElement(step,'h4', null, null,  'Anonymous Users Can :  ');
		
		var span = createTiddlyElement(step, 'span', null, "checkContainer")
		var anC = createTiddlyCheckbox(span, null, workspacePermission.anonC);
		anC.id='anC';
		anC.setAttribute("class","checkInput");
		var anC_label = createTiddlyElement(step, "label", null, "checkLabel", "Create Tiddlers");
	 	anC_label.setAttribute("for","anC");
		createTiddlyElement(step,'br');
		
		
		var span = createTiddlyElement(step, 'span', null, "checkContainer")
		var  anR = createTiddlyCheckbox(span, null ,workspacePermission.anonR);
		anR.id = 'anR';
		anR.setAttribute("class","checkInput");
		var anR_label = createTiddlyElement(step, "label", null, "checkLabel", "Read Tiddlers");
	 	anR_label.setAttribute("for","anR");

		createTiddlyElement(step,'br');
				var span = createTiddlyElement(step, 'span', null, "checkContainer")
		var anU = createTiddlyCheckbox(span, null, workspacePermission.anonU);
		anU.id = 'anU';
		anU.setAttribute("class","checkInput");
		var anU_label = createTiddlyElement(step, "label", null, "checkLabel", "Update Tiddlers");
	 	anU_label.setAttribute("for","anU");
	
		createTiddlyElement(step,'br');
		
					var span = createTiddlyElement(step, 'span', null, "checkContainer")
		var anD = createTiddlyCheckbox(span, null, workspacePermission.anonD);
		anD.id = 'anD';
		anD.setAttribute("class","checkInput");
		var anD_label = createTiddlyElement(step, "label", null, "checkLabel", "Delete Tiddlers");
	 	anD_label.setAttribute("for","anD");
	
		createTiddlyElement(step,'br');
		createTiddlyElement(frm,'br');
		var btn = createTiddlyElement(frm,'input',this.prompt,"button", "button");
		 btn.setAttribute('type','submit');
		 btn.value = 'Edit Workspace Permissions'
		createTiddlyElement(frm,'br');
		createTiddlyElement(frm,'br');
	},
		
	editWorkspaceOnSubmit: function() {
		var trueStr = "A";
		var falseStr = "D";
		// build up string with permissions values
		var anon=(this.anR.checked?trueStr:falseStr);
		anon+=(this.anC.checked?trueStr:falseStr);
		anon+=(this.anU.checked?trueStr:falseStr);
		anon+=(this.anD.checked?trueStr:falseStr);
		doHttp('POST', url+'handle/update_workspace.php', 'ccCreateWorkspace=' + encodeURIComponent(workspace)+'&amp;ccAnonPerm='+encodeURIComponent(anon),null,null,null, config.macros.ccEditWorkspace.editWorkspaceCallback,params);
		return false;
	},

	editWorkspaceCallback: function(status,params,responseText,uri,xhr) {
		if (xhr.status == 200) {
			displayMessage(responseText);	
		}
		return false;
	}		
}
config.macros.ccListWorkspaces = {
        handler: function(place,macroName,params,wikifier,paramString,tiddler, errorMsg) {
                // When we server this tiddler it need to know the URL of the server to post back to, this value is currently set in index.php
                <?php
                $result = db_workspace_selectAllPublic();
                while ($row = db_fetch_assoc($result))
                {
                        echo "var item = createTiddlyElement(place, 'A', null, null,  '".$row['name']."');\n";
                        if( $tiddlyCfg['use_mod_rewrite']==1 ) {
                                echo "item.href= url+'".$row['name']."';\n";
                        }else{
                                echo "item.href= url+'?workspace=".$row['name']."';\n";
                        }
                        echo "createTiddlyElement(place,'br');";
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
                        echo "var item = createTiddlyElement(place, 'A', null, null,  '".$row['workspace_name']."');\n";
                        if( $tiddlyCfg['use_mod_rewrite']==1 ) {
                                echo "item.href= url+'".$row['workspace_name']."';\n";
                        }else{
                                echo "item.href= url+'?workspace=".$row['workspace_name']."';\n";
                        }
                        echo "createTiddlyElement(place,'br');";
                }
                ?>
                createTiddlyText(place, "\n Your workspaces : <?php echo  db_num_rows($result);?>");
        }
}




//}}}
</pre>
</div>