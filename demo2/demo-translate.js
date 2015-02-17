updatePosition = function() {
  var heroBg = document.getElementById('hero-bg');
  var newPos = window.pageYOffset / 2;
  translateY(heroBg, newPos);
};

function translateY(elm, value) {
  var translate = 'translateY(' + value + 'px';
  elm.style['-webkit-transform'] = translate;
  elm.style['-moz-transform'] = translate;
  elm.style['-ms-transform'] = translate;
  elm.style['-o-transform'] = translate;
  elm.style.transform = translate;
}

$(document).ready(function() {
  $(window).on('scroll', updatePosition);
});