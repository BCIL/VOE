(function ($) {
    "use strict";
    $(document).ready(function () {

        var viz_height = $(window).height()/1.2;
        $('.iframe_demo_radial').css('height', viz_height +'px');
        $('.iframe_demo_sunburst').css('height', viz_height +'px');
        $('.iframe_demo_pviz').css('height', ($(window).height()/2.9) +'px');
        $('.iframe_demo_bedfile').css('height', ($(window).height()/1.6) +'px');
        $('.iframe_demo_RNASeq').css('height', ($(window).height()/2.2) +'px');
        $('.iframe_demo_vcf').css('height', ($(window).height()/1.6) +'px');
        $('.iframe_demo_cuffdiff').css('height', ($(window).height()/2.2) +'px');
                                    
        //// The link list of main page visualizations...
        $('.iframe_demo_radial').attr('src', 'visualizations/PhyloXML_Tree/RadialTree_demo.html');
        $('.iframe_demo_sunburst').attr('src', 'visualizations/PhyloXML_Tree/Sunburst_demo.html');
        $('.iframe_demo_pviz').attr('src', 'visualizations/GoogleGenomics/pviz_demo.html');
        $('.iframe_demo_bedfile').attr('src', 'visualizations/ChIP-Seq/Bedfile_viz.html');
        $('.iframe_demo_RNASeq').attr('src', 'visualizations/RNA-Seq/RNASeq_viz/RNASeq_viz.html');
        $('.iframe_demo_vcf').attr('src', 'visualizations/vcf_file_viz/vcf_file_viz.html');
        $('.iframe_demo_cuffdiff').attr('src', 'visualizations/RNA-Seq/CuffDiff_viz/cuffdiff_demo.html');

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

