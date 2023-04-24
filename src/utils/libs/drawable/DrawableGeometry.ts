import { Attributes } from "@/types/Attributes"
import { OGLRenderingContext } from "ogl-typescript"
import { Context } from "./Drawable"
import { Locations } from "./types"

type Buffers = { [name: string]: WebGLBuffer }

export class DrawableGeometry {
    public vao : ReturnType<WebGL2RenderingContext["createVertexArray"]>
    public attributes: Attributes
    public dynamic : boolean
    public buffers: Buffers = {}

    private gl: Context
    private locations: Locations

    /**
     * Only sets buffers by default
     * setAttributes() and setVAO() should be set by the user depending on wheter the attributes are dynamic or not, respectively
     */
    constructor(gl: WebGLRenderingContext | OGLRenderingContext, locations: Locations, attributes: Attributes, dynamic = false) {
        this.gl = gl as Context
        this.locations = locations
        this.attributes = attributes;
        this.dynamic = dynamic

        this.setBuffers()
    }

    setBuffers = (usage : number = this.gl.STATIC_DRAW) => {
        for (const [prop, data] of Object.entries(this.attributes)) {            
            this.buffers[prop] = this.getBuffer(prop, data.value, usage)
        }
    }

    getBuffer = (prop: string, array: BufferSource, usage: number) => {
        const buffer = this.gl.createBuffer();
        
        if (prop === "index") {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, array, usage);
        } else {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.bufferData(this.gl.ARRAY_BUFFER, array, usage);
        }

        return buffer
    }

    setAttributes = () => {        
        // Position
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position)

        const positionLocation = this.locations.attributes.position     
        if(typeof positionLocation === "undefined") throw new Error(`No attribute location provided`)
        const numComponents = this.attributes.position.size;
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, numComponents, this.gl.FLOAT, false, 0, 0);

        // Normal
        if (this.attributes.normal) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normal)

            const normalLocation = this.locations.attributes.normal
            const numComponents = this.attributes.normal.size
            this.gl.enableVertexAttribArray(normalLocation);
            this.gl.vertexAttribPointer(normalLocation, numComponents, this.gl.FLOAT, false, 0, 0);
        }

        // UV
        if (this.attributes.uv) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.uv)

            const uvLocation = this.locations.attributes.uv
            const numComponents = this.attributes.uv.size;
            this.gl.enableVertexAttribArray(uvLocation);
            this.gl.vertexAttribPointer(uvLocation, numComponents, this.gl.FLOAT, false, 0, 0);
        }

        // Color
        if (this.attributes.color) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color)

            const colorLocation = this.locations.attributes.color            
            const numComponents = this.attributes.color.size;
            this.gl.enableVertexAttribArray(colorLocation);
            this.gl.vertexAttribPointer(colorLocation, numComponents, this.gl.FLOAT, false, 0, 0);
        }

        if (this.attributes.index) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.index);
        }
    }

    setVAO = () => {
        this.vao = this.gl.createVertexArray()
        this.gl.bindVertexArray(this.vao)

        this.setAttributes()

        this.gl.bindVertexArray(null)
    }
}
