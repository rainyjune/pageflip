; (function ($) {
  $.fn.ebook = function (options) {
    var defaultOptions = {};

    var mergedOptions = $.extend(defaultOptions, options);

    var element = $(this);
    // Holds all original pages
    var originalCard = null;
    var activeCard = null;
    var prevCard = null;
    var nextCard = null;
    var slideIsForward = null;
    var pageCount = 0;
    var pageIndex = 0;

    var topMostCard = null;
    var bottomMostCard = null;

    var originalContainerName = "originalPagesContainer";
    var displayContainerName = "displayContainer";

    var originCardsContainer;
    var displayCardsContainer;

    function init() {
      originalCard = element.children();
      pageCount = originalCard.length;
      pageIndex = 0;

      addDisplayContainer();
      moveOriginalPages();
      populatePages();

      activeCard = $("#" + displayContainerName + " div:nth-child(1)");
      bindEvents();
    }

    /*
     * Move all original pages to a div.
     */
    function moveOriginalPages() {
      var originalPagesContainer = $("<div id='"+originalContainerName+"'></div>");
      element.append(originalPagesContainer);
      originalCard.appendTo(originalPagesContainer);
      originCardsContainer = $("#" + originalContainerName);
    }

    /*
     * Add a div to storage pages to be displayed.
     */
    function addDisplayContainer() {
      var originalPagesContainer = $("<div id='"+displayContainerName+"'></div>");
      element.append(originalPagesContainer);
      displayCardsContainer = $("#" + displayContainerName);
    }

    function populatePages() {
      var pageIndexs = mathGame(pageCount, pageIndex);
      console.log("pageindexs", pageIndexs);
      for (var i = 0; i < pageIndexs.length; i++) {
        var pageId = pageIndexs[i];
        // IF the specified page is not loaded yet
        if($("div[data-page='"+pageId+"']").length === 0) {
          console.log("NOT REQUIRED.....");
          var thisPage = $("#" + originalContainerName + " div:nth-child(" + pageId + ")");
          
          if (bottomMostCard) {
            console.log("bootomcard", bottomMostCard)
            $(bottomMostCard).attr('data-page', pageId).html(thisPage.clone().html());
            if (slideIsForward) {
              $(bottomMostCard).css("transform", "translateX(0px)");
            } else {
              $(bottomMostCard).css("transform", "translateX(-1024px)");
            }
          } else {
            thisPage.clone().attr('data-page', pageId).appendTo(displayCardsContainer);
          }
        } else {
          console.log("div#" + pageId + " is loaded already.");
        }
      }
    }

    function updateZIndex(isForward) {
      // UPDATE PAGES AFTER Z-INDEX Updated
      populatePages();


      isForward = typeof isForward != "undefined" ? isForward : true;
      var displayCardCount = displayCardsContainer.children();
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
        pageIndex++;
        activeCard.css("transform", "translateX(-1024px)");
      } else {
        pageIndex--;
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
      //console.log();
      var targetZIndex = target.css("z-index");
      if (targetZIndex != 3) {
        return;
      }
      if (e.originalEvent.propertyName === "transform") {
        if (slideIsForward) {
          updateZIndex(true);
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