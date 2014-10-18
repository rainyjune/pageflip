/**
 * Displays a collection, such as a set of photos, one item at a time.
 * @author rainyjune<rainyjune@live.cn>
 */
;(function(factory){
  if (typeof define === "function" && define.cmd) {
    define(function(require, exports, module){
      var $ = require('http://js.eju.com/gallery/zepto/1.1.3/zepto.js');;
      factory($);
    });
  } else {
    var $ = window.jQuery ? jQuery  : Zepto;
    factory($);
  }
}(function($){
  var isTransitionSupported = isCssTransitionSupported();
  var pageflip = function(element, options){
    this.element = element;
    var defaultOptions = {
      keyboardShortCuts: false,
      quickFlip: false,
      touchGesture: false,
      touchPlugin: null,
      dataPageUrlList: null
    };
    
    var mergedOptions = $.extend({}, defaultOptions, options);
    
    //var element = $(this);
    
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
      
      // Handle page URLs.
      if (mergedOptions.dataPageUrlList && $.isArray(mergedOptions.dataPageUrlList) && mergedOptions.dataPageUrlList.length > 0 ) {
        ajaxLoadPages(mergedOptions.dataPageUrlList);
      }
      
      addListeners();
      updatePager();
    }
    
    /**
     * Include all the pages indicated by options.dataPageUrlList
     * @param {Array} pageList
     */
    function ajaxLoadPages(pageList) {
      var oldCount = originalCardsCount;
      var listCount = pageList.length;
      originalCardsCount += listCount;
      
      // Add place holder page container
      $.each(pageList, function(index, page){
        var i = index + 1;
        var pageNumber = oldCount + i;
        addPlaceHolderPage(pageNumber);
        requestPage(page, pageNumber);
      });
    }
    
    /**
     * Add a placeholder div for the page to be rendered.
     * @param {Number} pageNumber The page number, start from 1.
     */
    function addPlaceHolderPage(pageNumber) {
      var thisPage = $("<div data-pageId='" + pageNumber + "'></div>").addClass("page");
      var loadingDiv = "<div>Loading....</div>";
      thisPage.append(loadingDiv);
      visualContainer.prepend(thisPage);
    }
    
    /**
     * Request the sepcified page and then insert it into its container.
     * @param {String} page The URL of this page.
     * @param {Number} pageNumber The page number.
     */
    function requestPage(page, pageNumber) {
      $.ajax({
        type: 'GET',
        url: page,
        dataType: 'text',
        timeout: 3000,
        context: $('body'),
        success: function(data){
          $("div[data-pageId='"+pageNumber+"']").html(data);
        },
        error: function(xhr, type){
          alert('Ajax error!')
        }
      })
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
          case "zepto":
            var pages = visualContainer.children();
            pages.on("swipeLeft", showNextSlide);
            pages.on("swipeRight", showPrevSlide);
            break;
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
        var oldPageIndex = currentPageIndex;
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
        // Trigger the custom pageselected event.
        console.log('this.element', element);
        element.trigger({
          "type":'pageselected',
          "detail": {
            "oldPageIndex": oldPageIndex,
            "currentPageIndex": currentPageIndex,
            "element":transitionProgressObject.element
          }
        });
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
          visualContainer.prepend(transitionProgressObject.element);
        }
        var pageElement = $(e.target) || transitionProgressObject.element;
        if (pageElement) {
          // Remove the .transition CSS class before remove the transform CSS rule. !important!
          pageElement.removeClass("transition").removeClass("slideRight");
          pageElement.css({"-webkit-transform": "","transform": ""});
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
      
      var currentPageElement = element.find('div[data-pageId="'+(currentPageIndex+1)+'"]');
      
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
      
      var currentPageElement = element.find('div[data-pageId="'+(currentPageIndex)+'"]');
      
      visualContainer.append(currentPageElement);
      slidePageElement(currentPageElement, 'previous');
      return false;
    }
    
    /**
     * Cancel all transitions.
     */
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
      var screenWidth = $(window).width();
      if (slideType=="next") {
        pageElement.addClass("transition");
        pageElement.css({
          "-webkit-transform": "translateX(-"+screenWidth+"px)",
          "transform": "translateX(-"+screenWidth+"px)"
        });
        visualContainer.trigger("transition_start", {"slideType": slideType, "element": pageElement});
      } else {
        // Make sure the custom transition_start event is triggered first. Important!
        visualContainer.trigger("transition_start", {"slideType": slideType, "element": pageElement});
        pageElement.css({
          "-webkit-transform": "translateX(-"+screenWidth+"px)",
          "transform": "translateX(-"+screenWidth+"px)"
        });
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
        var thisPage = $(page).attr("data-pageId", index + 1).addClass("page");
        visualContainer.prepend(thisPage);
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
    
    this.next = function() {
      showNextSlide();
    };
    
    this.previous = function() {
      showPrevSlide();
    };
    
    this.count = function() {
      return originalCardsCount;
    };
    /**
     * Gets the index of the currently displayed page.
     */
    this.getCurrentPage = function() {
      return currentPageIndex + 1;
    };
    
    /**
     * Sets the index of the currently displayed page.
     */
    this.setCurrentPage = function(i) {
      var oldCurrentPageIndex = currentPageIndex;
      if (i > 0 && i <= originalCardsCount && i !== oldCurrentPageIndex + 1) {
        currentPageIndex = i - 1;
        goToPage(oldCurrentPageIndex, currentPageIndex);
      }
    };
    
    function goToPage(oldPageIndex, newPageIndex) {
      var pageId = newPageIndex + 1;
      var pages = visualContainer.children();
      var sortedArr = getPageStackOrder(pageId);
      pages.sort(function(a, b){
        var comA = $.inArray(parseInt($(a).attr("data-pageId")), sortedArr);
        var comB = $.inArray(parseInt($(b).attr("data-pageId")), sortedArr);
        return comA - comB;
      });
      cancelPageTransition();
      visualContainer.append(pages);
      updatePager();
    };
    
    function getPageStackOrder(pageId) {
      var arr = [];
      for(var i = originalCardsCount; i >0 ; i--) {
        arr.push(i);
      }
      var arrIndex = $.inArray(pageId, arr);
      if (arrIndex === -1) {
        alert("error");
        return arr;
      }
      var frag = arr.splice(arrIndex + 1);
      //alert(frag);
      arr.unshift(frag);
      //alert(arr);
      return arr;
    }

    init();
    //return element;
  };
  
  /**
   * Registers an event handler for the specified event.
   * The following custom event is supported: pageselected(Raised when flips to a page.)
   * @param {String} type The name of the event to handle.
   * @param {Function} listener The event handler function to associate with the event.
   * @return {Object}
   */
  pageflip.prototype.addEventListener = function(type, listener) {
    return this.element.on(type, listener);
  };
  
  /**
   * Raises an event of the specified type and with additional properties.
   * @param {String} type The type (name) of the event.
   * @param {Object} details The set of additional properties to be attached to the event object when the event is raised.
   * @return {Object}
   */
  pageflip.prototype.dispatchEvent = function(type, details) {
    return this.element.trigger(type, details);
  };
  
  /**
   * Removes an event handler for the specified event that the addEventListener method registered.
   * @param {String} type The name of the event.
   * @param {Function} listener The event handler function to remove.
   * @return {Object}
   */ 
  pageflip.prototype.removeEventListener = function(type, listener) {
    return this.element.off(type, listener);
  };
  
  window.PageFlip = pageflip;
  
  $.fn.pageflipPublic = function(options) {
    return this.each(function(){
      var thisZone = $(this);
      thisZone.pageflip(options);
    });
  };
  
  /**
   * Autorun.
   */
  $(function(){
    var touchPlugin = null;
    if ($.fn.swipeLeft) {
      touchPlugin = "zepto";
    } else if ($.fn.hammer) {
      touchPlugin = "hammer";
    } else if ($.mobile) {
      touchPlugin = "jquerymobile";
    } else if ($.toe) {
      touchPlugin = "toe";
    } else if ($.fn.addSwipeEvents) {
      touchPlugin = "doubletap";
    }
    $(".pageFlipWrapper").pageflipPublic({
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
}));