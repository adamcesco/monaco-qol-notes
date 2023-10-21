import React from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
// eslint-disable-next-line object-curly-newline
import { save, open, message, confirm } from '@tauri-apps/api/dialog';
import MonacoEditorWrapper from './MonacoEditorWrapper';
import Titlebar from './Titlebar';

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
    this.onToggleOnTop = this.onToggleOnTop.bind(this);
    this.onClose = this.onClose.bind(this);
    this.editorRef = null;
    this.state = {
      onTop: false,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    this.unlistenCloseRequestedRef.current = appWindow.onCloseRequested(this.onClose);
    this.unlistenFileMenuRef.current = listen('menu-event', async (event) => {
      switch (event.payload) {
        case 'open': {
          this.onOpen();
          break;
        }

        case 'save': {
          this.onSave(false);
          break;
        }

        case 'save-as': {
          this.onSave(true);
          break;
        }

        case 'tog-on-top': {
          this.onToggleOnTop();
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
      event.preventDefault();
      this.onOpen();
    } else if (event.ctrlKey && event.code === 'KeyS') {
      event.preventDefault();
      this.onSave(this.filePathRef.current);
    } else if (event.ctrlKey && event.code === 'KeyT') {
      event.preventDefault();
      this.onToggleOnTop();
    } else if (event.ctrlKey && event.code === 'Equal') {
      event.preventDefault();
      this.editorRef.editor.trigger('editor', 'editor.action.fontZoomIn');
    } else if (event.ctrlKey && event.code === 'Minus') {
      event.preventDefault();
      this.editorRef.editor.trigger('editor', 'editor.action.fontZoomOut');
    }
  }

  async onSave(saveAs) {
    const filePathVal = saveAs ? null : this.filePathRef.current;
    if (filePathVal !== null && filePathVal === this.filePathRef.current) {
      invoke('write_file', { invokePath: filePathVal, invokeContent: this.editorRef.editor.getValue() })
        .catch(async (error) => {
          await message(`An error occured while saving to the following filepath: ${filePathVal}.\n\nThe details of the error are: ${error}`, { title: 'File Saving Error', type: 'error' });
        });
      return;
    }

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
      this.editorRef.didChangeModelContent.current = false;
    }
  }

  async onOpen() {
    if (this.editorRef.didChangeModelContent.current === true) {
      const yesOpen = await confirm('You have unsaved changes. Continue?', { title: 'Contiue?', okLabel: 'Yes', type: 'warning' });
      if (yesOpen === false) {
        return;
      }
    }

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

  onToggleOnTop() {
    const { onTop } = this.state;
    this.setState({ onTop: !onTop });
    appWindow.setAlwaysOnTop(!onTop);
  }

  async onClose(event) {
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
  }

  render() {
    return (
      <>
        <Titlebar
          onOpen={this.onOpen}
          onSave={this.onSave}
          onClose={this.onClose}
          onAOTEnabled={this.onToggleOnTop}
          onZoomIn={() => { this.editorRef.editor.trigger('editor', 'editor.action.fontZoomIn'); }}
          onZoomOut={() => { this.editorRef.editor.trigger('editor', 'editor.action.fontZoomOut'); }}
          onCommandPalette={() => {
            this.editorRef.editor.focus();
            this.editorRef.editor.trigger('editor', 'editor.action.quickCommand');
          }}
          focusEditor={() => { this.editorRef.editor.focus(); }}
          baseZIndex={0}
        />
        <div
          style={{ zIndex: 0 }}
        >
          <MonacoEditorWrapper
            ref={(ref) => { this.editorRef = ref; }}
          />
        </div>
      </>
    );
  }
}

export default App;
