/* eslint-disable */
export default async function setNavPills() {
  var total = document.querySelectorAll('.nav-pills');

  function initNavs() {
    total.forEach(function (item, i) {
      var existingMovingTabs = item.querySelectorAll('.moving-tab');
      if (existingMovingTabs) {
        for (var i = 0; i < existingMovingTabs.length; i++) {
          existingMovingTabs[i].remove();
        }
      }

      var moving_div = document.createElement('div');
      var active_li = item.querySelector('li .nav-link.active') || item.querySelector('li:first-child .nav-link');
      var tab = active_li.cloneNode();
      tab.innerHTML = "-";

      moving_div.classList.add('moving-tab', 'position-absolute', 'nav-link');
      moving_div.appendChild(tab);
      item.appendChild(moving_div);

      var list_length = item.getElementsByTagName("li").length;

      moving_div.style.padding = '0px';
      moving_div.style.width = active_li.offsetWidth + 'px';
      moving_div.style.transform = 'translate3d(' + active_li.offsetLeft + 'px, 0px, 0px)';
      moving_div.style.transition = '.5s ease';

      item.onmouseover = function (event) {
        let target = getEventTarget(event);
        let li = target.closest('li'); // get reference
        if (li) {
          let nodes = Array.from(li.closest('ul').children); // get array
          let index = nodes.indexOf(li) + 1;
          item.querySelector('li:nth-child(' + index + ') .nav-link').onclick = function () {
            moving_div = item.querySelector('.moving-tab');
            let sum = 0;
            if (item.classList.contains('flex-column')) {
              for (var j = 1; j <= nodes.indexOf(li); j++) {
                sum += item.querySelector('li:nth-child(' + j + ')').offsetHeight;
              }
              moving_div.style.transform = 'translate3d(0px,' + sum + 'px, 0px)';
              moving_div.style.height = item.querySelector('li:nth-child(' + j + ')').offsetHeight;
            } else {
              for (var j = 1; j <= nodes.indexOf(li); j++) {
                sum += item.querySelector('li:nth-child(' + j + ')').offsetWidth;
              }
              moving_div.style.transform = 'translate3d(' + sum + 'px, 0px, 0px)';
              moving_div.style.width = item.querySelector('li:nth-child(' + index + ')').offsetWidth + 'px';
            }
          }
        }
      }
    });
  }

  setTimeout(function () {
    initNavs();
  }, 250);

  // Tabs navigation resize

  window.addEventListener('resize', function (event) {
    total.forEach(function (item, i) {
      item.querySelector('.moving-tab').remove();
      var moving_div = document.createElement('div');
      var active_li = item.querySelector(".nav-link.active").parentElement;
      var tab = active_li.querySelector('.nav-link').cloneNode();
      tab.innerHTML = "-";

      moving_div.classList.add('moving-tab', 'position-absolute', 'nav-link');
      moving_div.appendChild(tab);

      item.appendChild(moving_div);

      moving_div.style.padding = '0px';
      moving_div.style.transition = '.5s ease';

      if (active_li) {
        let nodes = Array.from(active_li.closest('ul').children);
        let index = nodes.indexOf(active_li) + 1;

        let sum = 0;
        if (item.classList.contains('flex-column')) {
          for (var j = 1; j <= nodes.indexOf(active_li); j++) {
            sum += item.querySelector('li:nth-child(' + j + ')').offsetHeight;
          }
          moving_div.style.transform = 'translate3d(0px,' + sum + 'px, 0px)';
          moving_div.style.width = active_li.offsetWidth + 'px';
          moving_div.style.height = active_li.offsetHeight + 'px';
        } else {
          for (var j = 1; j <= nodes.indexOf(active_li); j++) {
            sum += item.querySelector('li:nth-child(' + j + ')').offsetWidth;
          }
          moving_div.style.transform = 'translate3d(' + sum + 'px, 0px, 0px)';
          moving_div.style.width = active_li.offsetWidth + 'px';
        }
      }
    });

    if (window.innerWidth < 991) {
      total.forEach(function (item, i) {
        if (!item.classList.contains('flex-column')) {
          item.classList.remove('flex-row');
          item.classList.add('flex-column', 'on-resize');
          let li = item.querySelector(".nav-link.active").parentElement;
          let nodes = Array.from(li.closest('ul').children); // get array
          let index = nodes.indexOf(li) + 1;
          let sum = 0;
          for (var j = 1; j <= nodes.indexOf(li); j++) {
            sum += item.querySelector('li:nth-child(' + j + ')').offsetHeight;
          }
          var moving_div = document.querySelector('.moving-tab');
          moving_div.style.width = item.querySelector('li:nth-child(1)').offsetWidth + 'px';
          moving_div.style.transform = 'translate3d(0px,' + sum + 'px, 0px)';

        }
      });
    } else {
      total.forEach(function (item, i) {
        if (item.classList.contains('on-resize')) {
          item.classList.remove('flex-column', 'on-resize');
          item.classList.add('flex-row');
          let li = item.querySelector(".nav-link.active").parentElement;
          let nodes = Array.from(li.closest('ul').children); // get array
          let index = nodes.indexOf(li) + 1;
          let sum = 0;
          for (var j = 1; j <= nodes.indexOf(li); j++) {
            sum += item.querySelector('li:nth-child(' + j + ')').offsetWidth;
          }
          var moving_div = document.querySelector('.moving-tab');
          moving_div.style.transform = 'translate3d(' + sum + 'px, 0px, 0px)';
          moving_div.style.width = item.querySelector('li:nth-child(' + index + ')').offsetWidth + 'px';
        }
      })
    }
  });

  // Function to remove flex row on mobile devices
  if (window.innerWidth < 991) {
    total.forEach(function (item, i) {
      if (item.classList.contains('flex-row')) {
        item.classList.remove('flex-row');
        item.classList.add('flex-column', 'on-resize');
      }
    });
  }

  function getEventTarget(e) {
    e = e || window.event;
    return e.target || e.srcElement;
  }
}