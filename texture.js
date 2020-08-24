class Texture {
  constructor(x_, y_, img_) {
    this.pos = createVector(x_, y_);
    this.myTexture = img_;
  }

  show() {
    image(this.myTexture, this.pos.x, this.pos.y);
  }
}
