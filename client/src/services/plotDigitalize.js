import convertCanvasToJimp from "../utils/convertCanvas2Jimp.ts";

const wpd = require("../wpd/wpd_node.js").wpd

async function extractPlot(cropCanvas, setFormValue, x1, x2, y1, y2, refColor) {
  // const bitmapData = bitmap.getData(); // 获取Bitmap的数据

  // // 将Bitmap数据转换为Buffer或Uint8Array，具体取决于您的Bitmap数据格式
  // // 这里假设使用Buffer
  // const buffer = Buffer.from(bitmapData);

  // // 使用Jimp的read方法读取Buffer数据并创建Jimp对象
  // const img = jimp.read(buffer);

  const img = await convertCanvasToJimp(cropCanvas)

  // console.log(img.bitmap)

  // create PlotData object
  let plotData = new wpd.PlotData();

  // calibration
  let calibration = new wpd.Calibration(2);

  // parameter order: (pixel_x, pixel_y, "value_x", "value_y")
  // note: value_x and value_y are to be specified as strings
  calibration.addPoint(parseInt(x1[0]), parseInt(x1[1]), x1[2], x1[3]); // X1
  calibration.addPoint(parseInt(x2[0]), parseInt(x2[1]), x2[2], x2[3]); // X2
  calibration.addPoint(parseInt(y1[0]), parseInt(y1[1]), y1[2], y1[3]); // Y1
  calibration.addPoint(parseInt(y2[0]), parseInt(y2[1]), y2[2], y2[3]); // Y2

  // console.log(calibration)

  // XY axes
  let axes = new wpd.XYAxes();
  axes.calibrate(calibration, false, false, false); // calibration, isLogX, isLogY, noRotationCorrection

  // add dataset
  let ds = new wpd.Dataset(2);

  // autodetector setup
  let autoDetectionData = new wpd.AutoDetectionData();
  autoDetectionData.fgColor = refColor;

  autoDetectionData.imageWidth = img.bitmap.width;
  autoDetectionData.imageHeight = img.bitmap.height;
  autoDetectionData.generateBinaryData(img.bitmap);

  let algo = new wpd.AveragingWindowAlgo();
  algo.setParams({ xStep: 10, yStep: 10 });
  algo.run(autoDetectionData, ds, axes);
  autoDetectionData.algorithm = algo;
  console.log(`number of points detected = ${ds.getCount()}`);

  // add to plot data
  plotData.addAxes(axes);
  plotData.addDataset(ds);
  plotData.setAxesForDataset(ds, axes);
  plotData.setAutoDetectionDataForDataset(ds, autoDetectionData);

  // save project
    // let serializedProject = JSON.stringify(plotData.serialize());
    // fs.writeFileSync(outputJSONFile, serializedProject);

    // save csv
    // let csv = "x,y\n";
    // for (let pi = 0; pi < ds.getCount(); pi++) {
    //     let pt = ds.getPixel(pi);
    //     let data = axes.pixelToData(pt.x, pt.y);
    //     csv += data[0] + "," + data[1] + "\n";
    // }
    // fs.writeFileSync(outputCSVFile, csv);

  let result = [];
  for (let pi = 0; pi < ds.getCount(); pi++) {
    let pt = ds.getPixel(pi);
    let data = axes.pixelToData(pt.x, pt.y);
    result.push([data[0], data[1]]);
  }

  console.log(result)

  setFormValue(JSON.stringify(result));
}

export default extractPlot;
