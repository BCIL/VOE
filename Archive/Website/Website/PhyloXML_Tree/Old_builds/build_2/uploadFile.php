<?php

    $filename = $_FILES["Filedata"]["tmp_name"];
    $filename1 = $_FILES["Filedata"]["name"];
    $filepath = "uploaded/".$filename;
    $ext = explode(".", $filename1);
    $ext = $ext[1];     # get extention info.
    
    #$extmsg = "extention? : ";
    #debug_to_console ($extmsg, $ext);
    
    if ($ext == 'xml')  {
        $ok = move_uploaded_file($_FILES["Filedata"]["tmp_name"],
                        "uploaded/" . $_FILES["Filedata"]["name"]);

        // This message will be passed to 'oncomplete' function
        //echo "uploaded/" . $_FILES["Filedata"]["name"];

        $var1 = "uploaded/" . $_FILES["Filedata"]["name"];
            #echo "Variable check: " . $var1 . "<br>";

            #/////////////////////////////////////////////////////////////////////
            #//////// To excute the python script
            $result = exec('python modifyXML.py ' . $var1);

            //echo "Excuted python?: " . $result;
            $comment = "Excuted python?: ";
            debug_to_console( $comment, $result);

            echo $_FILES["Filedata"]["name"];
    }
    else {
        $msg = "where? : ";
        $val = "error section";
        debug_to_console ($msg, $val);
        echo "error";
    }

    function debug_to_console( $data, $comment ) {
        if ( is_array( $data ) )
            $output = "<script>console.log( 'Debug Objects: " . implode( ',', $data) . $comment . "' );</script>";
        else
            $output = "<script>console.log( 'Debug Objects: " . $data . $comment . "' );</script>";
        echo $output;
}
?>