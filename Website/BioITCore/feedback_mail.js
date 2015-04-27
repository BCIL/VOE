function log(obj) {
    //$('#response').text(JSON.stringify(obj));
}

// create a new instance of the Mandrill class with your API key
var m = new mandrill.Mandrill('QK9Khf0PZGlo4Db42N7T4Q');

// create a variable for the API call parameters



function sendTheMail() {

var email_to = "BioITCoreDoNotReply@gmail.com";
var email_from = $('#feedback_from').val();
if (email_from == '') { email_from = 'anonymous@feedback.com' }
var subject = $('#feedback_subject').val();
//var text = $('iframe').contents().find('.wysihtml5-editor').html();
var text = $('.wysihtml5').val();

/*
email_to.toString();
email_from.toString();
subject.toString();
text.toString();
*/
    var params = {
        "message": {
            "from_email":email_from,
            "to":[{"email":email_to,
                    "name": "",
                    "type":'to'}],
            "subject": subject,
            "html": text
        }
    };

   
    m.messages.send(params, function(res) {
            console.debug(res);
            confirm("Thank you for your feedback!")
            location.reload();
        }, function(err) {
            confirm("Error - please try again later!")
            console.error(err);
        })


}

