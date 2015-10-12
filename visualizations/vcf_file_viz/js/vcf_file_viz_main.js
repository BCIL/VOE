
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


  ///  dropbox picker option setting
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
        extensions: ['.vcf'],
    };
  
  $("#bin_num").keyup(function(event) {
    if (event.keyCode == 13){
      $("#update_btn").click();
    }
  })

  $(document).ready(function() {
    // dropbox picker init
    updateCount=0;
    firstUpdate=false;
    var button = Dropbox.createChooseButton(options);
    document.getElementById("dropbox_chooser").appendChild(button)

    window.data_raw;
    window.data_list = [];
    window.data_list_prep = [];
    window.data_list_prep_chr = [];
    window.data_list_count = [];
    window.data_list_chr_uniq = [];
    window.main_graph_chk = 1;

    // reads vcf file as text

    //// sample input files ////
    // snp_test.vcf
    // test_data.vcf
    // indel_test.vcf
    // VarScan_data.vcf
    d3.text("input_data/VarScan_data.vcf", function(err, data) {
      //window.v = data;
      //console.log(v)
    // remove lines start with '##'
      var tmp_1 = data.replace(/^(##)(.*)/gm, '')
    // remove '#' that places with 'CHROM'
      var tmp_2 = tmp_1.replace(/^#/gm, '')
    // remove the first blank line
      var tmp_3 = tmp_2.replace(/^\s*$[\n\r]{1,}/gm, '') 
    // parsing vcf file from variable as tsv format  
      data_raw = d3.tsv.parse(tmp_3)

      gen_dataset(data_raw)
      
      getAllchrChart();
      rotate_xAxis();
      moveup_xAxisName();

      
    })  // end d3.text

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
    
    $("#all_chr").on("click", function() {
      $('#UCSClink').empty();
      $('#position_table').empty()
      main_graph_chk = 1;
      getAllchrChart();
      var cs = document.getElementById("chr_selector");
      cs.selectedIndex = 0;
    });

    $("#update_btn").on("click", function() {
      $('#UCSClink').empty();
      $('#position_table').empty()
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
    /*
    $(".showTableIcon").on("click", function() {
      console.log("showTableIcon clicked!")
      $('#UCSClink').empty();
      $('#position_table').empty();
    })
*/

  }); // end $(document).ready

  function gen_dataset(data_raw) {
    data_raw.forEach(function(d) {
      data_list_prep.push({
        name: d.CHROM,
        position: d.POS,
        id: d.ID,
        ref: d.REF,
        alt: d.ALT,
        filter: d.FILTER
      });
      data_list_chr_uniq.push(d.CHROM)
    })
    data_list_chr_uniq = data_list_chr_uniq.unique();
    var category = {};
    category.key = 'Chromosome';
    category.values = new Array();
    var set_select = false;
    data_list_chr_uniq.forEach(function(d) {
      var n = d;
      var max_val = -1;
      var count = 0;
      //for (var k=3; k<d.length; k++) { n += d[k]; }
      
      if (!set_select) {
        $("#chr_selector").append('<option type="text" class="form-control" id="null" value="null" > select.. </option>')
        set_select = true;
      }  
      $("#chr_selector").append("<option id=chr"+d+">" + d + "</option>")
      
      for (var i=0; i<data_list_prep.length; i++) {
        if (data_list_prep[i].name === d) {
          count += 1;
        }   
      }
      //console.log("count: " + count);
      data_list_count.push({
        chromosome: d,
        count: count
      })
      category.values.push({x:n, y:count, name:d})        // chr list data
    })
  data_list.push(category);
  }

  function update_chart(option) {
    document.getElementById("update_btn").disabled = false;
    document.getElementById("bin_num").disabled = false;
    data_list_prep_chr = [];

    updateCount+=1;
    if(updateCount == 1) {firstUpdate=true; xAxisNameMoved=false;}
    else{firstUpdate=false;}

    window.data_list_update = new Array();
    window.data_list_range = new Array();

    var st = document.getElementById("chr_selector");
    var chr_name = st.options[st.selectedIndex].value;
    window.c_list = [];       // positions
    window.c_list2 = [];
    c_list2.key = chr_name;
    c_list2.values = new Array();
    var n=0;

    data_list_prep.forEach(function (d) {
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
/*
    for (var j=0; j<c_list.length; j++) {
      var prev;
      if (j==0) { prev = 0; }
      else { prev = c_list[j-1]; }
      var curr = c_list[j];
      prev = parseInt(prev);
      curr = parseInt(curr);
      //for (var m=item_list.length-1; m>0; m--) {
      for (var m=0; m<item_list.length; m++) {
        //if (curr > item_list[m-1] && curr < item_list[m]) {
        //  item_count[m]+=1;
        //}
        if (prev < item_list[m]) {

        }
      }
    }
*/
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
        yTicks: 5,
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
      transpose_table();
      rotate_xAxis();
      moveup_xAxisName();
    }
    else {
      linechart.dataset = data_list_range;
      linechart.update();
      transpose_table();
      rotate_xAxis();
      moveup_xAxisName();
    }
  }

/////////////////////////////////////////////////////////////

  function userChart(userdata) {
    xAxisNameMoved = false;
    isUserData = true;
    firstUpdate = false;
    updateCount = 0;
    $("#linechart").empty();
    $("#chr_selector").empty();
    $('#position_table').empty();
    $('#UCSClink').empty();
    document.getElementById("update_btn").disabled = true;
    document.getElementById("bin_num").disabled = true;

    window.data_raw;
    window.data_list = [];
    window.data_list_prep = [];
    window.data_list_count = [];
    window.data_list_chr_uniq = [];
    window.main_graph_chk = 1;

    // remove lines start with '##'
      var tmp_1 = userdata.replace(/^(##)(.*)/gm, '')
    // remove '#' that places with 'CHROM'
      var tmp_2 = tmp_1.replace(/^#/gm, '')
    // remove the first blank line
      var tmp_3 = tmp_2.replace(/^\s*$[\n\r]{1,}/gm, '') 
    // parsing vcf file from variable as tsv format
      
    var h = tmp_3.substr(0,tmp_3.indexOf('\n'));
    var header_str = "CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO\n";
    var header = h.split('\t');
    if (h[0] !== 'CHROM' || h[1] !== 'POS' || h[2] !== 'REF') {
      tmp_3 = tmp_3.replace(h,'');
      tmp_3 = tmp_3.trim();
      tmp_3 = header_str + tmp_3;
    }

    data_raw = "";  
    data_raw = d3.tsv.parse(tmp_3)

    gen_dataset(data_raw);

    getAllchrChart();
    transpose_table();
    rotate_xAxis();
    moveup_xAxisName();

/*
      d3.select("#chr_selector").on("change", function() {
        $('#UCSClink').empty();
        $('#position_table').empty()
        update_chart();
      });
      $("#update_btn").on("click", function() {
        $("#UCSClink").empty();
        $("#position_table").empty();
        //xAxisNameMoved = false;
        update_chart();
      })
*/
      
  } // end user chart

  function getAllchrChart() {
    document.getElementById("update_btn").disabled = true;
    document.getElementById("bin_num").disabled = true;
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
    xTickFormat: function(d) { if(d.length < 3) {return 'chr' + d}
                                else{return d;} },
    tooltipText: function(d, element) { return "<p>name: "+d.name+"<br />count: "+d.y+"<p>"; }
    });
    linechart.show();
    transpose_table();
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