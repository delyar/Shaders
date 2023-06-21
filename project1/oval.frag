#version 330 compatibility

in vec2 vST;

uniform float uAd;
uniform float uBd;
uniform float uTol;

in vec3 vColor;
in float vLightIntensity;
const vec3 WHITE = vec3( 1., 1., 1. );
const vec3 PINK = vec3( 1., 0.5, 1. );
void

main( )
{

    float Ar = uAd/2;
    float Br = uBd/2;

    int numins = int(vST.s / uAd);
    int numint = int(vST.t/uBd);

    float sc = numins*uAd + Ar;
    float tc = numint*uBd + Br;

    float d = pow(((vST.s - sc)/Ar), 2) + pow(((vST.t - tc)/Br), 2);

    float t = smoothstep( 1.-uTol, 1.+uTol, d );
    vec3 color = mix( PINK, WHITE, t );

    vec3 rgb = vLightIntensity * color;
    gl_FragColor = vec4( rgb, 1. );

}