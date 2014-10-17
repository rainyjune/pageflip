$(function () {
  var a = $(".wrapper").pageflip({
    keyboardShortCuts: true,
    quickFlip: true,
    touchGesture: true,
    touchPlugin: 'zepto',
    dataPageUrlList:[
      'htmlfiles/page1.html',
      'htmlfiles/page2.html',
      'htmlfiles/page3.html',
      'htmlfiles/page4.html',
      'htmlfiles/page5.html',
    ]
  });
});