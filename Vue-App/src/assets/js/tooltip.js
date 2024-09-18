import bootstrap from "bootstrap/dist/js/bootstrap";
import { Tooltip } from 'bootstrap';

function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));

  tooltipTriggerList.forEach((tooltipTriggerEl) => {
    new bootstrap.Tooltip(tooltipTriggerEl, {
      template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner bg-gradient-dark"></div></div>',
      popperConfig: (defaultBsPopperConfig) => {
        return {
          ...defaultBsPopperConfig,
          modifiers: [
            ...defaultBsPopperConfig.modifiers,
            {
              name: 'offset',
              options: {
                offset: [0, -8], // Adjust this value as needed
              },
            },
            {
              name: 'preventOverflow',
              options: {
                padding: 0,
              },
            },
            {
              name: 'flip',
              options: {
                padding: 0,
              },
            },
          ],
        };
      },
    });
  });
}

function removeExistingTooltips() {
  const existingTooltips = [].slice.call(document.querySelectorAll('.tooltip'));
  existingTooltips.forEach((tooltip) => {
    const tooltipInstance = Tooltip.getInstance(tooltip);
    if (tooltipInstance) {
      tooltipInstance.dispose();
    }
    tooltip.remove();
  });
}

module.exports = { initTooltips, removeExistingTooltips };