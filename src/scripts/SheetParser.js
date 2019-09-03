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
    if (curlyOpenBracket > -1 && text.substring(0, curlyOpenBracket).trim().length == 0) { //this line is considered a chordPro meta data line
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
    for (let i = 0; i < text.length; ++i) {
      var ch = text[i];

      if (ch !== " ") word += ch;
      else {
        if (word.length > 0) {
          words.push({chord: word, pos: i - word.length});
          word = "";
        }                
      }
    } 
    if (word.length > 0) {
      words.push({chord: word, pos: text.length - word.length});
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
        (line.field === "unknown") ? unknown.push(line.value): metaData[line.field] = line.value;
      } else if (line.type === "ChordLyrics") {
        let text = line.text.trimLeft();
        let offset = line.text.length - text.length;
        for (let ch of line.chords) ch.pos -= offset;
        lines.push({type:"ChordLyrics", chords:line.chords, lyrics:text});
      } else if (line.type === "Info") {
        lines.push({type:"Info", chords:null, lyrics:line.data.trim()});
      } else if (line.type === "Chord") {
        let nextLine = null;
        if (i + 1 < sheet.length) nextLine = sheet[i+1];
        if (nextLine && nextLine.type === "Lyrics") {
          let text = nextLine.data.trimLeft();
          let offset = nextLine.data.length - text.length;
          for (let chord of line.chords) chord.pos -= offset;
          lines.push({type:"ChordLyrics", chords:line.chords, lyrics:text });
          ++i;
        } else {
          lines.push({type:"Chord", chords:line.chords, lyrics:""});
        }
      } else if (line.type === "Lyrics") {
        lines.push({type:"ChordLyrics", chords:null, lyrics:line.data});
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
      let chord = "", text = "";
      let parseChord = false;
      let chords = [];
      for (let i in line) {
        let ch = line[i];
        if (ch === '[') {
          parseChord = true;
          chord = "";
        } else if (ch === ']') {
          parseChord = false;
          chords.push({pos: text.length, chord: chord})
        } else {
          (parseChord)? chord += ch: text +=ch; 
        }
      }
      song.push({chords: chords, text: text, originalLine: line});
    }

    //now get line types
    let sheet = [];
    
    for (let i=0; i < song.length; ++i) {
      let line = song[i];
      let musicLine = { type: "Info"};
      if (line.chords.length == 0 && line.text.length == 0) continue;
      if (line.chords.length == 0) {
        // this line has no square brackets, can be chords only, or text only
        let text = line.text;

        //try parsing it as a chord pro meta data line
        musicLine = parseChordProMetaData(text);
        if (musicLine) {
            sheet.push(musicLine);
            continue;
        }

        let words = splitString(text);
        
        //check if all items in words are chords ???
        let valid = validChords(words);
        if (!valid) {
          musicLine = {type: "Lyrics", data: line.originalLine};
        } else {
          musicLine = {type: "Chord", chords: words };
        }
      } else {
        if (line.text.trim().length == 0) {
          //this line seems to have only chords
          let valid = validChords(line.chords);
          if (!valid) { //unknown Chord, make it Info
            musicLine = {type:"Info", data: line.originalLine};
          } else {
            musicLine = {type:"Chord", chords: line.chords, text: line.text};
          }
        } else {
          // this line has a mix of text and chord. Check if all the chords are really chords
          let valid = validChords(line.chords);
          if (!valid) {
            musicLine = {type:"Info", data: line.originalLine};
          } else {
            musicLine = {type:"ChordLyrics", chords: line.chords, text: line.text};
          }
        }
      }
      sheet.push(musicLine);
    }

    return reduce(sheet);
  }

  
export default sheetParser;