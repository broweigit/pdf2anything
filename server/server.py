from flask import Flask, request, current_app, jsonify, make_response
from flask_cors import CORS
import cv2
import numpy as np
from ocr import OCRSystem
from imageJ import IJSystem
import base64
import os
import time

# from ruler import calculate_line_length

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '12010524'
    CORS(app)

    with app.app_context():
        current_app.ocr = OCRSystem()
        # current_app.imgj = IJSystem()
        # current_app.ijLock = False
        # current_app.idc = 0
        # # # 重定向路径
        # upDir = os.path.pardir
        # os.chdir(upDir)

    @app.route('/upload-image', methods=['POST'])
    def upload_image():
        with app.app_context():

            img_file = request.files['image']
            
            img_array = np.fromstring(img_file.read(), np.uint8)
            current_app.img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

            return 'Image uploaded successfully'

    @app.route('/layout-analysis', methods=['GET'])
    def get_layout_analysis():
        layout_result = current_app.ocr.layout_analysis(current_app.img)

        return jsonify(layout_result)
    
    @app.route('/table-extract', methods=['GET'])
    def get_table_extract():
        bbox = request.args.get('bbox')
        bbox = [int(float(i)) for i in bbox[1:-1].split(',')]

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
        bbox = request.args.get('bbox') 
        lang = request.args.get('lang') 
        bbox = [int(float(i)) for i in bbox[1:-1].split(',')] 

        x, y, w, h = bbox
        img_roi = current_app.img[y:y+h, x:x+w]

        # cv2.imwrite('./roi.jpg', img_roi)

        text_result = current_app.ocr.text_analysis(img_roi, lang)
        return text_result
    
    @app.route('/convert-image', methods=['POST'])
    def convert_image():
        # Get the image file from the request
        image_file = request.files['image']
        
        # Read the image with OpenCV
        image = cv2.imdecode(np.fromstring(image_file.read(), np.uint8), cv2.IMREAD_COLOR)
        
        # Convert the image to PNG format
        _, png_data = cv2.imencode('.png', image)
        
        # Encode the PNG data as base64
        base64_data = base64.b64encode(png_data)
        base64_data_str = "data:image/png;base64," + base64_data.decode("utf-8")
        
        # Return the base64 string as the response
        return base64_data_str
    
    # @app.route('/imagej-analysis', methods=['POST'])
    # def imagej_analysis():
    #     if not current_app.ijLock:
    #         # Get the image file from the request
    #         image_file = request.files['image']
    #         arr_len = int(request.form.get('len', 0))

    #         # Read the image with OpenCV
    #         image = cv2.imdecode(np.fromstring(image_file.read(), np.uint8), cv2.IMREAD_COLOR)

    #         ruler_len, ruler_num = calculate_line_length(image[2048:, :])

    #         # ImageJ
    #         image_upper = image[:2048, :]
    #         thisId = current_app.idc
    #         current_app.idc += 1
    #         print('input ', thisId, ' len:', arr_len)
    #         temp_path = './input/'+str(thisId)+'.png'
    #         cv2.imwrite(temp_path, image_upper)

    #         if thisId == arr_len - 1:
    #             print('Do seg', thisId, arr_len)
    #             current_app.ijLock = True
    #             _ = current_app.imgj.segment(thisId)
    #             current_app.ijLock = False
    #             current_app.idc = 0

    #         temp_path = './output/'+str(thisId)+'.png'
    #         max_attempts = 10000
    #         attempt_delay = 10  # in seconds
    #         mask_image = None

    #         for attempt in range(max_attempts):
    #             if os.path.exists(temp_path):
    #                 # File exists, read the image
    #                 mask_image = cv2.imread(temp_path)
    #                 if mask_image is not None:
    #                     # Image read successfully, break out of the loop
    #                     print('output! ', thisId)
    #                     break
    #             else:
    #                 # File does not exist, sleep for the specified delay
    #                 time.sleep(attempt_delay)

    #         image[:2048, :] = mask_image
            
    #         # Convert the image to PNG format
    #         _, png_data = cv2.imencode('.png', image)
            
    #         # Encode the PNG data as base64
    #         base64_data = base64.b64encode(png_data)
    #         base64_data_str = "data:image/png;base64," + base64_data.decode("utf-8")
            
    #         # Return the base64 string as the response
    #         return base64_data_str
    #     return None
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)