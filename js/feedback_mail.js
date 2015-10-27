function log(obj) {
    //$('#response').text(JSON.stringify(obj));
}

// create a new instance of the Mandrill class with your API key
var m = new mandrill.Mandrill('QK9Khf0PZGlo4Db42N7T4Q');

function sendTheMail() {

var email_to = "baegi7942@gmail.com";
var email_from = $('#feedback_from').val();
if (email_from == '') { email_from = 'anonymous@feedback.com' }
var subject = $('#feedback_subject').val();
var text = $('.wysihtml5').val();

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

