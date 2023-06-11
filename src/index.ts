import { enqueue, getTarget, getTargetRect, h, parseStyle } from "./utils.ts"

export const affixProps = {
  offset: 0,
  activeClass: '',
  activeStyle: '',
  target: ''
}

export default class Affix extends HTMLElement {
  __container!: HTMLElement | Window
  __fixed!: HTMLElement
  __ro!: ResizeObserver
  value = false

  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    root.appendChild(this.__fixed = h('div', undefined, [h('slot')]))
    this.style.display = 'block'
  }

  connectedCallback() {
    this.__ro = new ResizeObserver(this.queueForceUpdate)
    this.__ro.observe(this.__fixed)
    this.setTarget()
    window.addEventListener('resize', this.queueForceUpdate)
  }
  disconnectedCallback() {
    this.__ro.disconnect()
    this.__container?.removeEventListener('scroll', this.__onscroll)
    window.removeEventListener('resize', this.queueForceUpdate)
  }

  static get observedAttributes() {
    return Object.keys(affixProps)
  }

  attributeChangedCallback(name: keyof typeof affixProps, old: string, val: string) {
    if (name === 'target') this.setTarget(val)
    this.queueForceUpdate()
  }

  get offset() {
    return +this.getAttribute('offset')! || affixProps.offset
  }

  get activeStyle() {
    return this.getAttribute('activeStyle') || affixProps.activeStyle
  }

  get activeClass() {
    return this.getAttribute('activeClass') || affixProps.activeClass
  }

  setTarget(str?: string) {
    let { __container: el } = this
    el?.removeEventListener('scroll', this.__onscroll)
    if (el && el !== window) this.__ro.unobserve(el as Element)
    el = this.__container = getTarget(str)
    el?.addEventListener('scroll', this.__onscroll, { passive: true })
    if (el && el !== window) this.__ro.observe(el as Element)
  }

  __onscroll = () => this.update()

  forceUpdate = () => this.update(true)
  queueForceUpdate = () => enqueue(this.forceUpdate)
  
  update = (force = false) => {
    const rect1 = getTargetRect(this.__container)
    const rect2 = this.getBoundingClientRect()
    const { offset } = this
    const { style, classList } = this.__fixed
    const value = offset > rect2.top - rect1.top
    
    if (!force && value === this.value) return
    
    const activeStyle = parseStyle(this.activeStyle)

    if (value) {
      const fixedRect = this.__fixed.getBoundingClientRect()
      // activeClass
      this.activeClass && this.activeClass.split(/\s+/).forEach(e => e && classList.add(e))
      // activeStyle
      for (const key in activeStyle) style.setProperty(key, activeStyle[key])
      style.setProperty('position', 'fixed')
      style.setProperty('top', `${rect1.top + offset}px`)
      this.style.setProperty('width', `${fixedRect.width}px`)
      this.style.setProperty('height', `${fixedRect.height}px`)
    } else {
      // activeClass
      this.activeClass && this.activeClass.split(/\s+/).forEach(e => e && classList.remove(e))
      // activeStyle
      for (const key in activeStyle) style.setProperty(key, '')
      style.setProperty('position', '')
      this.style.setProperty('width', '')
      this.style.setProperty('height', '')
    }

    if (value !== this.value) {
      this.value = value
      this.dispatchEvent(new Event('change', { bubbles: false }))
    }
  }
}

customElements.define('wc-affix', Affix)