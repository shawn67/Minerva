/* -------------------------------- */
/* ----general---- */

function parse(){
    dict = JSON.parse(data)
    var $option;

    uid = dict['userid'];
    uname = dict['username'];
    did = dict['domains'][0];
    tid = dict['topics'][0];
    if (uname != "admin"){
	if (dict['topics'][1] == null){
	    $("#lemurbox").attr("src", dict["domains"][1]);
	}
	else{
	    $("#lemurbox").attr("src", decodeURIComponent(dict['topics'][1]));
	}
    };
    if (uname == "admin"){
	$("#subtopic").hide();	
	$("#add_topic").hide();
	$("#edit_topic").hide();
	$("#delete_topic").hide();
	$("#viewdoc").hide();
	$("#SVannotations").hide();
    };
    for (i=2; i<dict["domains"].length;i++){
        $option = $("<option></option>").val(dict["domains"][i][0]).text(dict["domains"][i][1]);
        if (dict["domains"][i][0] == dict['domains'][0]){
            $option.prop("selected",true);
        };
        $("#Sdomain").append($option)
    };
    $("#username").text('Hi, ' + dict['username'])
    $("#topicname2 span").text($("#Stopic option:selected").text());
    /*
    for (i=2; i<dict["topics"].length;i++){
        $option = $("<option></option>").val(dict["topics"][i][0]).text(dict["topics"][i][1]);
        if (dict["topics"][i][0] == dict["topics"][0]){
            $option.prop("selected",true);
        };
        $("#Stopic").append($option);
    };
    */
    if (uname == "ian"){
	$("#summary").show();		
	$("#admin_cgi").show();		
    };
};

function valign($element){
    $element.each(function(){
        var margin_top = ($(this).parent().height() - $(this).innerHeight() - $(this).css("border-top-width").replace("px","") - $(this).css("border-bottom-width").replace("px","")) / 2;
        $(this).css("margin-top",margin_top + "px");
    });
};

function valignelements(){
    valign($("#domain_panel_description"));
    valign($("#topic_panel_description"));
    valign($("#edit_topic"));
    valign($("#add_subtopic_hint"));
    valign($("#confirm_sub"));
    valign($("#cancel_add_sub"));
};

function getSidebar(){
    if (tid != 0){
        $.ajax({
            url: "sidebarHandler.cgi",
            data: {
                topic_id: tid
            },
            dataType: "json",
            success: function(data){
                for (i=0;i<data.length;i++){
                    $subtopic = generateSubtopic(data[i][1], data[i][0]);
                    for (j=2;j<data[i].length;j++){
                        $passage = addPassageCallBack(data[i][j][1], $subtopic.find(".droppable"), data[i][j][0], data[i][j][2], {});
                        if (data[i][j][3] != -1){
                        //    $passage.addClass("grey");
                            $passage.find("input").eq(data[i][j][3] - 1).prop("checked",true);
                        //    $passage.find("input").prop("disabled",true);
                        }
                    }
                }
            },
	    complete: function(){
		if (uname == "admin"){
		    $('.deleteSubtopic').hide();
		    $('.Cboxheader span').hide();
		    $('.deletePassage').hide();
		    $(".passage form input").prop("disabled",true);
		};
	    }
        });
    }
};

function generateSubtopic(subtopic_name, subtopic_id){
    $dropbox = newDropbox(subtopic_name, subtopic_id);
    $("#dropbox_list").prepend($dropbox).show()
    if ($dropbox.find("h1").width() >= 330){
        $dropbox.find("h1").attr("title",subtopic_name);
    }
    return $dropbox
}

function test(){alert('haha')};
function logCurrentPage(urlvalue) {
    $.ajax({
        method: "POST",
        url: "logstate.cgi",
        data: {
            topic_id: tid,
            logurl: encodeURIComponent(urlvalue)
        }
    });
};

/* -------------------------------- */


/* -------------------------------- */
/* ----topic panel--- */

function addTopic(){
    $screen_lock = $("<div class='screen-cover'></div>");
    $screen_lock.css({
        "position" : "absolute",
        "z-index" : 10000,
        "background-color" : "#000",
        "opacity" : 0.15
    });
    $screen_lock.width($("body").width());
    $screen_lock.height($("body").height());
    $screen_lock.prependTo($("body"));
    $("#Atopic").css({
    	"z-index" : 10001,
	"position" : "relative"
    });
    $screen_lock.click(function(){
	alertdialog(1);
    });
    $("#Ctopic").hide();
    $("#Atopic input").val("");
    $("#Atopic").css({"display":"block","opacity":0});
    $("#Atopic").fadeTo("fast",1);
    valign($("#Atopic .cancel_topic"));
};

function confirmAddTopic(){
    $.ajax({
        method: "POST",
        url: "topicHandler.cgi",
        data: {
            userid : uid,
            domain_id : did,
            topic_name : $("#Atopic input").val()
        },
        success: function(response){
            addTopicCallBack(response.trim());
        }
    });
};

function addTopicCallBack(response){
    if (response == 0){
	alertdialog(2);
    }
    else if (response == -1){
	alertdialog(6);
    }
    else{
        //alert("Topic: " + $("#Atopic input").val() + " successfully added");
        //location = location + "?topic=" + response;
        /*
	$.ajax({
	    method: "post",
	    url: "./beta.cgi",
	    data: {
		topic: response
	    },
	    success: function(){
		window.location.reload();
	    }
	})*/
	if (tid == 0){
	    $.ajax({
		method: "POST",
		url: "logstate.cgi",
		data: {
		    topic_id: response,
		    logurl: encodeURIComponent(document.getElementById('lemurbox').contentWindow.location.href)
		}
	    });
	};
    $.ajax({
            method: "POST",
            url: "DynamicSearchHandler.cgi",
            data:{
                type: 'init',
                case_name: $("#Atopic input").val(),
                user_id: uid,
                domain_id: did,
                case_id: response
            },
            success: function(){
                $("<form action='./beta.cgi' method='post'><input name='topic' value="+response+"></form>").submit();
            }   
    })
	
	/*
	$("#Stopic").append($("<option></option>").val(response).text($("#Atopic input").val()));
        if ($("#Stopic option").length == 1){
            tid = response;
            $("#Stopic option").prop("selected", true);
        }
        $("#Atopic .cancel_topic").trigger("click");
	*/
    }
};

function editTopic(){
    if (tid != 0) {
        $("#Ctopic").hide();
        $("#Etopic input").val($("#Stopic option:selected").text());
        $("#Etopic").css({"display":"block","opacity":0});
        $("#Etopic").fadeTo("fast",1);
        valign($("#Etopic .cancel_topic"));
    }
};

function confirmEditTopic(){
    $.ajax({
        method: "POST",
        url: "topicHandler.cgi",
        data: {
            userid : uid,
            domain_id : did,
            topic_id : tid,
            topic_name : $("#Etopic input").val()
        },
        success: function(response){
            editTopicCallBack(response.trim());
        }
    })
};

function editTopicCallBack(response){
    if (response == 0){
	alertdialog(2);
    }
    else if (response == -1){
	alertdialog(6);
    }
    else{
        $("#Stopic option:selected").text($("#Etopic input").val());
	$("#topicname2 span").text($("#Stopic option:selected").text());
        //alert("Topic name changed successfully");
        $("#Etopic .cancel_topic").trigger("click");
    }
};

function cancelTopic(){
    $(".screen-cover").remove();
    $(this).parent().hide();
    $("#Ctopic").fadeIn();
};

function deleteTopic(){
    if (tid!=0){
	if (confirm("are you sure you want to delete this topic?") == true){
	    $.ajax({
		method : "post",
		url: "./deleteHandler.cgi",
		data:{
		    topic_id: tid,
		    domain_id: did,
		    userid: uid
		},
		success: function(response){
		    $("<form action='./beta.cgi' method='post'><input name='topic' value="+response.trim()+"></form>").submit();	
		}
	    });
	};
    };
};
/* -------------------------------- */


/* -------------------------------- */
/* ----subtopic panel---- */

function addSubtopic(){
    if (tid != 0){
        $("#add_subtopic_hint").hide();
        $("#input_subtopic").val("");
        $("#Asubtopic").fadeIn();
        valign($("#input_subtopic"));
        valign($("#cancel_add_sub"));
    }
    else{
	alertdialog(1);
    }
};

function cancelAddSub(){
    $("#Asubtopic").hide();
    $("#add_subtopic_hint").fadeIn();
};

function confirmAddSub(){
    $.ajax({
        method: "POST",
        url: "subtopicHandler.cgi",
        data: {
            userid : uid,
            topic_id : tid,
            subtopic_name : $("#input_subtopic").val()
        },
        success: function(response){
            addSubCallBack(response.trim());
        }
    });
};

function addSubCallBack(response){
    if (response == 0){
	alertdialog(3);
    }
    else if (response == -1){
	alertdialog(7);
    }
    else{
        $dropbox = newDropbox($("#input_subtopic").val(), response);
        $("#dropbox_list").prepend($dropbox).hide().fadeIn();
	if ($dropbox.find("h1").width() >= 330){
	    $dropbox.find("h1").attr("title",$dropbox.find("h1").text());
	}
        $("#cancel_add_sub").trigger("click");
    }
};

function newDropbox(subtopic_name, subtopic_id){
    $dropbox = $("<div class='dropbox'>\
                      <div class='boxheader'>\
                          <div class='Cboxheader'>\
                                <h1></h1>\
				<span>edit</span>\
                                <img src='./img/trash.png' class='deleteSubtopic'/>\
                                <div class='pstat'>#:<div class='pcount'>0</div></div>\
                                <div class='clear'></div>\
                          </div>\
                          <div class='Eboxheader'>\
                                <input type='text'/>\
                                <span>cancel</span>\
                                    <img src='./img/confirm.png'/>\
                                <div class='clear'></div>\
                          </div>\
                      </div>\
                      <div class='droppable' ondragover='return false' ondrop='annotate(event)'></div>\
                 </div>");
    $("#scount").text(parseInt($("#scount").text()) + 1);
    $dropbox.find("h1").tooltip({
        position: {my:"left top"}
    });
    $dropbox.find("h1").text(subtopic_name)
    $dropbox.find(".Cboxheader span").click(editSub);
    $dropbox.find(".Cboxheader img").click(deleteSub);
    $dropbox.find(".Eboxheader img").click(confirmEditSub);
    $dropbox.find(".Eboxheader input").keypress(function (e){
        if (e.which == 13){
            e.preventDefault();
            $(this).siblings('img').trigger('click');
	};
    }); 
    $dropbox.find(".Eboxheader span").click(cancelEditSub);
    $dropbox.data("subtopic_name",subtopic_name);
    $dropbox.data("subtopic_id",subtopic_id)
    return $dropbox
}

function deleteSub(){
    if (confirm("are you sure you want to delete this subtopic?") == true)
    {
	$p = $(this).closest('.dropbox');
	$.ajax({
	    method: "post",
	    url: "./deleteHandler.cgi",
	    data:{
		subtopic_id: $p.data("subtopic_id")
	    },
	    success: function(){
		$p.fadeOut(300,function(){$(this).remove();})
		$("#scount").text(parseInt($("#scount").text()) - 1)
	    }
	})
    };
};
/* -------------------------------- */


/* -------------------------------- */
/* ----dropbox_list---- */

function editSub(){
    $(this).parent().hide();
    $Eboxheader = $(this).parent().siblings(".Eboxheader");
    $Eboxheader.fadeIn();
    $Eboxheader.children("input").val($(this).siblings("h1").text());
    valign($Eboxheader.children("img, span"));
};

function cancelEditSub(){
    $(this).parent().hide();
    $(this).parent().siblings(".Cboxheader").fadeIn();
};

function confirmEditSub(){
    $r = $(this);
    $.ajax({
        method: "POST",
        url: "subtopicHandler.cgi",
        data: {
            userid : uid,
            topic_id : tid,
            subtopic_id : $(this).closest(".dropbox").data("subtopic_id"),
            subtopic_name : $(this).siblings("input").val()
        },
        success: function(response){
            editSubCallBack(response.trim(), $r);
        }
    });
};

function editSubCallBack(response, $target){
    if (response == 0){
	alertdialog(3);
    }
    else if (response == -1){
	alertdialog(7);
    }
    else{
        $target.closest(".boxheader").find("h1").text($target.siblings("input").val());
        $target.closest(".dropbox").data("subtopic_name", $target.siblings("input").val());
        //alert("Subtopic name changed successfully");
        $target.siblings("span").trigger("click");
    };
};

function annotate(event){
    event.preventDefault();
    if ($dragging != null){
	$drecord = $dragging;
	$dtarget = $(event.target).closest(".droppable");
	if ($drecord.closest('.droppable').is($dtarget) == false){
	    $.ajax({
		method: "post",
		url: "./updatePassage.cgi",
		data: {
		    passage_id: $drecord.data("passage_id"),
		    subtopic_id: $(event.target).closest(".dropbox").data("subtopic_id"),
		    topic_id: tid
		},
		success: function(){
		    $drecord.closest('.dropbox').find('.pcount').each(function(){
			$(this).text(parseInt($(this).text()) - 1);
		    });
		    $(event.target).closest('.dropbox').find('.pcount').each(function(){
			$(this).text(parseInt($(this).text()) + 1);
		    });
		    $drecord.appendTo($dtarget).hide().fadeIn(100);
		    $dtarget.scrollTop($dtarget[0].scrollHeight);
		}
	    });
	}
    }
    else{
	if ($("#lemurbox").contents().find("docno").length){
	    addPassage(event);
	}
	else{
	    alertdialog(4);
	};
    }
};

function addPassage(event){
    var doc_id = getDocno();
    var selection = document.getElementById('lemurbox').contentWindow.getSelection();
    if (selection.toString().trim() == "") {
	alertdialog(4);	
    }
    else {
	var start = Math.min(selection.anchorOffset,selection.focusOffset);
	var end = start + selection.toString().length;
	var $target = $(event.target).closest(".droppable");
	var sid = $target.parent().data("subtopic_id");
	var ptext = event.dataTransfer.getData("text/plain");
	$.ajax({
	    method: "post",
	    url: "passageHandler.cgi",
	    data:{
            docno: doc_id,
            offset_start: start,
	        offset_end: end,
	        subtopic_id: sid,
	        passage_name: ptext
		},
	    beforeSend: function(){
		$screen_lock = $("<div class='screen-cover'></div>");
		$screen_lock.css({
		"position" : "absolute",
		"z-index" : 10000,
		"background-color" : "#000",
		"opacity" : 0,
		"cursor" : "wait"
		});
		$screen_lock.width($("body").width());
		$screen_lock.height($("body").height());
		$screen_lock.prependTo($("body"));
	    },
            success: function(response){
                /*$.ajax({
                        method: "POST",
                        url: "DynamicSearchHandler.cgi",
                        data:{
                            type: 'feedback',
                            annotated_text: ptext,
                            user_id: uid,
                            domain_id: did,
                            case_id: tid,
                            rating: 3
                        },
                });*/
		$(".screen-cover").remove();
                passageFeedback = JSON.parse(response);
                addPassageCallBack(ptext, $target, passageFeedback['passage_id'], doc_id, passageFeedback);
            }
        });
    };
};

function dragstartfunc(){
    $dragging = $(this);
};

function dragendfunc(){
    $dragging = null;
};

function addPassageCallBack(ptext, $target, response, doc_id, dict){
    if (response == -1) {
	alertdialog(12);
    }
    else{
	$passage = $('<div class="passage" draggable="true">\
			<p></p>\
			<div class="origin">\
			    <span>From doc:</span>\
			    <span class="docno"></span>\
			    <img class="deletePassage" src="./img/trash.png">\
			    <div class="clear"></div>\
			</div>\
		    </div>');
    if ($.isEmptyObject(dict)==false) {
        $tmp_form = $('<form class="pairform"></form>');
	if (dict['options'].length > 0) {
	    $tmp_form.append('<div class="question">Is evidence to connect: </div>')    
	} 
        for (var i = 0; i < dict['options'].length; i++){
            $radio = $('<input type="radio" class="pair" name="pair" value="' + dict['options'][i] + '"/><span class="optionpair">' + dict['options'][i]+' ?</span><br/>');
	    $tmp_form.append($radio);
	    $($radio[0]).on("click", function(){
		$.ajax({
		    method: "post",
		    
		});
	    });//alert($(this).closest('span').text())});
        }
        $passage.append($tmp_form);
    }
    $passage.append('\
                <form class="scoreform">\
                    <input type="radio" class="score" name="score" value="1" />\
                    OK evidence \
                    <input type="radio" class="score" name="score" value="2" />\
                    Strong evidence\
                    <input type="radio" class="score" name="score" value="3" />\
                    Key evidence\
                </form>');
	$passage.on("dragstart",dragstartfunc);
	$passage.on("dragend",dragendfunc);
	$passage.find('p').text(ptext).css("cursor","pointer");
	$passage.find('p').click(function(){
	    updateHighlight($(this).text());
	});
	$passage.find('.docno').css('cursor','pointer').click(backToDocument).text(doc_id);
	$passage.find('input').click(grade);
	$passage.find('.deletePassage').click(deletePassage);
	$passage.data("passage_id",response);
	$passage.appendTo($target).hide().fadeIn(100);
	$target.closest('.dropbox').find('.pcount').each(function(){
	    $(this).text(parseInt($(this).text()) + 1);
	});
	$target.scrollTop($target[0].scrollHeight);
	return $passage
    }
}
function updateHighlight(text){
    if ($("#lemurbox").contents().find("#highlight_inputbox").length) {
	$("#lemurbox").contents().find("#highlight_inputbox input").val(text.replace(/\s+/g, " ")); 
	document.getElementById('lemurbox').contentWindow.highlighting(1);
    }
}

function deletePassage(){
    if (confirm("are you sure you want to delete this passage?") == true)
    {
	$p = $(this).closest('.passage');
	$.ajax({
	    method: "post",
	    url: "./deleteHandler.cgi",
	    data:{
		passage_id: $p.data("passage_id")
	    },
	    success: function(){
		$p.fadeOut(300,function(){$(this).remove();})
		$p.closest('.dropbox').find('.pcount').each(function(){
		    $(this).text(parseInt($(this).text()) - 1);
		});
	    }
	});
    };
};

function grade(){
    $target = $(this);
    $.ajax({
        method: "post",
        url: "grade.cgi",
        data: {
            score: $target.val(),
            passage_id: $target.closest(".passage").data("passage_id"),
            topic_id : tid
        },
        success: function(){
            //$target.siblings("input").prop('disabled',true);
            //$target.prop('disabled',true);
            //$target.closest(".passage").addClass("grey");
        }
    })
}

function getDocno(){
    return $("#lemurbox").contents().find("docno").text().trim()
};

function backToDocument(){
    window.open(dict["domains"][1].replace("search","check") + "?e=" + $(this).text(), 'check',"height=600,width=900,left=" + (screen.width-900)/2 + ",top=" + (screen.height-700)/2);
};

function displayList(type){
    //if (tid !=0){
	//$("#lemurbox").attr("src", "displayListHandler.cgi?type=" + type + "&topic_id=" + tid);
    //}
    if (tid != 0){
	window.open("displayListHandler.cgi?type=" + type + "&topic_id=" + tid + "&domain_id=" + did + "&username=" + uname, type, "height=600,width=900,left=" + (screen.width-900)/2 + ",top=" + (screen.height-700)/2);
    }
    else{
	alertdialog(1);
    }
};

function alertdialog(onum){
    $("#dialog" + onum).dialog("open");
};

/* -------------------------------- */


/* -------------------------------- */
/* ----main---- */
$(document).ready(function(){
    $dragging = null;
    
    tag = false;    

    $("body").height(Math.max(710, $(window).height()));
    
    $("#sidebar").height($("body").height() - 35);
    
    $("#lemurbox").height($("body").height() - 165);
    
    parse(data);

    valignelements();

    getSidebar();
   
    $(".dialogs").dialog({
	autoOpen: false,
    });
    
    $("#logout").click(function(e){
	e.preventDefault();
	$.ajax({
	    method: "post",
	    url: "http://infosense.cs.georgetown.edu/memex/otherlog.cgi",
	    data: {
		username: uname,
		userid: uid,
		flag: 'logout'
	    },
	    complete: function(){
		document.cookie = "usercookie=;";
		location = "http://infosense.cs.georgetown.edu/memex/beta.cgi";
	    }
	});
    });

    $("#Sdomain").change(function(event){
        /*$.ajax({
	    method: "post",
	    url: "./actionlog.cgi",
	    data:{
		domain_id: $(this).find("option:selected").val(), 
		domain_name: $(this).find("option:selected").text(), 
		sign: '1'
	    },
	    complete: function(){
		$("#Sdomain").closest("form").submit();
	    }
	});*/
	$("#Sdomain").closest("form").submit();
    });

    $("#Stopic").change(function(){
	/*$.ajax({
            method: "post",
            url: "./actionlog.cgi",
            data:{
                topic_id: $(this).find("option:selected").val(),
		topic_name: $(this).find("option:selected").text(),
                sign: '2'
            },
            complete: function(){
                $("#Stopic").closest("form").submit();
            }
        });*/
        $("#Stopic").closest("form").submit();
    });

    $("#add_topic").click(addTopic);

    $("#edit_topic").click(editTopic);

    $("#Atopic .confirm_topic").click(confirmAddTopic);

    $("#Atopic input").keypress(function (e){
	if (e.which == 13){
	    e.preventDefault();
	    confirmAddTopic();
	};
    });
    
    
    $("#Etopic .confirm_topic").click(confirmEditTopic);
    
    $("#Etopic input").keypress(function (e){
        if (e.which == 13){
            e.preventDefault();
            confirmEditTopic();
	};
    });    

    $("#topic .cancel_topic").click(cancelTopic);

    $("#delete_topic").click(deleteTopic);
    
    $("#add_subtopic").click(addSubtopic);
    
    $("#confirm_sub").click(confirmAddSub);

    $("#input_subtopic").keypress(function (e){
        if (e.which == 13){
            e.preventDefault();
            confirmAddSub();
	};
    });
    
    $("#cancel_add_sub").click(cancelAddSub);

    $(".Cboxheader span").click(editSub);

    $(".Eboxheader img").click(confirmEditSub);

    $(".Eboxheader span").click(cancelEditSub);
    
    $("#adoclist").click(function(){
	displayList('viewed');
    });

    $("#cdoclist").click(function(){
        displayList('completed');
    });
    
    $("#ddoclist").click(function(){
        displayList('discarded');
    });
    
    $("#viewanno").click(function(){
	$.ajax({
            method : "post",
            url: "./viewannotations.cgi",
            data : {
                userid: uid,
                username: uname
            },
            success: function(){
		$.ajax({
                    method: "post",
                    url: "http://infosense.cs.georgetown.edu/memex/otherlog.cgi",
                    data: {
                        username: uname,
                        userid: uid,
                        flag: 'download'
                    },
                    complete: function(){
                        window.location = './view/' + uname + ".csv"
                    }
                });
            }
        })
    });

    $("#saveanno").hide().click(function(){
	$.ajax({
            method : "post",
            url: "./saveannotations.cgi",
            data : {
                userid: uid,
                username: uname
            },
	    success: function(){
		$.ajax({
		    method: "post",
		    url: "http://infosense.cs.georgetown.edu/memex/otherlog.cgi",
		    data: {
			username: uname,
			userid: uid,
			flag: 'download'
		    },
		    complete: function(){
			window.location = './view/' + uname + ".csv"
		    }
		});
	    }
        });
    });
    
    $("#finishTopic").click(function(){
	var flag = false;
	$(".passage form").each(function(){
	    if ($(":radio:checked", this).val() == undefined){
		flag = true;
		unfinished = $(this).closest(".dropbox").find("h1").text();  
		return false;
	    };
	});
	if (flag == true) {
	    alert("You have ungraded passage in subtopic: " + unfinished); 
	}
	else if (tid !=0){
	    $.ajax({
		method: "post",
		url: "http://infosense.cs.georgetown.edu/memex/otherlog.cgi",
		data: {
		    username: uname,
		    userid: uid,
		    topic_id: tid,
		    flag: 'finish'
		},
		complete: function(){
		    //window.open("https://docs.google.com/forms/d/1mSKoylcF5wvrsqkRV6WcmVzpg5k2HA0LD715Gnsr2SI/viewform?entry.287497011=" + uname + "&entry.29467982=" + $("#Stopic option:selected").text().replace(' ','%20') + "&entry.566490455=" + tid + "&entry.1105456920=" + $("#Sdomain option:selected").text()) ; 
		}
	    });
	}
    });
    
    $("#summary").click(function(){
	$.ajax({
	    method: "post",
	    url: "./viewsummary.cgi",
	    data : {
                userid: uid,
                username: uname,
	    },
	    success: function(){
                window.location = './view/summary.csv'
            }
	});
    });
});
