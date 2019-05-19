export default function (feeling: any, texture: any ) {
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
  return Math.max(nfpFeelingValue, nfpTextureValue)
}
