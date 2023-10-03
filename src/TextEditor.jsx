import Monaco from '@monaco-editor/react';
import React from 'react';

class TextEditor extends React.Component {
  constructor() {
    super();
    this.onEditorDidMount = this.onEditorDidMount.bind(this);
    this.onEditorTextFocus = this.onEditorTextFocus.bind(this);
    this.onEditorTextBlur = this.onEditorTextBlur.bind(this);
  }

  onEditorDidMount(editor) {
    editor.onDidBlurEditorText(this.onEditorTextBlur);
    editor.onDidFocusEditorText(this.onEditorTextFocus);
  }

  onEditorTextFocus() {
    console.log('onEditorTextFocus');
  }

  onEditorTextBlur() {
    console.log('onEditorTextBlur');
  }

  render() {
    const options = {
      cursorStyle: 'line',
      language: 'markdown',
      lightbulb: {
        enabled: false,
      },
      lineDecorationsWidth: 0,
      lineNumbers: 'off',
      lineNumbersMinChars: 0,
      wordWrap: 'on',
      minimap: {
        enabled: true,
        showSlider: 'always',
      },
      quickSuggestions: false,
      readOnly: false,
      roundedSelection: false,
      theme: 'vs',
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
