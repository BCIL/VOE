 // set start and end position gap limit of user input
  window.pos_gap = 1000;
  ////
  window.xAxisNameMoved = false;
  window.firstUpdate = false;
  window.updateCount = 0;
  var isUserData = false;

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
        userChart(xhr.response)
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
              userChart(xhr.response);  
            }
        },
        cancel: function() {},
        linkType: "direct",
        multiselect: false,
        extensions: ['.bed'],
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

    window.chr_list = [];
    window.chr_list_uniq = [];
    window.chr_list_count = [];

    window.data_list = new Array();
    window.data_list_prep_chr = [];        
    window.main_graph_chk = 1;
    
    d3.tsv("data2.bed", function(error, data) {
      //window.data_tsv = data;
      
      gen_dataset(data);
      getAllchrChart();
      rotate_xAxis();
      moveup_xAxisName();
      transpose_table();
    });   // end d3.tsv

    $("#all_chr").on("click", function() {
      $('#position_table').empty();
      $('#UCSClink').empty();
      main_graph_chk = 1;
      getAllchrChart();
      document.getElementById("update_btn").disabled = true;
      document.getElementById("bin_num").disabled = true;
      $(".pos_input").attr("disabled", true);
      var cs = document.getElementById("chr_selector");
      cs.selectedIndex = 0;
    });
    
    $("#update_btn").on("click", function() {
      $('#UCSClink').empty();
      $('#position_table').empty();
      update_chart();
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
        userChart(reader.result);
      }
      reader.readAsText(file);
    })
////////////////////////////////////////////////////
/////// working ...... ////////////////////////////
/*
      $("#pos_submit").on("click", function() {
        console.log("pos_submit")
        
        var s = $("#pos_start").val();
        var e = $("#pos_end").val();
        var size = parseInt(e) - parseInt(s);
        
        if (size < 0) {alert("Start must be less number than End")}
        else if (size < pos_gap) {alert("The gap of two position is too close. Please set the gap larger than " + pos_gap)}
        else {alert("Passed all filters!\nTODO: make this function to work with user input positions!")}
      })
*/

  });       // end ready

  function userChart(userdata) {
    xAxisNameMoved = false;
    isUserData = true;
    firstUpdate = false;
    updateCount = 0;
    window.chr_list = [];
    window.chr_list_uniq = [];
    window.chr_list_count = [];    
    window.data_list = [];        
    main_graph_chk = 1;
    $("#linechart").empty();
    $("#chr_selector").empty();
    $('#position_table').empty();
    $('#UCSClink').empty();
    //window.userdata = userdata;

    /////////////////////////////////////////////////////////
    // 1. Inputdata format checking
    // 2. Add standard header if the header is not standard
    /////////////////////////////////////////////////////////
    var h = userdata.substr(0,userdata.indexOf('\n'));
    var header_str = "chrom\tchromStart\tchromEnd\tname\tscore\tstrand\n";
    var header = h.split('\t');
    if (h[0] !== 'chrom' || h[1] !== 'chromStart' || h[2] !== 'chromEnd') {
      var chk_chr = '';
      for (var i=0; i<3; i++) {
        chk_chr += h[0][i];
      }
      if (chk_chr === 'chr') {
       userdata = header_str + userdata;
      }
      else{
        userdata = userdata.replace(h,'');
        userdata = userdata.trim();
        userdata = header_str + userdata;
      }
    }
    /////////////////////////////////////////////////
    //// parse the data
    var data = d3.tsv.parse(userdata);
    //window.d_user = data;
    //window.data_tsv = userdata;
    
    gen_dataset(data);
    getAllchrChart();
    rotate_xAxis();
    moveup_xAxisName();
    transpose_table();
 
 /*
    $("#all_chr").on("click", function() {
      main_graph_chk = 1;
      getAllchrChart();
      document.getElementById("update_btn").disabled = true;
      document.getElementById("bin_num").disabled = true;
      $(".pos_input").attr("disabled", true);
      var cs = document.getElementById("chr_selector");
      cs.selectedIndex = 0;
    });
    
    $("#update_btn").on("click", function() {
      update_chart();
    })
*/
  } // end user chart

  function gen_dataset(data) {
    data.forEach(function(d) {
      d.chromStart = +d.chromStart;
      chr_list.push({
        name: d.chrom,
        position: d.chromStart,
        detail: d.name,
        score: d.score,
        strand: d.strand
      })
      chr_list_uniq.push(d.chrom);
    }); 

    chr_list_uniq = chr_list_uniq.unique();        
    
    var category = {};
    category.key = 'Chromosome';
    category.values = new Array();
    var set_select = false;
    chr_list_uniq.forEach(function(d) {
      var n = ""
      var max_val = -1;
      var count = 0;
      for (var k=3; k<d.length; k++) { n += d[k]; }
      
      if (!set_select) {
        $("#chr_selector").append('<option type="text" class="form-control" id="null" value="null" > select.. </option>')
        set_select = true;
      }  
      $("#chr_selector").append("<option>" + d + "</option>")
      
      for (var i=0; i<chr_list.length; i++) {
        if (chr_list[i].name === d) {
          count += 1;
        }   
      }
      chr_list_count.push({
        chromosome: d,
        count: count
      })
      category.values.push({x:n, y:count, name:d})        // chr list data
    })
    data_list.push(category);

    window.min = d3.min(data, function(d) { return +d.chromStart; })
    var max = d3.max(data, function(d) { return +d.chromStart; })
    var min_margin = parseInt(min) - parseInt(min/10)
    var max_margin = parseInt(max) + parseInt(min/10)

    var max_chrCount = d3.max(chr_list_count, function(d) { return +d.count })
    var min_chrCount = d3.min(chr_list_count, function(d) { return +d.count })

    d3.select("#chr_selector").on("change", function() {
      var st = document.getElementById("chr_selector");
      var chr_name = st.options[st.selectedIndex].value;
      if (chr_name === "null") { 
        $('#UCSClink').empty();
        $('#position_table').empty();  
        getAllchrChart(); 
      }
      else {
        $('#UCSClink').empty();
        $('#position_table').empty();
        update_chart();
      }
    });
  }

  function update_chart(option) {
    document.getElementById("update_btn").disabled = false;
    document.getElementById("bin_num").disabled = false;
    data_list_prep_chr = [];
    //$(".pos_input").attr("disabled", false);
    updateCount+=1;
    if(updateCount == 1) {firstUpdate=true; xAxisNameMoved=false;}
    else{firstUpdate=false;}

    window.data_list_update = new Array();
    window.data_list_range = new Array();

    var st = document.getElementById("chr_selector");
    var chr_name = st.options[st.selectedIndex].value;
    window.c_list = [];
    window.c_list2 = [];
    c_list2.key = chr_name;
    c_list2.values = new Array();
    var n=0;

    chr_list.forEach(function (d) {
      if (d.name === chr_name) {
        data_list_prep_chr.push(d);
        c_list.push(d.position)
      }
    })

    for (var i=0; i<c_list.length; i++) {
      c_list2.values.push({x:i+1, y:c_list[i], name:chr_name})        
    }
    data_list_update.push(c_list2);
    
    var low = parseInt(d3.min(c_list,function(d) { return +d}));
    var high = parseInt(d3.max(c_list,function(d) { return +d}));
    high = high + (high*0.1);   // 10% padding of upper limit
    var size = c_list.length;
    var item_num = parseInt($("#bin_num").val());
    var pos_range = parseInt(high / item_num);        
    window.item_list = new Array(item_num);
    window.item_count = new Array(item_num);
    var dr = [];
    dr.key = chr_name;
    dr.values = new Array();

    for (var k=0; k<item_list.length; k++) {
      item_list[k] = (pos_range*(k+1));
      item_count[k] = 0;
    }

    for (var j=0; j<item_list.length; j++) {
      var prev;
      if (j==0) { prev = 0; }
      else { prev = item_list[j-1]; }
      var curr = item_list[j];
      prev = parseInt(prev);
      curr = parseInt(curr);
      //console.log("prev: "+prev+" // curr: "+curr )
      for (var k=0; k<c_list.length; k++) {
        //console.log("candidate: " + c_list[k]);
        if (c_list[k] > prev && c_list[k] < curr+1) {
          //console.log("*** added item: " +c_list[k]);
          item_count[j] += 1;
        }
      }
    }

    for (var n=0; n<item_list.length; n++) {
      dr.values.push({x:item_list[n], y:item_count[n]});
    }
    data_list_range.push(dr);

    if (main_graph_chk == 1) {
      main_graph_chk = 0;
      $("#linechart").empty();
      window.linechart = new D3LineChart({ 
        container: "#linechart",
        data: data_list_range,
        displayTable: true,
        yTicks: 30,
        resizable: false,
        xAxisName: "Position",
        yAxisName: "Count",
        tooltipText: function(d, element) { 
          window.test_d = d;
          window.test_e = element;
          window.curr_pos = d.x;
          window.prev_pos;
          for (var i=0; i<item_list.length; i++) {
            if (item_list[i] == curr_pos) {
              if (i==0) { prev_pos = 0; }
              else { prev_pos = item_list[i-1]; }
            }
          }
          return "<p>count: "+d.y+"<br/>position: "+prev_pos+" - "+ curr_pos + "<p>";
        }
      });
      linechart.show();
      rotate_xAxis();
      moveup_xAxisName();
      transpose_table();
    }
    else {
      linechart.dataset = data_list_range;
      linechart.update();
      rotate_xAxis();
      moveup_xAxisName();
      transpose_table();
    }
  } // end update chart
  function getAllchrChart() {
    $("#linechart").empty();
    xAxisNameMoved = false;
    window.linechart = new D3LineChart({ 
    container: "#linechart",
    data: data_list,
    displayTable: true,
    yTicks: 10,
    resizable: false,
    xAxisName: "Chromosome",
    yAxisName: "Count",
    xTickFormat: function(d) { return 'chr' + d },
    tooltipText: function(d, element) { return "<p>name: "+d.name+"<br />count: "+d.y+"<p>"; }
    });
    
    linechart.show();
  }

  //////////////////////////////////////////////////////////////



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

  function renderPositionTable(chr,begin,end) {
    // data_list_prep_chr
    console.log("chr: " + chr)
    $("#genTable_indicator").empty();
    if(chr.length<3) {
      $("#genTable_indicator").append("<span>The table is generated!<br/>( chr"+chr+":"+begin+"-"+end+" )</span>")
    }
    else {
      $("#genTable_indicator").append("<span>The table is generated!<br/>( "+chr+":"+begin+"-"+end+" )</span>")  
    }
    var isDisabled = $("#update_btn").attr("disabled");
    if(typeof isDisabled === "undefined") {
      $("#genTable_indicator").fadeIn(500);
      setTimeout(function(){
        $("#genTable_indicator").fadeOut(500);
      }, 3000)
    }

    $("#position_table").empty();
    var t = $("#position_table");
    var start_pos = parseInt(begin);
    var end_pos = parseInt(end);
    var thead = Object.keys(data_list_prep_chr[0]);
    var tbody = [];
    var idx = 0;
    var mytable = "<table id='table_container' class='display dataTable'><tbody><tr>";
    for(var i=0; i<data_list_prep_chr.length; i++) {
      var curr = data_list_prep_chr[i].position;
      if(idx == 0) {
        mytable += "<thead><tr>";
        for(var j=0; j<thead.length; j++) {
          mytable += "<th>"+thead[j]+"</th>";
        }
        mytable += "</tr></thead><tbody>";
      }
      if(idx !=0 && start_pos < curr && end_pos > curr) {
        mytable += "<tr>";
        for (val in data_list_prep_chr[i]) {
          if (val === "position") {
            var begin = parseInt(data_list_prep_chr[i][val]) - 200;
            var end = parseInt(data_list_prep_chr[i][val]) + 200;
            if (chr.length < 3) {
              mytable += "<td><a href='http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr"+chr+"%3A"+begin+"-"+end+"' target='_target'>"+data_list_prep_chr[i][val]+"</a></td>"
            }
            else {
              mytable += "<td><a href='http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position="+chr+"%3A"+begin+"-"+end+"' target='_target'>"+data_list_prep_chr[i][val]+"</a></td>"
            }
          }
          else {
            mytable += "<td>"+data_list_prep_chr[i][val]+"</td>"
          }
        }
        mytable += "</tr>";
      }
      idx += 1;
    }
    mytable += "</tbody></table>";
    t.append(mytable);
    //$("#position_table").dataTable();
  }
