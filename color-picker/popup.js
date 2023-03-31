document.addEventListener("DOMContentLoaded", function () {
  var colorDisplay = document.getElementById("color-display");
  var hexDisplay = document.getElementById("hex-display");
  var rgbDisplay = document.getElementById("rgb-display");

  var redInput = document.getElementById("red-input");
  var greenInput = document.getElementById("green-input");
  var blueInput = document.getElementById("blue-input");

  function updateColorDisplay() {
    var red = parseInt(redInput.value);
    var green = parseInt(greenInput.value);
    var blue = parseInt(blueInput.value);

    var rgb = `rgb(${red}, ${green}, ${blue})`;
    var hex = `#${red.toString(16).padStart(2, "0")}${green.toString(16).padStart(2, "0")}${blue.toString(16).padStart(2, "0")}`;

    colorDisplay.style.backgroundColor = rgb;
    hexDisplay.textContent = hex;
    rgbDisplay.textContent = `${red}, ${green}, ${blue}`;
  }

  redInput.addEventListener("input", updateColorDisplay);
  greenInput.addEventListener("input", updateColorDisplay);
  blueInput.addEventListener("input", updateColorDisplay);
  
  function activateColorPicker() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, { action: "activateColorPicker" });
    });
  }
  
  function updateColorFromPicker(color) {
    redInput.value = color.r;
    greenInput.value = color.g;
    blueInput.value = color.b;
    updateColorDisplay();
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "colorUpdate") {
      updateColorFromPicker(request.color);
    } else if (request.action === "colorSelected") {
      updateColorFromPicker(request.color);
      window.close();
    }
  });
  
  colorDisplay.addEventListener("click", activateColorPicker);

  // Initialize the color display
  updateColorDisplay();
  chrome.runtime.sendMessage(
    { action: "getLastSelectedColor" },
    (lastSelectedColor) => {
      if (lastSelectedColor) {
        updateColorFromPicker(lastSelectedColor);
      }
    }
  );
});
