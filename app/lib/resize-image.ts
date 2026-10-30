const MAX_IMAGE_EDGE = 1920;
const JPEG_QUALITY = 0.85;

export function fitWithin(width: number, height: number, maxEdge: number) {
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

// WebP で書き出すと、対応していない Safari では黙って PNG になり大きくなるため JPEG にする
export async function resizeImage(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image, {
    imageOrientation: "from-image",
  });
  const { width, height } = fitWithin(
    bitmap.width,
    bitmap.height,
    MAX_IMAGE_EDGE
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("画像を変換できませんでした。");

  // JPEG は透過を持てず、そのままだと透過部分が黒くなるため白で塗る
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("画像を変換できませんでした。")),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}
