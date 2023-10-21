import React from 'react';
import PropTypes from 'prop-types';
import { appWindow } from '@tauri-apps/api/window';
import './Titlebar.css';

// todo: upgrade icons
// todo: clean css

class Titlebar extends React.Component {
  constructor() {
    super();
    this.unlistenResizedRef = React.createRef();
    this.unlistenEditorFocusRef = React.createRef();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.fileMenuButton = null;
    this.viewMenuButton = null;
    this.fileMenuWindowRef = null;
    this.viewMenuWindowRef = null;
    this.isSavedRef = null;
    this.isAOTRef = null;
    this.state = {
      // in tauri.config.json, we set the window to not be maximized by default
      maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg',
      displayFileMenu: false,
      displayViewMenu: false,
      menuArrowIndex: -1,
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    this.unlistenResizedRef.current = appWindow.onResized(() => {
      appWindow.isMaximized().then((isMaximized) => {
        if (isMaximized) {
          this.setState({ maximizeIcon: 'https://api.iconify.design/mdi:window-restore.svg' });
          return;
        }
        this.setState({ maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg' });
      });
    });
    this.unlistenEditorFocusRef.current = appWindow.listen('close-menu-windows', () => {
      this.setState({
        displayFileMenu: false,
        displayViewMenu: false,
      });
    });
  }

  componentDidUpdate() {
    const { displayFileMenu, displayViewMenu, menuArrowIndex } = this.state;
    const { editorContentChanged, isOnTop } = this.props;
    const {
      fileMenuWindowRef,
      viewMenuWindowRef,
      isSavedRef,
      isAOTRef,
    } = this;

    if (displayFileMenu) {
      this.fileMenuButton.classList.add('menu-open');
      if (menuArrowIndex !== -1) {
        fileMenuWindowRef.childNodes[menuArrowIndex].focus();
      }
    } else {
      this.fileMenuButton.classList.remove('menu-open');
    }
    if (displayViewMenu) {
      this.viewMenuButton.classList.add('menu-open');
      if (menuArrowIndex !== -1) {
        viewMenuWindowRef.childNodes[menuArrowIndex].focus();
      }
    } else {
      this.viewMenuButton.classList.remove('menu-open');
    }

    if (editorContentChanged) {
      isSavedRef.classList.add('ticked-state');
    } else {
      isSavedRef.classList.remove('ticked-state');
    }

    // is the window on top?
    if (isOnTop) {
      isAOTRef.classList.add('ticked-state');
    } else {
      isAOTRef.classList.remove('ticked-state');
    }
  }

  componentWillUnmount() {
    this.unlistenResizedRef.current.then((remove) => remove());
    this.unlistenEditorFocusRef.current.then((remove) => remove());
  }

  onKeyDown(event) {
    const { displayFileMenu, displayViewMenu } = this.state;
    const { focusEditor } = this.props;
    const { key } = event;
    const arrowUpPressed = key === 'ArrowUp';
    const arrowDownPressed = key === 'ArrowDown';
    const escapePressed = key === 'Escape' || key === 'Esc';
    if (displayFileMenu) {
      const { fileMenuWindowRef } = this;
      const { menuArrowIndex } = this.state;
      if ((arrowUpPressed || arrowDownPressed) && menuArrowIndex === -1) {
        event.preventDefault();
        this.setState({ menuArrowIndex: 0 });
        return;
      }

      if (arrowUpPressed) {
        event.preventDefault();
        this.setState({
          menuArrowIndex: (menuArrowIndex === 0)
            ? (fileMenuWindowRef.childNodes.length - 1) : (menuArrowIndex - 1),
        });
      }
      if (arrowDownPressed) {
        event.preventDefault();
        this.setState({
          menuArrowIndex: (menuArrowIndex === fileMenuWindowRef.childNodes.length - 1)
            ? 0 : (menuArrowIndex + 1),
        });
      }
      if (escapePressed) {
        event.preventDefault();
        this.setState({ displayFileMenu: false });
        focusEditor();
      }
    }

    if (displayViewMenu) {
      const { viewMenuWindowRef } = this;
      const { menuArrowIndex } = this.state;
      if ((arrowUpPressed || arrowDownPressed) && menuArrowIndex === -1) {
        event.preventDefault();
        this.setState({ menuArrowIndex: 0 });
        return;
      }

      if (arrowUpPressed) {
        event.preventDefault();
        this.setState({
          menuArrowIndex: (menuArrowIndex === 0)
            ? (viewMenuWindowRef.childNodes.length - 1) : (menuArrowIndex - 1),
        });
      }
      if (arrowDownPressed) {
        event.preventDefault();
        this.setState({
          menuArrowIndex: (menuArrowIndex === viewMenuWindowRef.childNodes.length - 1)
            ? 0 : (menuArrowIndex + 1),
        });
      }
      if (escapePressed) {
        event.preventDefault();
        this.setState({ displayFileMenu: false });
        focusEditor();
      }
    }
  }

  render() {
    const {
      onOpen,
      onSave,
      onClose,
      onAOTEnabled,
      onZoomIn,
      onZoomOut,
      onCommandPalette,
      focusEditor,
      baseZIndex,
    } = this.props;
    const { maximizeIcon } = this.state;
    const { displayFileMenu, displayViewMenu } = this.state;
    return (
      <div
        data-tauri-drag-region
        className="titlebar"
        style={{ zIndex: baseZIndex }}
      >
        <div className="menu-bar">
          <div ref={(ref) => { this.isSavedRef = ref; }} className="window-stater" />
          <div ref={(ref) => { this.isAOTRef = ref; }} id="aot-stater" className="window-stater" />
          <button
            ref={(ref) => { this.fileMenuButton = ref; }}
            type="button"
            className="titlebar-button menu-titlebar-button"
            aria-label="file menu button"
            onClick={() => {
              this.setState({
                displayFileMenu: true,
                displayViewMenu: false,
                menuArrowIndex: -1,
              });
            }}
          >
            File
          </button>
          {displayFileMenu ? (
            <div
              ref={(ref) => { this.fileMenuWindowRef = ref; }}
              className="menu-window"
              style={{
                zIndex: baseZIndex + 1,
                top: this.fileMenuButton.offsetTop + this.fileMenuButton.offsetHeight,
                left: this.fileMenuButton.offsetLeft,
              }}
            >
              <button
                type="button"
                className="menu-option"
                aria-label="open"
                onClick={() => { onOpen(); focusEditor(); }}
              >
                <p>Open</p>
                <p className="internal-menu-option-keybind">Ctrl+O</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="save"
                onClick={() => { onSave(false); focusEditor(); }}
              >
                <p>Save</p>
                <p className="internal-menu-option-keybind">Ctrl+S</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="save as"
                onClick={() => { onSave(true); focusEditor(); }}
              >
                <p>Save As...</p>
                <p className="internal-menu-option-keybind">Ctrl+Shift+S</p>
              </button>
            </div>
          ) : null}
          <button
            ref={(ref) => { this.viewMenuButton = ref; }}
            type="button"
            className="titlebar-button menu-titlebar-button"
            aria-label="view menu button"
            onClick={() => {
              this.setState({
                displayFileMenu: false,
                displayViewMenu: true,
                menuArrowIndex: -1,
              });
            }}
          >
            View
          </button>
          {displayViewMenu ? (
            <div
              ref={(ref) => { this.viewMenuWindowRef = ref; }}
              className="menu-window"
              style={{
                zIndex: baseZIndex + 1,
                top: this.viewMenuButton.offsetTop + this.viewMenuButton.offsetHeight,
                left: this.viewMenuButton.offsetLeft,
              }}
            >
              <button
                type="button"
                className="menu-option"
                aria-label="toggle always on top"
                onClick={() => { onAOTEnabled(); focusEditor(); }}
              >
                <p>Toggle Always on Top</p>
                <p className="internal-menu-option-keybind">Ctrl+T</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="zoom in"
                onClick={(event) => { onZoomIn(); event.target.blur(); }}
              >
                <p>Zoom In</p>
                <p className="internal-menu-option-keybind">Ctrl+=</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="zoom out"
                onClick={(event) => { onZoomOut(); event.target.blur(); }}
              >
                <p>Zoom Out</p>
                <p className="internal-menu-option-keybind">Ctrl+-</p>
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="titlebar-button menu-titlebar-button"
            aria-label="view menu button"
            onClick={() => {
              this.setState({
                displayFileMenu: false,
                displayViewMenu: false,
              });
              onCommandPalette();
            }}
          >
            Command Palette
          </button>
        </div>
        <div className="window-action-bar">
          <button
            type="button"
            className="titlebar-button"
            aria-label="minimize"
            onClick={() => { appWindow.minimize(); }}
          >
            <img
              src="https://api.iconify.design/mdi:window-minimize.svg"
              alt="minimize"
            />
          </button>
          <button
            type="button"
            className="titlebar-button"
            aria-label="maximize"
            onClick={() => { appWindow.toggleMaximize(); }}
          >
            <img
              src={maximizeIcon}
              alt="maximize"
            />
          </button>
          <button
            type="button"
            className="titlebar-button"
            id="quit-button"
            aria-label="close"
            onClick={() => { onClose(); }}
          >
            <img
              src="https://api.iconify.design/mdi:close.svg"
              alt="close"
            />
          </button>
        </div>
      </div>
    );
  }
}
Titlebar.propTypes = {
  onOpen: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onAOTEnabled: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  onCommandPalette: PropTypes.func.isRequired,
  focusEditor: PropTypes.func.isRequired,
  editorContentChanged: PropTypes.bool.isRequired,
  isOnTop: PropTypes.bool.isRequired,
  baseZIndex: PropTypes.number.isRequired,
};

export default Titlebar;
