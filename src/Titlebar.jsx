import React from 'react';
import PropTypes from 'prop-types';
import { appWindow } from '@tauri-apps/api/window';
import './Titlebar.css';

// todo: upgrade icons

class Titlebar extends React.Component {
  static setButtonVisuals(buttonRef, color, icon = null) {
    if (buttonRef === null) {
      return;
    }
    const { style, childNodes } = buttonRef;
    if (icon !== null) {
      childNodes[0].src = icon;
    }

    style.backgroundColor = color;
  }

  constructor() {
    super();
    this.unlistenResizedRef = React.createRef();
    this.unlistenEditorFocusRef = React.createRef();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.fileMenuWindowRef = null;
    this.viewMenuWindowRef = null;
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
    this.unlistenEditorFocusRef.current = appWindow.listen('editor-focus', () => {
      this.setState({
        displayFileMenu: false,
        displayViewMenu: false,
      });
    });
  }

  componentDidUpdate() {
    const { displayFileMenu, displayViewMenu, menuArrowIndex } = this.state;
    const { fileMenuWindowRef, viewMenuWindowRef } = this;
    // if the file menu is open, highlight the selected option
    if (displayFileMenu && menuArrowIndex !== -1) {
      fileMenuWindowRef.childNodes[menuArrowIndex].focus();
    }
    // if the view menu is open, highlight the selected option
    if (displayViewMenu && menuArrowIndex !== -1) {
      viewMenuWindowRef.childNodes[menuArrowIndex].focus();
    }
  }

  componentWillUnmount() {
    this.unlistenResizedRef.current.then((remove) => remove());
    this.unlistenEditorFocusRef.current.then((remove) => remove());
  }

  onKeyDown(event) {
    const { displayFileMenu, displayViewMenu } = this.state;
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
        appWindow.emit('request-editor-focus');
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
        appWindow.emit('request-editor-focus');
      }
    }
  }

  render() {
    const {
      onOpen,
      onSave,
      onAOTEnabled,
      onZoomIn,
      onZoomOut,
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
          <button
            type="button"
            className="titlebar-button"
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
            <div className="menu-window" ref={(ref) => { this.fileMenuWindowRef = ref; }} style={{ zIndex: baseZIndex + 1 }}>
              <button
                type="button"
                className="menu-option"
                aria-label="open"
                onClick={() => { onOpen(); appWindow.emit('request-editor-focus'); }}
              >
                <p>Open</p>
                <p>Ctrl+O</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="save"
                onClick={() => { onSave(false); appWindow.emit('request-editor-focus'); }}
              >
                <p>Save</p>
                <p>Ctrl+S</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="save as"
                onClick={() => { onSave(true); appWindow.emit('request-editor-focus'); }}
              >
                <p>Save As</p>
                <p>Ctrl+Shift+S</p>
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="titlebar-button"
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
            <div className="menu-window" ref={(ref) => { this.viewMenuWindowRef = ref; }} style={{ zIndex: baseZIndex + 1 }}>
              <button
                type="button"
                className="menu-option"
                aria-label="toggle always on top"
                onClick={() => { onAOTEnabled(); appWindow.emit('request-editor-focus'); }}
              >
                <p>Toggle Always on Top</p>
                <p>Ctrl+T</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="zoom in"
                onClick={() => { onZoomIn(); }}
              >
                <p>Zoom In</p>
                <p>Ctrl+=</p>
              </button>
              <button
                type="button"
                className="menu-option"
                aria-label="zoom out"
                onClick={() => { onZoomOut(); }}
              >
                <p>Zoom Out</p>
                <p>Ctrl+-</p>
              </button>
            </div>
          ) : null}
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
            onClick={() => { appWindow.emit('xclose-requested'); }}
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
  onAOTEnabled: PropTypes.func.isRequired,
  onZoomIn: PropTypes.func.isRequired,
  onZoomOut: PropTypes.func.isRequired,
  baseZIndex: PropTypes.number.isRequired,
};

export default Titlebar;
