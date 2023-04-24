import { Camera, OGLRenderingContext, Transform } from 'ogl-typescript'
import { DrawableMaterial } from './DrawableMaterial'
import { DrawableGeometry } from './DrawableGeometry'

export type Context = WebGLRenderingContext & { createVertexArray, bindVertexArray } | OGLRenderingContext & { createVertexArray, bindVertexArray }

/**
 * A barebones WebGL entity that also works with OGL's renderer and Scene Graph
 * @author @michael.dll
 */
export abstract class Drawable extends Transform {
    public gl: Context
    public material: DrawableMaterial
    public geometry: DrawableGeometry
    public name: string
    public mode: number // e.g.: WebGLRenderingContext["TRIANGLES"]

    constructor(gl: WebGLRenderingContext | OGLRenderingContext, { material, geometry, name = "Drawable" }) {
        super()

        this.gl = gl as Context
        this.mode = gl.TRIANGLES
        this.material = material
        this.geometry = geometry
        this.name = name
    }

    onBeforeDraw = ({ camera }: { camera: Camera }) => { }

    onPostDraw = ({ camera }: { camera: Camera }) => { }

    draw = ({ camera }: { camera: Camera }) => {
        if (!this.visible) return

        this.gl.useProgram(this.material.program);
        
        if(this.geometry.dynamic === false) this.gl.bindVertexArray(this.geometry.vao)
        else this.geometry.setAttributes()

        this.onBeforeDraw({ camera })

        if (this.geometry.attributes.index) {
            const vertexCount = this.geometry.attributes.index.value.length
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.mode, vertexCount, type, offset);
        }

        else this.gl.drawArrays(this.mode, 0, this.geometry.attributes.position.value.length / 3);

        if(this.geometry.dynamic === false) this.gl.bindVertexArray(this.geometry.vao)

        this.onPostDraw({ camera })
    }
}