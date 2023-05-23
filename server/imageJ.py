import imagej
import scyjava

class IJSystem():
    def __init__(self):
        scyjava.config.add_option('-Xmx6g')
        self.ij = imagej.init('./Fiji.app', mode=imagej.Mode.HEADLESS)

    def segment(self, id):
        args = {"input_dir": 'D:\mydoc\working\SE\project\pdf2anything\server\input',
        "output_dir": 'D:\mydoc\working\SE\project\pdf2anything\server\output',
        "model_path": '../c3v3.model'}

        script_path = './segment.bsh'
        with open(script_path, 'r') as raw_script:
            script = raw_script.read()

        # run segmentation script
        result = self.ij.py.run_script("BeanShell", script, args)

        return result