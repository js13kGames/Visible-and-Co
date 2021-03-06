/*
 * Copyright (c) 2010 Mozilla Corporation
 * Copyright (c) 2010 Vladimir Vukicevic
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * File: mjs
 *
 * Vector and Matrix math utilities for JavaScript, optimized for WebGL.
 */

/*
 * Constant: MJS_VERSION
 * 
 * mjs version number aa.bb.cc, encoded as an integer of the form:
 * 0xaabbcc.
 */
/** @const */ var MJS_VERSION = 0x000000;

/*
 * Constant: MJS_DO_ASSERT
 * 
 * Enables or disables runtime assertions.
 * 
 * For potentially more performance, the assert methods can be
 * commented out in each place where they are called.
 */
/** @const */ var MJS_DO_ASSERT = false;

/*
 * Constant: MJS_FLOAT_ARRAY_TYPE
 *
 * The base float array type.  By default, WebGLFloatArray.
 * 
 * mjs can work with any array-like elements, but if an array
 * creation is requested, it will create an array of the type
 * MJS_FLOAT_ARRAY_TYPE.  Also, the builtin constants such as (M4x4.I)
 * will be of this type.
 */
// Some hacks for running in both the shell and browser,
// and for supporting F32 and WebGLFloat arrays
/** @const */ var MJS_FLOAT_ARRAY_TYPE = (function() {
    var type = Array;
    try { type = WebGLFloatArray; } catch (e) { }
    try { type = Float32Array; } catch (e) { }
    return type;
})();

if (MJS_DO_ASSERT) {
function MathUtils_assert(cond, msg) {
    if (!cond)
        throw "Assertion failed: " + msg;
}
} else {
function MathUtils_assert() { }
}

/*
 * Class: V3
 *
 * Methods for working with 3-element vectors.  A vector is represented by a 3-element array.
 * Any valid JavaScript array type may be used, but if new
 * vectors are created they are created using the configured MJS_FLOAT_ARRAY_TYPE.
 */

var V3 = { };

V3._temp1 = new MJS_FLOAT_ARRAY_TYPE(3);
V3._temp2 = new MJS_FLOAT_ARRAY_TYPE(3);
V3._temp3 = new MJS_FLOAT_ARRAY_TYPE(3);

if (MJS_FLOAT_ARRAY_TYPE == Array) {
    V3.x = [1.0, 0.0, 0.0];
    V3.y = [0.0, 1.0, 0.0];
    V3.z = [0.0, 0.0, 1.0];

    V3.$ = function V3_$(x, y, z) {
        return [x, y, z];
    };

    V3.clone = function V3_clone(a) {
        //MathUtils_assert(a.length == 3, "a.length == 3");
        return [a[0], a[1], a[2]];
    };
} else {
    V3.x = new MJS_FLOAT_ARRAY_TYPE([1.0, 0.0, 0.0]);
    V3.y = new MJS_FLOAT_ARRAY_TYPE([0.0, 1.0, 0.0]);
    V3.z = new MJS_FLOAT_ARRAY_TYPE([0.0, 0.0, 1.0]);

/*
 * Function: V3.$
 *
 * Creates a new 3-element vector with the given values.
 *
 * Parameters:
 *
 *   x,y,z - the 3 elements of the new vector.
 *
 * Returns:
 *
 * A new vector containing with the given argument values.
 */

    V3.$ = function V3_$(x, y, z) {
        return new MJS_FLOAT_ARRAY_TYPE([x, y, z]);
    };

/*
 * Function: V3.clone
 *
 * Clone the given 3-element vector.
 *
 * Parameters:
 *
 *   a - the 3-element vector to clone
 *
 * Returns:
 *
 * A new vector with the same values as the passed-in one.
 */

    V3.clone = function V3_clone(a) {
        //MathUtils_assert(a.length == 3, "a.length == 3");
        return new MJS_FLOAT_ARRAY_TYPE(a);
    };
}

V3.u = V3.x;
V3.v = V3.y;

/*
 * Function: V3.add
 *
 * Perform r = a + b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.add = function V3_add(a, b, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(b.length == 3, "b.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[0] + b[0];
    r[1] = a[1] + b[1];
    r[2] = a[2] + b[2];
    return r;
};

/*
 * Function: V3.sub
 *
 * Perform
 * r = a - b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.sub = function V3_sub(a, b, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(b.length == 3, "b.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[0] - b[0];
    r[1] = a[1] - b[1];
    r[2] = a[2] - b[2];
    return r;
};

/*
 * Function: V3.neg
 *
 * Perform
 * r = - a.
 *
 * Parameters:
 *
 *   a - the vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.neg = function V3_neg(a, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = - a[0];
    r[1] = - a[1];
    r[2] = - a[2];
    return r;
};

/*
 * Function: V3.direction
 *
 * Perform
 * r = (a - b) / |a - b|.  The result is the normalized
 * direction from a to b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.direction = function V3_direction(a, b, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(b.length == 3, "b.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    return V3.normalize(V3.sub(a, b, r), r);
};

/*
 * Function: V3.length
 *
 * Perform r = |a|.
 *
 * Parameters:
 *
 *   a - the vector operand
 *
 * Returns:
 *
 *   The length of the given vector.
 */
V3.length = function V3_length(a) {
    //MathUtils_assert(a.length == 3, "a.length == 3");

    return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]);
};

/*
 * Function: V3.lengthSquard
 *
 * Perform r = |a|*|a|.
 *
 * Parameters:
 *
 *   a - the vector operand
 *
 * Returns:
 *
 *   The square of the length of the given vector.
 */
V3.lengthSquared = function V3_lengthSquared(a) {
    //MathUtils_assert(a.length == 3, "a.length == 3");

    return a[0]*a[0] + a[1]*a[1] + a[2]*a[2];
};

/*
 * Function: V3.normalize
 *
 * Perform r = a / |a|.
 *
 * Parameters:
 *
 *   a - the vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.normalize = function V3_normalize(a, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    var im = 1.0 / V3.length(a);
    r[0] = a[0] * im;
    r[1] = a[1] * im;
    r[2] = a[2] * im;
    return r;
};

/*
 * Function: V3.scale
 *
 * Perform r = a * k.
 *
 * Parameters:
 *
 *   a - the vector operand
 *   k - a scalar value
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.scale = function V3_scale(a, k, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[0] * k;
    r[1] = a[1] * k;
    r[2] = a[2] * k;
    return r;
}

/*
 * Function: V3.dot
 *
 * Perform
 * r = dot(a, b).
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *
 * Returns:
 *
 *   The dot product of a and b.
 */
V3.dot = function V3_dot(a, b) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(b.length == 3, "b.length == 3");

    return a[0] * b[0] +
        a[1] * b[1] +
        a[2] * b[2];
};

/*
 * Function: V3.cross
 *
 * Perform r = a x b.
 *
 * Parameters:
 *
 *   a - the first vector operand
 *   b - the second vector operand
 *   r - optional vector to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3-element vector with the result.
 */
V3.cross = function V3_cross(a, b, r) {
    //MathUtils_assert(a.length == 3, "a.length == 3");
    //MathUtils_assert(b.length == 3, "b.length == 3");
    //MathUtils_assert(r == undefined || r.length == 3, "r == undefined || r.length == 3");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(3);
    r[0] = a[1]*b[2] - a[2]*b[1];
    r[1] = a[2]*b[0] - a[0]*b[2];
    r[2] = a[0]*b[1] - a[1]*b[0];
    return r;
};

/*
 * Class: M4x4
 *
 * Methods for working with 4x4 matrices.  A matrix is represented by a 16-element array
 * in column-major order.  Any valid JavaScript array type may be used, but if new
 * matrices are created they are created using the configured MJS_FLOAT_ARRAY_TYPE.
 */

var M4x4 = { };

M4x4._temp1 = new MJS_FLOAT_ARRAY_TYPE(16);
M4x4._temp2 = new MJS_FLOAT_ARRAY_TYPE(16);

if (MJS_FLOAT_ARRAY_TYPE == Array) {
    M4x4.I = [1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              0.0, 0.0, 0.0, 1.0];

    M4x4.$ = function M4x4_$(m00, m01, m02, m03,
                             m04, m05, m06, m07,
                             m08, m09, m10, m11,
                             m12, m13, m14, m15)
    {
        return [m00, m01, m02, m03,
                m04, m05, m06, m07,
                m08, m09, m10, m11,
                m12, m13, m14, m15];
    };

    M4x4.clone = function M4x4_clone(m) {
        //MathUtils_assert(m.length == 16, "m.length == 16");
        return [m[0],  m[1],  m[2],  m[3],
                m[4],  m[5],  m[6],  m[7],
                m[8],  m[9],  m[10], m[11],
                m[12], m[13], m[14], m[15]];
    };
} else {
    M4x4.I = new MJS_FLOAT_ARRAY_TYPE([1.0, 0.0, 0.0, 0.0,
                                   0.0, 1.0, 0.0, 0.0,
                                   0.0, 0.0, 1.0, 0.0,
                                   0.0, 0.0, 0.0, 1.0]);

/*
 * Function: M4x4.$
 *
 * Creates a new 4x4 matrix with the given values.
 *
 * Parameters:
 *
 *   m00..m15 - the 16 elements of the new matrix.
 *
 * Returns:
 *
 * A new matrix filled with the given argument values.
 */
    M4x4.$ = function M4x4_$(m00, m01, m02, m03,
                             m04, m05, m06, m07,
                             m08, m09, m10, m11,
                             m12, m13, m14, m15)
    {
        return new MJS_FLOAT_ARRAY_TYPE([m00, m01, m02, m03,
                                         m04, m05, m06, m07,
                                         m08, m09, m10, m11,
                                         m12, m13, m14, m15]);
    };

/*
 * Function: M4x4.clone
 *
 * Clone the given 4x4 matrix.
 *
 * Parameters:
 *
 *   m - the 4x4 matrix to clone
 *
 * Returns:
 *
 * A new matrix with the same values as the passed-in one.
 */
    M4x4.clone = function M4x4_clone(m) {
        //MathUtils_assert(m.length == 16, "m.length == 16");
        return new MJS_FLOAT_ARRAY_TYPE(m);
    };
}

M4x4.identity = M4x4.I;

/*
 * Function: M4x4.topLeft3x3
 *
 * Return the top left 3x3 matrix from the given 4x4 matrix m.
 *
 * Parameters:
 *
 *   m - the matrix
 *   r - optional 3x3 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3x3 matrix with the result.
 */
M4x4.topLeft3x3 = function M4x4_topLeft3x3(m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 9, "r == undefined || r.length == 9");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(9);
    r[0] = m[0]; r[1] = m[1]; r[2] = m[2];
    r[3] = m[4]; r[4] = m[5]; r[5] = m[6];
    r[6] = m[8]; r[7] = m[9]; r[8] = m[10];
    return r;
};

/*
 * Function: M4x4.inverseOrthonormal
 *
 * Computes the inverse of the given matrix m, assuming that
 * the matrix is orthonormal.
 *
 * Parameters:
 *
 *   m - the matrix
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.inverseOrthonormal = function M4x4_inverseOrthonormal(m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");
    //MathUtils_assert(m != r, "m != r");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    M4x4.transpose(m, r);
    var t = [m[12], m[13], m[14]];
    r[3] = r[7] = r[11] = 0;
    r[12] = -V3.dot([r[0], r[4], r[8]], t);
    r[13] = -V3.dot([r[1], r[5], r[9]], t);
    r[14] = -V3.dot([r[2], r[6], r[10]], t);
    return r;
}

/*
 * Function: M4x4.inverseTo3x3
 *
 * Computes the inverse of the given matrix m, but calculates
 * only the top left 3x3 values of the result.
 *
 * Parameters:
 *
 *   m - the matrix
 *   r - optional 3x3 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 3x3 matrix with the result.
 */
M4x4.inverseTo3x3 = function M4x4_inverseTo3x3(m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 9, "r == undefined || r.length == 9");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(9);

    var a11 = m[10]*m[5]-m[6]*m[9],
        a21 = -m[10]*m[1]+m[2]*m[9],
        a31 = m[6]*m[1]-m[2]*m[5],
        a12 = -m[10]*m[4]+m[6]*m[8],
        a22 = m[10]*m[0]-m[2]*m[8],
        a32 = -m[6]*m[0]+m[2]*m[4],
        a13 = m[9]*m[4]-m[5]*m[8],
        a23 = -m[9]*m[0]+m[1]*m[8],
        a33 = m[5]*m[0]-m[1]*m[4];
    var det = m[0]*(a11) + m[1]*(a12) + m[2]*(a13);
    if (det == 0) // no inverse
        throw "matrix not invertible";
    var idet = 1.0 / det;

    r[0] = idet*a11;
    r[1] = idet*a21;
    r[2] = idet*a31;
    r[3] = idet*a12;
    r[4] = idet*a22;
    r[5] = idet*a32;
    r[6] = idet*a13;
    r[7] = idet*a23;
    r[8] = idet*a33;

    return r;
};

/*
 * Function: M4x4.makeFrustum
 *
 * Creates a matrix for a projection frustum with the given parameters.
 *
 * Parameters:
 *
 *   left - the left coordinate of the frustum
 *   right- the right coordinate of the frustum
 *   bottom - the bottom coordinate of the frustum
 *   top - the top coordinate of the frustum
 *   znear - the near z distance of the frustum
 *   zfar - the far z distance of the frustum
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makeFrustum = function M4x4_makeFrustum(left, right, bottom, top, znear, zfar, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var X = 2*znear/(right-left);
    var Y = 2*znear/(top-bottom);
    var A = (right+left)/(right-left);
    var B = (top+bottom)/(top-bottom);
    var C = -(zfar+znear)/(zfar-znear);
    var D = -2*zfar*znear/(zfar-znear);

    r[0] = 2*znear/(right-left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2*znear/(top-bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = (right+left)/(right-left);
    r[9] = (top+bottom)/(top-bottom);
    r[10] = -(zfar+znear)/(zfar-znear);
    r[11] = -1;
    r[12] = 0;
    r[13] = 0;
    r[14] = -2*zfar*znear/(zfar-znear);
    r[15] = 0;

    return r;
};

/*
 * Function: M4x4.makePerspective
 *
 * Creates a matrix for a perspective projection with the given parameters.
 *
 * Parameters:
 *
 *   fovy - field of view in the y axis, in degrees
 *   aspect - aspect ratio
 *   znear - the near z distance of the projection
 *   zfar - the far z distance of the projection
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makePerspective = function M4x4_makePerspective (fovy, aspect, znear, zfar, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    var ymax = znear * Math.tan(fovy * Math.PI / 360.0);
    var ymin = -ymax;
    var xmin = ymin * aspect;
    var xmax = ymax * aspect;

    return M4x4.makeFrustum(xmin, xmax, ymin, ymax, znear, zfar, r);
};

/*
 * Function: M4x4.makeOrtho
 *
 * Creates a matrix for an orthogonal frustum projection with the given parameters.
 *
 * Parameters:
 *
 *   left - the left coordinate of the frustum
 *   right- the right coordinate of the frustum
 *   bottom - the bottom coordinate of the frustum
 *   top - the top coordinate of the frustum
 *   znear - the near z distance of the frustum
 *   zfar - the far z distance of the frustum
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makeOrtho = function M4x4_makeOrtho (left, right, bottom, top, znear, zfar, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var tX = -(right+left)/(right-left);
    var tY = -(top+bottom)/(top-bottom);
    var tZ = -(zfar+znear)/(zfar-znear);
    var X = 2 / (right-left);
    var Y = 2 / (top-bottom);
    var Z = -2 / (zfar-znear);

    r[0] = 2 / (right-left);
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 2 / (top-bottom);
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = -2 / (zfar-znear);
    r[11] = 0;
    r[12] = -(right+left)/(right-left);
    r[13] = -(top+bottom)/(top-bottom);
    r[14] = -(zfar+znear)/(zfar-znear);
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.makeOrtho
 *
 * Creates a matrix for a 2D orthogonal frustum projection with the given parameters.
 * znear and zfar are assumed to be -1 and 1, respectively.
 *
 * Parameters:
 *
 *   left - the left coordinate of the frustum
 *   right- the right coordinate of the frustum
 *   bottom - the bottom coordinate of the frustum
 *   top - the top coordinate of the frustum
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the projection matrix.
 *   Otherwise, returns a new 4x4 matrix.
 */
M4x4.makeOrtho2D = function M4x4_makeOrtho2D (left, right, bottom, top, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeOrtho(left, right, bottom, top, -1, 1, r);
};

/*
 * Function: M4x4.mul
 *
 * Performs r = a * b.
 *
 * Parameters:
 *
 *   a - the first matrix operand
 *   b - the second matrix operand
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */

M4x4.mul = function M4x4_mul(a, b, r) {
    //MathUtils_assert(a.length == 16, "a.length == 16");
    //MathUtils_assert(b.length == 16, "b.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r === undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    var a4 = a[4], a5 = a[5], a6 = a[6], a7 = a[7];
    var a8 = a[8], a9 = a[9], a10 = a[10], a11 = a[11];
    var a12 = a[12], a13 = a[13], a14 = a[14], a15 = a[15];
    var b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    var b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7];
    var b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11];
    var b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

    r[0] = b0 * a0 + b1 * a4 + b2 * a8 + b3 * a12;
    r[1] = b0 * a1 + b1 * a5 + b2 * a9 + b3 * a13;
    r[2] = b0 * a2 + b1 * a6 + b2 * a10 + b3 * a14;
    r[3] = b0 * a3 + b1 * a7 + b2 * a11 + b3 * a15;
    r[4] = b4 * a0 + b5 * a4 + b6 * a8 + b7 * a12;
    r[5] = b4 * a1 + b5 * a5 + b6 * a9 + b7 * a13;
    r[6] = b4 * a2 + b5 * a6 + b6 * a10 + b7 * a14;
    r[7] = b4 * a3 + b5 * a7 + b6 * a11 + b7 * a15;
    r[8] = b8 * a0 + b9 * a4 + b10 * a8 + b11 * a12;
    r[9] = b8 * a1 + b9 * a5 + b10 * a9 + b11 * a13;
    r[10] = b8 * a2 + b9 * a6 + b10 * a10 + b11 * a14;
    r[11] = b8 * a3 + b9 * a7 + b10 * a11 + b1 * a15;
    r[12] = b12 * a0 + b13 * a4 + b14 * a8 + b15 * a12;
    r[13] = b12 * a1 + b13 * a5 + b14 * a9 + b15 * a13;
    r[14] = b12 * a2 + b13 * a6 + b14 * a10 + b15 * a14;
    r[15] = b12 * a3 + b13 * a7 + b14 * a11 + b15 * a15;
    return r;
};

/*
 * Function: M4x4.makeRotate
 *
 * Creates a transformation matrix for rotation by angle radians about the 3-element vector axis.
 *
 * Parameters:
 *
 *   angle - the angle of rotation, in radians
 *   axis - the axis around which the rotation is performed, a 3-element vector
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeRotate = function M4x4_makeRotate(angle, axis, r) {
    //MathUtils_assert(angle.length == 3, "angle.length == 3");
    //MathUtils_assert(axis.length == 3, "axis.length == 3");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    axis = V3.normalize(axis, V3._temp1);
    var x = axis[0], y = axis[1], z = axis[2];
    var c = Math.cos(angle);
    var c1 = 1-c;
    var s = Math.sin(angle);

    r[0] = x*x*c1+c;
    r[1] = y*x*c1+z*s;
    r[2] = z*x*c1-y*s;
    r[3] = 0;
    r[4] = x*y*c1-z*s;
    r[5] = y*y*c1+c;
    r[6] = y*z*c1+x*s;
    r[7] = 0;
    r[8] = x*z*c1+y*s;
    r[9] = y*z*c1-x*s;
    r[10] = z*z*c1+c;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.rotate
 *
 * Concatenates a rotation of angle radians about the axis to the give matrix m.
 *
 * Parameters:
 *
 *   angle - the angle of rotation, in radians
 *   axis - the axis around which the rotation is performed, a 3-element vector
 *   m - the matrix to concatenate the rotation to
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after performing the operation.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.rotate = function M4x4_rotate(angle, axis, m, r) {
    //MathUtils_assert(angle.length == 3, "angle.length == 3");
    //MathUtils_assert(axis.length == 3, "axis.length == 3");
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var im = 1.0 / V3.length(axis);
    // Note that multiplying by the reciprocal is not as accurate as dividing (extra rounding).
    var x = axis[0] * im, y = axis[1] * im, z = axis[2] * im;
    var c = Math.cos(angle);
    var c1 = 1-c;
    var s = Math.sin(angle);
    var xs = x*s;
    var ys = y*s;
    var zs = z*s;
    var xyc1 = x * y * c1;
    var xzc1 = x * z * c1;
    var yzc1 = y * z * c1;

    var t11 = x * x * c1 + c;
    var t21 = xyc1 + zs;
    var t31 = xzc1 - ys;
    var t12 = xyc1 - zs;
    var t22 = y * y * c1 + c;
    var t32 = yzc1 + xs;
    var t13 = xzc1 + ys;
    var t23 = yzc1 - xs;
    var t33 = z * z * c1 + c;

    var m11 = m[0], m21 = m[1], m31 = m[2], m41 = m[3];
    var m12 = m[4], m22 = m[5], m32 = m[6], m42 = m[7];
    var m13 = m[8], m23 = m[9], m33 = m[10], m43 = m[11];
    var m14 = m[12], m24 = m[13], m34 = m[14], m44 = m[15];

    r[0] = m11 * t11 + m12 * t21 + m13 * t31;
    r[1] = m21 * t11 + m22 * t21 + m23 * t31;
    r[2] = m31 * t11 + m32 * t21 + m33 * t31;
    r[3] = m41 * t11 + m42 * t21 + m43 * t31;
    r[4] = m11 * t12 + m12 * t22 + m13 * t32;
    r[5] = m21 * t12 + m22 * t22 + m23 * t32;
    r[6] = m31 * t12 + m32 * t22 + m33 * t32;
    r[7] = m41 * t12 + m42 * t22 + m43 * t32;
    r[8] = m11 * t13 + m12 * t23 + m13 * t33;
    r[9] = m21 * t13 + m22 * t23 + m23 * t33;
    r[10] = m31 * t13 + m32 * t23 + m33 * t33;
    r[11] = m41 * t13 + m42 * t23 + m43 * t33;
    r[12] = m14,
    r[13] = m24;
    r[14] = m34;
    r[15] = m44;

    return r;
};

/*
 * Function: M4x4.makeScale3
 *
 * Creates a transformation matrix for scaling by 3 scalar values, one for
 * each of the x, y, and z directions.
 *
 * Parameters:
 *
 *   x - the scale for the x axis
 *   y - the scale for the y axis
 *   z - the scale for the z axis
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeScale3 = function M4x4_makeScale3(x, y, z, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = x;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = y;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = z;
    r[11] = 0;
    r[12] = 0;
    r[13] = 0;
    r[14] = 0;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.makeScale1
 *
 * Creates a transformation matrix for a uniform scale by a single scalar value.
 *
 * Parameters:
 *
 *   k - the scale factor
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeScale1 = function M4x4_makeScale1(k, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeScale3(k, k, k, r);
};

/*
 * Function: M4x4.makeScale
 *
 * Creates a transformation matrix for scaling each of the x, y, and z axes by the amount
 * given in the corresponding element of the 3-element vector.
 *
 * Parameters:
 *
 *   v - the 3-element vector containing the scale factors
 *   r - optional 4x4 matrix to store the result in
 *
 * Returns:
 *
 *   If r is specified, returns r after creating the matrix.
 *   Otherwise, returns a new 4x4 matrix with the result.
 */
M4x4.makeScale = function M4x4_makeScale(v, r) {
    //MathUtils_assert(v.length == 3, "v.length == 3");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeScale3(v[0], v[1], v[2], r);
};

/*
 * Function: M4x4.scale3
 */
M4x4.scale3 = function M4x4_scale3(x, y, z, m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
};

/*
 * Function: M4x4.scale1
 */
M4x4.scale1 = function M4x4_scale1(k, m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = m[0] * k;
    r[1] = m[1] * k;
    r[2] = m[2] * k;
    r[3] = m[3] * k;
    r[4] = m[4] * k;
    r[5] = m[5] * k;
    r[6] = m[6] * k;
    r[7] = m[7] * k;
    r[8] = m[8] * k;
    r[9] = m[9] * k;
    r[10] = m[10] * k;
    r[11] = m[11] * k;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
};

/*
 * Function: M4x4.scale1
 */
M4x4.scale = function M4x4_scale(v, m, r) {
    //MathUtils_assert(v.length == 3, "v.length == 3");
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    var x = v[0], y = v[1], z = v[2];

    r[0] = m[0] * x;
    r[1] = m[1] * x;
    r[2] = m[2] * x;
    r[3] = m[3] * x;
    r[4] = m[4] * y;
    r[5] = m[5] * y;
    r[6] = m[6] * y;
    r[7] = m[7] * y;
    r[8] = m[8] * z;
    r[9] = m[9] * z;
    r[10] = m[10] * z;
    r[11] = m[11] * z;
    r[12] = m[12];
    r[13] = m[13];
    r[14] = m[14];
    r[15] = m[15];

    return r;
};

/*
 * Function: M4x4.makeTranslate3
 */
M4x4.makeTranslate3 = function M4x4_makeTranslate3(x, y, z, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = 1;
    r[1] = 0;
    r[2] = 0;
    r[3] = 0;
    r[4] = 0;
    r[5] = 1;
    r[6] = 0;
    r[7] = 0;
    r[8] = 0;
    r[9] = 0;
    r[10] = 1;
    r[11] = 0;
    r[12] = x;
    r[13] = y;
    r[14] = z;
    r[15] = 1;

    return r;
};

/*
 * Function: M4x4.makeTranslate1
 */
M4x4.makeTranslate1 = function M4x4_makeTranslate1 (k, r) {
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeTranslate3(k, k, k, r);
};

/*
 * Function: M4x4.makeTranslate
 */
M4x4.makeTranslate = function M4x4_makeTranslate (v, r) {
    //MathUtils_assert(v.length == 3, "v.length == 3");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.makeTranslate3(v[0], v[1], v[2], r);
};

/*
 * Function: M4x4.translate3
 */
M4x4.translate3 = function M4x4_translate3 (x, y, z, m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    /* It's not clear that copying the whole m matrix into locals here is a win.
       Computing r[12] through r[15] first, directly from m, and then assigning
       r[0] through r[11] directly from m *if* r !== m, might be faster. */

    var m11 = m[0], m21 = m[1], m31 = m[2], m41 = m[3];
    var m12 = m[4], m22 = m[5], m32 = m[6], m42 = m[7];
    var m13 = m[8], m23 = m[9], m33 = m[10], m43 = m[11];
    var m14 = m[12], m24 = m[13], m34 = m[14], m44 = m[15];

    r[0] = m11;
    r[1] = m21;
    r[2] = m31;
    r[3] = m41;
    r[4] = m12;
    r[5] = m22;
    r[6] = m32;
    r[7] = m42;
    r[8] = m13;
    r[9] = m23;
    r[10] = m33;
    r[11] = m43;
    r[12] = m11 * x + m12 * y + m13 * z + m14;
    r[13] = m21 * x + m22 * y + m23 * z + m24;
    r[14] = m31 * x + m32 * y + m33 * z + m34;
    r[15] = m41 * x + m42 * y + m43 * z + m44;

    return r;
};

/*
 * Function: M4x4.translate1
 */
M4x4.translate1 = function M4x4_translate1 (k, m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return M4x4.translate3(k, k, k, m, r);
};

/*
 * Function: M4x4.translate
 */
M4x4.translate = function M4x4_translate (v, m, r) {
    //MathUtils_assert(v.length == 3, "v.length == 3");
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    return  M4x4.translate3(v[0], v[1], v[2], m, r);
};

/*
 * Function: M4x4.makeLookAt
 */
M4x4.makeLookAt = function M4x4_makeLookAt (eye, center, up, r) {
    //MathUtils_assert(eye.length == 3, "eye.length == 3");
    //MathUtils_assert(center.length == 3, "center.length == 3");
    //MathUtils_assert(up.length == 3, "up.length == 3");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    var z = V3.direction(eye, center, V3._temp1);
    var x = V3.normalize(V3.cross(up, z, V3._temp2), V3._temp2);
    var y = V3.normalize(V3.cross(z, x, V3._temp3), V3._temp3);

    var tm1 = M4x4._temp1;
    var tm2 = M4x4._temp2;

    tm1[0] = x[0];
    tm1[1] = y[0];
    tm1[2] = z[0];
    tm1[3] = 0;
    tm1[4] = x[1];
    tm1[5] = y[1];
    tm1[6] = z[1];
    tm1[7] = 0;
    tm1[8] = x[2];
    tm1[9] = y[2];
    tm1[10] = z[2];
    tm1[11] = 0;
    tm1[12] = 0;
    tm1[13] = 0;
    tm1[14] = 0;
    tm1[15] = 1;

    tm2[0] = 1; tm2[1] = 0; tm2[2] = 0; tm2[3] = 0;
    tm2[4] = 0; tm2[5] = 1; tm2[6] = 0; tm2[7] = 0;
    tm2[8] = 0; tm2[9] = 0; tm2[10] = 1; tm2[11] = 0;
    tm2[12] = -eye[0]; tm2[13] = -eye[1]; tm2[14] = -eye[2]; tm2[15] = 1;

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);
    return M4x4.mul(tm1, tm2, r);
};

/*
 * Function: M4x4.transpose
 */
M4x4.transpose = function M4x4_transpose (m, r) {
    //MathUtils_assert(m.length == 16, "m.length == 16");
    //MathUtils_assert(r == undefined || r.length == 16, "r == undefined || r.length == 16");

    if (m == r) {
        var tmp = 0.0;
        tmp = m[1]; m[1] = m[4]; m[4] = tmp;
        tmp = m[2]; m[2] = m[8]; m[8] = tmp;
        tmp = m[3]; m[3] = m[12]; m[12] = tmp;
        tmp = m[6]; m[6] = m[9]; m[9] = tmp;
        tmp = m[7]; m[7] = m[13]; m[13] = tmp;
        tmp = m[11]; m[11] = m[14]; m[14] = tmp;
        return m;
    }

    if (r == undefined)
        r = new MJS_FLOAT_ARRAY_TYPE(16);

    r[0] = m[0]; r[1] = m[4]; r[2] = m[8]; r[3] = m[12];
    r[4] = m[1]; r[5] = m[5]; r[6] = m[9]; r[7] = m[13];
    r[8] = m[2]; r[9] = m[6]; r[10] = m[10]; r[11] = m[14];
    r[12] = m[3]; r[13] = m[7]; r[14] = m[11]; r[15] = m[15];

    return r;
};

M4x4.multV = function M4x4_multV( m, v ) {
    if ( v.length == 3 ) {
        return [
            v[0]*m[0] + v[1]*m[4] + v[2]*m[8],
            v[0]*m[1] + v[1]*m[5] + v[2]*m[9],
            v[0]*m[2] + v[1]*m[6] + v[2]*m[10],
            ];
    } else {
        return [
            v[0]*m[0] + v[1]*m[4] + v[2]*m[8] + v[3]*m[12],
            v[0]*m[1] + v[1]*m[5] + v[2]*m[9] + v[3]*m[13],
            v[0]*m[2] + v[1]*m[6] + v[2]*m[10] + v[3]*m[14],
            v[0]*m[3] + v[1]*m[7] + v[2]*m[11] + v[3]*m[15],
            ];
    }
}

M4x4.flip = function M4x4_flip( m ) {
    return [
        m[0], m[4], [8], m[12],
        m[1], m[5], [9], m[13],
        m[2], m[6], [10], m[14],
        m[3], m[7], [11], m[15]
        ];
}

function M3x3_mult( m, v ) {
    return [
        v[0]*m[0] + v[1]*m[3] + v[2]*m[6],
        v[0]*m[1] + v[1]*m[4] + v[2]*m[7],
        v[0]*m[2] + v[1]*m[5] + v[2]*m[8],
    ];
}

M4x4.inverse = function M4x4_inverse( m ) {
    var inv = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var i = 0;

    inv[0] = m[5]  * m[10] * m[15] - 
             m[5]  * m[11] * m[14] - 
             m[9]  * m[6]  * m[15] + 
             m[9]  * m[7]  * m[14] +
             m[13] * m[6]  * m[11] - 
             m[13] * m[7]  * m[10];

    inv[4] = -m[4]  * m[10] * m[15] + 
              m[4]  * m[11] * m[14] + 
              m[8]  * m[6]  * m[15] - 
              m[8]  * m[7]  * m[14] - 
              m[12] * m[6]  * m[11] + 
              m[12] * m[7]  * m[10];

    inv[8] = m[4]  * m[9] * m[15] - 
             m[4]  * m[11] * m[13] - 
             m[8]  * m[5] * m[15] + 
             m[8]  * m[7] * m[13] + 
             m[12] * m[5] * m[11] - 
             m[12] * m[7] * m[9];

    inv[12] = -m[4]  * m[9] * m[14] + 
               m[4]  * m[10] * m[13] +
               m[8]  * m[5] * m[14] - 
               m[8]  * m[6] * m[13] - 
               m[12] * m[5] * m[10] + 
               m[12] * m[6] * m[9];

    inv[1] = -m[1]  * m[10] * m[15] + 
              m[1]  * m[11] * m[14] + 
              m[9]  * m[2] * m[15] - 
              m[9]  * m[3] * m[14] - 
              m[13] * m[2] * m[11] + 
              m[13] * m[3] * m[10];

    inv[5] = m[0]  * m[10] * m[15] - 
             m[0]  * m[11] * m[14] - 
             m[8]  * m[2] * m[15] + 
             m[8]  * m[3] * m[14] + 
             m[12] * m[2] * m[11] - 
             m[12] * m[3] * m[10];

    inv[9] = -m[0]  * m[9] * m[15] + 
              m[0]  * m[11] * m[13] + 
              m[8]  * m[1] * m[15] - 
              m[8]  * m[3] * m[13] - 
              m[12] * m[1] * m[11] + 
              m[12] * m[3] * m[9];

    inv[13] = m[0]  * m[9] * m[14] - 
              m[0]  * m[10] * m[13] - 
              m[8]  * m[1] * m[14] + 
              m[8]  * m[2] * m[13] + 
              m[12] * m[1] * m[10] - 
              m[12] * m[2] * m[9];

    inv[2] = m[1]  * m[6] * m[15] - 
             m[1]  * m[7] * m[14] - 
             m[5]  * m[2] * m[15] + 
             m[5]  * m[3] * m[14] + 
             m[13] * m[2] * m[7] - 
             m[13] * m[3] * m[6];

    inv[6] = -m[0]  * m[6] * m[15] + 
              m[0]  * m[7] * m[14] + 
              m[4]  * m[2] * m[15] - 
              m[4]  * m[3] * m[14] - 
              m[12] * m[2] * m[7] + 
              m[12] * m[3] * m[6];

    inv[10] = m[0]  * m[5] * m[15] - 
              m[0]  * m[7] * m[13] - 
              m[4]  * m[1] * m[15] + 
              m[4]  * m[3] * m[13] + 
              m[12] * m[1] * m[7] - 
              m[12] * m[3] * m[5];

    inv[14] = -m[0]  * m[5] * m[14] + 
               m[0]  * m[6] * m[13] + 
               m[4]  * m[1] * m[14] - 
               m[4]  * m[2] * m[13] - 
               m[12] * m[1] * m[6] + 
               m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] + 
              m[1] * m[7] * m[10] + 
              m[5] * m[2] * m[11] - 
              m[5] * m[3] * m[10] - 
              m[9] * m[2] * m[7] + 
              m[9] * m[3] * m[6];

    inv[7] = m[0] * m[6] * m[11] - 
             m[0] * m[7] * m[10] - 
             m[4] * m[2] * m[11] + 
             m[4] * m[3] * m[10] + 
             m[8] * m[2] * m[7] - 
             m[8] * m[3] * m[6];

    inv[11] = -m[0] * m[5] * m[11] + 
               m[0] * m[7] * m[9] + 
               m[4] * m[1] * m[11] - 
               m[4] * m[3] * m[9] - 
               m[8] * m[1] * m[7] + 
               m[8] * m[3] * m[5];

    inv[15] = m[0] * m[5] * m[10] - 
              m[0] * m[6] * m[9] - 
              m[4] * m[1] * m[10] + 
              m[4] * m[2] * m[9] + 
              m[8] * m[1] * m[6] - 
              m[8] * m[2] * m[5];

    det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

    if (det == 0)
        return false;

    det = 1.0 / det;

    for (i = 0; i < 16; i++)
        inv[i] = inv[i] * det;
    return inv;
}
