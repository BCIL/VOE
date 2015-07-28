window.xAxisNameMoved = false;
  window.userChoiceInput = false;


  function initPicker() {
    window.picker = new FilePicker({
      apiKey: 'AIzaSyAc6hbd-Sq_YQ6CkviWXtQslAw4yC-PIB4',
      clientId: "639017132977-7e7o9ikbrmklj157qdc5rc2qs2ajd088.apps.googleusercontent.com",
      buttonEl: document.getElementById('googledrive_chooser'),
      onSelect: function(file) {
        window.upFile = file;
        downloadFile(file)
      }
    });
  }

  function downloadFile(file, callback) {
    if (file.downloadUrl) {
      var accessToken = gapi.auth.getToken().access_token;
      window.xhr = new XMLHttpRequest();
      xhr.open('GET', file.downloadUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.onload = function() {        
        parse_uploaded_data(xhr.response)
      };
      xhr.onerror = function() {
        callback(null);
      };
      xhr.send();
    } else {
      callback(null);
    }
  }


  Array.prototype.unique = function() {
      var o = {}, i, l = this.length, r = [];
      for(i=0; i<l;i+=1) o[this[i]] = this[i];
      for(i in o) r.push(o[i]);
      return r;
  };

  var options = {
        success: function(files) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', files[0].link);
            xhr.send();
            xhr.onload = function() {
              parse_uploaded_data(xhr.response);  
            }
        },
        cancel: function() {},
        linkType: "direct",
        multiselect: false,
        extensions: ['.tsv'],
    };
  
  $("#bin_num").keyup(function(event) {
    if (event.keyCode == 13){
      $("#update_btn").click();
    }
  })
  $(".pos_input").keyup(function(event) {
    if (event.keyCode == 13){
      $("#pos_submit").click();
    }
  })

  $(document).ready(function() {
    var button = Dropbox.createChooseButton(options);
    document.getElementById("dropbox_chooser").appendChild(button)
    document.getElementById("update_btn").disabled = true;
    document.getElementById("submitChoice_btn").disabled = true;
    window.data_list = [];
    window.data_list_valid = [];
    window.choice_list = [];
    var main_graph_chk = 1;
    d3.tsv("RNASeq_diff_short.tsv", function(error, data) {
      //window.data_tsv = data;
  
      var c = Object.keys(data[0]);
      window.y1 = data[0].sample_1;
      var y2 = data[0].sample_2;
      for (var i=0; i<c.length; i++) {
        if (i<3) {
          $("#xAxis_info_form").append("<input type='radio' name='xAxis_element' id='"+c[i]+"'>"+c[i]+'&emsp;&emsp;');  
        }
        if (c[i] == 'value_1'){
          $("#yAxis_info_form").append("<input type='checkbox' name='yAxis_element' id='"+c[i]+"' value='"+y1+"'>"+c[i]+"("+data[0].sample_1+")"+'&emsp;&emsp;');  
        }
        if (c[i] == 'value_2') {
          $("#yAxis_info_form").append("<input type='checkbox' name='yAxis_element' id='"+c[i]+"' value='"+y2+"'>"+c[i]+"("+data[0].sample_2+")"+'&emsp;&emsp;');  
        }
        //$("#column_selector").append("<option>"+c[i]+"</option>")

      }
      //$("#file_info").append(Object.keys(data[0]));

      //var geneDataList = document.getElementById("gene_datalist");
      data_list_valid = [];
      for (var i=0; i<data.length; i++) { 
        if(data[i].status==="OK" && data[i].significant==="yes" && !isNaN(data[i]["log2(fold_change)"])){
          data_list_valid.push(data[i]);
        }
      }

      $("#xAxis_gene_search").empty();
      var geneDataList = document.getElementById("xAxis_gene_search");
      for (var j=0; j<data_list_valid.length; j++) {
        var option = document.createElement('option');
        option.value = data_list_valid[j].gene;
        option.innerHTML = data_list_valid[j].gene;
        option.setAttribute("index",j);
        //option.setAttribute("value_1", data[j].value_1);
        //option.setAttribute("value_2", data[j].value_2);
        geneDataList.appendChild(option);
      }

      //////// init. chosen ///////////
      /*
      var config = {
      '.chosen-select' : {},
      }
      for (var selector in config) {
        $(selector).chosen(config[selector]);
      } 
      */         
      $('.chosen-select').chosen({width: "70%"});
      /////////////////////////////////////
    })

    $("#localdrive_btn_wrapper").click(function() {
      $("#selectfile_local").trigger('click');
    })
    $("#selectfile_local").change(function(e) {
      var file = document.getElementById("selectfile_local").files[0];
      window.reader = new FileReader();
      
      var file_name = file.name;
      var data_origin = "Local Drive";
      reader.onload = function(e) {
        parse_uploaded_data(reader.result);
      }
      reader.readAsText(file);
    })
  })    // end ready

  function parse_uploaded_data(fin) {
    document.getElementById("submit_btn").disabled = false;
    document.getElementById("update_btn").disabled = true;
    document.getElementById("submitChoice_btn").disabled = true;
    $("#linechart").empty();
    $("#xAxis_info_form").empty();
    $("#yAxis_info_form").empty();
    $("#xAxis_gene_search").empty();
    $(".chosen-results").empty();

    data_list = [];
    data_list_valid = [];
    choice_list = [];
    main_graph_chk = 1;
    var dataset = d3.tsv.parse(fin);
    console.log("before filtering: " + dataset.length);
    for (var i=0; i<dataset.length; i++) { 
      if(dataset[i].status==="OK" && dataset[i].significant==="yes" && !isNaN(dataset[i]["log2(fold_change)"])){
        data_list_valid.push(dataset[i]);
      }
    }
    console.log("after filtering: " + data_list_valid.length);
    gen_datalist(data_list_valid);
  }

  function gen_datalist(data) {
    var c = Object.keys(data[0]);
    window.y1 = data[0].sample_1;
    var y2 = data[0].sample_2;
    for (var i=0; i<c.length; i++) {
      if (i<3) {
        $("#xAxis_info_form").append("<input type='radio' name='xAxis_element' id='"+c[i]+"'>"+c[i]+'&emsp;&emsp;');  
      }
      if (c[i] == 'value_1'){
        $("#yAxis_info_form").append("<input type='checkbox' name='yAxis_element' id='"+c[i]+"' value='"+y1+"'>"+c[i]+"("+data[0].sample_1+")"+'&emsp;&emsp;');  
      }
      if (c[i] == 'value_2') {
        $("#yAxis_info_form").append("<input type='checkbox' name='yAxis_element' id='"+c[i]+"' value='"+y2+"'>"+c[i]+"("+data[0].sample_2+")"+'&emsp;&emsp;');  
      }
    }
    
    $("#spinner").fadeIn(function() {
      chosen_setup(data, function() {
        $("#spinner").fadeOut();
      })
    })
  }

  function chosen_setup(data, callback) {
    console.log("data_length: " + data.length)
    
    var geneDataList = document.getElementById("xAxis_gene_search");
    for (var j=0; j<data.length; j++) {
      var option = document.createElement('option');
      option.value = data[j].gene;
      option.innerHTML = data[j].gene;
      option.setAttribute("index",j);
      //option.setAttribute("value_1", data[j].value_1);
      //option.setAttribute("value_2", data[j].value_2);
      geneDataList.appendChild(option);
    }

    $("#xAxis_gene_search").trigger("chosen:updated");
    callback.call(this);
  }

  function gen_dataSet(chk_update) {
    if(!userChoiceInput){
      data_list = [];
      window.data_list_num = 0;
      var category = {};
      var y_form = document.getElementById("yAxis_info_form");
      var xAxis_selected;
      var e = document.getElementById("xAxis_info_form");
      for (var i=0; i<e.elements.length; i++){
        if (e.elements[i].checked == true) {
          xAxis_selected = e.elements[i];
        }
      }

      for (var j=0; j<y_form.elements.length; j++){
        if (y_form.elements[j].checked == true) {
          category = {};
          category.key = y_form.elements[j].value;
          category.values = new Array();
          data_list_num += 1;
          for (var k=0; k<data_list_valid.length; k++){
            var x_selected = xAxis_selected.id;
            var xAxisName = data_list_valid[k][x_selected];
            var y_selected = y_form.elements[j].id;
            var yAxisName = data_list_valid[k][y_selected];
            var stat = data_list_valid[k].status;
            //var sig = data_list_valid[k].significant;
            category.values.push({
              x: xAxisName,
              y: yAxisName,
              stat: stat,
              //significant: sig
            });  
          }
          data_list.push(category);      
        }
      }
      gen_graph(x_selected,chk_update);
    }
    else { gen_dataSet_by_choice() }        // gen. datalist based on user choice
  }

  function gen_dataSet_by_choice(chk_update) {
    data_list = [];
    window.data_list_num = 0;
    var category = {};
    var y_form = document.getElementById("yAxis_info_form");
    var xAxis_selected;
    var e = document.getElementById("xAxis_info_form");
    for (var i=0; i<e.elements.length; i++){
      if (e.elements[i].checked == true) {
        xAxis_selected = e.elements[i];
      }
    }
    var x_selected = xAxis_selected.id;
    for (var j=0; j<y_form.elements.length; j++){
      if (y_form.elements[j].checked == true) {
        category = {};
        category.key = y_form.elements[j].value;
        category.values = new Array();
        data_list_num += 1;
        for (var k=0; k<choice_list.length; k++){
          //var x_selected = xAxis_selected.id;
          //var xAxisName = data_tsv[k][x_selected];
          var idx = choice_list[k].index;
          var xAxisName = choice_list[k].item;
          var y_selected = y_form.elements[j].id;
          var yAxisName = data_list_valid[idx][y_selected];
          var stat = data_list_valid[idx].status;
          category.values.push({
            x: xAxisName,             // test_id, gene_id, or gene
            y: yAxisName,             // value
            stat: stat
          });  
        }
        data_list.push(category);      
      }
    }
    gen_graph(x_selected,chk_update);
  }

  function gen_graph(x_name,chk_update) {
    window.chk_update = chk_update;
    if(typeof chk_update === 'undefined'){
      $("#linechart").empty();
      xAxisNameMoved = false;
      window.linechart = new D3LineChart({ 
        container: "#linechart",
        data: data_list,
        resizable: false,
        displayTable: true,
        yTicks: 10,
        xAxisName: x_name.toUpperCase(),
        yAxisName: "",
        xTickFormat: function(d) { return d },
        tooltipText: function(d, element) { return "<p>Gene: "+d.x+"<br />Value: "+d.y+"<p>"; }
      });
      linechart.show();
      rotate_xAxis();
      moveup_xAxisName();
      transpose_table();
    }
    else {
      linechart.dataset = data_list;
      linechart.update();
      document.getElementById("xAxisName").innerHTML = x_name.toUpperCase();
      rotate_xAxis();
      transpose_table();
    }
  }

  function update() {
    gen_dataSet(true);

  }

  function rotate_xAxis() {
    d3.select(".x.axis").selectAll("text")
            .transition().duration(700)
            .attr("transform", "translate(-20,20) rotate(-60)");
  }
  function moveup_xAxisName() {
    if (!xAxisNameMoved) {
      xAxisNameMoved = true;
      var x_trans = document.getElementById("xAxisName").attributes[0].value;
      var x_tmp = x_trans.match(/[0-9]+/g);

      var x_tmp_0 = parseInt(x_tmp[0]);
      var x_tmp_1 = parseInt(x_tmp[x_tmp.length-1]) - 42;
      
      d3.select("#xAxisName").transition().duration(700)
        .attr("transform", "translate("+x_tmp_0+","+x_tmp_1+")")
    }
  }

  function collect_choice() {
    choice_list = [];
    var c = $("li.search-choice");
    for(var i=0; i<c.length; i++) {
      var item = $("li.search-choice").find("span")[i].innerHTML
      var idx = $("li.search-choice").find("a")[i].attributes[1].value;
      choice_list.push({
        item: item,
        index: idx
      })
    }
    /*
    var xForm = $("#xAxis_info_form")[0];
    for (var j=0; j<xForm.length; j++) {
      if (xForm[j].id == 'gene') {              // find gene index
        xForm[j].checked = "true";              // auto selection 'gene'
      }
      else {
        xForm[j].disabled="true";
      }
    }
    */
  }

  function transpose_table() {
    var t = $('#datatable').eq(0);
    var r = t.find('tr');
    var cols= r.length;
    var rows= r.eq(1).find('th,td').length+8;
    var cell, addon = 0, next, tmp, i = 0;
    var tb= $('<tbody></tbody>');

    while(i<rows){
        cell= addon;
        addon = 0;
        tmp= $('<tr></tr>');
        while(cell<rows){
            next= r.eq(cell++).find('th,td').eq(0);
            if (next.attr('colspan')) {
                addon=parseInt(next.attr('colspan')) - 1;
                next.attr('rowspan',next.attr('colspan')+1);
                next.removeAttr('colspan');
            } else if (next.attr('rowspan')) {
                cell+=parseInt(next.attr('rowspan')) - 1;
                next.attr('colspan',next.attr('rowspan'));
                next.removeAttr('rowspan');
            } 
            tmp.append(next);
        } 
        tb.append(tmp);
        ++i;
    }
    $('#datatable').append(tb);
    $('#datatable').show();
  }

  $("#submit_btn").on("click", function() {
    //document.getElementById("submit_btn").value = "reset";
    //document.getElementById("submit_btn").id = "reset_btn";
    document.getElementById("submit_btn").disabled = true;
    document.getElementById("update_btn").disabled = false;
    if (userChoiceInput) {
      console.log("user Choice")
      collect_choice();
      //$("#submitChoice_btn").click();  
    }
    gen_dataSet();
  })
  
  $("#reset_btn").on("click", function() {
    window.location.reload();
  })

  $("#update_btn").on("click", function() {
    if (userChoiceInput) {
      $("#submitChoice_btn").click();  
    }
    update();
  })

/*
  (function() {
    if()
    document.getElementById("submit_btn").disabled = true;
  })
*/

  $("#submitChoice_btn").on("click", function() {
    collect_choice();
    userChoiceInput = true;
    document.getElementById("update_btn").disabled = false;
  })


  $("#xAxis_gene_search").on("change", function(evt, params) {
    window.evt = evt;
    window.params = params;
    userChoiceInput = true;

    var xForm = $("#xAxis_info_form")[0];
    for (var j=0; j<xForm.length; j++) {
      if (xForm[j].id == 'gene') {              // find gene index
        xForm[j].checked = "true";              // auto selection 'gene'
      }
      else {
        xForm[j].disabled="true";
      }
    }
  })
