
    $(document).ready(function() {
    window.test = {};
    window.obj = {};
    //window.data_valid = [];
    window.input_data = [];
    window.input_data_selected = [];
    window.input_data_donut = [];
    window.chr_index_list = [];
    window.choice_list = [];

    //window.input_data_high = [];
    //window.input_data_low = [];
    window.input_data_option = "low"  // display low value data by default 
    
    //var data_origin = "";
    var uploaded_file = "";
    window.main_graph_chk = 1;     // 0: one chr graph,  1: entire graph
    var button = Dropbox.createChooseButton(options);
    document.getElementById("dropbox_chooser").appendChild(button);

    $("#localdrive_btn_wrapper").click(function() {
      $("#selectfile_local").trigger('click');
    })

    $("#p_value_input").keyup(function(event) {
      if (event.keyCode == 13){
        $("#update_btn").click();
      }
    })

    $("#selectfile_local").change(function(e) {
      var file = document.getElementById("selectfile_local").files[0];
      window.reader = new FileReader();
      
      var file_name = file.name;
      var data_origin = "Local Drive";
      reader.onload = function(e) {
        userChart(reader.result, data_origin, file_name);
      }
      reader.readAsText(file);
    })

    d3.tsv("Galaxy5_clean_demo.tabular", function(error, data) {
      gen_dataSet(data);
      })
    })  // end ready

    function userChart(userdata, data_origin, uploaded_file) {
      xAxisNameMoved = false;
      isUserData = true;
      firstUpdate = false;
      updateCount = 0;
      input_data = [];
      input_data_selected = [];
      input_data_donut = [];    
      chr_index_list = [];        
      main_graph_chk = 1;
      //input_data_high = [];
      //input_data_low = [];
      input_data_option = "low"  // display low value data by default 
      $("#pieChart_svg").empty();
      $("#controller").empty();
      $("#chr_label").empty();
      $("#filter_info").empty();
      $("#multiBarChart").empty();
      $("#focusChart_svg").empty();
      $("#controller").append("<li id=\'datatype\'> The data is uploaded from <b>" + data_origin +"</b></li>");
      $("#controller").append("<li id=\'upfilename\'> File name: <b>" + uploaded_file +"</b></li>")
      var data = d3.tsv.parse(userdata);
      test.data_raw = "";
      test.data_raw = data;
      var c = Object.keys(data[0]);
      window.y1 = data[0].sample_1;
      var y2 = data[0].sample_2;
      gen_dataSet(data);
    } // end user chart

    function initPicker() {
      window.picker = new FilePicker({
        apiKey: 'AIzaSyAc6hbd-Sq_YQ6CkviWXtQslAw4yC-PIB4',
        clientId: "639017132977-7e7o9ikbrmklj157qdc5rc2qs2ajd088.apps.googleusercontent.com",
        buttonEl: document.getElementById('googledrive_chooser'),
        onSelect: function(file) {
          var file_name=file.title;
          downloadFile(file,file_name)
        }
      });
    }

    function downloadFile(file, file_name, callback) {
      if (file.downloadUrl) {
        var accessToken = gapi.auth.getToken().access_token;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', file.downloadUrl);
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.onload = function() {
          var data_origin = "Google Drive";
          userChart(xhr.response, data_origin, file_name);
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
            var data_origin = "Dropbox";
            var a = xhr.responseURL;
            var b = a.split("/");
            var file_name = b[b.length-1];
            userChart(xhr.response, data_origin, file_name);  
          }
      },
      cancel: function() {},
      linkType: "direct",
      multiselect: false,
      //extensions: [''],
    };

    $("#update_btn").on("click", function() {
      var pv = $("#p_value_input").val();
      var user_pvalue = parseFloat(pv);
      gen_user_pval_dataset(user_pvalue);
      $("#filter_info").empty();
      $("#filter_info").append("<li>Filtered p-value by <b>"+ pv +"</b></li>");

      //update_chart();
    })

    function gen_dataSet(raw_data) {
      chr_index_list = [];
      obj.data_valid = [];
      for (var i=0; i<raw_data.length; i++) { 
        if(raw_data[i].status==="OK" && raw_data[i].significant==="yes" && !isNaN(raw_data[i]["log2(fold_change)"])){
          obj.data_valid.push(raw_data[i]);
        }
      }
      test.data_valid = obj.data_valid;

      //if(typeof(sample_1) === 'undefined') {
        window.sample_1 = {};
        window.sample_2 = {};
        window.log2 = {};
        sample_1.key = obj.data_valid[0].sample_1;
        sample_2.key = obj.data_valid[0].sample_2;
        log2.key = "log2(fold_change)";
        //sample_1.nonStackable = "false";
        //sample_2.nonStackable = "false";
        //log2.nonStackable = "false";
        sample_1.area = "false";
        sample_2.area = "false";
        log2.area = "false";
        sample_1.values = new Array();
        sample_2.values = new Array();
        log2.values = new Array();
        //log2.val = obj.data_valid[0]["log2(fold_change)"];
        //sample_1.val = obj.data_valid[0].value_1;
        //sample_2.val = obj.data_valid[0].value_2;
      //}
      var s1 = {}, s2 = {}, l2 = {};
      for (var j=0; j<obj.data_valid.length; j++) {
        s1 = {};
        s2 = {};
        l2 = {};
        
        var n = obj.data_valid[j].locus.split(':')
        var chrName = n[0];
        s1.y = parseInt(obj.data_valid[j].value_1);
        s1.x = j//chrName;
        s1.val = obj.data_valid[j].value_1;
        s1.chr = chrName;
        s1.gene = obj.data_valid[j].gene;
        s1.p_val = parseFloat(obj.data_valid[j].p_value);
        //s1.split = "no";
        s2.y = parseInt(obj.data_valid[j].value_2);
        s2.x = j//chrName;
        s2.val = obj.data_valid[j].value_2;
        s2.chr = chrName;
        s2.gene = obj.data_valid[j].gene;
        s2.p_val = parseFloat(obj.data_valid[j].p_value);
        //s2.split = "no";
        var l2chk = parseFloat(obj.data_valid[j]["log2(fold_change)"]).toFixed(1);
        if(l2chk < 0) {
          l2.y = parseInt(obj.data_valid[j]["log2(fold_change)"]);
        } else {
          l2.y = parseFloat(obj.data_valid[j]["log2(fold_change)"]).toFixed(1);  
        }
        l2.x = j//chrName;
        l2.val = obj.data_valid[j]["log2(fold_change)"];
        l2.chr = chrName;
        l2.gene = obj.data_valid[j].gene;
        l2.p_val = parseFloat(obj.data_valid[j].p_value);
        //l2.split = "no";
        sample_1.values.push(s1);
        sample_2.values.push(s2);
        log2.values.push(l2);
      }
      input_data.push(sample_1);
      input_data.push(sample_2);
      input_data.push(log2);
      window.input_data_ready = 'true';

      window.chr_counter = {};
      var chr_chk = 'null';
      var chr_obj = {};
      var chr_idx = [];
      for (var k=0; k<sample_1.values.length; k++) {
        chr_counter[sample_1.values[k].chr] = (chr_counter[sample_1.values[k].chr] || 0) + 1;
        var chrName = sample_1.values[k].chr;
        if (chr_chk != chrName || k == sample_1.values.length-1 ) {
          //console.log("unmatched name")
          if(k>0) { chr_index_list.push(chr_obj); }
          chr_obj = {};
          chr_obj.name = chrName;
          chr_obj.idx = new Array();
          chr_chk = chrName;
        }
        chr_obj.idx.push(k)
      }

      //input_data_donut
      for (var key in chr_counter) {
        var tmp = {};
        tmp.key = key;
        tmp.count = chr_counter[key];
        input_data_donut.push(tmp);
      }

      // calculate donut chr count data
      if (typeof(donut_count) === 'undefined') {
        window.donut_data = {};
      }
      donut_data.total = 0;
      for(var i=0; i<input_data_donut.length; i++) { 
        donut_data.total += input_data_donut[i].count 
      }
      donut_data.chrNum = input_data_donut.length;
      
      var sig = 'all';
      
      /*
      split_dataset(input_data);
      if (input_data_option === "low"){
        gen_graph(input_data_low, sig);
      }
      else {
        gen_graph(input_data_high, sig);
      }
      */
      gen_graph(input_data, sig);
    }

    function gen_graph(graph_data, mod){

/*  Multibar chart
/////////////////////////

        nv.addGraph({
            generate: function() {
                var width = nv.utils.windowSize().width,
                    height = nv.utils.windowSize().height;

                window.chart = nv.models.multiBarChart()
                    .width(width)
                    .height(height)
                    .stacked(false)
                    ;

                chart.dispatch.on('renderEnd', function(){
                    console.log('Render Complete');
                });

                var svg = d3.select('#multiBarChart').datum(graph_data);
                console.log('calling chart');
                svg.transition().duration(500).call(chart);

                return chart;
            },
            callback: function(graph) {
              nv.utils.windowResize(function() {
                  var width = nv.utils.windowSize().width;
                  var height = nv.utils.windowSize().height;
                  graph.width(width).height(height);

                  d3.select('#multiBarChart')
                      .attr('width', width)
                      .attr('height', height)
                      .transition().duration(0)
                      .call(graph);

              });
            }
        });
////////////////////////////
*/      
      
      nv.addGraph(function() {
        window.fchart = nv.models.lineWithFocusChart();
        fchart.brushExtent([50,70]);
        fchart.xAxis.tickFormat(d3.format(',f'));
        fchart.x2Axis.tickFormat(d3.format(',f'));
        fchart.yAxis.tickFormat(d3.format(',.f'));
        fchart.y2Axis.tickFormat(d3.format(',f'));
        //fchart.useInteractiveGuideline(true);
        fchart.isArea(false);
        fchart.height(700);
        //fchart.yRange([-20,0,100,1000])
        //fchart.forceY([-5,0,100])
        //fchart.yDomain([-5,0,2000])
        fchart.color(["#29A329","#FF8080","#4775FF"])
        
        d3.select('#focusChart_svg')
            .datum(graph_data)
            .call(fchart);
        //nv.utils.windowResize(fchart.update);
        return fchart;
    });

      if (mod === 'all') {
        var width = 350;
        var height = 350;
        nv.addGraph({
          generate: function() {
            var dchart = nv.models.pieChart()
                .x(function(d) { return d.key })
                .y(function(d) { return d.count })
                //.showLabels(false)
                .donut(true)
                .padAngle(.02)
                .cornerRadius(3)
                //.labelType('value')
                //.labelType(function(d) {return d.gene})
                //.labelThreshold(.04)
                //.width(width)
                //.height(height);
            dchart.title("CuffDiff")
            dchart.pie.donutLabelsOutside(true).donut(true);

            d3.select("#pieChart svg")
                .datum(input_data_donut)
                .transition().duration(1200)
                //.attr('width', width)
                //.attr('height', height)
                .call(dchart);

            return dchart;
          }
          /*,
          callback: function(graph) {
            nv.utils.windowResize(function() {
                var width = nv.utils.windowSize().width;
                var height = nv.utils.windowSize().height;
                graph.width(width).height(height);

                d3.select('#pieChart svg')
                    .attr('width', width)
                    .attr('height', height)
                    .transition().duration(0)
                    .call(graph);
            })
          }
          */
        })
      }
    }
    function gen_custom_dataset(e) {
      window.pie_click2 = e;
      main_graph_chk = 0;
      $("#chr_label").empty();
      $("#filter_info").empty();
      $("#chr_label").append('<li>Selected: <b>'+e.label+'</b></li>');
      input_data_selected = [];
      var s1 = {}, s2 = {}, l2 = {};
      s1.key = sample_1.key;
      s2.key = sample_2.key;
      l2.key = log2.key;
      s1.nonStackable = sample_1.nonStackable;
      s2.nonStackable = sample_2.nonStackable;
      l2.nonStackable = log2.nonStackable;
      s1.values = new Array();
      s2.values = new Array();
      l2.values = new Array();
      console.log(e.label)

      for (var i=0; i<chr_index_list.length; i++) {
        //s1 = {}; s2 = {}; l2 = {};
        if(e.label === chr_index_list[i].name) {
          for(var j=0; j<chr_index_list[i].idx.length; j++) {
            s1.values.push(input_data[0].values[chr_index_list[i].idx[j]]);
            s2.values.push(input_data[1].values[chr_index_list[i].idx[j]]);
            l2.values.push(input_data[2].values[chr_index_list[i].idx[j]]);
          }
        }
      }

      input_data_selected.push(s1);
      input_data_selected.push(s2);
      input_data_selected.push(l2);
      /////////////
      //input_data = [];
      //input_data = input_data_selected;
      //chart.update();
      /////////////
      
      /*
      split_dataset(input_data_selected);
      if (input_data_option === "low"){
        gen_graph(input_data_low);
      }
      else {
        gen_graph(input_data_high);
      }
      */
      gen_graph(input_data_selected);
    }

    function gen_user_pval_dataset(pv) {
      console.log("pv: " + pv);
      window.new_values_index = [];
      if (typeof(input_data_pval_filtered) === "undefined") {
        window.input_data_pval_filtered = [];
      }

      if(main_graph_chk == 1) {
        dataset = input_data;
        input_data_pval_filtered = $.extend(true, [], input_data);
      }
      else {
        dataset = input_data_selected;
        input_data_pval_filtered = $.extend(true, [], input_data);
      }
      console.log("dataset size: " + dataset[0].values.length);
      for(var i=0; i<dataset[2].values.length; i++) {
        if (dataset[2].values[i].p_val < pv || dataset[2].values[i].p_val == pv) {
          new_values_index.push(i);
        }
      }

      for (var p=0; p<input_data_pval_filtered.length; p++) {
        input_data_pval_filtered[p].values.length = 0;
      }

      for(var j=0; j<dataset.length; j++) {
        for(var k=0; k<new_values_index.length; k++) {
          input_data_pval_filtered[j].values.push(dataset[j].values[new_values_index[k]]);
        }
      }

      gen_graph(input_data_pval_filtered);
    }

  //////////////////////////////
  //  DEPRECATED!
  // - used variables -
  //  input_data_high, input_data_low
  /////////////////////////////
  /*
    function split_dataset(dataset) {
      input_data_high = [];
      input_data_low = [];
      input_data_high = $.extend(true, [], dataset);
      input_data_low = $.extend(true, [], dataset);
      var count = [];
      
      for (var p=0; p<input_data_high.length; p++) { 
        input_data_high[p].values.length = 0;
        input_data_low[p].values.length = 0;
      }
      for(var i=0; i<dataset.length; i++) {
        var oneCount = 0;
        var eachObj = {};
        var idx = [];
        for(var j=0; j<dataset[i].values.length; j++) {
          if (parseInt(dataset[i].values[j].y) > 100) { 
            oneCount += 1; 
            idx.push(j); 
          }
        }
        eachObj.count = oneCount;
        eachObj.values = idx;
        count.push(eachObj)
      }
      var maxIdx;
      for (var j=0; j<count.length-1; j++) {
        if (count[j].values.length > count[j+1].values.length) { maxIdx = j; }
      else { maxIdx = j+1;} 
      }
      //var dataset = dataset;
      for (var p=0; p<dataset.length; p++){
        for (var k=0; k<count[maxIdx].values.length; k++) {
          var index = count[maxIdx].values[k];
          dataset[p].values[index].split = "high";
        }
      }
      
      for (var q=0; q<dataset.length; q++){
        for (var k=0; k<dataset[0].values.length; k++) {
          if (dataset[q].values[k].split === "high") {
            input_data_high[q].values.push(dataset[q].values[k]);
          }          
          else {
            input_data_low[q].values.push(dataset[q].values[k]);
          }
        }
      }
    }
  */