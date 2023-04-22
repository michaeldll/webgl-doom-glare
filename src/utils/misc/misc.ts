export function ready(cb: Function) {
  if (document.readyState != 'loading') {
    cb();
  } else {
    document.addEventListener('DOMContentLoaded', (e) => cb());
  }
}

export default function loadImage(path: string): Promise<any> {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = path;
    image.onload = () => {
      resolve(image)
    }
  })
}