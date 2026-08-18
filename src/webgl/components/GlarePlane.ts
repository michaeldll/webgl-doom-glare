import { Camera, Mat4, OGLRenderingContext, Vec3 }      from "ogl-typescript";
import { Context, Drawable }                            from "@/utils/libs/drawable/Drawable";
import { DrawableGeometry }                             from "@/utils/libs/drawable/DrawableGeometry";
import { clamp, map }                                   from "@/utils/math/math";
import GlarePlaneMaterial                               from "@/webgl/materials/GlarePlaneMaterial";

const BORDER_SUBDIVISIONS = 16
const BORDER_VERTICES_PER_CORNER = BORDER_SUBDIVISIONS + 1

export default class GlarePlane extends Drawable {
    public quadColor = [1, 1, 1, .95]
    public edgeColor = [0, 0, 0, 0]
    public program = { transparent: true, depthTest: false } // For OGL
    public wireframe = false

    private modelViewMatrix = new Mat4()
    private vertices : Vec3[] = []

    constructor(gl: WebGLRenderingContext | OGLRenderingContext) {
        const material = new GlarePlaneMaterial(gl)

        const quadVertices = [
            [-1.0, -1.0, 0.0],
            [1.0, -1.0, 0.0],
            [1.0, 1.0, 0.0],
            [-1.0, 1.0, 0.0],
        ]
        const positions = quadVertices.flat()
        const uvs = [
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,
        ]
        const indices = [0, 1, 2, 0, 2, 3]

        for (let corner = 0; corner < quadVertices.length; corner++) {
            for (let subdivision = 0; subdivision < BORDER_VERTICES_PER_CORNER; subdivision++) {
                positions.push(...quadVertices[corner])
                uvs.push(1.0, 0.0)
            }
        }

        for (let corner = 0; corner < quadVertices.length; corner++) {
            const nextCorner = (corner + 1) % quadVertices.length
            const cornerStart = quadVertices.length + corner * BORDER_VERTICES_PER_CORNER
            const nextCornerStart = quadVertices.length + nextCorner * BORDER_VERTICES_PER_CORNER
            const outgoingEdge = cornerStart + BORDER_SUBDIVISIONS

            // Connect adjacent corners along each straight edge.
            indices.push(
                corner, outgoingEdge, nextCornerStart,
                corner, nextCornerStart, nextCorner,
            )

            // Fan the subdivided border around each corner.
            for (let subdivision = 0; subdivision < BORDER_SUBDIVISIONS; subdivision++) {
                indices.push(corner, cornerStart + subdivision, cornerStart + subdivision + 1)
            }
        }

        const vertexCount = quadVertices.length + quadVertices.length * BORDER_VERTICES_PER_CORNER

        const attributes = {
            position: {
                value: new Float32Array(positions),
                size: 3
            },
            uv: {
                value: new Float32Array(uvs),
                size: 2
            },
            color: {
                value: new Float32Array(vertexCount * 4).fill(1),
                size: 4
            },
            index: {
                value: new Uint16Array(indices),
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
        const pushDirectionsWorldSpace = [new Vec3(), new Vec3()]
        for (let i = 0; i < 4; i++) {
            pushDirectionsWorldSpace[0] = eyeToVerticesWorldSpace[i].clone().cross(eyeToVerticesWorldSpace[(i + 3) % 4]).scale(sign).normalize();

            pushDirectionsWorldSpace[1] = eyeToVerticesWorldSpace[(i + 1) % 4].clone().cross(eyeToVerticesWorldSpace[i]).scale(sign).normalize();

            for (let subdivision = 0; subdivision < BORDER_VERTICES_PER_CORNER; subdivision++) {
                const progress = subdivision / BORDER_SUBDIVISIONS
                const pushDirection = new Vec3(
                    pushDirectionsWorldSpace[0][0] * (1 - progress) + pushDirectionsWorldSpace[1][0] * progress,
                    pushDirectionsWorldSpace[0][1] * (1 - progress) + pushDirectionsWorldSpace[1][1] * progress,
                    pushDirectionsWorldSpace[0][2] * (1 - progress) + pushDirectionsWorldSpace[1][2] * progress,
                ).normalize()
                const offset = pushDirection.scale(pushDistance)
                this.vertices[4 + subdivision + BORDER_VERTICES_PER_CORNER * i] = this.vertices[i].clone().add(offset)
            }
        }
    }

    onBeforeDraw = ({ camera }: { camera: Camera }) => {
        if (!camera) return

        if(this.wireframe) {
            this.mode = this.gl.LINE_LOOP
            this.gl.uniform1f(this.material.locations.uniforms.uWireframeFactor, 1)
        }
        else {
            this.mode = this.gl.TRIANGLES
            this.gl.uniform1f(this.material.locations.uniforms.uWireframeFactor, 0)
        }

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