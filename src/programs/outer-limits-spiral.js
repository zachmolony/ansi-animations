/**
@author goatloaf
@title  Chroma Spiral
@desc   Shadertoy port
Inspired by this shader by scry
https://www.shadertoy.com/view/tdsyRf
*/

import { map } from "/src/modules/num.js";
import { sort } from "/src/modules/sort.js";
import { vec2, rot, add, mulN, addN, subN, length } from "/src/modules/vec2.js";

const { min, sin, cos, floor } = Math;

// const ASCII_LOGO = [
//   "                                                     ^:                                               ",
//   "                                                   .~.                                               ",
//   "                                .#G    G&.         JG&.      ~~:.:~57                               ",
//   "                                ~7@5  ~7@G        ~.:@5     7@.     :                               ",
//   "                               :^ ?@^.~ ~@7      .:  5@~    .G&&G?:                                 ",
//   "                               !   G@J   5@:     ?!BJ.#@       :7P&&5                               ",
//   "                              ~.    #:    #&    !~^.  .@G  .P      B@.                              ",
//   "                             ^~           .@5  ~^      7@? 7#7:..:~5:                               ",
//   "                             .. ....:7      .  ?J:     :5Y     ...                                  ",
//   "                   .!?Y~    7&#:... .^:        G@@.    B@@.         P@B^^^^^^:                      ",
//   "       ..:~777?5B!  7@@^     @@               ?:7@#   J:5@G         #@!      !#7       ....         ",
//   "   5GJ~^?@@Y    .^   &@Y     #@^ .!7^        ^7  B@J ^!  &@!       :@&        G@7   !G57^::~!7:     ",
//   "  :G.    G@&         ?@&     Y@BYBY^.        Y   .@@7?   :@@.      5@Y        B@P ~&@~       .PG    ",
//   "         :@@!        .@@~    ~@B            ?.    !@&     J@B      &@~       Y@G ~@@^         .@B   ",
//   "          G@&         B@B    .@&        .  ~~      P^      #@7    ~@&:::^^^!J?.  G@G           @@:  ",
//   "          :@@~        !@@.    @@^ ....^GY ^Y               :@@~   #@J            !@Y          ?@&   ",
//   "           G@#        ^@@G.  .!!:......^  ..                :::  .!?~             J&.        ?@&:   ",
//   "           !@@Y.      ..                                                           :J7^....~GB!     ",
//   "           ^~:.                                                                       .^^^^:.       ",
//   "                                                                                                    ",
// ];

const ASCII_LOGO = [
  " @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
  " @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@",
  "                 @@@@@@@@@@    @@@@@    @@@@@@@@@@                 ",
  "              @@@@@@@@         @@@@@        @@@@@@@@@              ",
  "            @@@@@@@@@@@@       @@@@@         @@@@@@@@@             ",
  "           @@@@@@@@@@@@@@      @@@@@         @@@@@@@@@@            ",
  "          @@@@@@ @@@@@@@@@     @@@@@         @@@@@ @@@@@           ",
  "         @@@@@@  @@@@(@@@@@@   @@@@@         @@@@@  @@@@@          ",
  "         @@@@    @@@@  @@@@@@@ @@@@@         @@@@@                 ",
  "         @@@@    @@@@    @@@@@@@@@@@         @@@@@                 ",
  "         @@@     @@@@     @@@@@@@@@@         @@@@@                 ",
  "        @@@@     @@@@       @@@@@@@@         @@@@@                 ",
  "        @@@@     @@@@        ,@@@@@@         @@@@@                 ",
  "        @@@@     @@@@          @@@@@@        @@@@@                 ",
  "         @@@     @@@@          @@@@@@@@      @@@@@                 ",
  "         @@@@    @@@@          @@@@@@@@@@    @@@@@                 ",
  "         @@@@.   @@@@          @@@@@@@@@@@/  @@@@@   @@@@@         ",
  "         @@@@@@  @@@@          @@@@@ @@@@@@  @@@@@  @@@@@          ",
  "          @@@@@@ @@@@          @@@@@  @@@@@@ @@@@@ @@@@@           ",
  "           @@@@@@@@@@@         @@@@@    @@@@@@@@@@@@@@@            ",
  "            @@@@@@@@@@@@       @@@@@      @@@@@@@@@@@@             ",
  "              @@@@@@@@@@@      @@@@@      @@@@@@@@@@@              ",
  "                 @@@@@@@@@@@@  @@@@@  @@@@@@@@@@@@                 ",
  "                    @@@@@@@@@@@@@@@@@@@@@@@@@@@                    ",
  "                       @@@@@@@@@@@@@@@@@@@@                         ",
];

const charMapping = [
  {
    " ": " ",
    "!": "|",
    "#": "=",
    "&": "+",
    ".": "*",
    5: "S",
    7: "M",
    ":": ";",
    "?": "/",
    "@": "*",
    B: "8",
    G: "S",
    J: "1",
    P: "4",
    Y: "V",
    "^": ">",
    "~": "-",
  },
  // {
  // ' ': '°',  // A small circle or degree symbol.
  // '!': '†',  // Dagger.
  // '#': '¤',  // Currency.
  // '&': '×',  // Multiplication.
  // '.': '•',  // Bullet.
  // '5': '%',
  // '7': '|',
  // ':': '÷',  // Division.
  // '?': '¿',  // Inverted question mark.
  // '@': '©',  // Copyright.
  // 'B': 'ß',  // German esszett.
  // 'G': '¢',  // Cent.
  // 'J': '*',
  // 'P': '¶',  // Pilcrow.
  // 'Y': '¥',  // Yen.
  // '^': '¨',  // Diaeresis.
  // '~': '¬'   // Negation.
  // }
];

const getCharFromLogo = (x, y, index, color, isBlack) => {
  const positionY = 10;
  const positionX = 35;

  if (y < positionY) return;
  if (x < positionX) return;
  y -= positionY;
  x -= positionX;

  const charFromSet =
    ASCII_LOGO[y] && ASCII_LOGO[y][x] ? ASCII_LOGO[y][x] : false;

  if ([false, " "].includes(charFromSet)) {
    return false;
  }

  // return charMapping?.[index % 3]?.[charFromSet] || charFromSet;
  // return charMapping?.[!isBlack ? 1 : 0]?.[charFromSet] || charFromSet;
  return charMapping[0][charFromSet];
};

const density = "$@B%.";
const colors = ["white", "red", "black", "black", "white", "white"];
// const logoColors = ["white", "white", "red", "white", "white"];
const bgColors = ["black", "black", "black", "black", "black", "black"];

export function main(coord, context, cursor, buffer) {
  const t = context.time * 0.0002;
  const m = min(context.cols, context.rows);
  const a = context.metrics.aspect;

  const st = {
    x: ((2.0 * (coord.x - context.cols / 2)) / m) * a,
    y: (2.0 * (coord.y - context.rows / 2)) / m,
  };

  for (let i = 0; i < 3; i++) {
    const o = i * 3;
    const v = vec2(sin(t * 3 + o), cos(t * 2 + o));
    add(st, v, st);

    const ang = -t + length(subN(st, 0.5));
    rot(st, ang, st);
  }

  mulN(st, 0.6, st);

  const s = cos(t) * 2.0;
  let c = sin(st.x * 3.0 + s) + sin(st.y * 6);
  c = map(sin(c * 0.5), -1, 1, 0, 1);

  const index = floor(c * (density.length - 1));
  const color = floor(c * (colors.length - 1));
  const bgColor = floor(c * (bgColors.length - 1));

  const mappedLogoChar = getCharFromLogo(
    coord.x,
    coord.y,
    index,
    color,
    bgColors[color] === "black"
  );
  const isLogoChar = !!mappedLogoChar;

  const getTransformedLogoChar = (mappedLogoChar, index) => {
    const logoChars = ["£", "$"];
    return logoChars[index % 2];
  };

  const finalCharacter = isLogoChar
    ? "$" // getTransformedLogoChar(mappedLogoChar, index)
    : density[index];

  return {
    char: finalCharacter,
    color: isLogoChar ? "white" : colors[color],
    backgroundColor: bgColors[bgColor],
  };
}

import { drawInfo } from "/src/modules/drawbox.js";
export function post(context, cursor, buffer) {
  // drawInfo(context, cursor, buffer)
}

export const settings = {
  fontWeight: 700,
};
