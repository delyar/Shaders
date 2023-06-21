#version 330 compatibility

in vec2 vST;
in vec3 vMCposition;
in float vLightIntensity;
in vec3 vMC;
in vec3 Eye;
in vec3 Norm;

in vec3 Light0;
in vec3 Light1;
in vec3 Light2;
uniform float uK;
uniform float uP;
uniform vec3 uColor;
uniform float uKa;
uniform float uKd;
uniform float uKs;
uniform float uShininess;
uniform float Timer;
uniform vec4 uSpecularColor;

void main()
{

    // per-fragment lighing
    vec3 ambient = uKa * uColor.rgb;
    float d = 0.;
    float s = 0.;

    vec3 Normal = gl_NormalMatrix * Norm;

    if( dot(Normal,Light0) > 0. ) // only do specular if the light can see the point
    {                                                                                                                                                                                                                                                                                                                                                
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light0) - Light0 );
        s = pow( max( dot(normalize(Eye),ref), 0. ), uShininess );
    }

	 if( dot(Normal,Light1) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light1) - Light1 );
        s = pow( max( dot(normalize(Eye),ref), 0. ), uShininess );
    }

 if( dot(Normal,Light2) > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( 2. * Normal * dot(Normal,Light2) - Light2 );
        s = pow( max( dot(normalize(Eye),ref), 0. ), uShininess );
    }


    vec3 specular = uKs * s * uSpecularColor.rgb;


    vec3 diffuse = uKd * dot(Normal,Light0+Light1+Light2) * uColor.rgb*Timer;
    gl_FragColor = vec4(ambient + diffuse + specular,1.0);
    gl_FragColor.a = 1.0;
}