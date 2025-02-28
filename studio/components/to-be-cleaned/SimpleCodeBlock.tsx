/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FC, useEffect, useState, useRef } from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import defaultTheme from 'prism-react-renderer/themes/palenight'
import Clipboard from 'clipboard'
import rangeParser from 'parse-numeric-range'
import { Button } from '@supabase/ui'

const highlightLinesRangeRegex = /{([\d,-]+)}/
const prism = {
  defaultLanguage: 'js',
  plugins: ['line-numbers', 'show-language'],
}

const SimpleCodeBlock: FC<any> = ({ children, className: languageClassName, metastring }) => {
  const [showCopied, setShowCopied] = useState(false)
  const target = useRef(null)
  const button = useRef(null)
  let highlightLines: any = []

  if (metastring && highlightLinesRangeRegex.test(metastring)) {
    const highlightLinesRange = metastring.match(highlightLinesRangeRegex)[1]
    highlightLines = rangeParser(highlightLinesRange).filter((n) => n > 0)
  }

  useEffect(() => {
    if (!showCopied) return
    const timer = setTimeout(() => setShowCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [showCopied])

  useEffect(() => {
    let clipboard: any

    // @ts-ignore
    if (button?.current?.button) {
      // @ts-ignore
      clipboard = new Clipboard(button.current.button, {
        // @ts-ignore
        target: () => target.current,
      })
    }

    return () => {
      if (clipboard) {
        clipboard.destroy()
      }
    }
  }, [button.current, target.current])

  let language = languageClassName && languageClassName.replace(/language-/, '')

  if (!language && prism.defaultLanguage) {
    language = prism.defaultLanguage
  }

  const handleCopyCode = (code: any) => {
    navigator?.clipboard?.writeText(code).then(() => setShowCopied(true))
  }

  return (
    <Highlight
      {...defaultProps}
      theme={(prism as any).theme || defaultTheme}
      code={children.trim()}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => {
        return (
          <div className="Code codeBlockWrapper">
            <pre ref={target} className={`codeBlock ${className}`}>
              {tokens.map((line, i) => {
                const lineProps = getLineProps({ line, key: i })

                if (highlightLines.includes(i + 1)) {
                  lineProps.className = `${lineProps.className} docusaurus-highlight-code-line`
                }

                return (
                  <div key={i} {...lineProps}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token, key })} />
                    ))}
                  </div>
                )
              })}
            </pre>
            <Button
              type="secondary"
              onClick={() => handleCopyCode(children)}
              style={{ padding: '2px 5px' }}
            >
              {showCopied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        )
      }}
    </Highlight>
  )
}

export default SimpleCodeBlock
