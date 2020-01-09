describe('voidcolor', () => {
  const voidcolor = require('../voidcolor');



  it('transforms real color to simulated color', () => {

  })

  it('dots two matrices', () => {
    
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
    expect(() => { voidcolor.linearToStandardRGB([[-0.1], [1.1], [2]]); }).toThrow();
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
