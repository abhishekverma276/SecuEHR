


import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import './QuickAccessButtons.css';

/**
 * QuickAccessButtons - A reusable component for displaying quick navigation buttons
 * 
 * @param {Object[]} buttons - Array of button objects with name and link properties
 * @returns {JSX.Element} - Rendered component
 */
const QuickAccessButtons = ({ buttons }) => {
  // If no buttons are provided, don't render anything
  if (!buttons || buttons.length === 0) {
    return null;
  }

  return (
    <div className="quick-access-container">
      <h3 className="quick-access-title">Quick Access</h3>
      <div className="quick-access-buttons">
        {buttons.map((button, index) => (
          <Link 
            key={index} 
            to={button.link} 
            className="quick-access-btn"
          >
            {button.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

// PropTypes for type checking
QuickAccessButtons.propTypes = {
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired
    })
  ).isRequired
};

export default QuickAccessButtons;
