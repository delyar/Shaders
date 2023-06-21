#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable
layout( triangles ) in;
layout( triangle_strip, max_vertices=204 ) out;


in vec3		vNormal[3];
out float	gLightIntensity;

uniform int     uLevel;
uniform float   uLightX, uLightY, uLightZ;

const vec3 LIGHTPOS = vec3( 0., 10., 0. );
const float PI = 3.14159265;

vec3 V0, V1, V2;
vec3 N0, N1, N2;

void
ProduceVertex( float s, float t )
{
    vec3 LIGHTPOS = vec3(uLightX, uLightY, uLightZ);
    
    vec3 v = V0 + s*V1 + t*V2;
    vec3 n = N0 + s*N1 + t*N2;
    
    vec3 tnorm = normalize( gl_NormalMatrix * n ); 

    float r 	= length( v );
    float theta = atan( v.z, v.x );
    float phi   = atan( v.y, length( v.xz ) );

    v.y = r * sin( phi );
    float xz = r * cos( phi );
    v.x = xz * cos( theta );
    v.z = xz * sin( theta );

    vec4 ECposition = gl_ModelViewMatrix * vec4( v, 1. );
    gLightIntensity = abs( dot( normalize(LIGHTPOS - ECposition.xyz), tnorm ) );

    gl_Position = gl_ProjectionMatrix * ECposition;
    EmitVertex( );
}


void
main( )
{
    V0 = gl_PositionIn[0].xyz;
    V1 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;
    V2 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;

    N1 = ( vNormal[1] - vNormal[0] );
    N2 = ( vNormal[2] - vNormal[0] );
    N0 = vNormal[0];

    int numLayers = 1 << uLevel;

    float dt = 1. / float( numLayers );

    float t_top = 1.;

    for( int l = 0; l < numLayers; l++ )
    {
        float t_bottom = t_top - dt;
        float smax_top = 1. - t_top;
        float smax_bottom = 1. - t_bottom;

        int nums = l + 1;
        float ds_top = smax_top / float( nums - 1 );
        float ds_bottom = smax_bottom / float( nums );

        float s_top = 0.;
        float s_bottom = 0.;

        for( int is = 0; is < nums; is++ )
        {
            ProduceVertex( s_bottom, t_bottom );
            ProduceVertex( s_top, t_top );
            s_top += ds_top;
            s_bottom += ds_bottom;
        }

        ProduceVertex( s_bottom, t_bottom );
        EndPrimitive( );

        t_top = t_bottom;
        t_bottom -= dt;
    }
}