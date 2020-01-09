describe('voidcolor', () => {
  const voidcolor = require('../voidcolor');

  it('transforms real color to simulated color', () => {
    expect(voidcolor.transform({r:50, g:100, b:150}, voidcolor.protanopiaFilter)).toEqual({r:94, g:94, b:150});
    expect(voidcolor.transform({r:50, g:100, b:150}, voidcolor.tritanopiaFilter)).toEqual({r:24, g:108, b:108});
    expect(voidcolor.transform({r:50, g:100, b:150}, voidcolor.deuteranopiaFilter)).toEqual({r:87, g:87, b:151});
    expect(voidcolor.transform({r:50, g:100, b:150}, voidcolor.achromatopsiaFilter)).toEqual({r:103, g:103, b:103});

    expect(voidcolor.transform({r:0, g:0, b:0}, voidcolor.protanopiaFilter)).toEqual({r:0, g:0, b:0});
    expect(voidcolor.transform({r:0, g:0, b:0}, voidcolor.tritanopiaFilter)).toEqual({r:0, g:0, b:0});
    expect(voidcolor.transform({r:0, g:0, b:0}, voidcolor.deuteranopiaFilter)).toEqual({r:0, g:0, b:0});
    expect(voidcolor.transform({r:0, g:0, b:0}, voidcolor.achromatopsiaFilter)).toEqual({r:0, g:0, b:0});

    expect(voidcolor.transform({r:255, g:255, b:255}, voidcolor.protanopiaFilter)).toEqual({r:255, g:255, b:255});
    expect(voidcolor.transform({r:255, g:255, b:255}, voidcolor.tritanopiaFilter)).toEqual({r:255, g:255, b:255});
    expect(voidcolor.transform({r:255, g:255, b:255}, voidcolor.deuteranopiaFilter)).toEqual({r:255, g:255, b:255});
    expect(voidcolor.transform({r:255, g:255, b:255}, voidcolor.achromatopsiaFilter)).toEqual({r:255, g:255, b:255});
  })

  it('dots two matrices', () => {
    const A = [[1, 2],
               [3, 4]];
    const B = [[2, 0],
               [1, 2]];
    const X = [[1, 2, 3],
               [4, 5, 6]];
    const ABexpected = [[4,  4],
                        [10, 8]];
    const AXexpected = [[9,  12, 15],
                        [19, 26, 33]];
    expect(voidcolor.dot).toThrow();
    expect(voidcolor.dot(A, B)).toEqual(ABexpected);
    expect(voidcolor.dot(A, X)).toEqual(AXexpected);
    expect(() => { voidcolor.dot(X, A); }).toThrow();

  })

  it('converts standard column vector to linear', () => {
    const vectorValid = voidcolor.standardToLinearRGB([[0], [255], [188]]);
    const expected = [0, 1, 0.5];
    for(let i = 0; i < 3; i++) {
      expect(vectorValid[i][0]).toBeCloseTo(expected[i]);
    }
    expect(voidcolor.standardToLinearRGB).toThrow();
    expect(() => { voidcolor.standardToLinearRGB([[-1], [256], [300]]); }).toThrow();
    expect(() => { voidcolor.standardToLinearRGB([[30], [255], [200], [30]]); }).toThrow();
    expect(() => { voidcolor.standardToLinearRGB([[34], [200]]); }).toThrow();
    expect(() => { voidcolor.standardToLinearRGB([255], [100], [30]); }).toThrow();
    expect(() => { voidcolor.standardToLinearRGB("[[255], [100], [30]]"); }).toThrow();
  })

  it('converts linear column vector to standard', () => {
    const vectorValid = voidcolor.linearToStandardRGB([[0], [1], [0.5]]);
    expect(vectorValid).toEqual([[0], [255], [188]]);
    expect(voidcolor.linearToStandardRGB).toThrow();
    expect(() => { voidcolor.linearToStandardRGB([[-0.2], [1.2], [2]]); }).toThrow();
    expect(() => { voidcolor.linearToStandardRGB([[0], [1], [0.5], [0]]); }).toThrow();
    expect(() => { voidcolor.linearToStandardRGB([[0], [1]]); }).toThrow();
    expect(() => { voidcolor.linearToStandardRGB([0], [1], [0.5]); }).toThrow();
  })

  it('converts linear to standard channel', () => {
    const min = voidcolor.linearToStandardChannel(0);
    expect(min).toBe(0);
    const max = voidcolor.linearToStandardChannel(1);
    expect(max).toBe(255);
    expect(voidcolor.linearToStandardChannel).toThrow();
    expect(() => { voidcolor.linearToStandardChannel(1.5); }).toThrow();
    expect(() => { voidcolor.linearToStandardChannel(-0.5); }).toThrow();
    expect(() => { voidcolor.linearToStandardChannel("Invalid"); }).toThrow();
  })

  it('converts standard to linear channel', () => {
    const min = voidcolor.standardToLinearChannel(0);
    expect(min).toBe(0.0);
    const max = voidcolor.standardToLinearChannel(255);
    expect(max).toBe(1.0);
    expect(voidcolor.standardToLinearChannel).toThrow();
    expect(() => { voidcolor.standardToLinearChannel(-1); }).toThrow();
    expect(() => { voidcolor.standardToLinearChannel(256); }).toThrow();
    expect(() => { voidcolor.standardToLinearChannel("Invalid"); }).toThrow();
  })
})
