import cv2
import base64
import numpy as np
import fitz
import tempfile

wdFormatPDF = 17 #转换的类型
zoom_x=2 #尺寸大小，越大图片越清晰
zoom_y=2 #尺寸大小，越大图片越清晰，长宽保持一致
rotation_angle=0 #旋转的角度，0为不旋转

def make_base64_png(cv_image_list):
    base64_data_str_list = []
    for cv_image in cv_image_list:
        # Convert the image to PNG format
        _, png_data = cv2.imencode('.png', cv_image)
        # Encode the PNG data as base64
        base64_data = base64.b64encode(png_data)
        base64_data_str = "data:image/png;base64," + base64_data.decode("utf-8")
        base64_data_str_list.append(base64_data_str)

    return base64_data_str_list

class FileManSystem():
    def __init__(self):
        self.pdf_file = None # should be fitz pdf
        self.img_list = [] # should be OpenCV imgs

    def loadImg(self, img_file):
        img_array = np.fromstring(img_file.read(), np.uint8)
        cv_image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        self.img_list.append(cv_image)
        
        return make_base64_png(self.img_list)

    def loadPdf(self, pdf_file):
        # fitz库本身不提供直接从文件对象读取PDF的功能,通过在内存中创建临时文件来实现类似的效果
        with tempfile.NamedTemporaryFile(suffix='.pdf') as temp_file:
            temp_file.write(pdf_file.read())  # 将文件内容写入临时文件
            temp_file.seek(0)  # 将文件指针移到文件开头
            pdf_data = temp_file.read()  # 读取文件内容
            pdf = fitz.open(stream=pdf_data, filetype='pdf') # 使用fitz库加载临时文件

            # 将pdf对象储存
            if self.pdf_file is not None:
                self.pdf_file.close()
            self.pdf_file = pdf

            # 处理PDF逻辑
            for pg in range(0, pdf.page_count):
                page = pdf[pg]
                # 设置缩放和旋转系数
                trans = fitz.Matrix(zoom_x, zoom_y).prerotate(rotation_angle)
                pm = page.get_pixmap(matrix=trans, alpha=False)
                # 写图像
                # pm.save("page-%i.png" % pg)

                # 将PIL图像转换为OpenCV图像
                getpngdata = pm.tobytes(output='png')
                # 解码为 np.uint8
                image_array = np.frombuffer(getpngdata, dtype=np.uint8)
                cv_image = cv2.imdecode(image_array, cv2.IMREAD_ANYCOLOR)
                # 将图像保存到列表
                self.img_list.append(cv_image)

            return make_base64_png(self.img_list)

            # pdf.close()

    def imgs2pdf(self):
        # https://blog.csdn.net/qq_42521874/article/details/115568175
        pass

    def reset(self):
        self.img_list = []
        return 'reset fileManager!'