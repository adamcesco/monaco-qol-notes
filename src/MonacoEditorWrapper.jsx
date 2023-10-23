import MonacoEditor from '@monaco-editor/react';
import React from 'react';
import PropTypes from 'prop-types';
import './MonacoEditorWrapper.css';
import { appWindow } from '@tauri-apps/api/window';

class MonacoEditorWrapper extends React.Component {
  static onEditorTextFocus() {
    appWindow.emit('close-menu-windows');
  }

  constructor(props) {
    super(props);
    this.onChangeModelContent = this.onChangeModelContent.bind(this);
    this.onEditorDidMount = this.onEditorDidMount.bind(this);
    this.onEditorTextBlur = this.onEditorTextBlur.bind(this);
    this.editor = null;
    this.state = { decorations: null };
  }

  componentWillUnmount() {
    this.editor.dispose();
  }

  onEditorDidMount(editor, monaco) {
    this.editor = editor;
    this.editor.onDidChangeModelContent(this.onChangeModelContent);
    this.editor.onDidBlurEditorText(this.onEditorTextBlur);
    this.editor.onDidFocusEditorText(MonacoEditorWrapper.onEditorTextFocus);
    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.lineHighlightBackground': '#eaeff6',
      },
    });
    monaco.editor.setTheme('myTheme');
  }

  onChangeModelContent() {
    const { contentDidChange } = this.props;
    const { decorations } = this.state;
    contentDidChange();
    if (decorations === null) {
      return;
    }

    decorations.clear();
  }

  onEditorTextBlur() {
    if (this.editor === null) {
      return;
    }

    const { lineNumber, column } = this.editor.getPosition();
    const { decorations } = this.state;

    if (decorations === null || decorations.length === 0) {
      this.setState({
        decorations: this.editor.createDecorationsCollection([
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
        ]),
      });
    }
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
      <MonacoEditor
        height="90vh"
        options={options}
        onMount={this.onEditorDidMount}
      />
    );
  }
}
MonacoEditorWrapper.propTypes = {
  contentDidChange: PropTypes.func.isRequired,
};

export default MonacoEditorWrapper;
