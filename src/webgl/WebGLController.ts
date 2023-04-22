import { Pane } from "tweakpane";
import { TierResult } from 'detect-gpu';
import GlareScene from "./scenes/GlareScene";
import { Renderer } from "ogl-typescript";

export default class WebGLController {
  public glareScene: GlareScene

  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private pane = new Pane()
  private gpuTier: TierResult

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.setRenderer(true);

    if (!location.hash.includes("debug")) this.pane.hidden = true

    this.glareScene = new GlareScene({
      renderer: this.renderer,
      pane: this.pane,
    })

    this.tweaks()
  }

  public setRenderer = (antialias = false) => {
    this.renderer = new Renderer({
      canvas: this.canvas,
      powerPreference: "high-performance",
      antialias,
      dpr: Math.min(window.devicePixelRatio, 2),
      stencil: false
    });

    // (this.renderer.gl as any).clearColor(...new Color("#504f7d"), 1);
  };

  private tweaks = () => {
  }

  public tick = () => {
    if (this.glareScene) {
      this.glareScene.tick();

      this.renderer.render({
        scene: this.glareScene.scene,
        camera: this.glareScene.camera
      })
    }

    if (!this.pane.hidden) this.pane.refresh()
  };

  public unmount = () => {
    this.glareScene.scene.traverse((transform) => {
      const casted = transform as any
      if (casted.geometry) {
        casted.geometry.remove()
      }
      if (casted.program) {
        casted.program.remove()
      }
    })

    this.glareScene.removeEvents()

    this.pane.dispose()
  };
}
