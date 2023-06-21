#version 330 compatibility

in vec2 vST;

uniform float uAd;
uniform float uBd;
uniform float uTol;
uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uAlpha;
uniform sampler2D Noise2;

in vec3 vColor;
in float vLightIntensity;
const vec3 WHITE = vec3( 1., 1., 1. );
const vec3 PINK = vec3( 1., 0.5, 1. );
void

main( )
{

    //calculating the noise value
    vec4 nv  = texture2D( Noise2, uNoiseFreq*vST );

    //calculating the ellipses texture
    float Ar = uAd/2;
    float Br = uBd/2;

    int numins = int(vST.s / uAd);
    int numint = int(vST.t/uBd);

    float sc = float(numins) * uAd  +  Ar;
    float tc = float(numint) * uBd  +  Br;

    float d = pow(((vST.s - sc)/Ar), 2) + pow(((vST.t - tc)/Br), 2);

    // give the noise a range of [-1.,+1.]:
    float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
    n = n - 2.;                             // -1. -> 1.
    n *= uNoiseAmp;

    // determine the color based on the noise-modified (s,t):
    float ds = vST.s - sc;                   // wrt ellipse center
    float dt = vST.t - tc;                   // wrt ellipse center

    float oldDist = sqrt( ds*ds + dt*dt );
    float newDist = oldDist + n;
    float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.

    ds = (scale * ds) / Ar;
    dt = (scale * dt) / Br;

    d = pow(ds , 2) + pow(dt , 2);


    float t = smoothstep( 1.-uTol, 1.+uTol, d );
    vec3 color = mix( PINK, WHITE, t );

    vec3 rgb = vLightIntensity * color;

    if (d <= 1.0) {
        // inside pattern
        gl_FragColor = vec4( rgb, 1.0);

    }else{
        // outside pattern
        if (uAlpha == 0.0) {
            // throw away
            discard;
        }
        gl_FragColor = vec4( rgb, uAlpha);

    }


}