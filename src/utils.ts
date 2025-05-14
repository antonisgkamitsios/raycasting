export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();

    img.src = url;
    img.onload = () => {
      res(img);
    };
    img.onerror = rej;
  });
}
