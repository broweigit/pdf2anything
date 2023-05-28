from paddleocr import PPStructure, PaddleOCR, save_structure_res
from paddleocr.ppstructure.recovery.recovery_to_doc import sorted_layout_boxes, convert_info_docx
import os

class OCRSystem():
    def __init__(self):
        self.layout_engine = PPStructure(table=False, ocr=False, show_log=True)
        self.table_engine = PPStructure(layout=False, show_log=True)
        self.text_engine_ch = PaddleOCR(use_angle_cls=True, lang="ch")
        self.text_engine_en = PaddleOCR(use_angle_cls=True, lang="en")
        self.recovery_engine = PPStructure(recovery=True, lang="en")
        # pass

    def layout_analysis(self, img):
        layout_result = self.layout_engine(img)
        for line in layout_result:
            line.pop('img')
        return layout_result

    def table_analysis(self, img):
        table_result = self.table_engine(img)
        return table_result

    def text_analysis(self, img, lang):
        result = None
        if lang=='ch':
            result = self.text_engine_ch.ocr(img, cls=False)
        elif lang=='en':
            result = self.text_engine_en.ocr(img, cls=False)
        dict_len = len(result[0])
        text_str = ""
        for i in range(dict_len):
            tmp_str = result[0][i][1][0]
            if lang == 'en' and  tmp_str.endswith('-'):
                text_str += tmp_str[:-1]
            elif lang == 'ch' or not tmp_str.endswith('-'):
                text_str += tmp_str+" "
        return text_str
    
    def recovery(self, img, random_path, index):
        recovery_result = self.recovery_engine(img)
        save_folder = random_path
        result = self.recovery_engine(img)
        save_structure_res(result, save_folder, 'temp'+str(index))

        for line in result:
            line.pop('img')

        h, w, _ = img.shape
        res = sorted_layout_boxes(result, w)
        convert_info_docx(img, res, save_folder, 'temp'+str(index))