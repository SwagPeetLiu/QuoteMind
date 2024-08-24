import bootstrap from "bootstrap/dist/js/bootstrap";

// initialization of Tooltips
export default function setTooltip() {
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  // eslint-disable-next-line no-unused-vars
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl,{
      template: '<div class="tooltip my-n3" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner bg-gradient-dark"></div></div>'
    });
  });
}
