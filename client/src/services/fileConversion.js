import axios from 'axios';
import JSZip from 'jszip';
import { BASE_URL } from "../utils/url";

const downloadImagesAsZip = (loadedImages) => {
  const zip = new JSZip();

  loadedImages.forEach((image, index) => {
    const fileName = `image_${index}.png`;
    zip.file(fileName, image.src, { base64: false });
  });

  zip.generateAsync({ type: 'blob' }).then((content) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'images.zip';
    link.click();
  });
};

const convertFile = async (fileType) => {

  axios.get(BASE_URL + '/convert-file', {
      params: {
        fileType: fileType,
      }
  })
  .then(function(response) {
    if (fileType === 'png') {
      const zip = new JSZip();
      const images = response.data.map((pngImage, index) => {
        const fileName = `image_${index}.png`;
        zip.file(fileName, pngImage.replace(/^data:image\/(png|jpg);base64,/, ""), { base64: true });
      });
      zip.generateAsync({ type: 'blob' }).then((content) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = 'images.zip';
        link.click();
      });
    }
    if (fileType === 'pdf') {
      const encodedPdf = response.data.pdfData;
      const decodedPdf = atob(encodedPdf);

      // 将解码后的PDF数据转换为字节数组
      const pdfData = new Uint8Array(decodedPdf.length);
      for (let i = 0; i < decodedPdf.length; i++) {
        pdfData[i] = decodedPdf.charCodeAt(i);
      }

      // 创建Blob对象并下载文件
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'document.pdf';
      link.click();
    }
    if (fileType === 'doc') {
      const encodedDoc = response.data.docData;
      const decodedDoc = atob(encodedDoc);

      // 将解码后的PDF数据转换为字节数组
      const docData = new Uint8Array(decodedDoc.length);
      for (let i = 0; i < decodedDoc.length; i++) {
        docData[i] = decodedDoc.charCodeAt(i);
      }

      // 创建Blob对象并下载文件
      const blob = new Blob([docData], { type: 'application/docx' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'document.docx';
      link.click();
    }
  })
  .catch(function(error) {
    console.log(error);
    // 处理请求错误
  });
};

export default convertFile;