export type BindElement = HTMLElement | Window

export const getTarget = (str?: string) =>  str ? document.querySelector(str) as HTMLElement : window

export function getTargetRect(target: BindElement): DOMRect {
  return target !== window
    ? (target as HTMLElement).getBoundingClientRect()
    : ({ top: 0, bottom: window.innerHeight } as DOMRect)
}

export function h(tag: string, props?: {}, children?: Element[]): HTMLElement {
  const el = Object.assign(document.createElement(tag), props)
  children && el.replaceChildren(...children)
  return el
}

export function parseStyle(str: string) {
  const style = {} as any, pair = str.split(';').filter(e => e)
  for (let i = 0; i < pair.length; i++) {
    const [k, v] = pair[i].split(':')
    style[k.trim()] = v.trim()
  }
  return style
}

const queueMicro = queueMicrotask

type CB = () => void
const cbs = [] as CB[]
let looping = false

export function enqueue(cb: CB) {
  cbs.includes(cb) || cbs.push(cb)
  if (looping) return
  looping = true
  queueMicro(() => {
    cbs.forEach(e => e())
    looping = false
  })
}