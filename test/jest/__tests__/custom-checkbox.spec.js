/* eslint-disable */
/**
 * @jest-environment jsdom
 */

import { mount, createLocalVue, shallowMount } from '@vue/test-utils'
import CHKBOX from 'src/components/custom-checkbox.vue'
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

  const wrapper = mount(CHKBOX, {
    localVue,
    propsData: {
      value: 'acne',
      label: 'Acne',
      // checkedIcon: '../assets/icons/ic_bl_0_c.png',
      uncheckedIcon: '../assets/icons/ic_bl_0.png',
      uncheckedColor: 'standard',
      checkedColor: 'primary'
    }
  })
  const vm = wrapper.vm

  it('passes the sanity check and creates a wrapper', () => {
    expect(wrapper.isVueInstance()).toBe(true)
  })

  it('has a created hook', () => {
    expect(typeof vm.updateInput).toBe('function')
  })

  it('it render props', () => {
    expect(wrapper.props().value).toBe('acne')
  })

  it('accesses the shallowMount', () => {
    // expect(vm.$el.textContent).toContain('rocket muffin')
    // expect(wrapper.text()).toContain('rocket muffin') // easier
    expect(wrapper.find('span').text()).toContain('Acne')
  })

  // it('sets the correct default data', () => {
  //   expect(typeof vm.counter).toBe('number')
  //   const defaultData2 = QBUTTON.data()
  //   expect(defaultData2.counter).toBe(0)
  // })

  it('correctly updates data when button is pressed', () => {
    wrapper.setData({ modelValue: { acne: false } })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(wrapper.find('img').attributes().src).toBe('../assets/icons/ic_bl_0.png')
    expect(wrapper.emitted().change).toHaveLength(1)
    expect(wrapper.emitted().change[0]).toEqual([{ acne: true }])
  })

  // it('formats a date without throwing exception', () => {
  //   // test will automatically fail if an exception is thrown
  //   // MMMM and MMM require that a language is 'installed' in Quasar
  //   let formattedString = date.formatDate(Date.now(), 'YYYY MMMM MMM DD')
  //   console.log('formattedString', formattedString)
  // })
})
