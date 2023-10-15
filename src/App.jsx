import React from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
// eslint-disable-next-line object-curly-newline
import { save, open, message, confirm } from '@tauri-apps/api/dialog';
import MonacoEditorWrapper from './MonacoEditorWrapper';

// todo: auto highlighting "to-do" comments
// todo: add viewable list of keybinds
// todo: allow users to change theme
// todo: allow users to change keybinds
// todo: give users a visual indicator of unsaved changes
// todo: give users a visual indicator of always on top

class App extends React.Component {
  constructor() {
    super();
    this.unlistenFileMenuRef = React.createRef();
    this.unlistenCloseRequestedRef = React.createRef();
    this.filePathRef = React.createRef();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSave = this.onSave.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.editorRef = null;
    this.state = {
      onTop: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    this.unlistenCloseRequestedRef.current = appWindow.onCloseRequested(async (event) => {
      if (this.editorRef.didChangeModelContent.current === false) {
        appWindow.close();
        return;
      }
      const result = await confirm('You have unsaved changes. Continue?', { title: 'Contiue?', okLabel: 'Yes', type: 'warning' });
      if (result === false) {
        event.preventDefault();
        return;
      }
      appWindow.close();
    });
    this.unlistenFileMenuRef.current = listen('menu-event', async (event) => {
      switch (event.payload) {
        case 'open': {
          if (this.editorRef.didChangeModelContent.current === false) {
            this.onOpen();
            break;
          }
          const result = await confirm('You have unsaved changes. Continue?', { title: 'Contiue?', okLabel: 'Yes', type: 'warning' });
          if (result === false) {
            break;
          }
          this.onOpen();
          break;
        }

        case 'save': {
          this.editorRef.didChangeModelContent.current = false;
          this.onSave(this.filePathRef.current);
          break;
        }

        case 'save-as': {
          this.editorRef.didChangeModelContent.current = false;
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
    document.removeEventListener('keydown', this.onKeyDown);
    this.unlistenCloseRequestedRef.current.then((remove) => remove());
    this.unlistenFileMenuRef.current.then((remove) => remove());
  }

  onKeyDown(event) {
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyS') {
      event.preventDefault();
      this.onSave(null);
    } else if (event.ctrlKey && event.code === 'KeyO') {
      this.onOpen();
    } else if (event.ctrlKey && event.code === 'KeyS') {
      this.onSave(this.filePathRef.current);
    } else if (event.ctrlKey && event.code === 'KeyT') {
      const { onTop } = this.state;
      this.setState({ onTop: !onTop });
      appWindow.setAlwaysOnTop(!onTop);
    } else if (event.ctrlKey && event.code === 'Equal') {
      this.editorRef.editor.trigger('editor', 'editor.action.fontZoomIn');
    } else if (event.ctrlKey && event.code === 'Minus') {
      this.editorRef.editor.trigger('editor', 'editor.action.fontZoomOut');
    }
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
