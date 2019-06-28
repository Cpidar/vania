export default function (feeling: number, texture: number ) {

  if (typeof feeling != 'number' || typeof texture != 'number') return null

  const feelingMapping: any = {
    0: 0,
    1: 1,
    2: 2,
    3: 4
  }
  const textureMapping: any = {
    0: 0,
    1: 3,
    2: 4
  }
  const nfpFeelingValue = feelingMapping[feeling]
  const nfpTextureValue = textureMapping[texture]
  return typeof Math.max(nfpFeelingValue, nfpTextureValue) === 'number' ? Math.max(nfpFeelingValue, nfpTextureValue) : -1
}
