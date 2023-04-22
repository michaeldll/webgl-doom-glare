import "./scss/global.scss";
import WebGLController from "./webgl/WebGLController";

const init = () => {

  const controller = new WebGLController(document.querySelector(".canvas-gl"))

  let raf: number
  const tick = () => {
    controller.tick()
    raf = requestAnimationFrame(tick)
  }

  tick()
};

init()