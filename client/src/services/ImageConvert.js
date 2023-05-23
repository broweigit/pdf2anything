import axios from 'axios';

const convertImageToPNG = async (file) => {
  try {
    if (file.type === 'image/tiff') {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://127.0.0.1:5000/convert-image', formData, {
        headers: {
          'Content-Type': 'image',
        },
      });

      return response.data;
    }
  } catch (error) {
    console.error(error);
    throw new Error('Image conversion failed');
  }
};

export default convertImageToPNG;