#version 330 compatibility

in float gLightIntensity;

void main( )
{
    gl_FragColor = vec4(vec3(0.2118, 0.6549, 0.2784)*gLightIntensity,1);
}