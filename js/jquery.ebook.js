; (function ($) {
  $.fn.ebook = function (options) {
    var defaultOptions = {};

    var mergedOptions = $.extend(defaultOptions, options);

    var element = $(this);
    var slideCards = element.children();
    var activeCard = null;
    var prevCard = null;
    var slideIsForward = null;
    var nextCard = null;

    var topMostCard = null;
    var bottomMostCard = null;

    function init() {
      activeCard = $(slideCards[0]);
      bindEvents();
    }

    function updateZIndex(isForward) {
      isForward = typeof isForward != "undefined" ? isForward : true;
      for (var i = 0, len = slideCards.length; i < len; i++) {
        var thisCard = slideCards[i];
        var thisZIndex = parseInt($(thisCard).css('z-index'));
        if (isForward) {
          thisZIndex = thisZIndex === 3 ? 1 : (thisZIndex + 1);
        } else {
          thisZIndex = thisZIndex === 1 ? 3 : (thisZIndex - 1);
        }
        $(thisCard).css('z-index', thisZIndex);
        if (thisZIndex === 3) {
          topMostCard = thisCard;
        } else if (thisZIndex === 1) {
          bottomMostCard = thisCard;
        }
      }
    }

    function setActiveCard(card) {
      activeCard = $(card);
    }

    function slideCard(isForward) {
      if (isForward) {
        activeCard.css("transform", "translateX(-1024px)");
      } else {
        updateZIndex(false);
        setTimeout(function () {
          $(prevCard).css("transform", "translateX(0px)");
          console.log("prev card:", prevCard[0].innerHTML);
        }, 0);
      }
    }

    function bindEvents() {
      element.on("transitionend", transitionend);
      $(".prevBtn").on("click", showPrevSlide);
      $(".nextBtn").on("click", showNextSlide);
    }

    function showPrevSlide(e) {
      e.preventDefault();
      slideIsForward = false;
      slideCard(false);
      return false;
    }

    function showNextSlide(e) {
      e.preventDefault();
      slideIsForward = true;
      slideCard(true);
      return false;
    }

    function transitionend(e) {
      console.log("Transition end!", e);
      var target = $(e.target);
      if (e.originalEvent.propertyName === "transform") {
        if (slideIsForward) {
          updateZIndex();
          prevCard = target;
          activeCard = $(topMostCard);
        } else {
          //prevCard = activeCard;
          prevCard = $(bottomMostCard);
          activeCard = target;
        }

        console.log(slideIsForward ? "Forward" : "backward");
        console.log("Activecard:", activeCard[0].innerHTML);
        console.log("Previouscard:", prevCard[0].innerHTML);
      }
    }

    init();
    return element;
  };
})(jQuery);