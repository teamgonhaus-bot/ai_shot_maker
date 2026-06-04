import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function BrutalistSelect({ value, onChange, options, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(o => (typeof o === 'object' ? o.value : o) === value) || options[0];
  const selectedLabel = typeof selectedOption === 'object' ? selectedOption.label : selectedOption;

  const accentColor = 'var(--accent-color)';
  const borderColor = isDarkMode ? '#FFFFFF' : accentColor;
  const bgColor = isDarkMode ? '#1C1C1E' : '#F8F8FF';
  const textColor = isDarkMode ? '#FFFFFF' : accentColor;
  const shadowColor = isDarkMode ? 'rgba(255,255,255,0.15)' : accentColor;

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 1000 : 1 }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: bgColor,
          color: textColor,
          border: `1.5px solid ${borderColor}`,
          borderRadius: '0px',
          fontWeight: 'bold',
          fontSize: '12px',
          textAlign: 'left',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isOpen ? `none` : `3px 3px 0px ${shadowColor}`,
          transform: isOpen ? 'translate(2px, 2px)' : 'none',
          transition: 'box-shadow 0.15s, transform 0.15s'
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              width: '100%',
              backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
              border: `1.5px solid ${borderColor}`,
              borderRadius: '0px',
              padding: 0,
              margin: 0,
              listStyle: 'none',
              boxShadow: `4px 4px 0px ${shadowColor}`,
              maxHeight: '220px',
              overflowY: 'auto',
              zIndex: 9999
            }}
          >
            {options.map((opt) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              const isSelected = optVal === value;

              return (
                <li key={optVal}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(optVal);
                      setIsOpen(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: isSelected 
                        ? (isDarkMode ? '#FFFFFF' : accentColor) 
                        : 'transparent',
                      color: isSelected 
                        ? (isDarkMode ? 'var(--accent-color)' : '#FFFFFF') 
                        : (isDarkMode ? '#FFFFFF' : '#1C1C1E'),
                      border: 'none',
                      borderRadius: '0px',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'background-color 0.15s, color 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = isDarkMode ? 'rgba(255,255,255,0.08)' : 'color-mix(in srgb, var(--accent-color) 5%, transparent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    {optLabel}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
