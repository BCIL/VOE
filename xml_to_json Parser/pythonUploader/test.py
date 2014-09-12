from sys import argv
import re
#Todo
# rebuild xml structure  
# delete phyloxml, remain phylogeny -> convert -> erase


#script, infile = argv;
#infile = open(filename, 'r+');
infile = "testTree2.xml"
outfile1 = "1_" + infile;
outfile2 = "2_" + infile;	
outfile3 = "3_" + infile;
outfile4 = "4_" + infile;	# output


findClade = 0;

with open (infile, 'r') as fin:
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
	fout.write(re.sub("(.*)</phylo(.*)", "", inXml));
	
with open (outfile2, 'r') as fin:
	inXml = fin.read();
with open (outfile3, 'w') as fout:
	fout.write(re.sub("(.*)<clade>\n(.*)<clade>", "<clade>", inXml));

with open (outfile3, 'r') as fin:
	inXml = fin.read();
with open (outfile4, 'w') as fout:
	fout.write(re.sub("</clade>\n(.*)<property", "<property", inXml));

#infile.seek(0)
#for line in infile:
#	print line;