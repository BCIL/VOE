<?php
$allowedExts = array("xml");
$temp = explode(".", $_FILES["file"]["name"]);
$extension = end($temp);

$Filename = $_FILES["file"]["name"];

#/////////////// Filtering the input file ////////////////////////

if (($_FILES["file"]["type"] == "text/xml")
&& ($_FILES["file"]["size"] < 100000)	// file size limit: 100 kb
&& in_array($extension, $allowedExts)) {
	if ($_FILES["file"]["error"] > 0) {
		echo "Error: " . $_FILES["file"]["error"] . "<br>";
	} else {
		echo "Upload: " . $_FILES["file"]["name"] . "<br>";
		echo "Type: " . $_FILES["file"]["type"] . "<br>";
		echo "Size: " . ($_FILES["file"]["size"] / 1024) . " kB<br>";
		#echo "Stored in: " . $_FILES["file"]["tmp_name"];

		if (file_exists("upload/" . $_FILES["file"]["name"])) {
		    echo $_FILES["file"]["name"] . " already exists. ";
	    } 
	    else {
			move_uploaded_file($_FILES["file"]["tmp_name"],
			"uploaded/" . $_FILES["file"]["name"]);
			echo "Stored in: " . "upload/" . $_FILES["file"]["name"] . "<br>";
		}
	}
} else {
	echo "Invalid file";
}

echo "The uploaded file name is " . "<strong>" . $Filename . "</strong><br>";

$var1 = "uploaded/".$Filename;
echo "Variable check: " . $var1 . "<br>";

#/////////////////////////////////////////////////////////////////////

#//////// To excute the python script
$result = exec('python modifyXML.py ' . $var1);


#$result = exec('/xml_to_json_Parser/pythonUploader/modifyXML.py '.$var1);
echo "Excuted python?: " . $result . "<br><br>";


##### move to previous page
#header('Location: ' . $_SERVER['HTTP_REFERER']);
#$prev = $_SERVER['HTTP_REFERER'];
#echo "Previous page: ". $prev. "<br>";
echo "<strong>Press "."<a href=\"javascript:history.go(-1)\"> GO BACK </a>"."then 'Parsing XML' to get your converted JSON data.</strong>";
?>