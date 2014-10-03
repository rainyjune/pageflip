;(function($){
  $.fn.pageflip = function(){
    var element = $(this);
    
    var originalCards = null,
        originalCardsCount = 0;
        
    var visualContainer = null,
        originalCardContainer = null;
        
    var currentPageIndex = 0;
    
    var prevBtn = null,
        nextBtn = null;
    
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
    }
    
    function showNextSlide(e) {
      e.preventDefault();
      if (currentPageIndex == originalCardsCount-1) {
        alert("The is the last page.");
        return false;
      }
      
      // Move current page to bottom most
      visualContainer.append($('div[data-pageid="'+(currentPageIndex+1)+'"]'));
      currentPageIndex++;
      populateVisiblePages();
      
      updatePager();
      return false;
    }
    
    function showPrevSlide(e) {
      e.preventDefault();
      if (currentPageIndex == 0) {
        alert("The is the first page.");
        return false;
      }
      
      // Move current page to bottom most
      visualContainer.prepend($('div[data-pageid="'+(currentPageIndex)+'"]'));
      currentPageIndex--;
      populateVisiblePages();
      
      updatePager();
      return false;
    }
    
    
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
    
    function buildVisualContainer() {
      visualContainer = $("<div id='displayContainer'></div>");
      element.append(visualContainer);
    }
    
    function buildOriginalCardContainer() {
      originalCardContainer = $("<div id='originalPagesContainer'></div>");
      element.append(originalCardContainer);
    }
    
    function moveOriginalCardsToContainer() {
      originalCardContainer.append(originalCards);
    }
    
    function populateVisiblePages() {
      var visiblePageIds = mathGame(currentPageIndex);
      var requiredPages = getRequiredPages(visiblePageIds);
      fetchPagesAndPopulate(requiredPages);
    }
    
    function fetchPagesAndPopulate(pageIds) {
      console.log("Fetch", pageIds);
      $.each(pageIds, function(index, id){
        var thisPage = originalCardContainer.children().eq(id-1).clone();
        thisPage.attr("data-pageId", id);
        // TODO 
        //visualContainer.append(thisPage);
        if (visualContainer.children().length === 3) {
          var visiblePageIds = getVisiblePageIds();
          
          var currentPageId = visualContainer.children().eq(0).attr("data-pageId");
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
    
    function getRequiredPages(pageIds) {
      var result = [];
      $.each(pageIds, function(index, id){
        if (visualContainer.find("div[data-pageId='"+id+"']").length === 0) {
          result.push(id);
        }
      });
      return result;
    }
    
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
    
    function getVisiblePageIds() {
      var result = [];
      $.each(visualContainer.children(), function(index, page){
        result.push($(page).attr("data-pageId"));
      });
      return result;
    }
    
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
      return result;
    }
    
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