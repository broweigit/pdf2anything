from paddleocr import PPStructure, PaddleOCR

class OCRSystem():
    def __init__(self):
        self.layout_engine = PPStructure(table=False, ocr=False, show_log=True)
        self.table_engine = PPStructure(layout=False, show_log=True)
        self.text_engine_ch = PaddleOCR(use_angle_cls=True, lang="ch")
        self.text_engine_en = PaddleOCR(use_angle_cls=True, lang="en")
        #self.recovery_engine = PPStructure(recovery=True)
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