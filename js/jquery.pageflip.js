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
      element: null,
      callBack: null
      };
    
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
        if (eventInfo === "next") {
          currentPageIndex++;
        } else {
          currentPageIndex--;
        }
        updatePager();
        return false;
      });
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
        return false;
      }
      var currentPageElement = $('div[data-pageId="'+(currentPageIndex+1)+'"]');
      visualContainer.trigger("transition_start", "next");
      
      slidePageElement(currentPageElement, function() {
        visualContainer.append(currentPageElement);
        populateVisiblePages();
      }, 'next');
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
        return false;
      }
      var currentPageElement = $('div[data-pageId="'+(currentPageIndex)+'"]');
      visualContainer.trigger("transition_start", "previous");
      
      visualContainer.prepend(currentPageElement);
      slidePageElement(currentPageElement, function() {
        populateVisiblePages();
      },'previous');
      return false;
    }
    
    /**
     * Slide the page DOM element.
     * @param {DOMElement} pageElement The Dom element be slided.
     * @param {Function} slideCallBack The function called after transtiion end.
     * @param {String} slideType The slide type, should be 'next' or 'previous'.
     * 
     */
    function slidePageElement(pageElement, slideCallBack, slideType) {
      if (slideType=="next") {
        pageElement.addClass("transition slideLeft");
        tempFunc(pageElement, slideCallBack);
      } else {
        pageElement.css("transform", "translateX(-1024px)"); 
        
        setTimeout(function(){
          pageElement.addClass("transition slideRight");
          tempFunc(pageElement, slideCallBack);
        }, 0);
      }
      
    }
    
    function tempFunc(pageElement, slideCallBack){
      cancelTransition();
      
      transitionProgressObject.element = pageElement;
      transitionProgressObject.callBack = slideCallBack;
      
      pageElement.one("transitionend", cancelTransition);
    }
    
    /**
     * Cancel page slide transition.
     */
    function cancelTransition(){
      if (transitionProgressObject && transitionProgressObject.element) {
        var pageElement = transitionProgressObject.element;
        pageElement.css("transform", "initial");
        pageElement.removeClass("transition").removeClass("slideRight").removeClass("slideLeft");
        
        pageElement.off("transitionend");
        transitionProgressObject.callBack();
        transitionProgressObject.element = null;
        transitionProgressObject.callBack = null;
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
      try {
        var visiblePageIds = mathGame(currentPageIndex);
        var requiredPages = getRequiredPages(visiblePageIds);
        fetchPagesAndPopulate(requiredPages);
      } catch (e) {
        
      }
    }
    
    /**
     * Include required pages and then populate them into div#displayContainer element.
     * @param {Array} pageIds
     * @return {Undefined}
     */
    function fetchPagesAndPopulate(pageIds) {
      console.log("Fetch", pageIds);
      $.each(pageIds, function(index, id){
        var thisPage = originalCardContainer.children().eq(id-1).clone();
        thisPage.attr("data-pageId", id);
        // TODO 
        //visualContainer.append(thisPage);
        if (visualContainer.children().length === 3) {
          var visiblePageIds = getVisiblePageIds();
          
          var currentPageId = currentPageIndex + 1;
          var notReachableId = findNotReachableNumber(currentPageId, visiblePageIds);
          var toBeReplacedElement = $("div[data-pageId='"+notReachableId+"']");
          
          console.log("To be replaced:", notReachableId);
          if (notReachableId===null) {
            debugger;
            //code
          }
          //debugger;
          //visualContainer.children().eq(1).replaceWith(thisPage);
          toBeReplacedElement.replaceWith(thisPage);
        } else {
          visualContainer.append(thisPage);
        }
      });
    }
    
    /**
     * Returns Ids of pages that should be in the div#displayContainer element but have not included yet.
     * @param {Array} pageIds All Ids of pages that in the div#displayContainer element.
     * @return {Array}
     */
    function getRequiredPages(pageIds) {
      var result = [];
      $.each(pageIds, function(index, id){
        if (visualContainer.find("div[data-pageId='"+id+"']").length === 0) {
          result.push(id);
        }
      });
      return result;
    }
    
    /**
     * Returns Ids of pages which are should be in the div#displayContainer element.
     * @param {Number} pageIndex
     * @return {Array}
     */
    function mathGame(pageIndex) {
      pageIndex = parseInt(pageIndex);
      var pageCount = originalCardsCount;
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
    
    /**
     * Get ids of pages which are in the div#displayContainer element.
     * @return {Array}
     */
    function getVisiblePageIds() {
      var result = [];
      $.each(visualContainer.children(), function(index, page){
        result.push(parseInt($(page).attr("data-pageId")));
      });
      return result;
    }
    
    /**
     * Get id of the page which should be replaced.
     * @param {Number} pageId
     * @param {Array} pageIdArray
     * @return {Number|Null}
     */
    function findNotReachableNumber(pageId, pageIdArray) {
      var result = null;
      pageId = parseInt(pageId);
      var ranges = getSiblingIds(pageId);
      for (var i = 0, len = pageIdArray.length; i < len; i++) {
        var thisPageId = parseInt(pageIdArray[i]);
        if ($.inArray(thisPageId, ranges) == -1) {
          result = thisPageId;
          break;
        }
      }
      if (result==null) {
        debugger;
      }
      return result;
    }
    
    /**
     * Get sibling page Ids.
     * 
     * @param {Number} pageIndex The page Id.
     * @return {Array}
     */
    function getSiblingIds(pageIndex) {
      pageIndex = parseInt(pageIndex);
      var pageCount = originalCardsCount;
      if (pageCount < 1 || pageIndex < 1 || pageIndex > pageCount) {
        throw new Error("siblings error");
      }
      var total = [];
      var start, end;
      for (var i = 0; i < pageCount; i++) {
        total.push(i+1);
      }
      if (pageIndex === 1) {
        start = 0;
        end = 3;
      } else if (pageIndex === pageCount ) {
        start = pageIndex - 3;
        end = pageCount;
      } else {
        start = pageIndex - 2 ;
        end = pageIndex + 1;
      }
      return total.slice(start, end);
    }
    init();
    return element;
  };
})(jQuery);