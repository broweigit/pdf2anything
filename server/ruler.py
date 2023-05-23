import cv2
import numpy as np
import pytesseract
import re

def calculate_line_length(image_raw):
    # assert(image_raw.shape == (2166, 2048, 3))
    # 截取感兴趣的区域
    image = image_raw[:64, :668]

    # 转换为灰度图像
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # 边缘检测
    edges = cv2.Canny(gray, 50, 150)

    # 应用霍夫变换检测直线
    lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=200, minLineLength=100, maxLineGap=5)

    # 提取第一条直线的端点坐标
    x1, y1, x2, y2 = lines[0][0]

    cv2.line(image_raw, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # 计算线段长度
    line_length = x2 - x1
    
    # 截取感兴趣的区域
    image = image_raw[64:, :668]

    # 转换为灰度图像
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    result = pytesseract.image_to_string(gray, config='--psm 7')
    numbers = re.findall(r'\d+', result)
    if len(numbers) > 0:
        number = int(numbers[0])  # 获取第一个数字
        cv2.putText(image, str(number), (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    else:
        print("无法识别数字")

    return line_length, number

# cv2.imshow('Detected Lines', image)
# cv2.waitKey(0)
# cv2.destroyAllWindows()


# pytesseract.pytesseract.tesseract_cmd = R"D:\mydoc\CS_Resources\Tesseract-OCR\tesseract.exe"
# image_raw = cv2.imread('ruler2.tiff')
# calculate_line_length(image_raw)