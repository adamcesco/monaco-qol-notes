import Monaco from '@monaco-editor/react';
import React from 'react';
import './TextEditor.css';

class TextEditor extends React.Component {
  constructor() {
    super();
    this.onEditorDidMount = this.onEditorDidMount.bind(this);
    this.onEditorTextFocus = this.onEditorTextFocus.bind(this);
    this.onEditorTextBlur = this.onEditorTextBlur.bind(this);
  }

  onEditorDidMount(editor) {
    this.editor = editor;
    editor.onDidBlurEditorText(this.onEditorTextBlur);
    editor.onDidFocusEditorText(this.onEditorTextFocus);
  }

  onEditorTextFocus() {
    this.decorations.clear();
  }

  onEditorTextBlur() {
    const position = this.editor.getPosition();
    this.decorations = this.editor.createDecorationsCollection([
      {
        range: new window.monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column + 1,
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
      lineDecorationsWidth: 0,
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
