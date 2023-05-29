import axios from 'axios';
import { BASE_URL } from "../utils/url";

const convertImageToPNG = async (file) => {
  try {
    if (file.type === 'image/tiff') {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(BASE_URL + '/convert-image', formData, {
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