// JavaScript that sends the image file to the server and displays the output video

  // Get the form and video elements
const form = document.getElementById('image-form');
const video = document.getElementById('output-video');

// Add an event listener to the form that submits the image file to the server
form.addEventListener('submit', (event) => {
  event.preventDefault();

  // Send the image file to the server
  const formData = new FormData(form);
  fetch('/process_image', { method: 'POST', body: formData })
    .then((response) => response.blob())
    .then((blob) => {
      // Set the video source to the output video file received from the server
      const url = URL.createObjectURL(blob);
      video.src = url;
    });
});