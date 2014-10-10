<?php
    if (isset($_POST['jsonData'])) {
    	#echo $_POST['jsonData'];
    	#echo $_POST['XMLname'];
    	$currDir = __DIR__;
    	$JSONdata = $_POST['jsonData'];
    	$filename = $_POST['XMLname'] . ".json";
    	$filename = $currDir."/uploaded/". $filename;
    	
    	#echo $currDir;
    	$file = fopen($filename, "w") or die("Error to open file");
    	fwrite($file, $JSONdata);
    	fclose($file);
    } 
    else {
    	echo "FAIL to get JSON data";
    }
?>