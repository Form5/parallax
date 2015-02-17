updatePosition = function() {
  var hero = document.getElementById('hero');
  var scrollPos = window.pageYOffset / 2;
  hero.style['background-position'] = '50% ' + scrollPos + 'px';
};

$(document).ready(function() {
  $(window).on('scroll', updatePosition);
});