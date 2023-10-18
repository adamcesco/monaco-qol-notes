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
    this.state = {
      // in tauri.config.json, we set the window to not be maximized by default
      maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg',
      displayFileMenu: false,
      displayViewMenu: false,
    };
  }

  componentDidMount() {
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
      this.setState({ displayFileMenu: false, displayViewMenu: false });
    });
  }

  componentWillUnmount() {
    this.unlistenResizedRef.current.then((remove) => remove());
    this.unlistenEditorFocusRef.current.then((remove) => remove());
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
            onClick={() => { this.setState({ displayFileMenu: !displayFileMenu }); }}
          >
            File
          </button>
          {displayFileMenu ? (
            <div className="menu-window" style={{ zIndex: baseZIndex + 1 }}>
              <button
                type="button"
                className="menu-option"
                onClick={() => { onOpen(); appWindow.emit('request-editor-focus'); }}
              >
                <p>Open</p>
                <p>Ctrl+O</p>
              </button>
              <button
                type="button"
                className="menu-option"
                onClick={() => { onSave(false); appWindow.emit('request-editor-focus'); }}
              >
                <p>Save</p>
                <p>Ctrl+S</p>
              </button>
              <button
                type="button"
                className="menu-option"
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
            onClick={() => { this.setState({ displayViewMenu: !displayViewMenu }); }}
          >
            View
          </button>
          {displayViewMenu ? (
            <div className="menu-window" style={{ zIndex: baseZIndex + 1 }}>
              <button
                type="button"
                className="menu-option"
                onClick={() => { onAOTEnabled(); appWindow.emit('request-editor-focus'); }}
              >
                <p>Toggle Always on Top</p>
                <p>Ctrl+T</p>
              </button>
              <button
                type="button"
                className="menu-option"
                onClick={() => { onZoomIn(); }}
              >
                <p>Zoom In</p>
                <p>Ctrl+=</p>
              </button>
              <button
                type="button"
                className="menu-option"
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
