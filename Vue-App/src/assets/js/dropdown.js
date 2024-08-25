import { createPopper } from '@popperjs/core';

export default function initializePopper(buttonSelector, dropdownSelector, arrowSelector, options = {}) {
  const button = document.querySelector(buttonSelector);
  const dropdown = document.querySelector(dropdownSelector);
  const arrow = document.querySelector(arrowSelector);

  if (!button || !dropdown || !arrow) {
    console.error('Elements not found');
    return null;
  }

  const defaultOptions = {
    strategy: 'absolute',
    placement: 'bottom-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [1, 1],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
          altAxis: true,
        },
      },
      {
        name: 'flip',
        options: {
          padding: 8,
        },
      },
      {
        name: 'computeStyles',
        options: {
          adaptive: false,
          gpuAcceleration: false,
        },
      },
      {
        name: 'arrow',
        options: {
          padding: 5,
          element: arrow,
        },
      },
    ],
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return createPopper(button, dropdown, mergedOptions);
}