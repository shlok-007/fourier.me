const form = document.getElementById('image-form');
const video = document.getElementById('output-video');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  fetch('/process_image', { method: 'POST', body: formData })
    .then((response) => response.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      video.src = url;
    });
});