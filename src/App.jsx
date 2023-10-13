import React from 'react';
import { save, open, message } from '@tauri-apps/api/dialog';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
import MonacoEditorWrapper from './MonacoEditorWrapper';

// todo: auto highlighting "to-do" comments

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
    this.state = {
      onTop: false,
    };
  }

  componentDidMount() {
    this.unlistenFileMenuRef.current = listen('menu-event', async (event) => {
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

        case 'tog-on-top': {
          const { onTop } = this.state;
          this.setState({ onTop: !onTop });
          await appWindow.setAlwaysOnTop(!onTop);
          break;
        }

        case 'zoom-in': {
          this.editorRef.editor.trigger('editor', 'editor.action.fontZoomIn');
          break;
        }

        case 'zoom-out': {
          this.editorRef.editor.trigger('editor', 'editor.action.fontZoomOut');
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
        id="editor"
        ref={(ref) => { this.editorRef = ref; }}
      />
    );
  }
}

export default App;
