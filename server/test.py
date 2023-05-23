import os
import imagej

# ij = imagej.init()
ij = imagej.init('./Fiji.app', mode=imagej.Mode.HEADLESS)

# ij.py.show(image, cmap='gray')

script_path = '../segment.bsh'
with open(script_path, 'r') as raw_script:
    script = raw_script.read()


# set args
input_directory = '../raw_input/'
segment_directory = '../segment_output/'
analysis_directory = '../threshold_output/'
model_path = './c3v3.model'

args = {"input_dir": input_directory,
        "output_dir": segment_directory,
        "model_path": model_path}

# run segmentation script
result = ij.py.run_script("BeanShell", script, args)

print("-------- Segmentation Complete --------")
print("Start Analysis")

# apply analysis for the segmented images
script_path = '../analysis.bsh'
with open(script_path, 'r') as raw_script:
    script = raw_script.read()

# process the image, then calculate the data
args = {"input_dir": segment_directory,
        "output_dir": analysis_directory,
        "dilation": 3,
        "erosion": 4}

result = ij.py.run_script("BeanShell", script, args)

file_names = ij.py.from_java(result.getOutput("file_names"))
elem_percentage = ij.py.from_java(result.getOutput("answer"))
elem_area_lists = ij.py.from_java(result.getOutput("particles"))

print(file_names)
print(elem_percentage)
print(elem_area_lists)

print("-------- Processing Complete --------")

end = 1