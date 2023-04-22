import { Camera, Mat4, OGLRenderingContext, Vec3 }      from "ogl-typescript";
import { Context, Drawable }                            from "@/utils/libs/drawable/Drawable";
import { DrawableGeometry }                             from "@/utils/libs/drawable/DrawableGeometry";
import { clamp, map }                                   from "@/utils/math/math";
import GlarePlaneMaterial                               from "@/webgl/materials/GlarePlaneMaterial";

export default class GlarePlane extends Drawable {
    public quadColor = [1, 1, 1, .95]
    public edgeColor = [0, 0, 0, 0]

    private modelViewMatrix = new Mat4()
    private vertices : Vec3[] = []

    program = { transparent: true, depthTest: false }

    constructor(gl: WebGLRenderingContext | OGLRenderingContext) {
        const material = new GlarePlaneMaterial(gl)        

        const attributes = {
            position: {
                value: new Float32Array([
                    -1.0, -1.0, 0.0,
                    1.0, -1.0, 0.0,
                    1.0, 1.0, 0.0,
                    -1.0, 1.0, 0.0,
        
                    -1.0, -1.0, 0.0,
                    1.0, -1.0, 0.0,
                    1.0, 1.0, 0.0,
                    -1.0, 1.0, 0.0,
        
                    -1.0, -1.0, 0.0,
                    1.0, -1.0, 0.0,
                    1.0, 1.0, 0.0,
                    -1.0, 1.0, 0.0,
        
                    -1.0, -1.0, 0.0,
                    1.0, -1.0, 0.0,
                    1.0, 1.0, 0.0,
                    -1.0, 1.0, 0.0,
                ]),
                size: 3
            },
            uv: {
                value: new Float32Array([
                    0.0, 0.0,
                    1.0, 0.0,
                    1.0, 1.0,
                    0.0, 1.0,
        
                    1.0, 0.0,
                    1.0, 0.0,
                    1.0, 0.0,
                    1.0, 0.0,
        
                    1.0, 0.0,
                    1.0, 0.0,
                    1.0, 0.0,
                    1.0, 0.0,
        
                    1.0, 0.0,
                    1.0, 0.0,
                    1.0, 0.0,
                    1.0, 0.0,
                ]),
                size: 2
            },
            color: {
                value: new Float32Array([
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
        
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
        
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
        
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0,
                    1.0, 1.0, 1.0, 1.0
                ]),
                size: 4
            },
            index: {
                value: new Uint16Array([
                    0,1,2, 0,2,3,                                                   // Quad
                    0,5,7, 0,7,1, 1,8,10, 1,10,2, 2,11,13, 2,13,3, 3,14,4, 3,4,0,   // Flaps
                    0,4,6, 0,6,5, 1,7,9, 1,9,8, 2,10,12, 2,12,11, 3,13,15, 3,15,14  // Connections
                ]), 
                size: 1
            },
        }        

        const geometry = new DrawableGeometry(gl, material.locations, attributes, true)

        super(gl, {
            material,
            geometry
        })

        this.gl = gl as Context

        // Create this.vertices from position attribute        
        const position = this.geometry.attributes.position.value
        for (let index = 0; index < position.length; index += 3) {
            const vertex = new Vec3(position[index], position[index + 1], position[index + 2])
            this.vertices.push(vertex)
        }
        
        // Wireframe
        // this.mode = this.gl.LINE_LOOP
    }

    extrude(camera: Camera, pushDistance = .5){
        const cameraLocalPosition = camera.position
        const directionToCenter = new Vec3().sub(this.position, camera.worldPosition).normalize();
        const quadNormal = new Vec3(0, 0, 1);

        const dot = directionToCenter.dot(quadNormal)
        
        // Set colors from dot        
        const alpha = clamp(map(Math.abs(dot), 0.001, 0.1, 0.0, 1.0), 0, 1);
        // Quad
        for (let index = 0; index < 16; index += 4) {            
            this.geometry.attributes.color.value[index]      = this.quadColor[0]            // r
            this.geometry.attributes.color.value[index + 1]  = this.quadColor[1]            // g
            this.geometry.attributes.color.value[index + 2]  = this.quadColor[2]            // b
            this.geometry.attributes.color.value[index + 3]  = this.quadColor[3] * alpha    // a            
        }

        // Flaps and connections
        for (let index = 16; index < this.geometry.attributes.color.value.length; index += 4) {            
            this.geometry.attributes.color.value[index]      = this.edgeColor[0] // r
            this.geometry.attributes.color.value[index + 1]  = this.edgeColor[1] // g
            this.geometry.attributes.color.value[index + 2]  = this.edgeColor[2] // b
            this.geometry.attributes.color.value[index + 3]  = this.edgeColor[3] // a
        }
        
        // Get worldspace eye to original 4 vertices
        const eyeToVerticesWorldSpace = [
            new Vec3(), 
            new Vec3(), 
            new Vec3(), 
            new Vec3()
        ]
        for (let index = 0; index < 4; index++) {
            eyeToVerticesWorldSpace[index] = this.vertices[index].clone().sub(cameraLocalPosition).normalize()
        }
        
        // Extrude quad vertices
        const sign = Math.sign(dot)
        const pushDirectionsWorldSpace = [new Vec3(), new Vec3(), new Vec3()]
        for (let i = 0; i < 4; i++) {
            pushDirectionsWorldSpace[0] = eyeToVerticesWorldSpace[i].clone().cross(eyeToVerticesWorldSpace[(i + 3) % 4]).scale(sign).normalize();

            pushDirectionsWorldSpace[1] = eyeToVerticesWorldSpace[(i + 1) % 4].clone().cross(eyeToVerticesWorldSpace[i]).scale(sign).normalize();

            pushDirectionsWorldSpace[2] = pushDirectionsWorldSpace[0].clone().add(pushDirectionsWorldSpace[1]).normalize();

            for (let j = 0; j < 3; j++) {
                const offset = pushDirectionsWorldSpace[j].clone().scale(pushDistance);
                this.vertices[4 + j + 3 * i] = this.vertices[i].clone().add(offset);
            }
        }
    }

    onBeforeDraw = ({ camera }: { camera: Camera }) => {
        if (!camera) return

        this.extrude(camera)
        
        // Update World Matrix
        this.updateMatrix()
        this.updateMatrixWorld()

        // Set the matrix uniforms
        this.modelViewMatrix.multiply(camera.viewMatrix, this.worldMatrix);
        this.gl.uniformMatrix4fv(this.material.locations.uniforms.modelViewMatrix, false, this.modelViewMatrix)
        this.gl.uniformMatrix4fv(this.material.locations.uniforms.projectionMatrix, false, camera.projectionMatrix)

        // Set buffers from this.vertices
        let vertexIndex = 0
        for (let index = 0; index < this.geometry.attributes.position.value.length; index += 3) {
            const vertex = this.vertices[vertexIndex]            
            
            this.geometry.attributes.position.value[index]      = vertex[0] // x
            this.geometry.attributes.position.value[index + 1]  = vertex[1] // y
            this.geometry.attributes.position.value[index + 2]  = vertex[2] // z            

            vertexIndex++
        }
        this.geometry.setBuffers(this.gl.DYNAMIC_DRAW)

        // Transparent, so needs to disable depth testing
        this.gl.disable(this.gl.DEPTH_TEST)

        // Enable alpha blending
        this.gl.enable(this.gl.BLEND);
        // Specify how alpha must blend: fragment color * alpha + clear color * (1 - alpha)
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
    }

    onPostDraw = () =>{
        this.gl.enable(this.gl.DEPTH_TEST)
    }    
}