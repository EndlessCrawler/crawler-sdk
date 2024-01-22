import React, { useRef, useEffect } from 'react'
import { useFormatter } from '@/hooks/useFormatter'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
//
// Monaco Editor (too vanilla)
// https://github.com/microsoft/monaco-editor
// https://microsoft.github.io/monaco-editor/playground.html
//
// Monaco options:
// https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IStandaloneEditorConstructionOptions.html
//
// React/next.js working example:
// https://github.com/react-monaco-editor/react-monaco-editor/issues/271#issuecomment-986612363
//

const MonacoEditor = ({
	language = 'json',
	content,
	className,
	onChange = (value) => { },
	disabled = false,
	readOnly = true,
	wordWrap = 'off',
	lineNumbers = 'on',
	miniMap = true,
}: {
	language?: string,
	content: any,
	className?: string,
	onChange?(value: string | undefined): void,
	disabled?: boolean,
	readOnly?: boolean,
	wordWrap?: 'off' | 'on',
	lineNumbers?: 'off' | 'on',
	miniMap?: boolean,
}) => {
	const monacoEditorRef = useRef<typeof monaco.editor | null>(null)
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

	// monaco takes years to mount, so this may fire repeatedly without refs set
	useEffect(() => {
		if (monacoEditorRef.current && editorRef.current) {
			// again, monaco takes years to mount and load, so this may load as null
			const model = monacoEditorRef.current.getModels()
			if (model?.length > 0) {
				// finally, do editor's document initialization here
				editorRef.current.setScrollTop(1)
				editorRef.current.setPosition({
					lineNumber: 2,
					column: 0,
				})
				editorRef.current.focus()
				monacoEditorRef.current.setModelMarkers(model[0], 'owner', [])
			}
		}
	}, [monacoEditorRef.current, editorRef.current])


	let options: monaco.editor.IStandaloneEditorConstructionOptions = {
		stopRenderingLineAfter: 1000,
		wordWrap,
		lineNumbers,
		minimap: { enabled: miniMap },
		tabSize: 2,
	}
	if (readOnly) {
		options = {
			...options,
			readOnly: true,
			domReadOnly: true,
			// scrollBeyondLastLine: false,
			// tabIndex: -1,
		}
	}

	const { formatted } = useFormatter(content)

	// const _theme = 'vs' // default
	const _theme = 'vs-dark'
	// const _theme = 'hc-black'
	// const _theme = 'hc-light'

	if (disabled) return <></>

	return <Editor
		value={formatted}
		language={language}
		onChange={(value, _event) => {
			onChange(value)
		}}
		className={`FillParent ${className}`}
		onMount={(editor, monaco) => {
			monacoEditorRef.current = monaco.editor
			editorRef.current = editor
		}}
		//@ts-ignore
		options={options}
		theme={_theme}
		height='60em'
	/>
}

export default MonacoEditor
