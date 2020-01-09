// Credit for matrix values: https://ixora.io/projects/colorblindness/color-blindness-simulation-research/

class Voidcolor {
  constructor() {
    // ** Conversions to different color codings * /
    this.lmsFiltered =    [[0.31399022, 0.63951294, 0.04649755],
            		          [0.15537241, 0.75789446, 0.08670142],
            		          [0.01775239, 0.10944209, 0.87256922]];
    this.rgbFiltered =    [[ 5.47221206, -4.6419601,   0.16963708],
                          [-1.1252419,   2.29317094, -0.1678952],
                          [ 0.02980165, -0.19318073,  1.16364789]];

    // ** Static filters * /
    this.protanopia =    [[0, 1.05118294, -0.05116099],
                          [0, 1,           0],
                          [0, 0,           1]];
    this.deuteranopia =  [[1,         0, 0],
                          [0.9513092, 0, 0.04866992],
                          [0,         0, 1]];
    this.tritanopia =    [[ 1,          0,          0],
       					          [ 0,          1,          0],
                          [-0.86744736, 1.86727089, 0]];
  }

  // ** Static filters * /

  protanopiaFilter(r, g, b) {
  	return this.transform({r, g, b}, this.protanopia);
  }

  deuteranopiaFilter(r, g, b) {
    return this.transform({r, g, b}, this.deuteranopia);
  }

  tritanopiaFilter(columnVector) {
    return this.transform({r, g, b}, this.tritanopia);
  }

  // ** Dynamic filters * /
  //
  // dynamic filters are defined each time they're called,
  // due to having better tested performance while being being async safe

  protanomalyFilter(r, g, b, ratio) {
    const protanomaly = [[1 - (1*ratio), 1.05118294 * ratio, -0.05116099 * ratio],
                         [0,             1,                   0],
                         [0,             0,                   1]];
    return this.transform({r, g, b}, filter);
  }

  deuteranomalyFilter(r, g, b, ratio) {
    const deuteranomaly = [[1,                 0,             0],
                           [0.9513092 * ratio, 1 - (1*ratio), 0.04866992 * ratio],
                           [0,                 0,             1]];
    return this.transform({r, g, b}, filter);
  }

  tritanomalyFilter(r, g, b, ratio) {
    const tritanomaly = [[ 1,                  0,                  0],
	                       [ 0,                  1,                  0],
                         [-0.86744736 * ratio, 1.86727089 * ratio, 1 - (1*ratio)]];
    return this.transform({r, g, b}, filter);
  }

  /**
   * Applies transformations to RGB values and returns new RGB color.
   * RGB is converted into LMS, filters are applied on LMS,
   * then LMS in converted back to RGB, which is final product.
   *
   * @param {object} color - color object with r, g, b parameters.
   * @param {array} filter - Transformation matrix.
   * @return {object} Transformed object containing new r, g, b parameters.
   */
  transform(color, filter) {
    let vector = this.toColumnVector(color);
    let rgb = this.standardToLinearRGB(vector);
    let lms = this.dot(this.lmsFiltered, rgb);
    let lmsFiltered = this.dot(filter, lms);
    let rgbFiltered = this.dot(this.rgbFiltered, lmsFiltered);
    vector = this.linearToStandardRGB(rgbFiltered);
    return { r: vector[0][0], g: vector[1][0], b: vector[2][0] }
  }

  /**
   * Produce a dot product of two matrices.
   *
   * @param {array} A - Two-dimensional array / matrix.
   * @param {array} B - Two-dimensional array / matrix.
   * @return {array} Dot product of two-dimensional arrays / matrices A and B.
   */
  dot(A, B) {
    const An = A.length, Am = A[0].length;
    const Bn = B.length, Bm = B[0].length;
    let matrix = new Array(Am);
    for(var r = 0; r < An; r++) {
      matrix[r] = new Array(Bm);
      for(var c = 0; c < Bm; c++) {
        matrix[r][c] = 0;
        for(var i = 0; i < Am; i++) {
            matrix[r][c] += A[r][i] * B[i][c];
        }
      }
    }
    return matrix;
  }

  /**
    * Transform RGB object to column vector
    *
    * @param {object} color - color object containing r, g, b properties
    * @return {array} - 1x3 column vector of r, g, b values
    */
  toColumnVector(color) {
  	return [[color.r], [color.g], [color.b]];
  }

  /**
   * Iterate over column vector and transform each value to linear RGB channel
   *
   * @param {array} columnVector - 1x3 column vector of standard RGB channels
   * @return {array} 1x3 column vector of linear RGB channels
   */
  standardToLinearRGB(columnVector) {
    if(!Array.isArray(columnVector)) throw new Error('expected array');
    if(columnVector.length != 3) throw new Error('expected 3 entries in column vector');
  	for(let i = 0; i < 3; i++) {
  		columnVector[i][0] = this.standardToLinearChannel(columnVector[i][0]);
  	}
  	return columnVector;
  }

  /**
   * Iterate over column vector and transform each value to standard RGB channel
   *
   * @param {array} columnVector - 1x3 column vector of linear RGB channels
   * @return {array} 1x3 column vector of standard RGB channels
   */
  linearToStandardRGB(columnVector) {
    if(!Array.isArray(columnVector)) throw new Error('expected array');
    if(columnVector.length != 3) throw new Error('expected 3 entries in column vector');
   	for(let i = 0; i < 3; i++) {
  		columnVector[i][0] = this.linearToStandardChannel(columnVector[i][0]);
  	}
  	return columnVector;
  }

  /**
   * Forward transformation
   * Transformation of non-linear standard RGB channel 0-255 to linear
   * RGB channel 0.0-1.0
   *
   * https://en.wikipedia.org/wiki/SRGB#Specification_of_the_transformation
   * @param {int} standard - a single sRGB channel, integer ranging 0-255
   * @return {float} linear representation of sRGB, float ranging 0.0-1.0
   */
  standardToLinearChannel(standard) {
    if(typeof standard === 'string' ||
       typeof standard === 'undefined') throw new Error('int expected');
    if(standard < 0 ||
       standard > 255) throw new Error('parameter much be within range [0 - 255]');
    standard = standard / 255;
    if(standard <= 0.04045) return standard / 12.92;
    else return Math.pow((standard + 0.055) / 1.055, 2.4);
  }

  /**
   * Reverse transformation
   * Transformation of linear RGB channel 0.0-1.0 to non-linear
   * standard RGB channel 0-255
   *
   * https://en.wikipedia.org/wiki/SRGB#Specification_of_the_transformation
   * @param {float} linear - linear representation of sRGB, float ranging 0.0-1.0
   * @return {int} a single sRGB channel, integer ranging 0-255
   */
  linearToStandardChannel(linear) {
    if(typeof linear === 'string' ||
       typeof linear === 'undefined') throw new Error('float expected');
    if(linear < 0 ||
       linear > 1) throw new Error('parameter much be within range [0.0 - 1.0]');
    let standard;
    if(linear <= 0.0031308) standard = linear * 12.92;
    else standard = 1.055 * Math.pow(linear, 1.0 / 2.4) - 0.055;
    return Math.round(standard * 255);
  }
}


module.id = 'voidcolor';
module.exports = new Voidcolor();
