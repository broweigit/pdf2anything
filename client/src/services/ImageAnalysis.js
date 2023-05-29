import axios from 'axios';
import { BASE_URL } from "../utils/url";

const imageJAnalysis = async (file, len) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('len', len);

    const response = await axios.post(BASE_URL + '/imagej-analysis', formData, {
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