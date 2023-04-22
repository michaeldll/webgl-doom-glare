import { OGLRenderingContext } from "ogl-typescript"
import { Locations } from "./types"


type Props = { vertex: string, fragment: string, attributes: string[], uniforms: string[] }
export class DrawableMaterial {
    public program : WebGLProgram
    public locations : Locations
    private gl : WebGLRenderingContext | OGLRenderingContext

    /**
     * Associates attribute and uniform locations w/ a program
     */
    constructor(gl : WebGLRenderingContext | OGLRenderingContext, {
        vertex,
        fragment,
        attributes,
        uniforms
    }: Props) {
        this.gl = gl
        this.program = this.getProgram(vertex, fragment)
        this.locations = this.getLocations(attributes, uniforms)
    }

    /**
     * Fetch attribute locations from program
     */
    getLocations = (attributes: string[], uniforms: string[]) => {
        const locations = {
            attributes: {},
            uniforms: {}
        }

        for (const attribute of attributes) {
            console.log(attribute);
            
            locations.attributes[attribute] = this.gl.getAttribLocation(this.program, attribute)
        }

        for (const uniform of uniforms) {
            locations.uniforms[uniform] = this.gl.getUniformLocation(this.program, uniform)
        }

        return locations
    }

    /**
     * Create and compile shader
     * @returns WebGLShader, or null if not compiled
     */
    getShader = (type: number, source: string) => {
        const shader = this.gl.createShader(type);

        // Send the source to the shader object
        this.gl.shaderSource(shader, source);

        this.gl.compileShader(shader);

        // Check if it compiled successfully
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            console.error(source)
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Create and link program
     * @returns WebGLProgram, or null if not linked.
     */
    getProgram = (vertex: string, fragment: string) => {
        const vertexShader = this.getShader(this.gl.VERTEX_SHADER, vertex);
        const fragmentShader = this.getShader(this.gl.FRAGMENT_SHADER, fragment);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        // Check if it linked successfully
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }
}