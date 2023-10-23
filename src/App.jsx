import React from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { appWindow } from '@tauri-apps/api/window';
// eslint-disable-next-line object-curly-newline
import { save, open, message, confirm } from '@tauri-apps/api/dialog';
import MonacoEditorWrapper from './MonacoEditorWrapper';
import Titlebar from './Titlebar';

// todo: auto highlighting "to-do" comments
// todo: allow users to change theme
// todo: allow users to change keybinds
// todo: save user settings like font size and theme

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
      editorContentChanged: false,
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

  componentDidUpdate() {
    const { onTop, editorContentChanged } = this.state;
    if (onTop === true) {
      this.isAOTRef.style.backgroundColor = '#ff1744';
    } else {
      this.isAOTRef.style.backgroundColor = '#d9dce3';
    }
    if (editorContentChanged === true) {
      this.isSavedRef.style.backgroundColor = '#ff1744';
    } else {
      this.isSavedRef.style.backgroundColor = '#d9dce3';
    }
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
        .then(() => {
          this.setState({ editorContentChanged: false });
        })
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
          this.setState({ editorContentChanged: false });
        })
        .catch(async (error) => {
          await message(`An error occured while saving to the following filepath: ${filePath}.\n\nThe details of the error are: ${error}`, { title: 'File Saving Error', type: 'error' });
        });
    }
  }

  async onOpen() {
    const { editorContentChanged } = this.state;
    if (editorContentChanged === true) {
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
          this.setState({ editorContentChanged: false });
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
    const { editorContentChanged } = this.state;
    if (editorContentChanged === false) {
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
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <div
            ref={(ref) => { this.isSavedRef = ref; }}
            style={{
              display: 'inline-flex',
              height: '.13rem',
              width: '4.5rem',
              backgroundColor: '#d9dce3',
              marginTop: '.3rem',
              marginBottom: '.45rem',
              marginRight: '.6rem',
            }}
          />
          <div
            ref={(ref) => { this.isAOTRef = ref; }}
            style={{
              display: 'inline-flex',
              height: '.13rem',
              width: '4.5rem',
              backgroundColor: '#d9dce3',
              marginTop: '.3rem',
              marginBottom: '.45rem',
            }}
          />
        </div>
        <div
          style={{
            zIndex: 0,
            boxShadow: 'rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px',
          }}
        >
          <MonacoEditorWrapper
            ref={(ref) => { this.editorRef = ref; }}
            contentDidChange={() => { this.setState({ editorContentChanged: true }); }}
          />
        </div>
      </>
    );
  }
}

export default App;
