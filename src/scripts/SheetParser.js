var chordParser = require('./ChordParser').default,

sheetParser = {};

function validChords(chords) {
    var isValid = true;
    for (var item of chords) {
      var chord = chordParser.parse(item.chord);
      if (!chord) {
        isValid = false;
        break;
      }
    }
    return isValid;
}

function parseChordProMetaData(text) {
    var curlyOpenBracket = text.indexOf("{");
    var curlyCloseBracket = text.indexOf("}");
    var musicLine = null;
    if (curlyOpenBracket > -1) { //this line is considered a chordPro meta data
      var chordProMetaLine = "";
      if (curlyCloseBracket > -1) {
        chordProMetaLine = text.substring(curlyOpenBracket + 1, curlyCloseBracket);
      } else {
        chordProMetaLine = text.substring(curlyOpenBracket + 1);
      }
      var data = chordProMetaLine.split(":");
      
      if (data.length === 1) {
        musicLine = {type:"ChordProMeta", field: "unknown", value: data[0].trim()};
      } else {
        musicLine = {type:"ChordProMeta", field: data[0].trim(), value: data.slice(1).join(":").trim()};
      }
    }
    return musicLine;
}

function splitString(text) {
    var words = [];
    var word = "";
    for (var i in text) {
      var ch = text[i];

      if (ch.trim().length != 0) {
        word += ch;
      } else {
        if (word.length > 0) {
          words.push({chord: word, pos: i - word.length});
          word = "";
        }                
      }
    } 
    if (word.length > 0) {
      words.push({chord: word, pos: i});
      word = "";
    }
    return words;
}

function reduce(sheet) {
    let metaData = {};
    let unknown = [];
    let lines = [];
    for (var i=0; i < sheet.length; ++i) {
        var line = sheet[i];
        if (line.type === "ChordProMeta") {
            if (line.field === "unknown") {
                unknown.push(line.value);
            } else {
                metaData[line.field] = line.value;
            }
        } else if (line.type === "ChordLyrics") {
            var text = "";
            if (line.chords.length === line.lyrics.length) {
                text = "";
                for (var j = 0; i < line.chords.length; ++j) {
                    line.chords[j].pos = text.length;
                    text += line.lyrics[j];
                }
            } else {
                text = line.lyrics[0].trimLeft();
                var numCharRemoved = line.lyrics[0].length - text.length;
                line.lyrics[0] = text;
                for (var j = 1; j < line.lyrics.length; ++j) {
                    line.chords[j-1].pos = text.length;
                    text += line.lyrics[j];
                }
            }
            lines.push({type:"ChordLyrics", chords:line.chords, lyrics:text});
        } else if (line.type === "Info") {
            line.data = line.data.trim();
            lines.push(line);
        } else if (line.type === "Chord") {
            var nextLine = null;
            if (i + 1 < sheet.length) var nextLine = sheet[i+1];
            if (nextLine && nextLine.type === "Lyrics") {
                var text = nextLine.data.trimLeft();
                var numCharRemoved = nextLine.data.length - text.length;
                for (var chord of line.chords) {
                    chord.pos -= numCharRemoved;
                }
                lines.push({type:"ChordLyrics", chords:line.chords, lyrics:text });
                ++i;
            } else {
                lines.push(line);
            }
        } else if (line.type === "Lyrics") {
            lines.push({type:"ChordLyrics", chords:[], lyrics:line.data});
        }
    }

    if (unknown.length > 0) metaData["unknown"] = unknown;
    var result = {metaData: metaData, lines: lines}
    return result;
}

sheetParser.parse = function(chordSheet) {
    chordSheet = chordSheet.split(/\r?\n/)
    var song = [];
    for (var line of chordSheet) {
      var chord = "";
      var lyric = "";
      var parseChord = false;
      line = line.trimRight();
      if (line.length === 0) continue;
      var chords = [];
      var lyrics = [];
      for (var i in line) {
        var ch = line[i];
        if (ch === '[') {
          lyrics.push(lyric);
          parseChord = true;
          chord = "";
        } else if (ch === ']') {
          lyric = "";
          parseChord = false;
          chords.push({pos: i, chord: chord})
        } else {
          if (parseChord) {
            chord += ch;
          } else {
            lyric += ch;
          }
        }
      }
      if (lyric.length !== 0) lyrics.push(lyric); 
      song.push({chords: chords, lyrics: lyrics, originalLine: line});
    }

    //now get line types
    var sheet = [];
    
    for (var line of song) {
      var musicLine = { type: "Info"};
      if (line.chords.length == 0 && line.lyrics.length == 0) continue;
      if (line.chords.length == 0) {
        // this line has no square brackets
        var text = line.lyrics[0];
        var musicLine = parseChordProMetaData(text);
        if (musicLine) {
            sheet.push(musicLine);
            continue;
        }

        var words = splitString(text);
        
        //check if all the words are chords ???
        var valid = validChords(words);
        if (!valid) {
          musicLine = {type: "Lyrics", data: line.originalLine};
        } else {
          musicLine = {type: "Chord", chords: words };
        }
      } else {
        // this line has a mix of lyrics and chords
        //check if all the chords are really chords
        var valid = validChords(line.chords);
        if (!valid) {
          musicLine = {type:"Info", data: line.originalLine};
        } else {
          musicLine = {type:"ChordLyrics", chords: line.chords, lyrics: line.lyrics};
        }
      }
      sheet.push(musicLine);
    }

    var sheet = reduce(sheet);
    return sheet;
  }

  
export default sheetParser;