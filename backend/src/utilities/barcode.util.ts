import * as bwipjs from 'bwip-js';

export async function generateBarcodeImage(barcodeText: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'code128',
        text: barcodeText,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      },
      (err, png) => {
        if (err) {
          reject(err);
        } else {
          resolve(png);
        }
      },
    );
  });
}
