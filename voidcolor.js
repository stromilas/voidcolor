// Credit for matrix values: https://ixora.io/projects/colorblindness/color-blindness-simulation-research/

class Voidcolor {
  constructor() {
    // ** Conversions to different color codings * /
    this.LMS =  [[0.31399022, 0.63951294, 0.04649755],
                 [0.15537241, 0.75789446, 0.08670142],
                 [0.01775239, 0.10944209, 0.87256922]];
    this.RGB =  [[ 5.47221206, -4.6419601,   0.16963708],
                 [-1.1252419,   2.29317094, -0.1678952],
                 [ 0.02980165, -0.19318073,  1.16364789]];

    // ** Static filters * /
    this.protanopiaFilter =    [[0, 1.05118294, -0.05116099],
                                [0, 1,           0],
                                [0, 0,           1]];
    this.deuteranopiaFilter =  [[1,         0, 0],
                                [0.9513092, 0, 0.04866992],
                                [0,         0, 1]];
    this.tritanopiaFilter =    [[ 1,          0,          0],
                                [ 0,          1,          0],
                                [-0.86744736, 1.86727089, 0]];
    this.achromatopsiaFilter = [[0.212656, 0.715158, 0.072186],
                                [0.212656, 0.715158, 0.072186],
                                [0.212656, 0.715158, 0.072186]];
  }

  // ** Static functions * /

  protanopia(r, g, b) {
    return this.transform({r, g, b}, this.protanopiaFilter);
  }

  deuteranopia(r, g, b) {
    return this.transform({r, g, b}, this.deuteranopiaFilter);
  }

  tritanopia(r, g, b) {
    return this.transform({r, g, b}, this.tritanopiaFilter);
  }

  achromatopsia(r, g, b) {
    return this.transform({r, g, b}, this.achromatopsiaFilter);
  }

  // ** Dynamic functions * /
  //
  // dynamic filters are defined each time they're called,
  // due to having better tested performance while being being thread/async safe

  protanomaly(r, g, b, ratio) {
    const protanomaly = [[1 - (1*ratio), 1.05118294 * ratio, -0.05116099 * ratio],
                         [0,             1,                   0],
                         [0,             0,                   1]];
    return this.transform({r, g, b}, protanomaly);
  }

  deuteranomaly(r, g, b, ratio) {
    const deuteranomaly = [[1,                 0,             0],
                           [0.9513092 * ratio, 1 - (1*ratio), 0.04866992 * ratio],
                           [0,                 0,             1]];
    return this.transform({r, g, b}, deuteranomaly);
  }

  tritanomaly(r, g, b, ratio) {
    const tritanomaly = [[ 1,                  0,                  0],
                         [ 0,                  1,                  0],
                         [-0.86744736 * ratio, 1.86727089 * ratio, 1 - (1*ratio)]];
    return this.transform({r, g, b}, tritanomaly);
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
    let lms = this.dot(this.LMS, rgb);
    let lmsFiltered = this.dot(filter, lms);
    let rgbFiltered = this.dot(this.RGB, lmsFiltered);
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
    if(!Array.isArray(A) || !Array.isArray(A)) throw new Error('expected 2d arrays');
    const Am = A.length, An = A[0].length;
    const Bm = B.length, Bn = B[0].length;
    if(An != Bm) throw new Error(`dimensions incompatible An:${An}, Bm:${Bm}`);
    let matrix = new Array(An);
    for(let r = 0; r < Am; r++) {
      matrix[r] = new Array(Bn);
      for(let c = 0; c < Bn; c++) {
        matrix[r][c] = 0;
        for(let i = 0; i < An; i++) {
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
   * Note: After transformations, some times small error is introduced
   *       and some linear values end up slightly out of bounds, which is normal
   *       hence more lenient bound checks
   *
   * https://en.wikipedia.org/wiki/SRGB#Specification_of_the_transformation
   * @param {float} linear - linear representation of sRGB, float ranging 0.0-1.0
   * @return {int} a single sRGB channel, integer ranging 0-255
   */
  linearToStandardChannel(linear) {
    if(typeof linear === 'string' ||
       typeof linear === 'undefined') throw new Error('float expected');
    if(linear < -0.15 ||
       linear > 1.15) throw new Error(`parameter must be within range [0.0 - 1.0]: ${linear}`);
    let standard;
    if(linear <= 0.0031308) standard = linear * 12.92;
    else standard = 1.055 * Math.pow(linear, 1.0 / 2.4) - 0.055;
    return Math.round(standard * 255);
  }
}

module.id = 'voidcolor';
module.exports = new Voidcolor();
