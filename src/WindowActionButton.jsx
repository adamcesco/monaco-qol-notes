import React from 'react';
import PropTypes from 'prop-types';
import './Titlebar.css';

class WindowActionButton extends React.Component {
  constructor() {
    super();
    this.onEnterDefault = this.onEnterDefault.bind(this);
    this.onLeaveDefault = this.onLeaveDefault.bind(this);
    this.buttonRef = null;
  }

  onEnterDefault() {
    if (this.buttonRef === null) {
      return;
    }
    const { style } = this.buttonRef;
    const { onEnterColor } = this.props;
    style.backgroundColor = onEnterColor;
  }

  onLeaveDefault() {
    if (this.buttonRef === null) {
      return;
    }
    const { style } = this.buttonRef;
    style.backgroundColor = 'transparent';
  }

  render() {
    const {
      purposeLabel,
      onClick,
      icon,
    } = this.props;
    return (
      <button
        type="button"
        ref={(ref) => { this.buttonRef = ref; }}
        className="titlebar-button"
        aria-label={purposeLabel}
        onMouseEnter={this.onEnterDefault}
        onMouseLeave={this.onLeaveDefault}
        onFocus={this.onLeaveDefault}
        onBlur={this.onLeaveDefault}
        onClick={() => { onClick(); }}
      >
        <img
          src={icon}
          alt={purposeLabel}
        />
      </button>
    );
  }
}
WindowActionButton.propTypes = {
  purposeLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
  onEnterColor: PropTypes.string,
};
WindowActionButton.defaultProps = {
  onEnterColor: 'rgba(0, 0, 0, 0.1)',
};

export default WindowActionButton;
