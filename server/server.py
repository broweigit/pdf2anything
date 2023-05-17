from flask import Flask, request, current_app, jsonify, make_response
from flask_cors import CORS
import cv2
import numpy as np
from ocr import OCRSystem

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '12010524'
    CORS(app)

    # 鍒濆鍖朞CRSystem
    with app.app_context():
        current_app.ocr = OCRSystem()

    # ...鍏朵粬閰嶇疆鍜岃矾鐢�

    @app.route('/upload-image', methods=['POST'])
    def upload_image():
        with app.app_context():

            # 浠� POST 璇锋眰涓幏鍙栧浘鍍忔枃浠�
            img_file = request.files['image']
            
            # 灏嗗浘鍍忔枃浠惰鍏ヤ负 OpenCV 瀵硅薄
            img_array = np.fromstring(img_file.read(), np.uint8)
            current_app.img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

            return 'Image uploaded successfully'

    @app.route('/layout-analysis', methods=['GET'])
    def get_layout_analysis():
        layout_result = current_app.ocr.layout_analysis(current_app.img)

        return jsonify(layout_result)
    
    @app.route('/table-extract', methods=['GET'])
    def get_table_extract():
        bbox = request.args.get('bbox') # 浠� GET 璇锋眰鐨勫弬鏁颁腑鑾峰彇 bbox 鍊�
        bbox = [int(i) for i in bbox[1:-1].split(',')] # 灏� bbox 瀛楃涓茶浆鎹负鏁扮粍

        # 鎴彇鐩稿簲閮ㄥ垎鐨凴OI
        x, y, w, h = bbox
        img_roi = current_app.img[y:y+h, x:x+w]

        # cv2.imwrite('./roi.jpg', img_roi)

        table_result = current_app.ocr.table_analysis(img_roi)
        # print(table_result[0]['res']['html'])
        response = make_response(table_result[0]['res']['html'])
        response.headers['Content-Type'] = 'text/html'
        return response
    
    @app.route('/text-extract', methods=['GET'])
    def get_text_extract():
        bbox = request.args.get('bbox') # 浠� GET 璇锋眰鐨勫弬鏁颁腑鑾峰彇 bbox 鍊�
        lang = request.args.get('lang') # 浠� GET 璇锋眰鐨勫弬鏁颁腑鑾峰彇 bbox 鍊�
        bbox = [int(i) for i in bbox[1:-1].split(',')] # 灏� bbox 瀛楃涓茶浆鎹负鏁扮粍

        # 鎴彇鐩稿簲閮ㄥ垎鐨凴OI
        x, y, w, h = bbox
        img_roi = current_app.img[y:y+h, x:x+w]

        # cv2.imwrite('./roi.jpg', img_roi)

        text_result = current_app.ocr.text_analysis(img_roi, lang)
        return text_result
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)