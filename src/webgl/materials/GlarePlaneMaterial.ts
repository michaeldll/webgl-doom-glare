import { DrawableMaterial } from "@/utils/libs/drawable/DrawableMaterial";

export default class GlarePlaneMaterial extends DrawableMaterial{
    constructor(gl: WebGLRenderingContext){
        const vertex = /* glsl */ `
        attribute vec3 position;
        attribute vec2 uv;
        attribute vec3 normal;
        attribute vec4 color;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec4 vColor;

        void main() {
            vUv = uv;
            vNormal = normal;
            vColor = color;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragment = /* glsl */ `
        precision mediump float;

        uniform float uWireframeFactor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec4 vColor;

        void main() {
            gl_FragColor = mix(vColor, vec4(vec3(1.), 1.), uWireframeFactor);
            
            // Debug :
            // gl_FragColor = vec4(1., 0., 0., 1.);
        }
    `;

    // Attributes and uniforms need to be active in the program for location fetching to work !
    super(gl, {
        vertex,
        fragment,
        attributes: ['position', 'uv', 'normal', 'color'],
        uniforms: ['projectionMatrix', 'modelViewMatrix', 'uWireframeFactor']
    })
    }
}