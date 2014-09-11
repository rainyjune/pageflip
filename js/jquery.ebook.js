; (function ($) {
  $.fn.ebook = function (options) {
    var defaultOptions = {};

    var mergedOptions = $.extend(defaultOptions, options);

    var element = $(this);
    var originalCard = null;
    var slideCards = null;
    var activeCard = null;
    var prevCard = null;
    var nextCard = null;
    var slideIsForward = null;
    var pageCount = 0;
    var pageIndex = 0;

    var topMostCard = null;
    var bottomMostCard = null;

    function init() {
      originalCard = element.children();
      pageIndex = 0;
      addDisplayContainer();
      moveOriginalPages();
      slideCards = $("#originalPagesContainer").children();
      pageCount = slideCards.length;
      populatePages();
      activeCard = $("#displayContainer div:nth-child(1)");
      bindEvents();
    }

    function moveOriginalPages() {
      var originalPagesContainer = $("<div id='originalPagesContainer'></div>");
      element.append(originalPagesContainer);
      originalCard.appendTo(originalPagesContainer);
    }

    function addDisplayContainer() {
      var originalPagesContainer = $("<div id='displayContainer'></div>");
      element.append(originalPagesContainer);
    }

    function populatePages() {
      var pageIndexs = mathGame(pageCount, pageIndex);
      console.log("pageindexs", pageIndexs);
      for (var i = 0; i < pageIndexs.length; i++) {
        var thisPage = $("#originalPagesContainer div:nth-child(" + pageIndexs[i] + ")");
        thisPage.clone().appendTo($("#displayContainer"));
      }
    }

    function updateZIndex(isForward) {
      isForward = typeof isForward != "undefined" ? isForward : true;
      var displayCardCount = $("#displayContainer").children();
      for (var i = 0, len = displayCardCount.length; i < len; i++) {
        var thisCard = displayCardCount[i];
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
          prevCard = $(bottomMostCard);
          activeCard = target;
        }

        console.log(slideIsForward ? "Forward" : "backward");
        console.log("Activecard:", activeCard[0].innerHTML);
        console.log("Previouscard:", prevCard[0].innerHTML);
      }
    }

    function mathGame(pageCount, pageIndex) {
      if (pageCount < 1 || pageIndex < 0 || pageIndex > pageCount - 1) {
        throw new Error("mathGame error");
      }
      var total = [];
      var start, end;
      for (var i = 0; i < pageCount; i++) {
        total.push(i+1);
      }
      if (pageIndex === 0) {
        start = 0;
        end = 3;
      } else if (pageIndex === pageCount - 1) {
        start = pageIndex - 2;
        end = pageCount;
      } else {
        start = pageIndex - 1 ;
        end = pageIndex + 2;
      }
      return total.slice(start, end);
    }

    init();
    return element;
  };
})(jQuery);