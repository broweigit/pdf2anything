from flask import Flask, request, current_app, jsonify, make_response
from flask_cors import CORS

from flask_sqlalchemy import SQLAlchemy

from ocr import OCRSystem
from chat import ChatSystem
from fileman import FileManSystem

import cv2
import numpy as np
import base64
import click

import sys
import os

# from ruler import calculate_line_length

def create_app():
    # SQLite 配置
    WIN = sys.platform.startswith('win')
    if WIN:  # 如果是 Windows 系统，使用三个斜线
        prefix = 'sqlite:///'
    else:  # 否则使用四个斜线
        prefix = 'sqlite:////'

    app = Flask(__name__)
    app.config['SECRET_KEY'] = '12010524'
    app.config['SQLALCHEMY_DATABASE_URI'] = prefix + os.path.join(app.root_path, 'data.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 关闭对模型修改的监控
    db = SQLAlchemy(app)
    CORS(app)
    
    with app.app_context():
        current_app.ocr = OCRSystem()
        current_app.chat = ChatSystem()
        current_app.fm = FileManSystem()

    # Table
    class User(db.Model):  # 表名将会是 user（自动生成，小写处理）
        id = db.Column(db.Integer, primary_key=True)  # 主键 id
        username = db.Column(db.String(20))  # 名字
        account = db.Column(db.String(9))  # 账号 固定9位
        password = db.Column(db.String(30))  # 密码

    class Project(db.Model):  # 表名将会是 project
        id = db.Column(db.Integer, primary_key=True)  # 主键 id
        name = db.Column(db.String(20))  # 项目的名称
        user_id = db.Column(db.Integer)  # 所属用户的id


    class File(db.Model):  # 表名将会是 model
        id = db.Column(db.Integer, primary_key=True)  # 主键 id
        type = db.Column(db.String(20))  # 文件的类型，根据文件的类型可以把文件转成长文本或者把长文本转成文件，文件的类型可以是文件夹
        name = db.Column(db.String(20))  # 文件的名字
        content = db.Column(db.Text)  # 文件的内容

    @app.cli.command()  # 注册为命令，可以传入 name 参数来自定义命令
    @click.option('--drop', is_flag=True, help='Create after drop.')  # 设置选项
    def initdb(drop):
        """Initialize the database."""
        if drop:  # 判断是否输入了选项
            db.drop_all()
        db.create_all()
        click.echo('Initialized database.')  # 输出提示信息


    @app.route('/upload-image', methods=['POST'])
    def upload_image():
        with app.app_context():

            img_file = request.files['image']

            return current_app.fm.loadImg(img_file)
        
    @app.route('/upload-pdf', methods=['POST'])
    def upload_pdf():
        with app.app_context():

            file = request.files['file']  # 获取上传的文件对象
            if file and file.filename.endswith('.pdf'):
                return current_app.fm.loadPdf(file)
            
    @app.route('/upload-reset', methods=['POST'])
    def upload_reset():
        with app.app_context():
            return current_app.fm.reset()

    @app.route('/layout-analysis', methods=['GET'])
    def get_layout_analysis():
        with app.app_context():
            page_id = request.args.get('pageId') 
            layout_result = current_app.ocr.layout_analysis(current_app.fm.img_list[int(page_id)])

            return jsonify(layout_result)
    
    @app.route('/table-extract', methods=['GET'])
    def get_table_extract():
        with app.app_context():
            bbox = request.args.get('bbox')
            page_id = request.args.get('pageId') 
            bbox = [int(float(i)) for i in bbox[1:-1].split(',')]

            x, y, w, h = bbox
            img_roi = current_app.fm.img_list[int(page_id)][y:y+h, x:x+w]

            # cv2.imwrite('./roi.jpg', img_roi)

            table_result = current_app.ocr.table_analysis(img_roi)
            # print(table_result[0]['res']['html'])
            response = make_response(table_result[0]['res']['html'])
            response.headers['Content-Type'] = 'text/html'
            return response
    
    @app.route('/text-extract', methods=['GET'])
    def get_text_extract():
        with app.app_context():
            bbox = request.args.get('bbox') 
            lang = request.args.get('lang') 
            page_id = request.args.get('pageId') 
            bbox = [int(float(i)) for i in bbox[1:-1].split(',')] 

            x, y, w, h = bbox
            img_roi = current_app.fm.img_list[int(page_id)][y:y+h, x:x+w]

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
        with app.app_context():
            prompt = request.args.get('prompt') 
            return current_app.chat.stream_response(prompt)
    
    @app.route('/chat-reset', methods=['POST'])
    def chat_reset():
        with app.app_context():
            return current_app.chat.reset()
        
    # 登录
    @app.route('/USys/login', methods=['GET'])
    def login():
        # 获取表单数据
        account = request.args.get('account')  # 传入表单对应输入字段的 name 值
        password = request.args.get('password')  # 传入表单对应输入字段的 password 值

        user = User.query.filter_by(account=account, password=password).first()
        normal_response = jsonify({'id': user.id, 'username': user.username})
        return make_response(normal_response, 200)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)