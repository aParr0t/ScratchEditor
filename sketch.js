//declare/assign variables
let res = 40;
let tileWidth, gridRes;
let layers = new Array(4);
let editLayer = 1;
let currentTexture;
let layerCheckboxes = new Array(layers.length);
let layerNames = [
  "background",
  "level hitbox",
  "danger",
  "foreground"
];

//DOM elements
let brushSize, brushSizeSlider;
let saveButton;
let editLayerSlider;
let gridCheckbox;
let tools = [];
let textures = [];
let c = document.createElement("canvas");

function preload() {
  for (let i = 0; i < 1; i++) {
    tools[i] = loadImage("assets/tools/tool-" + i + ".png");
  }
  for (let i = 0; i < 1; i++) {
    textures[i] = loadImage("assets/textures/texture-" + i + ".png");
  }
}

function setup() {
  createCanvas(480, 360);

  //declare dom elements
  //brush slider
  brushSizeSlider = createSlider(1, 3, 1, 1);
  brushSizeSlider.parent("brushDiv");
  select("#brushSizeText").parent("brushDiv")
  positionElement("brushDiv", 20, height);

  //save button
  saveButton = createButton("Save");
  saveButton.mousePressed(saveLevel);
  saveButton.parent("settingsDiv");

  //visible layers
  positionElement("settingsDiv", width + 10, 0);
  select("#layerText").parent("settingsDiv");
  for (let i = 0; i < layerCheckboxes.length; i++) {
    layerCheckboxes[i] = createCheckbox(layerNames[i]);
    if (i == editLayer) {
      layerCheckboxes[i].checked(true);
    } else {
      layerCheckboxes[i].checked(false);
    }
    layerCheckboxes[i].parent("settingsDiv");
  }

    //grid checkbox
  gridCheckbox = createCheckbox("show grid", true);
  select("#settingsText").parent("settingsDiv");
  gridCheckbox.parent("settingsDiv");

  //editlayer
  editLayerSlider = createSlider(0, layers.length - 1, 1, 1);
  editLayerSlider.parent("editLayerDiv");
  select("#editLayerText").parent("editLayerDiv")
  positionElement("editLayerDiv", 0 + 160, height);

  positionElement("imageDiv", 20, height+200)
  for (let i = 0; i < textures.length; i++) {

    img = textures[i];
    let src = drawImage("imageDiv", img).src;
    domImg = createImg(src, "");
    domImg.parent("imageDiv");
    domImg.mousePressed(() => {
      currentTexture = img;
    })
  }

  //declare/assign variables and arrays
  tileWidth = width / res;
  gridRes = {
    w: width / tileWidth,
    h: height / tileWidth
  }

  currentTexture = tools[0];

  for (let i = 0; i < layers.length; i++) {
    layers[i] = twoDGrid(gridRes.w, gridRes.h);
  }

}

function draw() {
  background(220);

  //update variables/array based on dom elements
  brushSize = brushSizeSlider.value();
  editLayer = editLayerSlider.value();

  //update html of dom elements
  select("#brushSizeText").html("Brush size : " + brushSize);
  select("#editLayerText").html("Editing layer : " + layerNames[editLayer]);

  if (gridCheckbox.checked()) {
    stroke(150);
    strokeWeight(1)
    drawGrid(gridRes.w, gridRes.h, tileWidth);
  }

  renderLayers();
}

function renderLayers() {
  for (let i = 0; i < layerCheckboxes.length; i++) {
    if (layerCheckboxes[i].checked()) {
      renderLayer(i);
    }
  }
}

function positionElement(id, x_, y_) {
  element = select("#" + id);
  element.position(x_, y_);
}

function renderLayer(layer_) {
  for (let i = 0; i < gridRes.h; i++) {
    for (let j = 0; j < gridRes.w; j++) {
      let obj = layers[layer_][i][j];
      if (obj instanceof Texture) {
        obj.show();
      }
    }
  }
}

function writeColor(image_, x_, y_, red_, green_, blue_) {
  let idx_ = (y_ * image_.width + x_) * 4;
  image_.pixels[idx_ + 0] = red_;
  image_.pixels[idx_ + 1] = green_;
  image_.pixels[idx_ + 2] = blue_;
  image_.pixels[idx_ + 3] = 255;
}

//add tiles when mousePressed
function mouseDragged() {
  addMultipleTiles(mouseX, mouseY, brushSize);
}

function mousePressed() {
  addMultipleTiles(mouseX, mouseY, brushSize);
}

//adding new tiles to the layer
function addMultipleTiles(x_, y_, size_) {
  if (mouseX >= 0 && mouseX < width && mouseY >= 0 && mouseY < height) {
    let newTile;
    if (size_ % 2 == 0) {
      newTile = calculateGridPos(x_, y_, "round");
    } else {
      newTile = calculateGridPos(x_, y_, "floor");
    }
    let pixelOffset = 0 - floor(size_ / 2);
    for (let i = pixelOffset; i < pixelOffset + size_; i++) {
      for (let j = pixelOffset; j < pixelOffset + size_; j++) {
        addTileToGrid(newTile.x + j, newTile.y + i);
      }
    }
  }
}

function addTileToGrid(gridx_, gridy_) {
  if (gridx_ >= 0 && gridx_ < gridRes.w && gridy_ >= 0 && gridy_ < gridRes.h) {
    if (currentTexture == 0) {
      layers[editLayer][gridy_][gridx_] = 0;
    } else {
      layers[editLayer][gridy_][gridx_] = new Texture(gridx_ * tileWidth, gridy_ * tileWidth, currentTexture);
    }
  }
}

function twoDGrid(width_, height_, value_ = 0) {
  let returnGrid = [];
  for (let i_ = 0; i_ < height_; i_++) {
    returnGrid.push([]);
    for (let j_ = 0; j_ < width_; j_++) {
      returnGrid[i_][j_] = value_;
    }
  }
  return returnGrid;
}

function calculateGridPos(x_, y_, align_ = "floor") {
  let returnVector;
  if (align_ == "floor") {
    returnVector = createVector(
      floor(x_ / tileWidth),
      floor(y_ / tileWidth)
    )
  } else if (align_ == "round") {
    returnVector = createVector(
      round(x_ / tileWidth),
      round(y_ / tileWidth)
    )
  }
  return returnVector;
}

function saveLevel() {
  let saveImg = createImage(width, height);
  saveImg.loadPixels();
  for (let i = 0; i < gridRes.h; i++) {
    for (let j = 0; j < gridRes.w; j++) {
      let obj = layers[editLayer][i][j];
      if (obj instanceof Texture) {
        obj.myTexture.loadPixels();
        for (let y = 0; y < obj.myTexture.height; y++) {
          for (let x = 0; x < obj.myTexture.width; x++) {
            let idx = (y * tileWidth + x) * 4;
            let red = obj.myTexture.pixels[idx + 0];
            let green = obj.myTexture.pixels[idx + 1];
            let blue = obj.myTexture.pixels[idx + 2];
            writeColor(saveImg, obj.pos.x + x, obj.pos.y + y, red, green, blue);
          }
        }
      }
    }
  }
  saveImg.updatePixels();
  saveImg.save("Level hitbox", "png");
}

function drawGrid(cols_, rows_, step_) {
  for (let x = 1; x < cols_; x++) {
    line(x * step_, 0, x * step_, height);
  }

  for (let y = 1; y < rows_; y++) {
    line(0, y * step_, width, y * step_);
  }
}

function keyPressed() {
  if (key == "d") {
    currentTexture = tools[0]
  } else if (key == "e") {
    currentTexture = 0;
  }
}

function drawImage(id, img) {
  c.width = img.width; //setting the canvas width and height to the img
  c.height = img.height;

  let ctx = c.getContext("2d"); //allows you to draw stuff on the canvas
  img.loadPixels();
  let data = new ImageData(img.pixels, img.width, img.height);
  ctx.putImageData(data, 0, 0); //drawing the images pixel data onto the canvas

  let url = c.toDataURL(); //turning the canvas to a url

  let newImage = new Image(); //creating a DOM image
  newImage.src = url; //setting the image url to the new url

  // let test = document.getElementById(id)
  // test.append(newImage) //putting the image on the html element

  return newImage;
}
