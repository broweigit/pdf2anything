from flask import Flask, request, current_app, jsonify, make_response
from flask_cors import CORS

from ocr import OCRSystem
from chat import ChatSystem

import cv2
import numpy as np
import base64

# from ruler import calculate_line_length

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '12010524'
    CORS(app)

    with app.app_context():
        current_app.ocr = OCRSystem()
        current_app.chat = ChatSystem()

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
    
    
    @app.route('/chat-stream', methods=['GET'])
    def chat_stream():
        prompt = request.args.get('prompt') 
        return current_app.chat.stream_response(prompt)
    
    @app.route('/chat-reset', methods=['POST'])
    def chat_reset():
        return current_app.chat.reset()
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)