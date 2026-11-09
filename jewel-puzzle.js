/* Edit the destination, ordered colors, and physical button mapping here. */
(function(root) {
  'use strict';

  const DESTINATION = 'https://cshadwell.github.io/dragon-dungeon/';
  const SEQUENCE = ['white', 'yellow', 'green', 'blue', 'blue', 'yellow', 'red'];

  // Button IDs retain the original sound filenames.
  const BUTTON_COLORS = {
    'gem-purple': 'red',
    'gem-yellow': 'white',
    'gem-red': 'green',
    'gem-blue': 'blue',
    'gem-green': 'yellow'
  };

  function createMatcher() {
    let recent = [];
    function reset() {
      recent = [];
    }
    function press(color) {
      recent.push(color);
      recent = recent.slice(-SEQUENCE.length);
      const matched = recent.length === SEQUENCE.length &&
        SEQUENCE.every((expected, index) => recent[index] === expected);
      if (matched) reset();
      return matched;
    }
    return {press, reset};
  }

  const puzzle = {DESTINATION, SEQUENCE, BUTTON_COLORS, createMatcher};
  if (typeof module === 'object' && module.exports) module.exports = puzzle;
  else root.JewelPuzzle = puzzle;
})(typeof globalThis === 'object' ? globalThis : this);
