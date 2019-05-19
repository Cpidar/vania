/* eslint-disable */
/**
 * @jest-environment jsdom
 */

import { mount, createLocalVue, shallowMount } from '@vue/test-utils'
import PHNMODAL from 'src/components/phn-modal.vue'
import RADIO from 'src/components/custom-radio.vue'
import * as All from 'quasar'
// import langEn from 'quasar/lang/en-us' // change to any language you wish! => this breaks wallaby :(
const { Quasar, date } = All

const components = Object.keys(All).reduce((object, key) => {
  const val = All[key]
  if (val && val.component && val.component.name != null) {
    object[key] = val
  }
  return object
}, {})

describe('Mount Quasar', () => {
  const localVue = createLocalVue()
  localVue.use(Quasar, { components }) // , lang: langEn

  const wrapper = mount(PHNMODAL, {
    localVue,
    propsData: {
    }
  })

  const vm = wrapper.vm

  it('passes the sanity check and creates a wrapper', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })

  it('has a created hook', () => {
    expect(typeof vm.close).toBe('function')
  })
  
  it('it render props', () => {
    expect(wrapper.props().phn.pain.acne).toBeFalsy()
  })

  it('it render data', () => {
    expect(vm.bleedIcons).toHaveLength(4)
    expect(vm.bleedIcons[0]).toEqual({ icon: '../asstes/icons/ic_bl_0.png', label: 'spotting', checkedIcon: '../asstes/icons/ic_bl_0_c.png' })
    expect(vm.painIcons).toHaveLength(17)
    expect(vm.painIcons[0]).toEqual({ key: 'acne', icon: '../asstes/icons/ic_sy_acne.png', label: 'جوش پوست' })
    expect(vm.pains).toEqual({ acne: true })
  })


  // it('accesses the shallowMount', () => {
  //   expect(vm.$el.textContent).toContain('rocket muffin')
  //   expect(wrapper.text()).toContain('rocket muffin') // easier
  //   expect(wrapper2.find(RADIO).props().uncheckedIcon).toBe('../asstes/icons/ic_bl_0.png')
  // })

  // it('sets the correct default data', () => {
  //   expect(typeof vm.counter).toBe('number')
  //   const defaultData2 = QBUTTON.data()
  //   expect(defaultData2.counter).toBe(0)
  // })

  // it('correctly updates data when button is pressed', () => {
  //   const button = wrapper.find('button')
  //   button.trigger('click')
  //   expect(wrapper.find('img').attributes().src).toBe('../assets/icons/ic_bl_0_c.png')
  // })

  // it('formats a date without throwing exception', () => {
  //   // test will automatically fail if an exception is thrown
  //   // MMMM and MMM require that a language is 'installed' in Quasar
  //   let formattedString = date.formatDate(Date.now(), 'YYYY MMMM MMM DD')
  //   console.log('formattedString', formattedString)
  // })
})
