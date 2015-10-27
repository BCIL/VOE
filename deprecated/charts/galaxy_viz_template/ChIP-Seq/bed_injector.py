#!/usr/bin/python
import sys
import fileinput

class Injector:
	bed_file = ''
	html_template_file = ''
	bed_viz_file = ''
	data_target = ''
	def read_bed(self):
		with open(self.bed_file, 'r') as fin, open(self.html_template_file, 'r') as fout:
			data = fin.readlines()
			data_str = ''.join(data)
			self.data_target = fout.readlines()
			tmp = repr(data_str)
			tmp = tmp[1:-1];
			varName = "var inputFile=";
			self.data_target[692] = varName +'"'+tmp + '"\n';
			self.write_html()
	def write_html(self):
		open(self.bed_viz_file, 'w').close()
		with open(self.bed_viz_file, 'w') as fout:
			fout.writelines(self.data_target)
	def init(self,bed,template,HTML_output):
		self.bed_file = bed
		self.html_template_file = template
		self.bed_viz_file = HTML_output
		self.read_bed()

#######  set path and names of input and output files ######
bed = 'home/data/output/'
template = 'home/data/output/bed_viz_template.html'
HTML_output = 'home/data/output/bed_viz.html'
############################################################

inj = Injector()
inj.init(bed,template,HTML_output)