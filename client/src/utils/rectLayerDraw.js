function drawRectLayer(rectData, setRectLayer, setSelectedId) {
  // 给Text一些适当的Padding
  const TextType = ['title', 'text', 'reference'];
  const rects = rectData.map((obj, index) => ({
      id: `rect${index + 1}`,
      x: TextType.includes(obj.type) ? obj.bbox[0] - 5 : obj.bbox[0],
      y: TextType.includes(obj.type) ? obj.bbox[1] - 5 : obj.bbox[1],
      width: TextType.includes(obj.type) ? obj.bbox[2] - obj.bbox[0] + 10 : obj.bbox[2] - obj.bbox[0],
      height: TextType.includes(obj.type) ? obj.bbox[3] - obj.bbox[1] + 10 : obj.bbox[3] - obj.bbox[1],
      label: obj.type,
      onSelect: function() {
        setSelectedId(`rect${index + 1}`);
      }
  }));
  setRectLayer(rects)
}

export default drawRectLayer;

