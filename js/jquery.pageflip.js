;(function($){
  $.fn.pageflip = function(){
    var element = $(this);
    
    var originalCards = null,
        originalCardsCount = 0;
        
    var visualContainer = null,
        originalCardContainer = null;
        
    // Current page index, zero based.
    var currentPageIndex = 0;
    
    var prevBtn = null,
        nextBtn = null;

    var transitionProgressObject = {
      slideType: null,
      element: null
      };
      
    var testCount = 0;
    var testTimer = null;
    
    /**
     * The init function.
     */
    function init() {
      originalCards = element.children();
      originalCardsCount = originalCards.length;
      
      buildOriginalCardContainer();
      moveOriginalCardsToContainer();
      buildVisualContainer();
      populateVisiblePages();
      
      prevBtn = $(".prevBtn");
      nextBtn = $(".nextBtn");
      
      addListeners();
      updatePager();
    }
    
    
    /**
     * Add event listeners for this plugin.
     *
     */
    function addListeners() {
      prevBtn.on("click", showPrevSlide);
      nextBtn.on("click", showNextSlide);
      
      $(document).keydown(function (e) {
        switch (e.which) {
          case 37: // left
            showPrevSlide(e);
            break;
          case 38: // up
            break;
          case 39: // right
            showNextSlide(e);
            break;
          case 40: // down
            break;
          default: return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
      });
      
      // There is no transitionstart event yet, we create this custome event handler.
      visualContainer.on("transition_start", function(e, eventInfo){
        if (eventInfo.slideType === "next") {
          currentPageIndex++;
        } else {
          currentPageIndex--;
        }
        transitionProgressObject.slideType = eventInfo.slideType;
        transitionProgressObject.element = eventInfo.element;
        updatePager();
        return false;
      });
      
      /**
       * Add event listener for the transition end event.
       * @param {Event} e
       * @return {Boolean} false
       */
      visualContainer.on("transitionend", function(e) {
        console.log("transition end........,", e.target, e);
        if (transitionProgressObject.element && transitionProgressObject.slideType === "next") {
          visualContainer.append(transitionProgressObject.element);
        }
        var pageElement = transitionProgressObject.element;
        if (pageElement) {
          // Remove the .transition CSS class before remove the transform CSS rule. !important!
          pageElement.removeClass("transition").removeClass("slideRight").removeClass("slideLeft");
          pageElement.css("transform", "");
        }
        
        resetTransitionProgressObject();
        return false;
      });
    }
    
    /**
     * Reset the variable transitionProgressObject.
     */
    function resetTransitionProgressObject() {
      transitionProgressObject = {
        slideType: null,
        element: null
      };
    }
    
    /**
     * Show the next page.
     * @param {Event} e The jQuery click event object.
     * @return {Boolean} false
     */
    function showNextSlide(e) {
      e && e.preventDefault();
      if (currentPageIndex === originalCardsCount-1) {
        alert("The is the last page.");
        /*
        testTimer = setInterval(showPrevSlide, 1);
        */
        return false;
      }
      
      if (!isTransitionFinished()) {
        console.log("not finished......., next");
        cancelPageTransition();
        //return false;
      }
      
      var currentPageElement = $('div[data-pageId="'+(currentPageIndex+1)+'"]');
      
      slidePageElement(currentPageElement, 'next');
      return false;
    }
    
    
    /**
     * Show the previous page.
     * @param {Event} e The jQuery click event object.
     * @return {Boolean} false
     */
    function showPrevSlide(e) {
      e && e.preventDefault();
      if (currentPageIndex === 0) {
        alert("The is the first page.");
        /*
        if (testTimer) {
          clearInterval(testTimer);
        }
        */
        return false;
      }
      
      if (!isTransitionFinished()) {
        console.log("not finished......., prev", transitionProgressObject.element);
        cancelPageTransition();
        //return false;
      }
      
      var currentPageElement = $('div[data-pageId="'+(currentPageIndex)+'"]');
      
      visualContainer.prepend(currentPageElement);
      slidePageElement(currentPageElement, 'previous');
      return false;
    }
    
    function cancelPageTransition() {
      // Do nothing if transition finished.
      if (isTransitionFinished()) { return false; }
      visualContainer.trigger("transitionend");
      return false;
    }
    
    /**
     * Check if there is a transition is in progress or not.
     * @return {Boolean} 
     */
    function isTransitionFinished() {
      return transitionProgressObject.element === null;
    }
    
    /**
     * Slide the page DOM element by updating its css rules.
     * @param {DOMElement} pageElement The Dom element be slided.
     * @param {String} slideType The slide type, should be 'next' or 'previous'.
     * 
     */
    function slidePageElement(pageElement, slideType) {
      if (slideType=="next") {
        pageElement.addClass("transition slideLeft");
        visualContainer.trigger("transition_start", {"slideType": slideType, "element": pageElement});
      } else {
        // Make sure the custom transition_start event is triggered first. Important!
        visualContainer.trigger("transition_start", {"slideType": slideType, "element": pageElement});
        pageElement.css("transform", "translateX(-1024px)");
        // We should specify a time interval other than zero. 
        setTimeout(function(){
          pageElement.addClass("transition slideRight");
        }, 100);
      }
    }
    
    /**
     * Update the previous, next button style.
     */
    function updatePager() {
      if (currentPageIndex <= 0) {
        prevBtn.addClass("disabledButton");
      } else {
        prevBtn.removeClass("disabledButton");
      }
      if (currentPageIndex >= originalCardsCount - 1) {
        nextBtn.addClass("disabledButton");
      } else {
        nextBtn.removeClass("disabledButton");
      }
    }
    
    /**
     * Create a new container to hold all the pages to be displayed.
     */
    function buildVisualContainer() {
      visualContainer = $("<div id='displayContainer'></div>");
      element.append(visualContainer);
    }
    
    /**
     * Create a new container to place all these pages.
     */
    function buildOriginalCardContainer() {
      originalCardContainer = $("<div id='originalPagesContainer'></div>");
      element.append(originalCardContainer);
    }
    
    /**
     * Move orignal pages into a new container.
     */
    function moveOriginalCardsToContainer() {
      originalCardContainer.append(originalCards);
    }
    
    /**
     * Populate required pages.
     *
     */    
    function populateVisiblePages() {
      $.each(originalCards, function(index, page){
        var thisPage = $(page).clone().attr("data-pageId", index + 1);
        visualContainer.append(thisPage);
      });
    }

    init();
    return element;
  };
})(jQuery);