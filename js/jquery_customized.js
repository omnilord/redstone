$.fn.extend({
  hasClasses: function (selectors, all) {
    var $self = $(this);
    var c = 0;
    for (var i in selectors) {
      if ($self.hasClass(selectors[i])) {
        if (!all || typeof all == "undefined") { return true; }
        c++;
      }
    }
    if (selectors.length == c) { return true; }
    return false;
  },
  hasAttr: function(attr) {
    if (typeof attr !== 'string') return false;
    return $(this).is('['+attr+']');
  }
});
