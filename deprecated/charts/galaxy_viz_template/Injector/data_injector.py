#!/usr/bin/python
import sys
import fileinput

class Injector:
	data_type = ''
	input_data = ''
	viz_template = ''
	data_viz_file = ''
	data_target = ''
	def read_input_data(self):
		with open(self.input_data, 'r') as fin, open(self.viz_template, 'r') as fout:
			data = fin.readlines()
			data_str = ''.join(data)
			self.data_target = fout.readlines()
			tmp = repr(data_str)
			tmp = tmp[1:-1];
			varName = "var inputFile=";
			if data_type is "ChIP_Seq":
				self.data_target[692] = varName +'"'+tmp + '"\n';
			elif data_type is "RNA_Seq":
				self.data_target[56] = varName +'"'+tmp + '"\n';
			else:
				print "Error! - Invalid data_type!"
				sys.exit();
			self.write_html()
	def write_html(self):
		open(self.data_viz_file, 'w').close()
		with open(self.data_viz_file, 'w') as fout:
			fout.writelines(self.data_target)
	def init(self,data_type,data,chip_seq,rna_seq,HTML_output):
		self.data_type = data_type;
		if data_type is "ChIP_Seq":
			self.viz_template = chip_seq;
		else:
			self.viz_template = rna_seq;
		self.input_data = data
		self.data_viz_file = HTML_output
		self.read_input_data()
		

#######  set path and names of input and output files ######
data_type = ''											# leave as empty
input_data = '/home/data/output/'									# PATH -> input file path
ChIP_Seq_template = 'home/data/output/chipseq_viz_template.html'	# PATH -> chip_seq template path
RNA_Seq_template = 'home/data/output/rnaseq_viz_template.html'		# PATH -> rna_seq template path
HTML_output = 'home/data/output/data_viz_result.html'				# PATH -> output path
############################################################

if len(sys.argv) is not 2:
	print "Error! - It required one argv to degermine input file name";
	sys.exit();
fin = sys.argv[1].split('.');
if len(fin) is not 2:
	print "Error! - Invalid argv";
if fin[1] == 'tsv' or fin[1] == 'tabular':
	data_type = "RNA_Seq";
	input_data = input_data + sys.argv[1];
elif fin[1] == 'bed':
	data_type = 'ChIP_Seq';
	input_data = input_data + sys.argv[1];
	
if data_type == "":
	print "Error! - " + sys.argv[1] + " is invalid!";
	sys.exit();

inj = Injector()
inj.init(data_type, input_data, ChIP_Seq_template, RNA_Seq_template, HTML_output)
print "Successfully done!"
