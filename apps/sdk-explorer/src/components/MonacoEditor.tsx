'use client';

import Editor from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { useEffect, useRef } from 'react';
import { useFormatter } from '@/hooks/useFormatter';

//
// Monaco Editor — https://github.com/microsoft/monaco-editor
// @monaco-editor/react loads the editor lazily on the client (SSR-safe loader).
//

const MonacoEditor = ({
  language = 'json',
  content,
  className,
  onChange = () => {},
  disabled = false,
  readOnly = true,
  wordWrap = 'off',
  lineNumbers = 'on',
  miniMap = true,
}: {
  language?: string;
  content: unknown;
  className?: string;
  onChange?(value: string | undefined): void;
  disabled?: boolean;
  readOnly?: boolean;
  wordWrap?: 'off' | 'on';
  lineNumbers?: 'off' | 'on';
  miniMap?: boolean;
}) => {
  const monacoEditorRef = useRef<typeof monaco.editor | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // monaco takes a while to mount, so this may fire before the refs are set.
  useEffect(() => {
    if (monacoEditorRef.current && editorRef.current) {
      const model = monacoEditorRef.current.getModels();
      if (model?.length > 0) {
        editorRef.current.setScrollTop(1);
        editorRef.current.setPosition({ lineNumber: 2, column: 0 });
        editorRef.current.focus();
        monacoEditorRef.current.setModelMarkers(model[0], 'owner', []);
      }
    }
  });

  const options: monaco.editor.IStandaloneEditorConstructionOptions = {
    stopRenderingLineAfter: 1000,
    wordWrap,
    lineNumbers,
    minimap: { enabled: miniMap },
    tabSize: 2,
    ...(readOnly ? { readOnly: true, domReadOnly: true } : {}),
  };

  const { formatted } = useFormatter(content);

  if (disabled) return null;

  return (
    <Editor
      value={formatted}
      language={language}
      onChange={(value) => onChange(value)}
      className={`fill-parent ${className ?? ''}`}
      onMount={(editor, monacoInstance) => {
        monacoEditorRef.current = monacoInstance.editor;
        editorRef.current = editor;
      }}
      options={options}
      theme="vs-dark"
      height="60em"
    />
  );
};

export default MonacoEditor;
