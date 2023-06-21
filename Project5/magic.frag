#version 330 compatibility

uniform float uSc;
uniform float uTc;
uniform float uDs;
uniform float uDt;
uniform float uRad;
uniform float uMagFactor;
uniform float uSharpFactor;
uniform sampler2D uImageUnit;
uniform float uRotAngle;
uniform bool uUseCircle;
uniform bool uUseSobel;

in vec2	vST;

const vec4  WHITE = vec4( 1.,1.,1.,1. );


void
main( )
{
	//translate
	float top = uSc + uDs;
	float bottom = uSc - uDs;
	float right = uTc + uDt;
	float left = uTc - uDt;

	float s = vST.s;
	float t = vST.t;

	//get resolution
	ivec2 ires = textureSize( uImageUnit, 0 );
	float ResS = float( ires.s );
	float ResT = float( ires.t );

	//rgb
	vec3 rgb = texture2D( uImageUnit, vST ).rgb;

	//magnify
	s = (s-uSc) / uMagFactor;
	t = (t-uTc) / uMagFactor;

	//rotate
	float sPrime = s*cos(uRotAngle) - t*sin(uRotAngle);
	float tPrime = s*sin(uRotAngle) + t*cos(uRotAngle);

	//combine
	vec2 vSTPrime = vec2(sPrime, tPrime);
	vec3 irgb = texture2D( uImageUnit, vSTPrime ).rgb;


	vec3 target;

	if (uUseSobel) {
		//edge detection 
		const vec3 LUMCOEFFS = vec3( 0.2125,0.7154,0.0721 );
		vec2 stp0 = vec2(1./ResS, 0. );
		vec2 st0p = vec2(0. , 1./ResT);
		vec2 stpp = vec2(1./ResS, 1./ResT);
		vec2 stpm = vec2(1./ResS, -1./ResT);
		float i00 = dot( texture2D( uImageUnit, vST ).rgb , LUMCOEFFS );
		float im1m1 = dot( texture2D( uImageUnit, vST-stpp ).rgb, LUMCOEFFS );
		float ip1p1 = dot( texture2D( uImageUnit, vST+stpp ).rgb, LUMCOEFFS );
		float im1p1 = dot( texture2D( uImageUnit, vST-stpm ).rgb, LUMCOEFFS );
		float ip1m1 = dot( texture2D( uImageUnit, vST+stpm ).rgb, LUMCOEFFS );
		float im10 = dot( texture2D( uImageUnit, vST-stp0 ).rgb, LUMCOEFFS );
		float ip10 = dot( texture2D( uImageUnit, vST+stp0 ).rgb, LUMCOEFFS );
		float i0m1 = dot( texture2D( uImageUnit, vST-st0p ).rgb, LUMCOEFFS );
		float i0p1 = dot( texture2D( uImageUnit, vST+st0p ).rgb, LUMCOEFFS) ;
		float h = -1.*im1p1 - 2.*i0p1 - 1.*ip1p1 + 1.*im1m1 + 2.*i0m1 + 1.*ip1m1;
		float v = -1.*im1m1 - 2.*im10 - 1.*im1p1 + 1.*ip1m1 + 2.*ip10 + 1.*ip1p1;
		float mag = sqrt( h*h + v*v );
		vec3 sobel = vec3( mag,mag,mag );
		target = sobel;
	} else {
		//sharpening
		vec2 stp0 = vec2(1./ResS, 0. );
		vec2 st0p = vec2(0. , 1./ResT);
		vec2 stpp = vec2(1./ResS, 1./ResT);
		vec2 stpm = vec2(1./ResS, -1./ResT);
		vec3 i00 = texture2D( uImageUnit, vSTPrime ).rgb;
		vec3 im1m1 = texture2D( uImageUnit, vSTPrime-stpp ).rgb;
		vec3 ip1p1 = texture2D( uImageUnit, vSTPrime+stpp ).rgb;
		vec3 im1p1 = texture2D( uImageUnit, vSTPrime-stpm ).rgb;
		vec3 ip1m1 = texture2D( uImageUnit, vSTPrime+stpm ).rgb;
		vec3 im10 = texture2D( uImageUnit, vSTPrime-stp0 ).rgb;
		vec3 ip10 = texture2D( uImageUnit, vSTPrime+stp0 ).rgb;
		vec3 i0m1 = texture2D( uImageUnit, vSTPrime-st0p ).rgb;
		vec3 i0p1 = texture2D( uImageUnit, vSTPrime+st0p ).rgb;
		vec3 blur = vec3(0.,0.,0.);
		blur += 1.*(im1m1+ip1m1+ip1p1+im1p1);
		blur += 2.*(im10+ip10+i0m1+i0p1);
		blur += 4.*(i00);
		blur /= 16.0;
		target = blur;
	}

	if (uUseCircle) {
		
		if (pow(s-uSc, 2) + pow(t-uTc, 2) < pow(uRad, 2)) {
			//inside circle
			gl_FragColor = vec4( mix( target, irgb, uSharpFactor ), 1.0 );
		} else {
			//outside circle
			gl_FragColor = vec4(rgb, 1.0);
		}

	} else {

		if (s < top && s> bottom && t < right && t > left){
			//inside square
			gl_FragColor = vec4( mix( target, irgb, uSharpFactor ), 1.0 );

		} else {
			//outside square
			gl_FragColor = vec4(rgb, 1.0);
		}
	}

}