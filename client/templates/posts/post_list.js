Template.postsList.rendered = function () {

  this.find('.wrapper')._uihooks = {

    insertElement: function (node, next) {

      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn();

    },

    moveElement: function (node, next) {

      var $node = $(node),
        $next = $(next),
        oldTop = $node.offset().top,
        height = $node.outerHeight(true),

        // find elements in between next and node
        $inBetween = $next.nextUntil(node);

      if ($inBetween.length === 0) {
        $inBetween = $node.nextUntil(next);
      }

      // now put node in place
      $node.insertBefore(next);

      // measure new top
      var newTop = $node.offset().top;

      // move node back to wher is was before
      $node
        .removeClass('animate')
        .css('top', oldTop - newTop);

      // push every other element down (or up) to put them back
      $inBetween
        .removeClass('animate')
        .css('top', oldTop < newTop ? height : height * -1);

      // force a redraw
      $node.offset();

      // reset everything to 0, animated
      $node
        .addClass('animate')
        .css('top', 0);

      $inBetween
        .addClass('animate')
        .css('top', 0);

    },

    removeElement: function (node) {

      $(node)
        .fadeOut(function () {
          $(this).remove();
        });
    }

  };

};
