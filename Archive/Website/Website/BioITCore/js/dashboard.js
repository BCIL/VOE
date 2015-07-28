(function ($) {
    "use strict";
    $(document).ready(function () {
        var viz_height = $(window).height()/1.2;
        $('.iframe_demo_radial').css('height', viz_height +'px');
        $('.iframe_demo_sunburst').css('height', viz_height +'px');
        $('.iframe_demo_pviz').css('height', ($(window).height()/1.8) +'px');
        $('.iframe_demo_bedfile').css('height', ($(window).height()/2.3) +'px');


        //// link main page visualizations...
        $('.iframe_demo_radial').attr('src', 'PhyloXML_Tree/RadialTree_demo.html');
        $('.iframe_demo_sunburst').attr('src', 'PhyloXML_Tree/Sunburst_demo.html');
        $('.iframe_demo_pviz').attr('src', 'GoogleGenomics/pviz_demo.html');
        $('.iframe_demo_bedfile').attr('src', 'bedfile_viz/Bedfile_viz_demo.html');

        $(document).on('click', '.event-close', function () {
            $(this).closest("li").remove();
            return false;
        });


        // Calendar and Clock setting
        $(function () {
            window.dt = new Date();
            var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
            var day = weekday[dt.getDay()];
            $('.cal-day').append('<span> Today <br> </span> ' + day);
            $('.evnt-input').keypress(function (e) {
                var p = e.which;
                var inText = $('.evnt-input').val();
                if (p == 13) {                          // 13 == enter key.
                    if (inText == "") {
                        alert('Empty Field');
                    } else {
                        $('<li>' + inText + '<a href="#" class="event-close"> <i class="ico-close2"></i> </a> </li>').appendTo('.event-list');
                    }
                    $(this).val('');
                    $('.event-list').scrollTo('100%', '100%', {
                        easing: 'swing'
                    });
                    return false;
                    e.epreventDefault();
                    e.stopPropagation();
                }
            });

                var date = dt.getDate();
                var monthList = ["January","Febrary","March","April","May","June","July","August","September","October","November","December"];
                var month = monthList[dt.getMonth()];
                var year = dt.getFullYear();
                var hour = dt.getHours();
                var min = dt.getMinutes();
                var sec = dt.getSeconds();
                
                //$('#clock_date').append(month + ' ' + date);
                //$('#clock_day').append(year +', '+ day);

                //var clockId = setInterval(update, 1000);
                //update();
        });
        
        /*
        $.simpleWeather({
            location: 'New York, NY',
            woeid: '',
            unit: 'f',
            success: function(weather) {
                window.temp = weather;
                //$('#weather_info').append('<h1> Today </h1><img src="'+weather.thumbnail+'" align="left"><span class="degree">'+weather.temp+"</span>");
                $('#w_location').append(weather.city);
                $('#w_text').append(weather.text);
                $('#w_sunrise').append(weather.sunrise);
                $('#w_sunset').append(weather.sunset);
                var monthList_abb = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                for (var i=0; i<weather.forecast.length; i++) {
                    var dt = weather.forecast[i].date;
                    var d_arr = dt.split(' ');
                    var mm = d_arr[1];
                    var dd = d_arr[0];
                    var month;
                    //var ul = $('#forecast').append('<ul>');
                    for (var j=0; j<monthList_abb.length; j++) {
                        if (monthList_abb[j] === mm) {
                            mm = parseInt(j) + 1; 
                            //console.log("month: " + mm); 
                            break; 
                        } 
                    }
                    if (i==0) {
                        $('.forecast_ul').append('<li><h2>TODAY</h2><img src="'+weather.forecast[i].thumbnail+'"><div class="statistics">H:'+weather.forecast[i].high+"/L:"+weather.forecast[i].low+"</div></li>")
                    }
                    else{
                        $('.forecast_ul').append('<li><h2>'+mm+'/'+dd+'</h2><img src="'+weather.forecast[i].thumbnail+'"><div class="statistics">H:'+weather.forecast[i].high+"/L:"+weather.forecast[i].low+"</div></li>")
                    }
                }

                var sr = weather.sunrise;
                var ss = weather.sunset;
                var sr_a = sr.split(' ');
                var ss_a = ss.split(' ');
                var sr_h = sr_a[0].split(':');
                var ss_h = ss_a[0].split(':');
                var sr_hour = parseInt(sr_h[0]);
                var ss_hour = parseInt(ss_h[0]);

                if(hour>ss_hour || hour<sr_hour) {
                    $('#city_image').append("<img src='images/NY_night.jpg' height='300' alt=''>")
                }
                else {
                    $('#city_image').append("<img src='images/NY_day.png' height='300' alt=''>")
                }
            },
            error: function(error) {
              $("#weather").html('<p>'+error+'</p>');
            }
        });
        */
    });
})(jQuery);

/*
function update() {
    var date = new Date()

    var hours = date.getHours()
    var Am_Pm;
    if (hours < 12) { Am_Pm = "AM"; }
    else { Am_Pm = "PM" }
    
    if (hours > 12) { hours = hours - 12 }
    document.getElementById('clock_hour').innerHTML = hours;

    var minutes = date.getMinutes()
    if (minutes < 10) minutes = '0'+minutes
    document.getElementById('clock_min').innerHTML = minutes

    var seconds = date.getSeconds()
    if (seconds < 10) seconds = '0'+seconds
    document.getElementById('clock_sec').innerHTML = seconds  + ' ' + Am_Pm;
}
*/

