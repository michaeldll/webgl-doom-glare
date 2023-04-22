export type Buffers = {
    [bufferName: string]: WebGLBuffer | null
}

export type Locations = {
    attributes: {
        [attributeName: string]:number
    },
    uniforms: {
        [uniformName: string]: number
    }
}

export type Geometry = {
    positions?: Float32Array // For easier super() behavior in meshes/
    normals?: Float32Array
    indices?: Uint16Array
    colors?: Float32Array
    uvs?: Float32Array
}

export type Vector3 = {
    x: number,
    y: number,
    z: number
}

export type MeshParameters = {
    position?: Vector3,
    rotation?: Vector3,
    scale?: Vector3
}

export type MeshConstructor = {
    shaders: [string, string],
    locationNames: {
        attributes: string[]
        uniforms: string[]
    }
    gl: WebGLRenderingContext
    parameters?: MeshParameters
    name?: string
}