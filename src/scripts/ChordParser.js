
var chordParser = {};

var ROOT_PATTERN = '(?<key>[A-G](#|b)?)';
var SUFFIX_PATTERN = '(?<suffix>\\(?(M|maj|major|m|min|minor|dim|sus|dom|aug)?(\\+|-|add)?(6/9)?\\d*\\)?)';
var BASS_PATTERN = '(\\/(?<bass>[A-G](#|b)?))?';

let XRegExp = require("xregexp");
chordParser.CHORD_REGEX = XRegExp("^" + ROOT_PATTERN + SUFFIX_PATTERN + BASS_PATTERN + "$");

class MusicKey {
  constructor(keyFlat, semitoneScale, keySharp) {
    this.flat = keyFlat;
    this.value = semitoneScale;
    this.sharp = keySharp;
  }
}

class MusicKeys {
  constructor() {
    this.keys = {};
    this.index = {};
  }
  addKey(keyFlat, semitoneScale, keySharp) {
    if (keyFlat) {
      this.keys[keyFlat] = new MusicKey(keyFlat, semitoneScale, keySharp);
      if (keySharp) this.keys[keySharp] = this.keys[keyFlat];
      this.index[semitoneScale] = this.keys[keyFlat];
    }
    return this;
  }

  getKey(keyName, numSemitones) {
    if (numSemitones) {
      return this.index[this.mod(this.keys[keyName].value + numSemitones,12)];
    } else {
      return this.keys[keyName];
    }
  }

  
  mod(x, n) { //compute x % n, works with positive and negative values of x
    return (x % n + n) % n;
  }
}

let semiTones = new MusicKeys();
semiTones.addKey("C", 0).addKey("Db", 1, "C#").addKey("D",2).addKey("Eb",3,"D#")
          .addKey("E",4).addKey("F",5).addKey("Gb",6,"F#").addKey("G",7)
          .addKey("Ab",8,"G#").addKey("A",9).addKey("Bb",10,"A#").addKey("B",11);

chordParser.db = require('@tombatossals/chords-db/src/db').default;

let suffixIndices = {}
suffixIndices.ukulele = {};
suffixIndices.guitar = {};
for (let i in chordParser.db.ukulele.suffixes) {
  suffixIndices.ukulele[chordParser.db.ukulele.suffixes[i]] = i;
}
for (let i in chordParser.db.guitar.suffixes) {
  suffixIndices.guitar[chordParser.db.guitar.suffixes[i]] = i;
}


function properSuffix(suffix) {
  if (suffix === "") suffix = "major";
  else if (suffix === "m") suffix = "minor";
  return suffix; 
}
function shortSuffix(suffix) {
  if (suffix === "major") suffix = "";
  else if (suffix === "minor") suffix = "m";
  return suffix;
}
chordParser.getSuffixIndex = function(instrument, suffix) {
  return suffixIndices[instrument][properSuffix(suffix)];
}
chordParser.parse = function(chordText) {
  let result = XRegExp.exec(chordText, this.CHORD_REGEX);
  if (!result) return null;
  return {key: result.key, suffix: result.suffix, bass: result.bass};
};  
chordParser.getChord = function(instrument, key, suffix, bass) {
  key = key.replace("#","sharp");
  let chord = this.db[instrument].chords[key][this.getSuffixIndex(instrument, suffix)];
  return {key: chord.key, suffix: chord.suffix, bass: bass};
}
chordParser.text = function(chord) {
  let str = "";
  if (chord) {
    str = chord.key + shortSuffix(chord.suffix);
    if (chord.bass) str += "/" + chord.bass;
    return str;
  } else return " ";
}

chordParser.transpose = function(chord, num_semitones, isSharp) {
  if (chord) {
    let isGetSharp = (isSharp)? isSharp: false;
    let newKey = semiTones.getKey(chord.key, num_semitones);
    chord.key = (isGetSharp && chord.sharp)? newKey.sharp: newKey.flat;
  }
  return chord;
}

export default chordParser;
  