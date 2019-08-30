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
    for (let i=0; i < sheet.length; ++i) {
      let line = sheet[i];
        if (line.type === "ChordProMeta") {
            if (line.field === "unknown") {
                unknown.push(line.value);
            } else {
                metaData[line.field] = line.value;
            }
        } else if (line.type === "ChordLyrics") {
          let text = "";
          if (line.chords.length === line.lyrics.length) {
              text = "";
              for (let j = 0; i < line.chords.length; ++j) {
                  line.chords[j].pos = text.length;
                  text += line.lyrics[j];
              }
          } else {
              text = line.lyrics[0].trimLeft();
              line.lyrics[0] = text;
              for (let j = 1; j < line.lyrics.length; ++j) {
                  line.chords[j-1].pos = text.length;
                  text += line.lyrics[j];
              }
          }
          lines.push({type:"ChordLyrics", chords:line.chords, lyrics:text});
        } else if (line.type === "Info") {
            line.data = line.data.trim();
            lines.push(line);
        } else if (line.type === "Chord") {
          let nextLine = null;
          if (i + 1 < sheet.length) nextLine = sheet[i+1];
          if (nextLine && nextLine.type === "Lyrics") {
            let text = nextLine.data.trimLeft();
            let numCharRemoved = nextLine.data.length - text.length;
            for (let chord of line.chords) {
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
    return {metaData: metaData, lines: lines}
}

sheetParser.parse = function(chordSheet) {
    chordSheet = chordSheet.split(/\r?\n/);
    let maxLineLength = 0;
    for (let i in chordSheet) {
      chordSheet[i] = chordSheet[i].trimRight();
      if (maxLineLength < chordSheet[i].length) maxLineLength = chordSheet[i].length;
    }

    let song = [];
    for (let line of chordSheet) {
      console.log('line', line);
      let chord = "", lyric = "";
      let parseChord = false;
      let chords = [], lyrics = [];
      for (let i in line) {
        let ch = line[i];
        if (ch === '[') {
          lyrics.push(lyric);
          parseChord = true;
          chord = "";
        } else if (ch === ']') {
          lyric = "";
          parseChord = false;
          chords.push({pos: i, chord: chord})
          console.log('i', i);
        } else {
          (parseChord)? chord += ch: lyric +=ch;          
        }
      }
      if (lyric.length !== 0) lyrics.push(lyric); 
      song.push({chords: chords, lyrics: lyrics, originalLine: line});
    }
    console.log('song', song);
    //now get line types
    let sheet = [];
    
    for (let line of song) {
      let musicLine = { type: "Info"};
      if (line.chords.length == 0 && line.lyrics.length == 0) continue;
      if (line.chords.length == 0) {
        // this line has no square brackets
        let text = line.lyrics[0];
        musicLine = parseChordProMetaData(text);
        if (musicLine) {
            sheet.push(musicLine);
            continue;
        }

        let words = splitString(text);
        
        //check if all the words are chords ???
        let valid = validChords(words);
        if (!valid) {
          musicLine = {type: "Lyrics", data: line.originalLine};
        } else {
          musicLine = {type: "Chord", chords: words };
        }
      } else {
        // this line has a mix of lyrics and chords
        //check if all the chords are really chords
        let valid = validChords(line.chords);
        if (!valid) {
          musicLine = {type:"Info", data: line.originalLine};
        } else {
          musicLine = {type:"ChordLyrics", chords: line.chords, lyrics: line.lyrics};
        }
      }
      sheet.push(musicLine);
    }

    return reduce(sheet);
  }

  
export default sheetParser;