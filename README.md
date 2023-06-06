[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/4Haj4PaL)
# pdf2anything
A web based smart document digitalization tool that provides comprehensive service access such as OCR digitalization with layout analysis support, plot data digitalization, File conversion, and ChatGPT in one station.

## 设计意图
This software is intended to:
* Improve PaddleOCR usability: Make a easy UI for user to justify the process of PaddleOCR Layout scanning, by implementing a interactive canvas(powered by Konva) and adding LabelRects components, which is designed to be draggable, resizeable, editable, and able to respectively call further OCR extractions.
* Adding plot digitalization routine to retrive original data from existing xy-plot.
* Integrate a Chatbox for user to help bridging between OCR results and openAI service. User can benifit from both OCR information extraction and NLP, extending user’s experience to chat on images, plot and tables.
* Unify different file format into one form, including pdf, docx, png, and excel. 

## 使用教程

网页DEMO: 暂未开放

用户引导：[UserGuide.md](UserGuide.md)

## 安装方法

如果你只需要使用该软件，请参考[docker部署](#jump2)

如果你需要在服务器提供web服务，请先阅读[服务器地址配置](#jump1)

如果你需要使用ChatGPT，请务必在./server下创建key.ini文件，填写你的key

![image](https://github.com/sustech-cs304/team-project-2231/assets/82894523/4e64fc81-60ac-437a-b247-5abfb5b3a70a)


如果你是开发人员，请参考[开发环境搭建](#jump)


## <span id="jump2">docker部署</span>

1. 回到项目根目录
2. 进入server目录
```
cd ./server
```
3. 构建docker镜像
```
docker build -t pdf2anything .
```
等待image构建完成，然后检查image是否成功构建：
```
docker images
```
存在“pdf2anything”的image即构建成功
4. 运行docker container实例
```
docker run -d -p 5000:5000 --name [你的container命名，如container1] pdf2anything
```
![TLQ_7{IBDO%_Q_FM@_1OKGJ](https://github.com/sustech-cs304/team-project-2231/assets/82894523/3ddc2c65-ff69-456d-a79a-0d03c7bbf0c6)

服务器启动需要等一段时间，你可以通过以下方式查看当前log：
```
docker logs [你的container命名，如container1]
```
5. 通过 http://localhost:5000 访问服务器

6. 如果你需要让服务器能被其他人从外网通过你的IP或域名访问，你需要做以下修改：
<span id="jump1">服务器地址配置</span>
先回到项目根目录，然后
```
cd ./client/src/utils
```
打开url.js, 编辑utils源码中的地址：
```
export const BASE_URL = '你的公网、局域网IP，如127.0.0.1，或域名，如www.example.com'
```
重新build前端（你需要Node.js环境）
```
cd ./client
npm run build
```
然后回到docker部署第一步，构建docker


## <span id="jump">开发环境搭建</span>

> 环境准备： Windows or Linux，Node.js([版本至少v16以上](http://nodejs.cn/download/))

1. 克隆项目(打开git bash)

```
git clone https://github.com/sustech-cs304/team-project-2231 -b main
```

### 前端依赖安装

1. 在项目目录下，进入client
```
cd ./client
```

2. 安装[pnpm](https://pnpm.io/zh/installation) ，已安装的可以跳过

```
# 使用npmjs.org安装
npm install pnpm -g

# 指定国内源npmmirror.com安装
npm --registry=https://registry.npmmirror.com install pnpm -g
```

3. 安装前端依赖
```
cd pdf2anything/client
pnpm install
```
4. 前端项目运行,调试（运行在http://localhost:3000）

```
npm start
```

5. 前端项目一键部署到后端（将自动build到server项目下的相应位置）

```
npm run build
```

### 后端

5. 安装Anaconda，进入Anaconda Prompt

6. 使用./server下的environment.yml创建项目conda环境

```
conda env create -f /path/to/this/project/server/environment.yml
```

7. 启动环境
```
conda activate ocr_env
```

若前缀变为（ocr_env）即成功

8. 进入项目的server文件夹，在该环境下运行server（运行app.py即可）

```
cd /path/to/this/project
cd ./server
python app.py
```
9. 如果需要重新创建数据库，请在server目录下运行如下指令：
```
flask initdb
```
