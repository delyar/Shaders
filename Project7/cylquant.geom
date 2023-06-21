#version 330 compatibility
#extension GL_EXT_gpu_shader4: enable
#extension GL_EXT_geometry_shader4: enable
layout( triangles )  in;
layout( triangle_strip, max_vertices=204 )  out;

uniform int     uLevel;
uniform float   uQuantize;

in vec3	    vNormal[3];

out float	gLightIntensity;
uniform bool uModelCoords;

uniform float uLightX;
uniform float uLightY;
uniform float uLightZ;

vec3 V0, V01, V02;
vec3 N0, N01, N02;

const float PI = 3.14159265;

float
Sign( float f )
{
        if( f >= 0. )   return  1.;
        return -1.;
}

float
Quantize( float f )
{
        f *= uQuantize;
        f += 0.5 * Sign(f);                // round-off
        int fi = int( f );
        f = float( fi ) / uQuantize;
        return f;
}


float
atan2( float y, float x )
{
        if( x == 0. )
        {
                if( y >= 0. )
                        return  PI/2.;
                else
                        return -PI/2.;
        }
        return atan(y,x);
}

vec3
QuantizedVertex( float s, float t )
{
	vec3 v = V0 + t * V02 + s * V01;
	
    float radius = length( v.xz );
    float theta = atan2( v.z, v.x );
    float height = v.y;

    radius = Quantize( radius );
    height = Quantize( height );

    v.xz = radius * vec2( cos(theta), sin(theta) );
    v.y = height;
	return v;
}

void RenderQuantizedVertexWithLighting( float s, float t ){
    vec3 LIGHTPOS = vec3( uLightX, uLightY, uLightZ );

	vec3 v = QuantizedVertex( s, t );
	vec3 n = N0 + s * N01 + t * N02;

	vec3 tnorm = normalize(gl_NormalMatrix * n);

	vec4 ECposition ;
    if( uModelCoords)
    {
		ECposition = gl_ModelViewMatrix * vec4( v, 1. );
	}
	else{
		ECposition = vec4( v, 1. );
	}
    
    gLightIntensity = abs( dot( normalize(LIGHTPOS - ECposition.xyz), tnorm ) );
    gl_Position = gl_ProjectionMatrix * ECposition;
    EmitVertex( );
}

void
main( )
{
    V01 = ( gl_PositionIn[1] - gl_PositionIn[0] ).xyz;
    V02 = ( gl_PositionIn[2] - gl_PositionIn[0] ).xyz;
    V0 = gl_PositionIn[0].xyz;

    N01 = ( vNormal[1] - vNormal[0] );
    N02 = ( vNormal[2] - vNormal[0] );
    N0 = vNormal[0];

    int layers = 1 << uLevel;

    float dt = 1. / float( layers );
    float t_top = 1.;
    for( int intgr = 0; intgr < layers; intgr++ )
    {
        float t_bot = t_top - dt;
        float smax_top = 1. - t_top;
        float smax_bot = 1. - t_bot;

        int nums = intgr + 1;
        float sprime_top = smax_top / float( nums - 1 );
        float sprime_bot = smax_bot / float( nums );
        float s_top = 0.;
        float s_bot = 0.;

        for( int j = 0; j < nums; j++ )
        {
            RenderQuantizedVertexWithLighting( s_bot, t_bot );
            RenderQuantizedVertexWithLighting( s_top, t_top );
            s_top += sprime_top;
            s_bot += sprime_bot;
        }

        RenderQuantizedVertexWithLighting( s_bot, t_bot );
        EndPrimitive( );

        t_top = t_bot;
        t_bot -= dt;
    }
}

