$(document).ready(function() {
  $("DIV#palette .square").addClass("palette").draggable({"helper": "clone", "zIndex": 9999});

  var width = 10;
  var height = 10;
  var $table = $("DIV.layer > table").first().empty();
  for (var h = 0; h < height; h++) {
    var $trow = $(document.createElement("TR")).attr("data-y", h);
    for (var w = 0; w < width; w++) {
      var $tcell = $(document.createElement("TD")).attr("data-x", w).droppable({
        accept: ".square",
        tolerance: "pointer",
        drop: function(ev, ui) {
          // ToDo: first unhook any circuits attached

          // ToDo: Specialty dropping:
          // 1. re-map circuitry
          // 2. auto orient
          // 3. dropping ontop of a "block" should add to the next layer
          // 4. fetch correct initial circuit (repeaters should be delay=1)
          // 5. If moving a square on the board, put an empty where the ui.draggable was unless the source=destination
          // 6. Add a rotate option to direction oriented squares
          // 7. Step the power for the new square once based on surrounding squares (trickier when multiple layers are added), do not propigate
          // 8. re-route wire as necessary
          //

          if ($(ui.draggable).hasClass("palette")) {
            var dropsq = ui.draggable.clone();
            dropsq.removeClass("palette");
            if (dropsq.hasClass("empty")) {
              $(dropsq).draggable("destroy").removeClass("ui-draggable");
            } else {
              $(dropsq).draggable({"helper": "clone", "zIndex": 9999})
                .dblclick(function() {
                  $(this).toggleClass("powered");

                });
            }
            $(this).empty().append(dropsq);
          } else {
            // ToDo: better method for copying in an empty square when moving other squares
            $(ui.draggable).closest("TD").append($(document.createElement("DIV")).addClass("square empty"));
            $(this).empty().append(ui.draggable);
          }
        }
      });
      $(document.createElement("DIV")).addClass("square empty").appendTo($tcell);
      $trow.append($tcell);
    }
    $table.append($trow);
  }

  $("#flop").click(function() {
    $("DIV#stage .square").each(function() {
      $(this).toggleClass("powered");
    });
  });

  $("DIV#palette, DIV#stage, DIV#controlBox").draggable();
});
