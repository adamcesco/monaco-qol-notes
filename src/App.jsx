import React from 'react';
import { save, open, message } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import MonacoEditorWrapper from './MonacoEditorWrapper';

// todo: auto-generated table of contents using a file's headers
// todo: auto highlighting "to-do" comments
// todo: Picture-in-Picture note taking

window.onkeydown = (e) => {
  if (e.ctrlKey && e.shiftKey && e.code === 'KeyS') {
    e.preventDefault();
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

  async onSave(filePathVal) {
    const filePath = filePathVal || await save({
      defaultPath: 'untitled.md',
      filters: [{
        name: 'md',
        extensions: ['md', 'txt'],
      }],
    });
    if (filePath !== null) {
      invoke('write_file', { invokePath: filePath, invokeContent: this.editorRef.editor.getValue() })
        .then(() => {
          this.filePathRef.current = filePath;
        })
        .catch(async (error) => {
          await message(`An error occured while saving to the following filepath: ${filePath}.\n\nThe details of the error are: ${error}`, { title: 'File Saving Error', type: 'error' });
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
          await message(`An error occured while opening the following filepath: ${filePath}.\n\nThe details of the error are: ${error}`, { title: 'File Opening Error', type: 'error' });
        });
    }
  }

  render() {
    return (
      <MonacoEditorWrapper
        ref={(ref) => { this.editorRef = ref; }}
      />
    );
  }
}

export default App;
