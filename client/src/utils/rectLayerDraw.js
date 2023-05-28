function drawRectLayer(rectData, setRectLayer, setSelectedId, currImg) {
  if (!currImg) {
    alert('Error: No currImg');
  }
  // 给Text一些适当的Padding, 但是不能越界
  const TextType = ['title', 'text', 'reference'];
  const padding = 3;
  const imgWidth = currImg.width;
  const imgHeight = currImg.height;

  const rects = rectData.map((obj) => {
    const id = obj.id;
    let x = obj.bbox[0];
    let y = obj.bbox[1];
    let width = obj.bbox[2] - obj.bbox[0];
    let height = obj.bbox[3] - obj.bbox[1];
    // 没有hasOCR字段或hasOCR字段为false 结果均为false
    let hasOCR = obj.hasOwnProperty('hasOCR');
    if (hasOCR) {
      hasOCR = obj.hasOCR;
    }
    // 添加适当的 Padding
    if (TextType.includes(obj.type)) {
      x -= padding;
      y -= padding;
      width += padding * 2;
      height += padding * 2;
    }
    // 边界检查，确保矩形不超出图片边界
    if (x < 0) {
      x = 0;
    }
    if (y < 0) {
      y = 0;
    }
    if (x + width > imgWidth) {
      width = imgWidth - x;
    }
    if (y + height > imgHeight) {
      height = imgHeight - y;
    }
    return {
      id: id,
      x,
      y,
      width,
      height,
      label: obj.type,
      hasOCR: hasOCR,
      onSelect: function() {
        setSelectedId(id);
      }
    };
  });
  setRectLayer(rects);
}

export default drawRectLayer;

