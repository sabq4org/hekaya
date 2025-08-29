'use client'

import { useEffect, useState } from 'react'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import python from 'highlight.js/lib/languages/python'

const lowlight = createLowlight()
lowlight.register({ javascript, typescript, html, css, python })

interface TiptapContentProps {
  content: any
  className?: string
}

export default function TiptapContent({ content, className = '' }: TiptapContentProps) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    if (content) {
      const extensions = [
        StarterKit.configure({
          codeBlock: false,
        }),
        Image,
        Link,
        Table,
        TableRow,
        TableHeader,
        TableCell,
        CodeBlockLowlight.configure({
          lowlight,
        }),
        Color.configure({ types: [TextStyle.name] }),
        TextStyle,
        Highlight,
        Underline,
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ]

      const generatedHtml = generateHTML(content, extensions)
      setHtml(generatedHtml)
    }
  }, [content])

  return (
    <div 
      className={`tiptap-content prose prose-lg max-w-none dark:prose-invert
        prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
        prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4
        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline
        prose-strong:text-gray-900 dark:prose-strong:text-gray-100
        prose-em:text-gray-800 dark:prose-em:text-gray-200
        prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900
        prose-img:rounded-lg prose-img:mx-auto
        prose-blockquote:border-l-4 prose-blockquote:border-purple-500 prose-blockquote:pl-4
        prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
        prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
        prose-li:text-gray-800 dark:prose-li:text-gray-200
        prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-700
        prose-th:bg-gray-100 dark:prose-th:bg-gray-800 prose-th:p-2
        prose-td:p-2 prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700
        ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
