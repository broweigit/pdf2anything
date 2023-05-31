# 基础镜像
FROM python:3.9

# 创建和设置工作路径
WORKDIR /server

# 复制项目文件到工作目录
COPY . /server

# 安装所需的依赖项
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update
RUN apt-get install ffmpeg libsm6 libxext6  -y

CMD python3 app.py

# 暴露端口
EXPOSE 5000

