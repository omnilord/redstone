$(document).ready(function() {
  $("DIV#palette .square").addClass("palette").draggable({"helper": "clone", "zIndex": 9999});

  var width = 10;
  var height = 10;
  var $table = $("DIV#stage TABLE").first().empty();
  for (var h = 0; h < height; h++) {
    var $trow = $(document.createElement("TR")).attr("data-y", h);
    for (var w = 0; w < width; w++) {
      var $tcell = $(document.createElement("TD")).attr("data-x", w).droppable({
        accept: ".square",
        tolerance: "pointer",
        drop: function(ev, ui) {
          if ($(ui.draggable).hasClass("palette")) {
            var $el = ui.draggable.clone();
            $el.removeClass("palette");
            $(this).empty().append($el);
            if ($el.is('[data-type]')) {
              var domEl = $el.get(0);
              var redstone;
              switch ($el.attr('data-type')) {
                case 'empty':
                  redstone = EmptyBlock(); break;
                case 'block':
                  redstone = Block(); break;
                case 'circuit':
                  redstone = Circuit(); break;
                case 'torch':
                  redstone = Torch(); break;
                case 'memoryCell':
                  redstone = MemoryCell(); break;
                case 'pressurePlate':
                  redstone = PressurePlate(); break;
                case 'lever':
                  redstone = Lever(); break;
                case 'button':
                  redstone = Button(); break;
                case 'repeater':
                  redstone = Repeater(); break;
                case 'noteblock':
                  redstone = NoteBlock(); break;
                case 'piston':
                  redstone = Piston(); break;
                case 'stickyPiston':
                  redstone = StickyPiston(); break;
                default:
              }
              if (typeof redstone !== "undefined") {
                $.extend(domEl, redstone);
                domEl.onDrop();
              }
              if ($el.attr('data-type') !== 'empty') {
                $el.draggable({"helper": "clone", "zIndex": 9999});
              }
            }
          } else {
            var $emptyDiv = $(document.createElement("DIV")).addClass("square").attr('data-type', 'empty');
            var redstone = EmptyBlock();
            var domEmptyDiv = $emptyDiv.get(0);
            $.extend(domEmptyDiv, redstone);
            $(ui.draggable).closest("TD").empty().append($emptyDiv);
            if (domEmptyDiv.onDrop) { domEmptyDiv.onDrop(); }
            $(this).empty().append(ui.draggable);
            if (ui.draggable.get(0).onDrop) { ui.draggable.get(0).onDrop(); }
          }
        }
      });
      $(document.createElement("DIV")).addClass("square").attr('data-type', 'empty').appendTo($tcell);
      $trow.append($tcell);
    }
    $table.append($trow);
  }

  $("#flop").click(function() {
    $("DIV#stage .square").each(function() {
      $(this).toggleClass("powered");
    });
  });

  $("BODY > DIV").draggable();
});
// ToDo: Specialty dropping:
// 1. re-map circuitry
// 2. auto orient
// 3. dropping ontop of a "block" should add to the next layer
// 4. fetch correct initial circuit (repeaters should be delay=1)
// 5. If moving a square on the board, put an empty where the ui.draggable was unless the source=destination
// 6. Add a rotate option to direction oriented squares
// 7. Step the power for the new square once based on surrounding squares (trickier when multiple layers are added), do not propigate
// 8. re-route wire as necessary


var Component = function(componentExtension) {
  var newComponent = {
    gates: {
      north: undefined,
      south: undefined,
      east: undefined,
      west: undefined,
      up: undefined,
      down: undefined
    },
    sources: [], // Which gates are providing power to this circuit
    onPowerOff: function(fromDirection) {},
    onPowerOn: function(fromDirection) {},
    onDrop: function() {
      var $this = $(this);
      var x = parseInt($this.closest("TD").attr("data-x"));
      var y = parseInt($this.closest("TR").attr("data-y"));
      var z = parseInt($this.closest("TABLE").attr("data-z"));

      var north = (typeof this.gates.north !== 'undefined' ? this.gates.north : $('DIV#stage TABLE[data-z="'+z+'"] TR[data-y="'+(y - 1)+'"] > TD[data-x="'+x+'"] > DIV').get(0));
      var south = (typeof this.gates.south !== 'undefined' ? this.gates.south : $('DIV#stage TABLE[data-z="'+z+'"] TR[data-y="'+(y + 1)+'"] > TD[data-x="'+x+'"] > DIV').get(0));
      var east  = (typeof this.gates.east  !== 'undefined' ? this.gates.east  : $('DIV#stage TABLE[data-z="'+z+'"] TR[data-y="'+y+'"] > TD[data-x="'+(x + 1)+'"] > DIV').get(0));
      var west  = (typeof this.gates.west  !== 'undefined' ? this.gates.west  : $('DIV#stage TABLE[data-z="'+z+'"] TR[data-y="'+y+'"] > TD[data-x="'+(x - 1)+'"] > DIV').get(0));
      var up    = (typeof this.gates.up    !== 'undefined' ? this.gates.up    : $('DIV#stage TABLE[data-z="'+(z - 1)+'"] TR[data-y="'+y+'"] > TD[data-x="'+x+'"] > DIV').get(0));
      var down  = (typeof this.gates.down  !== 'undefined' ? this.gates.down  : $('DIV#stage TABLE[data-z="'+(z + 1)+'"] TR[data-y="'+y+'"] > TD[data-x="'+x+'"] > DIV').get(0));
      if (typeof north !== "undefined") {
        if (north.addDirection) {
          if (north.addDirection("south", this)) { this.addDirection("north", north); }
        }
      }
      if (typeof south !== "undefined") {
        if (south.addDirection) {
          if (south.addDirection("north", this)) { this.addDirection("south", south); }
        }
      }
      if (typeof east  !== "undefined") {
        if (east.addDirection) {
          if (east.addDirection("west", this)) { this.addDirection("east", east); }
        }
      }
      if (typeof west  !== "undefined") {
        if (west.addDirection) {
          if (west.addDirection("east", this)) { this.addDirection("west", west); }
        }
      }
      if (typeof up    !== "undefined") {
        if (up.addDirection) {
          if (up.addDirection("down", this)) { this.addDirection("up", up); }
        }
      }
      if (typeof down  !== "undefined") {
        if (down.addDirection) {
          if (down.addDirection("up", this)) { this.addDirection("down", down); }
        }
      }
    },
    addDirection: function(direction, which) {
      switch (direction) {
        case "north":
        case "south":
        case "east":
        case "west":
          this.gates[direction] = which;
          return this.retile();
        case "up":
        case "Down":
          this.gates[direction] = which;
        default:
      }
      return false;
    },
    retile: function() {
      var newClass = this._retile();
      if (newClass !== "") {
        $(this).attr('data-face', newClass);
        return true;
      }
      return false;
    },
    removeDirection: function(direction) {
      this.addDirection(direction, null);
    }
  };
  $.extend(newComponent, componentExtension);
  return newComponent;
};

var EmptyBlock = function(td) {
  return new Circuit({
  });
}


var Block = function() {
  return new Circuit({
  });
}


var Circuit = function() {
  return new Component({
    _retile: function() {
      var gn = this.gates.north;
      var gs = this.gates.south;
      var ge = this.gates.east;
      var gw = this.gates.west;
      var gu = this.gates.up;
      var gd = this.gates.down;
      if (gn !== undefined && ge !== undefined && gs !== undefined && gw !== undefined) return "cross";
      if (gn !== undefined && ge !== undefined && gs !== undefined) return "teast";
      if (gn !== undefined && ge !== undefined && gw !== undefined) return "tnorth";
      if (gn !== undefined && gs !== undefined && gw !== undefined) return "twest";
      if (ge !== undefined && gs !== undefined && gw !== undefined) return "tsouth";
      if (gn !== undefined && ge !== undefined) return "cornerNE";
      if (gn !== undefined && gw !== undefined) return "cornerNW";
      if (gs !== undefined && gw !== undefined) return "cornerSW";
      if (gs !== undefined && ge !== undefined) return "cornerSE";
      if (gn !== undefined || gs !== undefined) return "vertical";
      if (ge !== undefined || gw !== undefined) return "horizontal";
      return "";
    },
    poop: function() {
      console.log("this is a poop.");
    }
  });
}


var Torch = function() {
  return new Circuit({
  });
}


var MemoryCell = function() {
  return new Circuit({
  });
}


var PressurePlate = function() {
  return new Circuit({
  });
}


var Lever = function() {
  return new Circuit({
  });
}


var Button = function() {
  return new Circuit({
  });
}


var Repeater = function() {
  return new Circuit({
  });
}


var NoteBlock = function() {
  return new Circuit({
  });
}


var Piston = function() {
  return new Circuit({
  });
}


var StickyPiston = function() {
  return new Circuit({
  });
}
