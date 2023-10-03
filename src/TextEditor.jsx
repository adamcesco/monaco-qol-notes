import Monaco from '@monaco-editor/react';
import React from 'react';
import './TextEditor.css';

class TextEditor extends React.Component {
  constructor() {
    super();
    this.onEditorDidMount = this.onEditorDidMount.bind(this);
    this.onEditorTextFocus = this.onEditorTextFocus.bind(this);
    this.onEditorTextBlur = this.onEditorTextBlur.bind(this);
    this.decorations = null;
    this.editorRef = null;
  }

  // eslint-disable-next-line react/sort-comp
  onEditorDidMount(editor, monaco) {
    this.editorRef = editor;
    this.editorRef.onDidBlurEditorText(this.onEditorTextBlur);
    this.editorRef.onDidFocusEditorText(this.onEditorTextFocus);
    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.lineHighlightBackground': '#EAEFF6',
      },
    });
    monaco.editor.setTheme('myTheme');
  }

  componentWillUnmount() {
    this.editorRef.dispose();
  }

  onEditorTextFocus() {
    if (this.decorations !== null) {
      this.decorations.clear();
    }
  }

  onEditorTextBlur() {
    if (this.editorRef === null) {
      return;
    }

    const { lineNumber, column } = this.editorRef.getPosition();
    this.decorations = this.editorRef.createDecorationsCollection([
      {
        range: new window.monaco.Range(
          lineNumber,
          column,
          lineNumber,
          column + 1,
        ),
        options: {
          className: 'my-bookmark',
          minimap: {
            color: 'red',
            position: 2,
          },
        },
      },
    ]);
  }

  render() {
    const options = {
      cursorStyle: 'line',
      language: 'markdown',
      lightbulb: {
        enabled: false,
      },
      lineNumbers: 'off',
      lineNumbersMinChars: 0,
      wordWrap: 'on',
      minimap: {
        enabled: true,
        showSlider: 'always',
      },
      occurrencesHighlight: false,
      quickSuggestions: false,
      readOnly: false,
      roundedSelection: false,
      trimAutoWhitespace: false,
      unicodeHighlight: {
        ambigousCharacters: true,
        includeComments: true,
        includeStrings: true,
        invisibleCharacters: true,
      },
      wrappingIndent: 'same',
    };

    return (
      <Monaco
        height="90vh"
        options={options}
        onMount={this.onEditorDidMount}
      />
    );
  }
}

export default TextEditor;
