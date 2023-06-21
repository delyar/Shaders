#version 330 compatibility
#define pi 3.14

out vec2 vST;
out vec3 vMCposition;
out float vLightIntensity; 
out vec3 vMC;
out vec3 Eye;
out vec3 Norm;
out vec3 Light0;
out vec3 Light1;
out vec3 Light2;

uniform float uK;
uniform float uP;
uniform float uLight0X;
uniform float uLight0Y;
uniform float uLight0Z;

uniform float uLight1X;
uniform float uLight1Y;
uniform float uLight1Z;

uniform float uLight2X;
uniform float uLight2Y;
uniform float uLight2Z;

vec4 LIGHTPOS0 = vec4( uLight0X, uLight0Y, uLight0Z, 1. );
vec4 LIGHTPOS1 = vec4( uLight1X, uLight1Y, uLight1Z, 1. );
vec4 LIGHTPOS2 = vec4( uLight2X, uLight2Y, uLight2Z, 1. );

void main()
{
    vST = gl_MultiTexCoord0.st;
    vec4 glV = gl_Vertex;

    // lighting
    vec4 mixLight0 = gl_ModelViewMatrix * LIGHTPOS0;
    vec3 ECposition0 = (gl_ModelViewMatrix * glV).xyz;
    Light0 = normalize(mixLight0.xyz - ECposition0);

    vec4 mixLight1 = gl_ModelViewMatrix * LIGHTPOS1;
    vec3 ECposition1 = (gl_ModelViewMatrix * glV).xyz;
    Light1 = normalize(mixLight1.xyz - ECposition1);

    vec4 mixLight2 = gl_ModelViewMatrix * LIGHTPOS2;
    vec3 ECposition2 = (gl_ModelViewMatrix * glV).xyz;
    Light2 = normalize(mixLight2.xyz - ECposition2);

    Eye = normalize(vec3(0.0, 0.0, 0.0) - ECposition0);
    Norm = normalize(gl_NormalMatrix * gl_Normal);


    gl_Position = gl_ModelViewProjectionMatrix * glV;
    vMC = gl_Position.xyz;
}
