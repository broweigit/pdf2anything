# pdf2anything
A web based smart document digitalization tool that can do OCR digitalization and layout analysis, as well as interact with ChatGPT. 

## 使用方法

> 环境准备： Windows or Linux，Node.js([版本至少v16以上](http://nodejs.cn/download/))

1. 克隆项目

# 前端部分

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
4. 前端运行

npm start

# 后端部分

5. 安装Anaconda，进入Anaconda Prompt

6. 使用./server下的environment.yml创建项目conda环境


```
conda env create -f /path/to/your/environment.yml
```

7. 启动环境
```
conda activate ocr_env
```

若前缀变为（ocr_env）即成功

8. 在该环境下运行server


```
cd /path/to/this/project
cd ./server
python server.py
```