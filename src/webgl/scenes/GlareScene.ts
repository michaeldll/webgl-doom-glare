import { Camera, OGLRenderingContext, Orbit, Renderer, Transform, Vec3 } from "ogl-typescript";
import { FolderApi } from "tweakpane";
import GlarePlane from "../components/GlarePlane";

export default class GlareScene {
  public scene: Transform
  public camera: Camera
  
  private gl: OGLRenderingContext
  private pane: FolderApi
  private renderer: Renderer

  private plane : GlarePlane
  private controls : any

  constructor({renderer, pane}: {renderer: Renderer, pane: FolderApi}) {
    this.gl = renderer.gl as OGLRenderingContext
    this.pane = pane
    this.renderer = renderer
    
    this.scene = new Transform()

    this.setCamera()
    this.onResize();
    this.setObjects();
    this.setEvents();

    this.tweaks()
  }

  protected setCamera() {
    this.camera = new Camera(this.gl, {
      fov: 21,
      near: 0.1,
      far: 1000
    })
    this.camera.position.set(0, 0, 5.3)

    this.controls = new Orbit(this.camera, {
    });
  }

  private setObjects() {
    this.plane = new GlarePlane(this.gl)

    this.plane.scale.set(.5)

    this.plane.setParent(this.scene)
  }

  private onResize = () => {
    const canvas = this.gl.canvas as HTMLCanvasElement
    const rect = canvas.getBoundingClientRect()
    this.renderer.setSize(rect.width, rect.height);
    this.camera.perspective({
      aspect: rect.width / rect.height,
    });

    this.renderer.dpr = Math.min(2, window.devicePixelRatio);
  };

  private setEvents = () => {
    window.addEventListener("resize", this.onResize);
  };

  public removeEvents = () => {
    window.removeEventListener("resize", this.onResize);
  }

  private tweaks = () => {
    const folder: FolderApi = this.pane.addFolder({
      title: "Glare Scene",
    });

    folder.addInput(this.plane, "wireframe", { label: "Toggle wireframe" });
  }

  public tick() {
    this.controls.update()
  }
}
