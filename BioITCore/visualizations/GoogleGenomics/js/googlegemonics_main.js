
var JSONdata_ref;   // stores return data
var JSONdata_dSets;
var startPosition_global = -1;
var endPosition_global = -1;
var margin_Startposition = -1;
var margin_Endposition = -1;
var performance_start;
var performance_end;;
/////////////////////// pviz /////////////////////
var pviz;
var seqEntry;

///////////////////////  datasets variables ///////////////////
var callSetId = "NULL";
var jobType = "NULL";
var jobType_chk = 0;
var dataset_reads = [];          // the result data from reads // id, alignedSeq, position
var test_data_params;           // used the function 'search_Reads'
var JSONdata_dataSets = [];
var project_list = [];

///////////////////////   Reads variables   /////////////////////
var reads_id;
var reads_name;
var reads_groupsetID = [];

///////////////////////  Checking a brower type of the user ////
var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);

///////////////////////  reference variables ///////////////////
var clientId = "639017132977-7e7o9ikbrmklj157qdc5rc2qs2ajd088.apps.googleusercontent.com"
var refSetId = "NULL";
var jobType;                 
var userCommand;
var JSONdata_getRefId;
var JSONdata_getRefName;
var refIdList;
var refNameList = [];
var refNameLIst_valid = [];
var refID_input;
var getUserEvent = "";
var query_seq;
var seq_start;
var seq_end;
var align_pos_start = [];
var align_pos_end = [];
var pviz;
var pviz_chk;
var testSeq;          // function sendData_no_body
var testSeq_string;   // function sendData_no_body
var basesData;        // function sendData_no_body
var ref_name;         // stores from dropdown name (1-22 ,X,Y)
var ref_name_userInput  // get refname from user input
var reads_chromosome_name // (1-22 ,X,Y)
///////////////////////////////////////////////////////////////////

init();                       // Initialize app.

function init() {
  // clientId chk
  if (!clientId) {
    alert('A client ID is required.');
  } else {
    $.initGenomics({clientId: clientId});
  }
  $(".RGsetsId_control").hide();
  $(".refName_control").hide();
  $(".startPosition_control").hide();
  $(".endPosition_control").hide();
  $(".PageSize_control").hide();
  //$(".RefsetId_control").hide();
  $("#Visualization_button").hide();
  //$("#reads_submit").css("display","none");

}

function get_ReadsInfo(option) {
  var inForm = document.forms[0];
  reads_groupsetID = [];
  reads_name = option[option.selectedIndex].text;
  reads_id = option[option.selectedIndex].value;

  reads_groupsetID.push(reads_id);                 // stores as list

}

function search_Reads(option) {
  if (!(typeof(error_chk) === 'undefined')) { error_chk = 0; } 
  if (isChrome) {
    performance_start = performance.now();                 // measuring performance (start)   
  }
 
  $('#reads_submit').attr('class', 'loading');
  $('#reads_submit').text('Loading...');
  
  var inForm = document.forms[0];
 
  reads_chromosome_name = inForm.reads_chromosome_name.value;

  // chromosome name validation check.
  var tmp_chrName = parseInt(reads_chromosome_name);
  if (isNaN(tmp_chrName)) {
    if (reads_chromosome_name == 'x' || reads_chromosome_name == 'X' || reads_chromosome_name == 'y' || reads_chromosome_name =='Y') {
    }
    else {
      alert("Error - invalid chromosome name!!")
      $('#reads_submit').attr('class', 'standby');
      $('#reads_submit').text('Submit');
      return;
    }
  }
  else {
    if (tmp_chrName<1 || tmp_chrName >22) {
    alert("Error - invalid chromosome name!!")
    $('#reads_submit').attr('class', 'standby');
    $('#reads_submit').text('Submit');
    return;
    }
  }
  
  //ref_name = reads_chromosome_name;
  var reads_start = inForm.reads_start.value;
  var reads_end = parseInt(reads_start) + parseInt(inForm.reads_length.value);
  var reads_pageSize = inForm.reads_pageSize.value;

  startPosition_global = reads_start;
  endPosition_global = reads_end;
  //// 5% of margin
  window.margin = parseInt( (endPosition_global - startPosition_global) * 0.05)    
 
  ////  decalare as global variable for recursive search Reads ajax when it got chr chracter error...
  window.search_Reads_params = {
          readGroupSetIds: reads_groupsetID,
          referenceName: reads_chromosome_name,
          start: reads_start,
          end: reads_end,
          pageSize: reads_pageSize
  }
  var params = search_Reads_params;
  test_data_params = params;

  var url = '/reads/search';
  var method = 'POST';
 
  sendData_Reads (params, url, method);
  var doc = document.getElementById("refSetIdSelector");
  var chkIndex = parseInt(doc.selectedIndex); 
  if (chkIndex != 0) {
    getValidReferences();
  }
}


function sendData (callSetId, params, url, method) {
  $.genomicsAjax ( url, {
    version: 'v1beta2',
    method: method,
    data: JSON.stringify(params),
    success: function(json) {
      JSONdata_dataSets = json;
    }
  });
}

function sendData_RG (params, url, method) {
  $.genomicsAjax ( url, {
    version: 'v1beta2',
    method: method,
    data: JSON.stringify(params),
    success: function(json) {
      JSONdata_RG = json;
      var pn = document.getElementById("datasetIdSelector")
      var pn_id = pn.options[pn.selectedIndex].id;
      if (pn_id == 'projName_1000') {    // use saved Genomes (500 count)
        $('#reads_groupsetIdSelector').empty();
        var proj_selector = $("#reads_groupsetIdSelector");
        proj_selector.append("<option value='null'>Select..</option>");
        for(var i=0; i<proj_1000.length; i++) {
          proj_selector.append("<option value='"+proj_1000[i].id+"'>"+proj_1000[i].name+"</option>");
        }
      }
      else {
        updateReadsMenu(json);          // update Genome in Project
      }
    }
  });
}

function sendData_Reads (params, url, method) {
  $.genomicsAjax ( url, {
    version: 'v1beta2',
    method: method,
    data: JSON.stringify(params),
    success: function(json) {
      dataset_reads = [];
      JSONdata_Reads = json;
      try {
        for (var i=0; i<json.alignments.length; i++) {
          dataset_reads.push({ id: json.alignments[i].id,
                              fragName: json.alignments[i].fragmentName,
                              referenceName: json.alignments[i].alignment.position.referenceName,
                              position: json.alignments[i].alignment.position.position,
                              alignedSeq: json.alignments[i].alignedSequence,
                              reverseStrand: json.alignments[i].alignment.position.reverseStrand,
                              cigar: json.alignments[i].alignment.cigar
          })
        }
      } catch(e) {
        alert("Warning! - No alignment data has been returned from Google Genomics!");
        $('#reads_submit').attr('class', 'standby');
        $('#reads_submit').text('Submit');
      }

      // get first alignment position - margin
      margin_Startposition = json.alignments[0].alignment.position.position - margin;
      
      var jsonSize = json.alignments.length;
      var lastAlignPosition = parseInt(json.alignments[jsonSize-1].alignment.position.position) + json.alignments[jsonSize-1].alignedSequence.length;
      if (lastAlignPosition > parseInt(endPosition_global)) {
        margin_Endposition = lastAlignPosition + 50;         // 50 base for margin at the end
      }
      else {
        margin_Endposition = parseInt(endPosition_global);    // margin is not needed.
      }
      $('#reads_submit').attr('class', 'standby');
      $('#reads_submit').text('Submit');
      $(".RefsetId_control").show();
      //$("#Visualization_button").show();
      if (isChrome) { 
        performance_end = performance.now();
        console.log("Submit processing took " + ((performance_end - performance_start) / 1000) + " seconds");
      }
    },
    ////  Error handler.. (1 -> 'chr1' converting, invalid chromosome name detection)
    error: function() {
      console.error("Warning: sendData_Reads error detected!");
      console.debug(" - Auto renaming to fix the error - ")
      if (typeof(error_chk) === 'undefined' || error_chk == 0) {
        window.error_chk = 1;
      }
      else {
        if(error_chk == 1 || error_chk > 1 && error_chk < 4) {
          if(confirm("Error - attempt " + error_chk + '\n\tContinue?')) {
            error_chk += 1;
            var params_refName = params.referenceName;
            var params_refName = "chr" + params_refName;
            params.referenceName = params_refName;
            sendData_Reads(params, url, method);
          }
          else {
            $('#reads_submit').css('background', 'blue');
            $('#reads_submit').text('Submit');
            $(".RefsetId_control").hide();
            function JobAbort() { 
                Error.apply(this, arguments);
                this.name="JobAbort";
            }
            JobAbort.prototype = Object.create(Error.prototype);
            throw new JobAbort("Job cancelled.");
          }
        }
        else {
          //alert("Error - Unkown problem has been occurred.. \n\t\tTerminate the process.");
          $('#reads_submit').css('background', 'blue');
          $('#reads_submit').text('Submit');
          $(".RefsetId_control").hide();
          function FatalError() { 
              Error.apply(this, arguments);
              this.name="FatalError";
          }
          FatalError.prototype = Object.create(Error.prototype);
          throw new FatalError("Error - Unkown problem has been occurred.. \n\tTerminate the process.");
        }
        
      }
      var params_refName = params.referenceName;
      var params_refName = "chr" + params_refName;
      params.referenceName = params_refName;
      sendData_Reads(params, url, method);

    }
  });
}


function updateReadGroupsetsIdMenu (option) {
  var form_name = option[option.selectedIndex].text;
  var form_id = option[option.selectedIndex].value;
  var RG_datasetID = [];
  RG_datasetID.push(form_id);       // store as list
  var RG_pagesize = 20;             // Genome in project list size
  
  var params = {
          datasetIds: RG_datasetID,
          pageSize: RG_pagesize,
          //name: RG_name
        };
  var url = '/readgroupsets/search';
  var method = 'POST';
  sendData_RG(params, url, method);   // list[0] == callSetId

  $(".RGsetsId_control").show();                  // shows next step form
  $(".refName_control").show();
  $(".startPosition_control").show();
  $(".endPosition_control").show();
  $(".PageSize_control").show();
  //$("#reads_submit").show();
  $("#Visualization_button").show();

}

function updateReadsMenu (json) {             // using JSONdata_RG
  $('#reads_groupsetIdSelector').empty();
  var reads_menu = document.getElementById("reads_groupsetIdSelector");
  var padding = document.createElement("option");
  padding.text = "Select"; 

  try {
    for (var i=0; i<json.readGroupSets.length; i++) {
      if (i == 0) { reads_menu.appendChild(padding) }
      var tmp = document.createElement("option");
      var p = {};
      tmp.value = json.readGroupSets[i].id;
      tmp.text = json.readGroupSets[i].name;
      p.id = json.readGroupSets[i].id;
      p.name = json.readGroupSets[i].name;
      reads_menu.appendChild(tmp);
      project_list.push(p);
    }
  }
  catch(e){
    alert("The project is empty!");
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////           REFERENCE             ////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////



function getRefSetId(option) {
  //$("#Visualization_button").hide();
  refSetId = "";
  refSetId = option[option.selectedIndex].value;
  if (refSetId === 'NuLL') {
    console.debug("Not selected Reference Genome.");
    return;
  }
  //$('#Visualization_button').css('background', 'red');
  //$('#Visualization_button').text('Loading...');
  //$("#Visualization_button").show();
  updateReference(refSetId);            // send refSetId to Google and receive refId list 
                                        // then update the list that user can see.
  setTimeout (function() {
    getValidReferences();                 // delay for AJAX processing time.
  }, 2000);
}                                       


function getRefName(option) {
  var refId_raw = option[option.selectedIndex].value;
  var refId_split = refId_raw.split(" ");
  var refId = refId_split[0];
  var params = '';                      // no request body to get refId using refSetId
  var url = '/references/' + refId;
  var method = 'GET';
  var job = 'getRefName'
  sendData_no_body (refId, params, url, method, job);   
}

function updateReference(refSetId) {    // send refSetId to Google
  var params = '';                      // no request body to get refId using refSetId
  var url = '/referencesets/' + refSetId;
  var method = 'GET';
  var job = 'getRefId'
  sendData_no_body (refSetId, params, url, method, job);  
}


function getValidReferences() {
  var dfrd = $.Deferred();
  //console.log("Get valid references")
  var params = '';                      
  var method = 'GET';
  var job = 'getRefNameList'
  refNameList = [];
 
  try {
    for (var i=0; i<refIdList.referenceIds.length; i++) {
      var url = '/references/' + refIdList.referenceIds[i];
      sendData_no_body (refIdList.referenceIds[i], params, url, method, job);  
    }
  } catch(e){
    alert("Err - Please select different project or try again later.")
  }

  setTimeout (function() {
    validChkReferences();                 // delay for AJAX processing time.
  }, 2000);
 
}

function validChkReferences() {
  //console.log("==== VALID CHECK ====");
  //var count = 0;
  refNameLIst_valid = [];       // init.
  //refNameList = [];
  for (var i=0; i<refNameList.length; i++) {
    //console.log(refNameList[i].name);
    //var check_int = parseInt(refNameList[i].name);
    //if (check_int > 0 && check_int < 24) { 
    if (!isNaN(refNameList[i].name)) {
      refNameLIst_valid.push(refNameList[i]);
    }
    if (refNameList[i].name === 'X' || refNameList[i].name === 'x' || refNameList[i].name === 'Y' || refNameList[i].name === 'y') { 
      refNameLIst_valid.push(refNameList[i]); 
    }
  }
  setTimeout(function(){
    if (refNameLIst_valid.length != 24) { validChkReferences() }
  },500)
  updateReferenceMenu_validList(refNameLIst_valid);           // update dropdown menu
}

function getUserInput_ref(option) {
  var refId_chk = document.getElementById("refSetIdSelector");
  var refId_chk_value = refId_chk.options[refId_chk.selectedIndex].value
  if(refId_chk_value === "NULL") {
    alert ("Please select Reference Genome!")
    return;
  }
  var coverage = parseInt(document.getElementById("reads_pageSize").value);
  $("#reads_submit").click();

  var waiting;
  if (coverage < 30) { waiting = 5; }
  else { waiting = parseInt(coverage / 10) + 10 };
  var waitForsubmit = waiting * 1000;
  
  var refreshTimer = setInterval(function() {
    var msg = '';
    $("#timer").empty();
    if(waiting == 1){
      msg = waiting + " second left";
    }
    else if(waiting > 1) {
      msg = waiting + " seconds left";
    }
    else {
      clearInterval(refreshTimer);
    }
    $("#timer").append(msg);
    waiting = waiting - 1;
  },1000)
  
  setTimeout(function() {
    userCommand = "sequence";
    var inForm = document.forms[0];
    var start;
    var end;
    if (margin_Startposition < 0) {
      start = inForm.reads_start.value;
      end = parseInt(start) + parseInt(inForm.reads_length.value);
    }
    else {
      start = margin_Startposition;
      end = margin_Endposition;
    }
    
    var doc = document.getElementById("refIdSelector_valid");
    
    var refId_raw = doc.options[doc.selectedIndex].text;
    var refId_split = refId_raw.split(" ");
    var ref_Id = refId_split[0];
    //ref_Id = document.getElementById("reads_chromosome_name").value;
    ref_name_userInput = inForm.reads_chromosome_name.value;
    ref_name = refId_split[1].split(/[()]+/).filter(function(e) { return e} );

    if (ref_name_userInput != ref_name) {
      for (var i=0; i<doc.options.length; i++) {
        var tmp_raw = doc.options[i].text;
        var tmp_split = tmp_raw.split(" ");
        var tmp_name = tmp_split[1].split(/[()]+/).filter(function(e) { return e} );;
        if (tmp_name == ref_name_userInput) {
          ref_name = tmp_name;
          ref_Id = tmp_split[0];
          break; 
        }
      }
    }
    refID_input = ref_Id;
    
    console.log("\t=============== USER INPUT ==============="
                +"\n\tReference ID: " + ref_Id
                +"\n\tReference name: " + ref_name
                +"\n\tStart: " + start
                +"\n\tEnd: " + end
                );  
    
    if (start > end) {
      alert("Err - Start position # should be lower than End position #");
      return;
    }
    var params = {start : start, end : end};                      

    var url = '/references/' + ref_Id + '/bases';
    var method = 'GET';
    var job = 'getBases'
    sendData_no_body (refSetId, params, url, method, job);  // job == jobType

    // Set an execution delay to reduce visualization error.
    var myPviz = setTimeout(function() {genPviz(testSeq_string, ref_Id, params)}, 1000);
  }, waitForsubmit);
  
}


//////////////////////////////////////////////////////////////////////
//  1. Preparation collection of variables for passing pviz drawing page
//  2. For passing the variables, using local Storage.
//////////////////////////////////////////////////////////////////////
function genPviz (seq, ref_Id, params) {
  var lclchk = localStorageSupported();
  var Aseqs = [];                                 // store data_reads info
  var posList = [];                               // alignedSeq, fragName, position,
  var fragName = [];

/*
  ///////////////////////////////////////////
  // find reverse strand and convert the sequence.
  ///////////////////////////////////////////
  // for better managing this, using separate loop.
  for (var i=0; i<dataset_reads.length; i++) {
    if (dataset_reads[i].reverseStrand === true) {
      var str = dataset_reads[i].alignedSeq;
      var rev_str = str.split("").reverse().join("");
      console.debug("original: " + str + "\nconverted: " + rev_str);
      dataset_reads[i].alignedSeq = rev_str;
    }
  }
  //////////////////////////////////////////////////
*/
/*
  for (var i=0; i<dataset_reads.length; i++) {
    Aseqs.push(dataset_reads[i].alignedSeq);
    posList.push(dataset_reads[i].position);
    fragName.push(dataset_reads[i].fragName);
  }
  */
  ////////////////////////////////////////////////////////
  // pushing aligned sequence in 'Aseqs'
  // pushing each sequence position data in 'posList'
  // pushing each readName(fragName) in 'fragName'
  //   if the same name is exist in fragName array, later duplicate name will be added
  //    "-1" dash and number.. the number is from 1. 
  ////////////////////////////////////////////////////////
  for (var i=0; i<dataset_reads.length; i++) {
    if (dataset_reads[i].cigar.length == 1) {
      Aseqs.push(dataset_reads[i].alignedSeq);
    }
    else {
      var alignedSeq_full = dataset_reads[i].alignedSeq;
      var alignedSeq_tmp = "";

      if (dataset_reads[i].cigar[0].operation === "ALIGNMENT_MATCH") {
        var seq_length = dataset_reads[i].cigar[0].operationLength;
        for (var j=0; j<seq_length; j++) {
          alignedSeq_tmp += alignedSeq_full[j];
        }
        Aseqs.push(alignedSeq_tmp);
      }
      else {
        var seq_length = dataset_reads[i].cigar[0].operationLength;
        var seq_fullLength = dataset_reads[i].alignedSeq.length;
        for (var j=seq_length; j<seq_fullLength; j++) {
          alignedSeq_tmp += alignedSeq_full[j];
        }
        Aseqs.push(alignedSeq_tmp);
      }
    }

    posList.push(dataset_reads[i].position);

    //fragName.push(dataset_reads[i].fragName);
    
    var dataset_reads_name = dataset_reads[i].fragName;  
    var tailName = 1;
    var isFound = false;
    for (var k=0; k<fragName.length; k++) {
      //console.debug("fragName Length: " + fragName.length)

      if (fragName[k] === dataset_reads_name) {
        var newName = dataset_reads_name + '-' + tailName;
        tailName += 1;
        fragName.push(newName);
        isFound = true;
      }
      
    }
    if(!isFound) {
        fragName.push(dataset_reads_name);
      }
  
  }

  
  if(lclchk) {
    window.alignment_List = [];
    for (var i=0; i<fragName.length; i++) {
      alignment_List.push({"AlignSeq": Aseqs[i], "Position": posList[i], "fragName": fragName[i]});
    }

    localStorage.setItem("startPosition", margin_Startposition);
    localStorage.setItem("sequence", seq);          //  reference Sequence - string
    localStorage.setItem("ref_Id", ref_Id);         //  reference ID - string
    localStorage.setItem("ref_Name", ref_name);     //  reference(chr) Name - 1~2 character
    localStorage.setItem("start", params.start);    //  start position - margin - integer
    localStorage.setItem("end", params.end);        //  end position + margin - integer
    localStorage.setItem("alignedSeq", Aseqs);      //  aligned sequences - array
    localStorage.setItem("alignedPos", posList);    //  aligned sequence positions - array
    localStorage.setItem("fragName", fragName);     //  alignment seq fragment name - array

    window.genPviz_seq = seq;
    window.genPviz_ref_Id = ref_Id;
    window.genPviz_ref_name = ref_name;
    window.genPviz_params_start = params.start;
    window.genPviz_params_end = params.end;
    window.genPviz_Aseqs = Aseqs;
    window.genPviz_posList = posList;
    window.genPviz_fragName = fragName;

    window.open("draw_pviz_rev3.html");

  }
}

///////////////////////////////////////////////////////////////////////////
// This testing is important to propery use pviz implementation
//    because using localStorage to pass main html variables to pviz page.
///////////////////////////////////////////////////////////////////////////
function localStorageSupported() {      
 try {
  return "localStorage" in window && window["localStorage"] !== null;
 } catch (e) {
  return false;
 }
}
////////////////////////////////////////////////////////////////////////////

function getAlignment() {
  userCommand = "alignment";
  var inForm = document.forms[0];
  var start;
  var end;
  if (margin_Startposition < 0) {
    start = inForm.reads_start.value;
    end = parseInt(start) + parseInt(inForm.reads_length.value);
  }
  else {
    start = margin_Startposition;
    end = margin_Endposition;
  }
  //var start = inForm.startPosition.value;
  //var end = inForm.endPosition.value;
  seq_start = start;
  seq_end = end;
  query_seq = inForm.query_seq.value;
  if (query_seq == "") { 
    alert("Please fill Query Sequence section!"); 
    return;
  }
  var doc = document.getElementById("refIdSelector");
  var ref_Id = doc.options[doc.selectedIndex].text;
  refID_input = ref_Id;
  if (start > end) {
    alert("Err - Start position # should be lower than End position #");
    return;
  }

  var params = {start : start, end : end};                      
  var url = '/references/' + ref_Id + '/bases';
  var method = 'GET';
  var job = 'getBases'
  sendData_no_body (refSetId, params, url, method, job);  
}

function sendData_with_body (callSetId, params, url, method) {
  $.genomicsAjax ( url, {
    version: 'v1beta2',
    method: method,
    data: JSON.stringify(params),
    success: function(json) {
      JSONdata_ref = json;
    }
  });
}

function sendData_no_body (callSetId, params, url, method, jobType) {
  $.genomicsAjax ( url, {
    version: 'v1beta2',
    method: method,
    data: params,
    success: function(json) {
      if (jobType == 'getRefId') {
        JSONdata_getRefId = json;
        refIdList = json;
        updateReferenceMenu(refIdList);
      }
      else if (jobType == 'getRefNameList') {
        refNameList.push(json);
      }
      else if (jobType == 'getBases') {
        basesData = "";
        basesData = json;
        var seqData = [];                       // returned Sequence stored
        
        var idx = 0;
        for (var i=0; i<json.sequence.length; i++) {
          seqData.push(json.sequence[i]);
        }
        testSeq_string = seqData.join('');      // generate ref.seq for pviz
      }
    }
  });
}


function updateReferenceMenu (list) {
  $('#refIdSelector').empty();
  $('#refCount').empty();
  for (var i=0; i<list.referenceIds.length; i++) {
    $('#refIdSelector').append('<option>'+list.referenceIds[i]+'</option>');
  }
  $('#refCount').append('ref.ID count: ' + list.referenceIds.length + '&nbsp;&nbsp;');

  updateReferenceMenu_validList()
}

//var test_list;
function updateReferenceMenu_validList (list) {
  //test_list = list;
  $('#refIdSelector_valid').empty();
  $('#valid_refCount').empty();
  for (var i=0; i<list.length; i++) {
    if (list[i].name == reads_chromosome_name ) {
      //console.debug("Hey you are in seleted menu")
      $('#refIdSelector_valid').append("<option "+"selected='selected'>" +list[i].id+ ' ('+list[i].name+')</option>');      
    }
    else {
      $('#refIdSelector_valid').append('<option>'+list[i].id+' ('+list[i].name+')</option>');
    }
  }
  $('#valid_refCount').append('Valid ref.ID count: ' + list.length);
  $("#Visualization_button").attr('class', 'btn-success');
  $("#Visualization_button").text('Visualize it!');
  //$("#Visualization_button").show();
}
