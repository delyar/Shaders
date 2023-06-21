#version 330 compatibility

in vec2 vST;
in vec3 vMC;

in vec3 Eye;
in vec3 Norm;
in vec3 Light;

uniform float uNoiseAmp;
uniform float uNoiseFreq;
uniform float uK;
uniform float uP;
uniform float uKa;
uniform float uKd;
uniform float uKs;
uniform float uShininess;
uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;
uniform vec4 uColor;
uniform vec4 uSpecularColor;

uniform sampler2D Noise2;
uniform sampler3D Noise3;

const vec3 PINK = vec3( 1., 0.5, 1. );


in vec3 vColor;
in float vLightIntensity;

vec3
RotateNormal( float angx, float angy, vec3 n )
{
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
}

void

main( )
{

    // get two noise values
    vec4 nvx = texture( Noise3, uNoiseFreq*vMC );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;	// -1. to +1.
	angx *= uNoiseAmp;

    vec4 nvy = texture( Noise3, uNoiseFreq*vec3(vMC.xy,vMC.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;	// -1. to +1.
	angy *= uNoiseAmp;



    // per-fragment lighing
    vec4 ambient = uKa * uColor;
    float d = 0.;
    float s = 0.;

    vec3 Normal = gl_NormalMatrix * normalize(RotateNormal(angx, angy, Norm));

    if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light) - Light );
        s = pow( max( dot(normalize(Eye),ref), 0. ), uShininess );
    }

    vec4 specular = uKs * s * uSpecularColor;


    vec4 diffuse = uKd * dot(Normal,Light) * uColor;
    gl_FragColor = vec4( ambient + diffuse + specular);
    gl_FragColor.a = 1.0;
}