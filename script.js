












console.clear();

gsap.registerPlugin(ScrollTrigger);

window.addEventListener("load", () => {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".wrapper",
        start: "top top",
        end: "+=150%",
        pin: true,
        scrub: true,
        markers: false
      }
    })
    .to("img", {
      scale: 2,
      z: 250,
      transformOrigin: "center center",
      ease: "power1.inOut"
    })
    .to(
      ".section.hero",
      {
        scale: 1.2,
        transformOrigin: "center center",
        ease: "power1.inOut"
      },
      "<"
    );
});


//darken bg on scroll - jQuery
//cannot figure out how to get the same effect using GSAP,
//if you do, please let me know :D

$(document).ready(function() {
   $.fn.darkenScroll = function() {
    var elem = $( this );
    self = this;

    $(window).on('scroll', function(){
      scroll = $(document).scrollTop();
      offsetTop = elem.offset().top + elem.outerHeight();
      opacity = 1 / offsetTop * scroll;
      if (opacity > 0 && opacity < 1) {
        elem.css({'box-shadow': '10000px 0 0 0 rgba(0,0,0,' + opacity + ') inset'});
      }
    })
  }
  $('.section.hero').darkenScroll();
})