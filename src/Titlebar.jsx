import React from 'react';
import { appWindow } from '@tauri-apps/api/window';
import WindowActionButton from './WindowActionButton';
import './Titlebar.css';

class Titlebar extends React.Component {
  constructor() {
    super();
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
    return (
      <div data-tauri-drag-region className="titlebar">
        <WindowActionButton
          purposeLabel="minimize"
          onClick={() => { appWindow.minimize(); }}
          icon="https://api.iconify.design/mdi:window-minimize.svg"
        />
        <WindowActionButton
          purposeLabel="maximize"
          onClick={() => { appWindow.toggleMaximize(); }}
          icon={maximizeIcon}
        />
        <WindowActionButton
          purposeLabel="close"
          onClick={() => { appWindow.close(); }}
          icon="https://api.iconify.design/mdi:close.svg"
          onEnterColor="rgba(255, 50, 50)"
          onEnterIcon="https://api.iconify.design/mdi:close.svg?color=white"
        />
      </div>
    );
  }
}

export default Titlebar;
