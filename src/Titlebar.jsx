import React from 'react';
import PropTypes from 'prop-types';
import { appWindow } from '@tauri-apps/api/window';
import './Titlebar.css';

function WindowActionButton({ ariaLabel, onClick, icon }) {
  function onEnter(e) {
    const { target } = e;
    const { style } = target;
    style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  }
  function onLeave(e) {
    const { target } = e;
    const { style } = target;
    style.backgroundColor = 'transparent';
  }
  return (
    <button
      type="button"
      className="titlebar-button"
      aria-label={ariaLabel}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onClick}
    >
      <img
        src={icon}
        alt={ariaLabel}
      />
    </button>
  );
}
WindowActionButton.propTypes = {
  ariaLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
};

class Titlebar extends React.Component {
  constructor() {
    super();
    this.state = {
      // in tauri.config.json, we set the window to not be maximized by default
      maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg',
    };
  }

  render() {
    const { maximizeIcon } = this.state;
    return (
      <div data-tauri-drag-region className="titlebar">
        <WindowActionButton
          ariaLabel="minimize"
          onClick={() => { appWindow.minimize(); }}
          icon="https://api.iconify.design/mdi:window-minimize.svg"
        />
        <WindowActionButton
          ariaLabel="maximize"
          onClick={() => {
            appWindow.toggleMaximize();
            appWindow.isMaximized().then((isMaximized) => {
              if (isMaximized) {
                this.setState({ maximizeIcon: 'https://api.iconify.design/mdi:window-maximize.svg' });
                return;
              }
              this.setState({ maximizeIcon: 'https://api.iconify.design/mdi:window-restore.svg' });
            });
          }}
          icon={maximizeIcon}
        />
        <WindowActionButton
          ariaLabel="close"
          onClick={() => { appWindow.close(); }}
          icon="https://api.iconify.design/mdi:close.svg"
        />
      </div>
    );
  }
}

export default Titlebar;
