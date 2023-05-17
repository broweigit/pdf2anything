export function cutImage(image, bbox) {
  const [x, y, width, height] = bbox;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  // return <img src={canvas.toDataURL()} alt="Cropped" />;
  return canvas;
}