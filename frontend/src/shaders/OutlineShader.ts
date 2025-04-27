import * as PIXI from 'pixi.js';

// Default vertex shader with explicit attributes
const vertexShaderSrc = `
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    
    uniform mat3 projectionMatrix;
    varying vec2 vTextureCoord;
    
    void main(void) {
        gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
`;

const outlineFragmentShader = `
    precision mediump float;

    uniform sampler2D uSampler;
    uniform vec2 uResolution;
    uniform float uThickness;
    uniform vec3 uColor;

    varying vec2 vTextureCoord;

    void main(void) {
        vec4 color = texture2D(uSampler, vTextureCoord);
        
        // Use original color if it's opaque
        if (color.a > 0.9) {
            gl_FragColor = color;
            return;
        }

        // Check for neighboring opaque pixels
        vec2 pixelSize = 1.0 / uResolution;
        float t = uThickness;
        
        // Check in all 8 directions at once
        bool hasNeighbor = 
            texture2D(uSampler, vTextureCoord + vec2(t, 0) * pixelSize).a > 0.0 ||   // right
            texture2D(uSampler, vTextureCoord + vec2(-t, 0) * pixelSize).a > 0.0 ||  // left
            texture2D(uSampler, vTextureCoord + vec2(0, t) * pixelSize).a > 0.0 ||   // up
            texture2D(uSampler, vTextureCoord + vec2(0, -t) * pixelSize).a > 0.0 ||  // down
            texture2D(uSampler, vTextureCoord + vec2(t, t) * pixelSize).a > 0.0 ||   // diagonal
            texture2D(uSampler, vTextureCoord + vec2(t, -t) * pixelSize).a > 0.0 ||
            texture2D(uSampler, vTextureCoord + vec2(-t, t) * pixelSize).a > 0.0 ||
            texture2D(uSampler, vTextureCoord + vec2(-t, -t) * pixelSize).a > 0.0;
            
        gl_FragColor = hasNeighbor ? vec4(uColor, 1.0) : vec4(0.0);
    }
`;

class OutlineShader extends PIXI.Filter {
    constructor(public color: number) {
        const red = (color >> 16) & 0xff;
        const green = (color >> 8) & 0xff;
        const blue = color & 0xff;
        super(vertexShaderSrc, outlineFragmentShader, {
            uThickness: 5.0,
            uColor: [red / 255, green / 255, blue / 255],
            uResolution: [window.innerWidth, window.innerHeight],
        });

        window.addEventListener('resize', () => {
            this.uniforms.uResolution = [window.innerWidth, window.innerHeight];
        });
    }
}

export default OutlineShader;
