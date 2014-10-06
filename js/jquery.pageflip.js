;(function($){
  var isTransitionSupported = isCssTransitionSupported();
  $.fn.pageflip = function(options){
    var defaultOptions = {
      keyboardShortCuts: false,
      quickFlip: false,
      touchGesture: false,
      touchPlugin: null
    };
    
    var mergedOptions = $.extend({}, defaultOptions, options);
    
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
      element.addClass("pageFlipWrapper");
      originalCards = element.children();
      originalCardsCount = originalCards.length;
      
      buildOriginalCardContainer();
      moveOriginalCardsToContainer();
      buildVisualContainer();
      populateVisiblePages();
      buildPagerContainer();
      
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
      
      if (mergedOptions.keyboardShortCuts) {
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
      }
      
      if (mergedOptions.touchGesture && mergedOptions.touchPlugin) {
        var touchPlugin = mergedOptions.touchPlugin;
        switch (touchPlugin) {
          case 'jquerymobile':
            var pages = visualContainer.children();
            pages.on("swipeleft", showNextSlide);
            pages.on("swiperight", showPrevSlide);
            break;
          case 'hammer':
            var pages = visualContainer.children().hammer();
            pages.on("swipeleft", showNextSlide);
            pages.on("swiperight", showPrevSlide);
            break;
          case "toe":
            var pages = visualContainer.children();
            var handleSwipe = function (e) {
              var direction = e.direction;
              if (direction === "left") {
                showNextSlide(e);
              } else if (direction === "right") {
                showPrevSlide(e);
              }
              return false;
            };
            pages.on('swipe', handleSwipe);
            break;
          case "doubletap":
            var pages = visualContainer.children();
            pages.addSwipeEvents().on('swipeleft', showNextSlide).on("swiperight", showPrevSlide);
            break;
          default:
            console.warn("The touch plugin is not supported yet.", touchPlugin);
            break;
        }
      }
      
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
        
        if(!isTransitionSupported) {
          transitionProgressObject.element.trigger("transitionend");
        }
        return false;
      });
      
      /**
       * Add event listener for the transition end event.
       * @param {Event} e
       * @return {Boolean} false
       */
      visualContainer.children().on("transitionend", function(e) {
        console.log("transition end........,", e.target, e);
        if (transitionProgressObject.element && transitionProgressObject.slideType === "next") {
          visualContainer.append(transitionProgressObject.element);
        }
        var pageElement = $(e.target) || transitionProgressObject.element;
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
        if (!mergedOptions.quickFlip) {
          return false;
        }
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
        if (!mergedOptions.quickFlip) {
          return false;
        }
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
      //visualContainer.trigger("transitionend");
      transitionProgressObject.element.trigger("transitionend");
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
      visualContainer = $("<div class='displayContainer'></div>");
      element.append(visualContainer);
    }
    
    /**
     * Create a new container to place all these pages.
     */
    function buildOriginalCardContainer() {
      originalCardContainer = $("<div class='originalPagesContainer'></div>");
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
    
    function buildPagerContainer() {
      var pagerContainer = $("<div class='pagerContainer'></div>");
      prevBtn = $("<a href='#' class='prevBtn'>Previous Button</a>");
      nextBtn = $("<a href='#' class='nextBtn'>Next Button</a>");
      pagerContainer.append(prevBtn);
      pagerContainer.append(nextBtn);
      element.append(pagerContainer);
    }

    init();
    return element;
  };
  
  /**
   * Autorun.
   */
  $(function(){
    var touchPlugin = null;
    if ($.fn.hammer) {
      touchPlugin = "hammer";
    } else if ($.mobile) {
      touchPlugin = "jquerymobile";
    } else if ($.toe) {
      touchPlugin = "toe";
    } else if ($.fn.addSwipeEvents) {
      touchPlugin = "doubletap";
    }
    $(".pageFlipWrapper").pageflip({
      keyboardShortCuts: true,
      quickFlip: true,
      touchGesture: true,
      touchPlugin: touchPlugin
    });
  });
  
  /**
   * Normalize the transition end event name across browers.
   * @return {String|NULL}
   */
  function transitionEndEventName() {
    var i,
        undefined,
        el = document.createElement('div'),
        transitions = {
            'transition':'transitionend',
            'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
            'MozTransition':'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        };

    for (i in transitions) {
        if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
            return transitions[i];
        }
    }
    return null;
    //TODO: throw 'TransitionEnd event is not supported in this browser'; 
  }
  
  /**
   * Check for CSS transition support.
   * @return {Boolean}
   */
  function isCssTransitionSupported() {
    return !!transitionEndEventName();
  }
})(jQuery);