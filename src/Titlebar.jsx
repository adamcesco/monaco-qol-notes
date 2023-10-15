import React from 'react';
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
    this.miniButtonRef = null;
    this.maxButtonRef = null;
    this.closeButtonRef = null;
    this.fileButtonRef = null;
    this.viewButtonRef = null;
    this.state = {
      // in tauri.config.json, we set the window to not be maximized by default
      maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg',
    };
  }

  componentDidMount() {
    appWindow.onResized(() => {
      appWindow.isMaximized().then((isMaximized) => {
        if (isMaximized) {
          this.setState({ maximizeIcon: 'https://api.iconify.design/mdi:window-restore.svg' });
          return;
        }
        this.setState({ maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg' });
      });
    });
  }

  render() {
    const { maximizeIcon } = this.state;
    // todo: add file and view menu buttons
    // todo: add file and view menu windows (divs)
    return (
      <div data-tauri-drag-region className="titlebar">
        <div className="menu-bar">
          <button
            type="button"
            ref={(ref) => { this.fileButtonRef = ref; }}
            className="titlebar-button"
            aria-label="file menu button"
            onMouseEnter={() => Titlebar.setButtonVisuals(this.fileButtonRef, 'rgba(0, 0, 0, 0.1)')}
            onMouseLeave={() => Titlebar.setButtonVisuals(this.fileButtonRef, 'transparent')}
            onFocus={() => Titlebar.setButtonVisuals(this.fileButtonRef, 'transparent')}
            onBlur={() => Titlebar.setButtonVisuals(this.fileButtonRef, 'transparent')}
            onClick={() => { }}
          >
            File
          </button>
          <button
            type="button"
            ref={(ref) => { this.viewButtonRef = ref; }}
            className="titlebar-button"
            aria-label="view menu button"
            onMouseEnter={() => Titlebar.setButtonVisuals(this.viewButtonRef, 'rgba(0, 0, 0, 0.1)')}
            onMouseLeave={() => Titlebar.setButtonVisuals(this.viewButtonRef, 'transparent')}
            onFocus={() => Titlebar.setButtonVisuals(this.viewButtonRef, 'transparent')}
            onBlur={() => Titlebar.setButtonVisuals(this.viewButtonRef, 'transparent')}
            onClick={() => { }}
          >
            View
          </button>
        </div>
        <div className="window-action-bar">
          <button
            type="button"
            ref={(ref) => { this.miniButtonRef = ref; }}
            className="titlebar-button"
            aria-label="minimize"
            onMouseEnter={() => Titlebar.setButtonVisuals(this.miniButtonRef, 'rgba(0, 0, 0, 0.1)')}
            onMouseLeave={() => Titlebar.setButtonVisuals(this.miniButtonRef, 'transparent')}
            onFocus={() => Titlebar.setButtonVisuals(this.miniButtonRef, 'transparent')}
            onBlur={() => Titlebar.setButtonVisuals(this.miniButtonRef, 'transparent')}
            onClick={() => { appWindow.minimize(); }}
          >
            <img
              src="https://api.iconify.design/mdi:window-minimize.svg"
              alt="minimize"
            />
          </button>
          <button
            type="button"
            ref={(ref) => { this.maxButtonRef = ref; }}
            className="titlebar-button"
            aria-label="maximize"
            onMouseEnter={() => Titlebar.setButtonVisuals(this.maxButtonRef, 'rgba(0, 0, 0, 0.1)')}
            onMouseLeave={() => Titlebar.setButtonVisuals(this.maxButtonRef, 'transparent')}
            onFocus={() => Titlebar.setButtonVisuals(this.maxButtonRef, 'transparent')}
            onBlur={() => Titlebar.setButtonVisuals(this.maxButtonRef, 'transparent')}
            onClick={() => { appWindow.toggleMaximize(); }}
          >
            <img
              src={maximizeIcon}
              alt="maximize"
            />
          </button>
          <button
            type="button"
            ref={(ref) => { this.closeButtonRef = ref; }}
            className="titlebar-button"
            aria-label="close"
            onMouseEnter={() => Titlebar.setButtonVisuals(this.closeButtonRef, 'rgba(255, 50, 50)', 'https://api.iconify.design/mdi:close.svg?color=white')}
            onMouseLeave={() => Titlebar.setButtonVisuals(this.closeButtonRef, 'transparent', 'https://api.iconify.design/mdi:close.svg')}
            onFocus={() => Titlebar.setButtonVisuals(this.closeButtonRef, 'transparent')}
            onBlur={() => Titlebar.setButtonVisuals(this.closeButtonRef, 'transparent')}
            onClick={() => { appWindow.close(); }}
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

export default Titlebar;
