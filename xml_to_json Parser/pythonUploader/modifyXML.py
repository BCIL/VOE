from sys import argv
import re
#Todo
# rebuild xml structure  
# delete phyloxml, remain phylogeny -> convert -> erase


script, infile_argv = argv;
#infile = open(filename, 'r+');
infile = infile_argv[9:];
uploadFolderName = "uploaded/";

outfile1 = uploadFolderName + "1_" + infile;
outfile2 = uploadFolderName + "2_" + infile;	
outfile3 = uploadFolderName + "3_" + infile;
outfile4 = uploadFolderName + "4_" + infile;	# output


findClade = 0;

with open (infile_argv, 'r') as fin:
	inXml = fin.read();

with open (outfile1, 'w') as fout:
	fout.write(re.sub("(.*)<phyloxml(.*)", "", inXml));
	#fout.write(re.sub("(.*)</phylo(.*)", "", inXml));
	#fout.seek(0);
	#if findClade == 0:							# delete first clade
	#fout.write(re.sub("(.*)<clade(.*)", "", inXml));
	#print re.match("(.*)<clade>(.*)", inXml);
		#print chk;
		#findClade=1;
with open (outfile1, 'r') as fin:
	inXml = fin.read();
with open (outfile2, 'w') as fout:
	fout.write(re.sub("(.*)</phyloxml(.*)", "", inXml));
	
with open (outfile2, 'r') as fin:
	inXml = fin.read();
with open (outfile3, 'w') as fout:				# delete first clade
	fout.write(re.sub("(.*)<clade>\n(.*)<clade>", "<clade>", inXml));

with open (outfile3, 'r') as fin:
	inXml = fin.read();
with open (outfile4, 'w') as fout:				# delete </clade> that related delete <clade>
	fout.write(re.sub("</clade>\n(.*)<property", "<property", inXml));

print "True";

#infile.seek(0)
#for line in infile:
#	print line;