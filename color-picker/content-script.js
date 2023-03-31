document.body.style.cursor = 'crosshair';
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
let isPickerActive = true;

function getHexColor(r, g, b) {
  return `#${(r << 16) | (g << 8) | b.toString(16).padStart(6, '0')}`;
}

function getRGBColor(r, g, b) {
  return `rgb(${r}, ${g}, ${b})`;
}

document.addEventListener('mousemove', (e) => {
  if (!isPickerActive) return;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.drawWindow(window, window.scrollX, window.scrollY, window.innerWidth, window.innerHeight, 'white');

  const imageData = ctx.getImageData(e.clientX, e.clientY, 1, 1).data;
  const [r, g, b] = imageData;
  const hexColor = getHexColor(r, g, b);
  const rgbColor = getRGBColor(r, g, b);

  chrome.runtime.sendMessage({ hexColor, rgbColor });
});

document.addEventListener('click', () => {
  if (isPickerActive) {
    isPickerActive = false;
    document.body.style.cursor = 'default';
  }
});

function getPixelColor(x, y) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 1;
  canvas.height = 1;
  ctx.drawImage(document.querySelector("html"), -x, -y);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
}

function createCrosshair() {
  const crosshair = document.createElement("div");
  crosshair.style.position = "fixed";
  crosshair.style.width = "15px";
  crosshair.style.height = "15px";
  crosshair.style.border = "1px solid black";
  crosshair.style.borderRadius = "50%";
  crosshair.style.zIndex = "99999";
  crosshair.style.pointerEvents = "none";
  return crosshair;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "activateColorPicker") {
    const crosshair = createCrosshair();
    document.body.appendChild(crosshair);

    const onMouseMove = (e) => {
      crosshair.style.left = `${e.pageX - 7}px`;
      crosshair.style.top = `${e.pageY - 7}px`;
      const color = getPixelColor(e.pageX, e.pageY);
      chrome.runtime.sendMessage({ action: "colorUpdate", color });
    };

    const onMouseDown = (e) => {
      e.preventDefault();
      const color = getPixelColor(e.pageX, e.pageY);
      chrome.runtime.sendMessage({ action: "storeColor", color });
      deactivateColorPicker();
    };

    const deactivateColorPicker = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.body.removeChild(crosshair);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
  }
});
