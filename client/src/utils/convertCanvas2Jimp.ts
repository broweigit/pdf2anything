import 'jimp';
import axios from 'axios';
const { Jimp } = window as any;

// async function convertCanvasToJimp(canvas) {
//   const { width, height } = canvas;
//   const ctx = canvas.getContext('2d');
//   const imageData = ctx.getImageData(0, 0, width, height);
//   const { data } = imageData;

//   return new Promise((resolve, reject) => {
//     new Jimp({ data, width, height }, (err, image) => {s
//       if (err) {
//         reject(err);
//       } else {
//         resolve(image);
//       }
//     });
//   });
// }

async function convertCanvasToJimp(canvas) {
  const imageFile = '/xyplot.png';

  try {
    const response = await axios.get(imageFile, { responseType: 'arraybuffer' });
    const imageBuffer = response.data;
    const jimpImage = await Jimp.read(imageBuffer);

    // 在这里进行Jimp图像对象的后续处理
    console.log(jimpImage);

    return jimpImage;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default convertCanvasToJimp;