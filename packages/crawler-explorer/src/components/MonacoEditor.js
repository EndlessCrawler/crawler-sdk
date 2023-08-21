import React, { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'

// compact stringify options:
// https://github.com/AitoDotAI/json-stringify-pretty-compact
//@ts-ignore
var stringify = require('@aitodotai/json-stringify-pretty-compact')

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
	onChange = (value) => { },
	className = null,
	disabled = false,
	readOnly = true,
	wordWrap = false,
	lineNumbers = true,
	miniMap = true,
}) => {
	const monacoEditorRef = useRef(null)
	const editorRef = useRef(null)

	// monaco takes years to mount, so this may fire repeatedly without refs set
	useEffect(() => {
		if (monacoEditorRef.current && editorRef.current) {
			// again, monaco takes years to mount and load, so this may load as null
			const model = monacoEditorRef.current.getModels()
			if (model?.length > 0) {
				// finally, do editor's document initialization here
				onInitializePane(monacoEditorRef, editorRef, model)
			}
		}
	}, [monacoEditorRef.current, editorRef.current])

	const onInitializePane = (
		monacoEditorRef,
		editorRef,
		model
	) => {
		editorRef.current.setScrollTop(1)
		editorRef.current.setPosition({
			lineNumber: 2,
			column: 0,
		})
		editorRef.current.focus()
		monacoEditorRef.current.setModelMarkers(model[0], 'owner', null)
	}

	let options = {
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

	// const _theme = 'vs' // default
	const _theme = 'vs-dark'
	// const _theme = 'hc-black'
	// const _theme = 'hc-light'

	const _content =
		typeof content == 'object' ? stringify(content, {
			indent: '\t',
			maxNesting: 1,
			maxLength: 1300,
			margins: true,
		}) //JSON.stringify(content, null, '\t')
			: typeof content != 'string' ? content.toString()
				: content

	if (disabled) return <></>

	return <Editor
		value={_content}
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
		// width='60em'
		height='80em'
	/>
}

export default MonacoEditor
