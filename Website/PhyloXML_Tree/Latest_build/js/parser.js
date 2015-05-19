    function parser(filename) {
                /////// Set the modified file name.
                //////  This must be changed if the modifyXML.py has been changed.
            var url = "uploaded/modified_" + filename;
            console.log("** parser section \n file: " + url)
            var xml = new JKL.ParseXML( url, null );
            xml.setOutputArrayElements( ["clade"], ["name"] );
            var data = xml.parse();
            
            var dumper = new JKL.Dumper();
            var text = dumper.dump( data );
            
            var outData = output(text);
            //console.log("parsed Data:\n\t" + outData);
            var Datalength = outData.length;
            
            
            function output(text) {
                if ( typeof(text) == "undefined" ) return "";
                text = text.replace(new RegExp('(.*)phylogeny(.*)', 'g'), '').replace(/"clade"/g, '"children"').replace(/"#text"/g, '"text"').replace(/"rooted"/g, '"name"').replace(/"true"/g, '"ROOT"').replace(/"confidence"/g, '"property"').replace(/""name"":/g,"").replace(/""ROOT","/g, "");

                // newText contains parsed valid JSON data
                // To remove last '}' for valid JSON data (removed parent 'phylogeny')
                newText = text.substr(text.indexOf("{"), text.lastIndexOf("}")-1); 
                return newText;
            }
            window.p_d = newText;
        }