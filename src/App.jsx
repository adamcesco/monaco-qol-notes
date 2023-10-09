import React from 'react';
import { save, open } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import MonacoEditorWrapper from './MonacoEditorWrapper';
// add global short cuts for monaco editor

class App extends React.Component {
  constructor() {
    super();
    this.unlistenFileMenuRef = React.createRef();
    this.onSave = this.onSave.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.filePathRef = React.createRef();
    this.editorRef = null;
  }

  componentDidMount() {
    this.unlistenFileMenuRef.current = listen('file-menu-event', async (event) => {
      switch (event.payload) {
        case 'open': {
          this.onOpen();
          break;
        }

        case 'save': {
          this.onSave();
          break;
        }

        case 'save-as': {
          this.filePathRef.current = null;
          this.onSave();
          break;
        }

        default: {
          break;
        }
      }
    });
  }

  componentWillUnmount() {
    this.unlistenFileMenuRef.current.then((remove) => remove());
  }

  async onSave() {
    if (this.filePathRef.current === null) {
      this.filePathRef.current = await save({
        defaultPath: 'untitled.md',
        filters: [{
          name: 'md',
          extensions: ['md', 'txt'],
        }],
      });
    }
    if (this.filePathRef.current !== null) {
      invoke('write_file', { invokePath: this.filePathRef.current, invokeContent: this.editorRef.editor.getValue() })
        .catch((error) => { console.log(error); });
    }
  }

  async onOpen() {
    const filePath = await open({
      defaultPath: 'untitled.md',
      filters: [{
        name: 'md',
        extensions: ['md', 'txt'],
      }],
    });
    if (filePath !== null) {
      invoke('get_file_content', { invokeFilepath: filePath })
        .then((result) => {
          this.filePathRef.current = filePath;
          this.editorRef.editor.setValue(result);
        })
        .catch((error) => { console.log(error); });
    }
  }

  render() {
    return (
      <MonacoEditorWrapper ref={(ref) => { this.editorRef = ref; }} />
    );
  }
}

export default App;
