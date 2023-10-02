import React from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      text: '',
    };
  }

  render() {
    const { text } = this.state;
    const options = {
      cursorStyle: 'line',
      defaultValue: '',
      folding: false,
      glyphMargin: false,
      language: 'markdown',
      lightbulb: {
        enabled: false,
      },
      lineDecorationsWidth: 0,
      lineNumbers: 'off',
      lineNumbersMinChars: 0,
      quickSuggestions: false,
      readOnly: false,
      roundedSelection: false,
      theme: 'vs',
      trimAutoWhitespace: false,
      unicodeHighlight: true,
      wrappingIndent: 'same',
    };

    return (
      <Editor
        height="90vh"
        value={text}
        options={options}
      />
    );
  }
}

export default App;
