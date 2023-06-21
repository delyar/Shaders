#version 330 compatibility
#define pi 3.14

out vec2 vST;
out vec3  vMCposition;
out float vLightIntensity; 
out vec3 vMC;
out vec3 Eye;
out vec3 Norm;
out vec3 Light;

uniform float uK;
uniform float uP;
uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;

vec4 LIGHTPOS   = vec4( uLightX, uLightY, uLightZ, 1. );

void
main( )
{
    vST = gl_MultiTexCoord0.st;
    vec4 glV = gl_Vertex;
    float Y0 = 1.0;

    // displacing Z
    glV.z = uK * (Y0-glV.y) * sin( 2.*pi*glV.x/uP );

    // compute normal
    float dzdx = uK * (Y0-glV.y) * (2.*pi/uP) * cos( 2.*pi*glV.x/uP );
    float dzdy = -uK * sin( 2.*pi*glV.x/uP );
    vec3 Tx = vec3(1., 0., dzdx );
    vec3 Ty = vec3(0., 1., dzdy );
    vec3 normal = normalize( cross( Tx, Ty ) );

    // lighting
    vec4 mixLight =  gl_ModelViewMatrix* LIGHTPOS;
	vec3 tnorm = normalize(gl_NormalMatrix * gl_Normal);
	vec3 ECposition = (gl_ModelViewMatrix * glV).xyz;
	Norm = normalize(gl_NormalMatrix * normal);
	Light = normalize(mixLight.xyz - ECposition);
	Eye = normalize(vec3(0.0, 0.0, 0.0) - ECposition);

	gl_Position = gl_ModelViewProjectionMatrix * glV;
	vMC = gl_Position.xyz;
}