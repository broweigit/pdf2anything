import { BASE_URL } from "../utils/url";

function resetUpload() {
    fetch(BASE_URL + '/upload-reset', {
      method: 'POST',
    })
      .then((response) => {
        if (response.ok) {
          console.log('Reset request sent: Success');
        } else {
          console.log('Reset request sent: Error');
        }
      })
      .catch((error) => {
        console.error('Error resetting Backend Files:', error);
      });
}

function resetChat() {
    fetch(BASE_URL + '/chat-reset', {
      method: 'POST',
    })
      .then((response) => {
        if (response.ok) {
          console.log('Reset request sent: Success');
        } else {
          console.log('Reset request sent: Error');
        }
      })
      .catch((error) => {
        console.error('Error resetting Backend messages:', error);
      });
}

export {resetUpload, resetChat}