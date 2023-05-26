function resetUpload() {
    fetch('http://localhost:5000/upload-reset', {
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
    fetch('http://localhost:5000/chat-reset', {
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