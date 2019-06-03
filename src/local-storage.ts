import { LocalStorage } from 'quasar'
import Observable from 'obv'
import config from './config'

export const scaleObservable = Observable()
setObvWithInitValue('tempScale', scaleObservable, {
  min: config.temperatureScale.defaultLow,
  max: config.temperatureScale.defaultHigh
})

export const unitObservable = Observable()
unitObservable.set(config.temperatureScale.units)
scaleObservable((scale: any) => {
  const scaleRange = scale.max - scale.min
  if (scaleRange <= 3) {
    unitObservable.set(0.1)
  } else {
    unitObservable.set(0.5)
  }
})

export function saveTempScale(scale: any) {
  LocalStorage.set('tempScale', JSON.stringify(scale))
  scaleObservable.set(scale)
}

export const tempReminderObservable = Observable()
setObvWithInitValue('tempReminder', tempReminderObservable, {
  enabled: false
})

export function saveTempReminder(reminder: any) {
  LocalStorage.set('tempReminder', JSON.stringify(reminder))
  tempReminderObservable.set(reminder)
}

export const periodReminderObservable = Observable()
setObvWithInitValue('periodReminder', periodReminderObservable, {
  enabled: false
})

export function savePeriodReminder(reminder: any) {
  LocalStorage.set('periodReminder', JSON.stringify(reminder))
  periodReminderObservable.set(reminder)
}

export const useCervixObservable = Observable()
setObvWithInitValue('useCervix', useCervixObservable, false)

export function saveUseCervix(bool: any) {
  LocalStorage.set('useCervix', JSON.stringify(bool))
  useCervixObservable.set(bool)
}

export const hasEncryptionObservable = Observable()
setObvWithInitValue('hasEncryption', hasEncryptionObservable, false)

export function saveEncryptionFlag(bool: any) {
  LocalStorage.set('hasEncryption', JSON.stringify(bool))
  hasEncryptionObservable.set(bool)
}

export function getLicenseFlag() {
  return LocalStorage.getItem('agreedToLicense')
}

export function saveLicenseFlag() {
  LocalStorage.set('agreedToLicense', JSON.stringify(true))
}

function setObvWithInitValue(key: string, obv: any, defaultValue: any) {
  const result = LocalStorage.getItem(key)
  let value
  if (result) {
    value = JSON.parse(result)
  } else {
    value = defaultValue
  }
  obv.set(value)
}

export function saveInitialCycleConfig(cycle: any) {
  LocalStorage.set('appOpenedBefore', true)
  LocalStorage.set('initialCycle', cycle)
}

export function getInitialCycleConfig() {
  return LocalStorage.getItem('initialCycle')
}