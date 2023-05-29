const fs = require('fs');
const path = require('path');
const glob = require('glob');

const sourceDir = 'build';
const destinationDir = '../server/templates';

// 获取源目录下的所有文件路径（不包括 static 文件夹）
const files = glob.sync(`./${sourceDir}/**/*`, {
  nodir: true,
});

// 创建目标目录
fs.mkdirSync(destinationDir, { recursive: true });

// 移动文件到目标目录
files.forEach(file => {
  const relativePath = path.relative(sourceDir, file);
  const destinationPath = path.join(destinationDir, relativePath);

  const destinationDirPath = path.dirname(destinationPath);
  fs.mkdirSync(destinationDirPath, { recursive: true });

  fs.renameSync(file, destinationPath);
});

console.log('Files moved successfully!');
