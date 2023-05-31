import * as XLSX from 'xlsx';

function htmlToExcel(htmlTable, filename) {
    // 创建一个临时的 div 元素
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlTable;
    
    // 获取表格元素
    var table = tempDiv.getElementsByTagName('table')[0];
  
    // 创建一个工作簿对象
    var workbook = XLSX.utils.book_new();
  
    // 将 HTML 表格转换为工作表对象
    var worksheet = XLSX.utils.table_to_sheet(table);
  
    // 将工作表添加到工作簿中
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    // 将工作簿转换为二进制数据
    var excelData = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
  
    // 创建一个 Blob 对象
    var blob = new Blob([s2ab(excelData)], { type: 'application/octet-stream' });
  
    // 创建一个下载链接
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename + '.xlsx';
  
    // 模拟点击下载链接
    link.click();
  
    // 释放对象 URL
    URL.revokeObjectURL(link.href);
  }
  
  
// 将字符串转换为 ArrayBuffer
function s2ab(s) {
var buf = new ArrayBuffer(s.length);
var view = new Uint8Array(buf);
for (var i = 0; i < s.length; i++) {
    view[i] = s.charCodeAt(i) & 0xFF;
}
return buf;
}

export default htmlToExcel;
  