import axios from 'axios';

const imageJAnalysis = async (file, len) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('len', len);

    const response = await axios.post('http://127.0.0.1:5000/imagej-analysis', formData, {
      headers: {
        'Content-Type': 'image',
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('Image conversion failed');
  }
};

export default imageJAnalysis;