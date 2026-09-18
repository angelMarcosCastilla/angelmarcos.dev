import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ShikiTransformer } from 'shiki'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const codeBlockTransformer: ShikiTransformer = {
  name: 'code-block-header',

  pre(node) {
    const lang = this.options.lang || 'text'

    node.properties['data-language'] = lang
    node.properties['data-code-block'] = 'true'

    return node
  }
}
