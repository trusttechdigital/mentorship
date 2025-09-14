import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ label, checked, onChange }) => {
  return (
    <div className="toggle-switch">
      <label>
        <input type="checkbox" checked={checked} onChange={onChange} />
        <span className="slider round"></span>
        {label}
      </label>
    </div>
  );
};

export default ToggleSwitch;