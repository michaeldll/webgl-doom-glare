import loadImage from "@/utils/misc/misc";
import { Camera, Mat4 } from "ogl-typescript";
import { Drawable } from "./Drawable";
import { DrawableGeometry } from "./DrawableGeometry";
import { DrawableMaterial } from "./DrawableMaterial";

export const PlaneAttributes = {
  position: {
      value: new Float32Array([
          -1.0, -1.0, 0.0,
          1.0, -1.0, 0.0,
          1.0, 1.0, 0.0,
          -1.0, 1.0, 0.0,
      ]), 
      size: 3
  },
  normal: {
      value: new Float32Array([
          0.0, 0.0, 1.0,
          0.0, 0.0, 1.0,
          0.0, 0.0, 1.0,
          0.0, 0.0, 1.0,
      ]), 
      size: 3
  },
  uv: {
      value: new Float32Array([
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
      ]),
      size: 2
  },
  index: {
      value: new Uint16Array([
          0, 1, 2, 0, 2, 3,
      ]), 
      size: 1
  },
}

export default class Plane extends Drawable {
    texture : WebGLTexture
    modelViewMatrix : Mat4
    worldMatrix: Mat4

    constructor(gl) {
        const vertex = /* glsl */ `
            attribute vec3 position;
            attribute vec2 uv;
            attribute vec3 normal;
            
            uniform mat4 uWorldMatrix;
            // uniform mat4 modelViewMatrix;
            // uniform mat4 projectionMatrix;

            varying vec2 vUv;
            varying vec3 vNormal;

            void main() {
                vUv = uv;
                vNormal = normal;

                gl_Position = uWorldMatrix * vec4(position, 1.0);
            }
        `;

        const fragment = /* glsl */ `
            precision mediump float;

            uniform sampler2D uTexture;

            varying vec2 vUv;
            varying vec3 vNormal;

            void main() {
                gl_FragColor = texture2D(uTexture, vUv);

                // Debug :
                // gl_FragColor = vec4(vUv.x, vUv.y, 0., 1.);
                // gl_FragColor = vec4(1., 0., 0., 1.);
            }
        `;

        // Attributes need to be active in the program for location fetching to work !
        const material = new DrawableMaterial(gl, {
            vertex,
            fragment,
            attributes: ['position', 'uv', 'normal'],
            uniforms: ['uWorldMatrix', 'uTexture']
        })

        // Plane
        const geometry = new DrawableGeometry(gl, material.locations, PlaneAttributes)

        super(gl, {
            material,
            geometry
        })

        this.gl = gl

        // Create texture containing a 1x1 blue pixel.
        this.texture = gl.createTexture();

        // Enable texture 0
        gl.activeTexture(gl.TEXTURE0);

        // Set the texture's target (2D or cubemap)
        gl.bindTexture(gl.TEXTURE_2D, this.texture);

        // Fill the texture with a 1x1 blue pixel.
        const width = 1
        const height = 1
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

        // Pass texture 0 to the sampler
        gl.useProgram(this.material.program);
        gl.uniform1i(this.material.locations.uniforms.uTexture, 0);
    }

    load = () => {
        loadImage(`UV_Grid.png`).then((image) => {
            // console.log(image);

            // Flip the image's y axis
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);

            // Enable texture 0
            this.gl.activeTexture(this.gl.TEXTURE0);

            // Set the texture's target (2D or cubemap)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

            // Stretch/wrap options
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl["LINEAR"]);

            // Bind image to texture 0
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.gl.RGB, this.gl.UNSIGNED_BYTE, image);

            // Mipmaps
            this.gl.generateMipmap(this.gl.TEXTURE_2D);

            // Pass texture 0 to the sampler
            this.gl.useProgram(this.material.program);
            this.gl.uniform1i(this.material.locations.uniforms.uTexture, 0);

            this.gl.activeTexture(this.gl.TEXTURE0);
        })
    }

    onBeforeDraw = ({ camera }: { camera: Camera }) => {
        this.gl.activeTexture(this.gl.TEXTURE0)
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture)
        this.gl.uniform1i(this.material.locations.uniforms.uTexture, 0);

        // World Matrix
        this.updateMatrix()
        this.gl.uniformMatrix4fv(this.material.locations.uniforms.uWorldMatrix, false, this.matrix)

        if (!camera) return
        // this.gl.uniformMatrix4fv(this.material.locations.uniforms.cameraWorldPosition, false, camera.worldPosition)
        // this.gl.uniformMatrix4fv(this.material.locations.uniforms.viewMatrix, false, camera.viewMatrix)
        
        // this.gl.uniformMatrix4fv(this.material.locations.uniforms.projectionMatrix, false, camera.projectionMatrix)
        // this.modelViewMatrix.multiply(camera.viewMatrix, this.matrix);
        // this.gl.uniformMatrix4fv(this.material.locations.uniforms.modelViewMatrix, false, this.modelViewMatrix)
    }
}