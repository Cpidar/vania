  // tslint:disable:max-line-length
import labels from './settings'
const settingsTitles = labels.menuTitles

export const shared = {
  cancel: 'لغو',
  save: 'ذخیره',
  errorTitle: 'Error',
  successTitle: 'Success',
  warning: 'هشدار',
  incorrectPassword: 'Password incorrect',
  incorrectPasswordMessage: 'That password is incorrect.',
  tryAgain: 'Try again',
  ok: 'تایید',
  confirmToProceed: 'Confirm to proceed',
  date: 'Date',
  cycleDayWithLinebreak: 'Cycle\nday',
  loading: 'Loading ...',
  more: 'more',
  less: 'less',
  enter: 'Enter',
  yes: 'بله',
  no: 'خیر'
}

export const headerTitles = {
  Home: 'Home',
  Calendar: 'Calendar',
  Chart: 'Chart',
  Stats: 'Statistics',
  SettingsMenu: 'Settings',
  Reminders: settingsTitles.reminders,
  NfpSettings: settingsTitles.nfpSettings,
  DataManagement: settingsTitles.dataManagement,
  Password: settingsTitles.password,
  About: settingsTitles.about,
  License: settingsTitles.license,
  BleedingEditView: 'خونریزی',
  TemperatureEditView: 'دما',
  WeightEditView: 'وزن',
  MucusEditView: 'Mucus',
  CervixEditView: 'Cervix',
  NoteEditView: 'یادداشت',
  DesireEditView: 'Desire',
  SexEditView: 'Sex',
  PainEditView: 'Pain',
  MoodEditView: 'Mood',
  InfoSymptom: 'Info',
}

export const menuTitles = {
  Home: 'Home',
  Calendar: 'Calendar',
  Chart: 'Chart',
  Stats: 'Stats',
  Settings: 'Settings'
}

export const eventsDescription = {
  MIS: 'قمر در عقرب',
  FOM: '',
  LOM: ''
}

export const stats = {
  cycleLengthTitle: 'Cycle length',
  cycleLengthExplainer: 'Basic statistics about the length of your cycles.',
  emptyStats: 'At least one completed cycle is needed to present you with stats here.',
  // oneCycleStats: (number) => `You have documented one cycle of ${number} days.`,
  oneCycleStats: 'You have documented one cycle of',
  daysLabel: 'days',
  // getBasisOfStats: (numberOfCycles) => `Stats are based on ${numberOfCycles} completed cycles.`,
  basisOfStatsBeginning: 'Stats are based on',
  basisOfStatsEnd: 'completed cycles.',
  averageLabel: 'Average cycle length',
  minLabel: 'Shortest cycle',
  maxLabel: 'Longest cycle',
  stdLabel: 'Standard deviation'
}

export const periodLabels = {
  startPeriod: 'شروع پریود',
  endPeriod: 'پایان پریود',
  endPeriodInAnotherDay: 'اگه این روز نیست تو روز مدنظر بله بزنید'
}

export const bleedingPrediction = {
  noPrediction: 'There is not enough period data to predict the next one.',
  predictionInFuture: (startDays: string, endDays: string) => `Your next period is likely to start in ${startDays} to ${endDays} days.`,
  predictionStartedXDaysLeft: (numberOfDays: number) => `Your period is likely to start today or during the next ${numberOfDays} days.`,
  predictionStarted1DayLeft: 'Your period is likely to start today or tomorrow.',
  predictionStartedNoDaysLeft: 'Your period is likely to start today.',
  predictionInPast: (startDate: string, endDate: string) => `Based on your documented data, your period was likely to start between ${startDate} and ${endDate}.`
}

export const passwordPrompt = {
  title: 'Unlock app',
  enterPassword: 'Enter password here',
  deleteDatabaseExplainer: 'If you\'ve forgotten your password, unfortunately, there is nothing we can do to recover your data, because it is encrypted with the password only you know. You can, however, delete all your encrypted data and start fresh. Once all data has been erased, you can set a new password in the settings, if you like.',
  forgotPassword: 'Forgot your password?',
  deleteDatabaseTitle: 'Forgot your password?',
  deleteData: 'Yes, delete all my data',
  areYouSureTitle: 'Are you sure?',
  areYouSure: 'Are you absolutely sure you want to permanently delete all your data?',
  reallyDeleteData: 'Yes, I am sure'
}

export const home = {
  title: 'وضعیت دوره فعلی',
  editToday: 'add data for today',
  cycleDayNotEnoughInfo: 'We don\'t have enough information to know what your current cycle day is.',
  unknown: '?',
  // @ts-ignore
  cycleDayKnown: d => `Your last period started ${getDaysDescriptor(d)}.`,
  trackPeriod: 'track your period',
  checkFertility: 'check your fertility',
  // @ts-ignore
  phase: n => `${['1st', '2nd', '3rd'][n - 1]} cycle phase`
}
// @ts-ignore
const getDaysDescriptor = cycleDayNumber => {
  if (cycleDayNumber === 1) return 'today'
  if (cycleDayNumber === 2) return 'yesterday'
  return `${cycleDayNumber - 1} days ago`
}

export const fertilityStatus = {
  fertile: 'fertile',
  infertile: 'infertile',
  fertileUntilEvening: 'Fertile phase ends in the evening',
  unknown: 'We cannot show any cycle information because no period data has been added.',
  preOvuText: 'With NFP rules, you may assume 5 days of infertility at the beginning of your cycle, provided you don\'t observe any fertile mucus or cervix values.',
  periOvuText: 'We have not been able to detect both a temperature shift and mucus or cervix shift.',
  // @ts-ignore
  postOvuText: tempRule => {
    return (
      'We have detected a temperature shift (' + ['regular', '1st exception', '2nd exception'][tempRule] +
      ' temperature rule), as well as a mucus shift according to NFP rules. You may assume infertility, but always remember to ' +
      'double-check for yourself. Make sure the data makes sense to you.'
    )
  }
}

export const entryPage = {
  explainer: 'برای اینکه این اپلیکیشن قادر به پیش بینی باشد سوالات لازم است جواب داده شود',
  cycleLengthTitle: 'طول دوره',
  cyclelengthQuestion: 'طول دوره تان به طور میانگین چند روز است؟',
  cyclelengthExplainer: 'منظور از طول دوره شروع خونریزی تا شروع خونریزی بعدی است',
  bleedingLengthTitle: 'طول پریودی',
  bleedinlengthQuestion: 'طول دوره خونریزی به طور میانگین چند روز است؟',
  bleedinlengthExplainer: '',
  lastCycleStartTitle: 'تاریخ آخرین دوره',
  lastCycleStartQuestion: 'روز شروع آخرین دوره تان را وارد کنید؟',
  lastCycleStartExplainer: '',
  continue: 'ادامه',
  back: 'بازگشت',
  finish: 'ورود'
}

export const charts = {
  temperatureChartTitle: 'تغییرات دما',
  caption: (t: number) => `میانگین ${t}`,
  weightChartTitle: 'تغییرات وزن',
}
