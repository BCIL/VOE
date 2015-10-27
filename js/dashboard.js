(function ($) {
    "use strict";
    $(document).ready(function () {

        var wh = $(window).height();
        var viz_list = [
        {ele:'.iframe_demo_radial', src:'visualizations/PhyloXML_Tree/RadialTree_demo.html', height:wh/1.2 +'px'},
        {ele:'.iframe_demo_sunburst', src:'visualizations/PhyloXML_Tree/Sunburst_demo.html', height:wh/1.2 +'px'},
        {ele:'.iframe_demo_pviz', src:'visualizations/GoogleGenomics/pviz_demo.html', height:wh/2.9 +'px'},
        {ele:'.iframe_demo_bedfile', src:'visualizations/ChIP-Seq/Bedfile_viz.html', height:wh/1.6 +'px'},
        {ele:'.iframe_demo_RNASeq', src:'visualizations/RNA-Seq/RNASeq_viz/RNASeq_viz.html', height:wh/2.2 +'px'},
        {ele:'.iframe_demo_vcf', src:'visualizations/vcf_file_viz/vcf_file_viz.html', height:wh/1.6 +'px'},
        {ele:'.iframe_demo_cuffdiff', src:'visualizations/RNA-Seq/CuffDiff_viz/cuffdiff_demo.html', height:wh/2.2 +'px'}
        ]

        var idx = 0;
        var task_num = 2;
        var viz_num = viz_list.length;
        var interval_num = 200;
        var gen_iframe = setInterval(function(){
            if (idx < viz_num) {
                var t = 0;
                while(t < task_num && idx < viz_num) {
                    $(viz_list[idx].ele).attr('src',viz_list[idx].src).css('height',viz_list[idx].height);
                    idx++;
                    t++;
                }
                interval_num *= 2;
            }
            else {window.clearInterval(gen_iframe)}
        },interval_num)

        $("#ytplayer").hide();
        $('#ytplayer').css('width', '0 px');
        $('#ytplayer').css('height', '0 px');
        
        $("#ytplayer_btn").click(function() {
          var a = $("#ytplayer");
          if(a.attr("status") === "hide") {
            $("#ytplayer").slideDown('show');
            a.attr("status","show");
            $('#ytplayer_btn').attr("class", "btn btn-warning btn-sm");
            $("#ytplayer_btn").text("Hide video");  
          }
          else if(a.attr("status") === "show") {
            $("#ytplayer").slideUp('hide');
            a.attr("status","hide");
            $('#ytplayer_btn').attr("class", "btn btn-success btn-sm");
            $("#ytplayer_btn").text("Show video");  
          }
        })

        $(document).on('click', '.event-close', function () {
            $(this).closest("li").remove();
            return false;
        });
    });
})(jQuery);

