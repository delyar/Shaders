#version 330 compatibility
#define pi 3.14

uniform float uK, uP;

out vec3	vNs;
out vec3	vEs;
out vec3	vMC;




void
main( )
{    
    vec4 newVertex = gl_Vertex; //glV
    float Y0 = 1.0;

	vMC = gl_Vertex.xyz;

    // displacing Z
    newVertex.z = uK * (Y0-newVertex.y) * sin( 2.*pi*newVertex.x/uP );

	vec4 ECposition = gl_ModelViewMatrix * newVertex;

	float dzdx = uK * (Y0-newVertex.y) * (2.*pi/uP) * cos( 2.*pi*newVertex.x/uP );
	float dzdy = -uK * sin( 2.*pi*newVertex.x/uP );
	vec3 xtangent = vec3(1., 0., dzdx );
	vec3 ytangent = vec3(0., 1., dzdy );

	vec3 newNormal = normalize( cross( xtangent, ytangent ) );
	vNs = newNormal;
	vEs = ECposition.xyz - vec3( 0., 0., 0. ) ; 
	       		// vector from the eye position to the point

	gl_Position = gl_ModelViewProjectionMatrix * newVertex;
}