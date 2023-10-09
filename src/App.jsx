import React from 'react';
import { save, open, message } from '@tauri-apps/api/dialog';
import { emit, listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import MonacoEditorWrapper from './MonacoEditorWrapper';
// add global short cuts for monaco editor

window.onkeydown = (e) => {
  if (e.ctrlKey && e.code === 'KeyP') {
    e.preventDefault();
  }
  if (e.ctrlKey && e.code === 'KeyO') {
    e.preventDefault();
    emit('file-menu-event', {
      payload: 'open',
    });
  }
  if (e.ctrlKey && e.code === 'KeyS') {
    e.preventDefault();
    emit('file-menu-event', {
      payload: 'save',
    });
  }
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
    emit('file-menu-event', {
      payload: 'save-as',
    });
  }
};

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
          this.onSave(this.filePathRef.current);
          break;
        }

        case 'save-as': {
          this.onSave(null);
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

  async onSave(fp) {
    const filePath = fp || await save({
      defaultPath: 'untitled.md',
      filters: [{
        name: 'md',
        extensions: ['md', 'txt'],
      }],
    });
    if (filePath !== null) {
      invoke('write_file', { invokePath: this.filePathRef.current, invokeContent: this.editorRef.editor.getValue() })
        .then(() => {
          this.filePathRef.current = filePath;
        })
        .catch(async (error) => {
          await message(`An error occured while writing to the following filepath: ${this.filePathRef.current}.\n\nThe details of the error are: ${error}`, { title: 'File Writing Error', type: 'error' });
        });
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
        .catch(async (error) => {
          await message(`An error occured while opening the following filepath: ${this.filePathRef.current}.\n\nThe details of the error are: ${error}`, { title: 'File Writing Error', type: 'error' });
        });
    }
  }

  render() {
    return (
      <MonacoEditorWrapper ref={(ref) => { this.editorRef = ref; }} />
    );
  }
}

export default App;
