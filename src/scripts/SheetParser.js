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
  // split string into words, 
  // keep track of the position of the first character of each word in the string
  var words = [];
  var word = "";
  for (let i = 0; i < text.length; ++i) {
    var ch = text[i];
    if (ch === " ") {
      if (word.length > 0) {
        words.push({chord: word, pos: i - word.length});
        word = "";
      }                
    } else word += ch;
  } 
  if (word.length > 0) {
    words.push({chord: word, pos: text.length - word.length});
  }
  return words;
}

// combine a chord line and its next lyric line into one chord-lyric line
function reduce(sheet) {  
  let maxLineCharacter = 50;
  let metaData = {};
  let unknown = [], lines = [];
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
        let offset = 0;
        if (line.chords.length > 0) offset = line.chords[0].pos;
        for (let chord of line.chords) chord.pos -= offset;
        lines.push({type:"ChordLyrics", chords:line.chords, lyrics:" ".repeat(maxLineCharacter)});
      }
    } else if (line.type === "Lyrics") {
      lines.push({type:"ChordLyrics", chords:null, lyrics:line.data});
    }
  }

  metaData["unknown"] = unknown;
  return {metaData: metaData, lines: lines}
}

sheetParser.parse = function(chordSheet) {
    chordSheet = chordSheet.split(/\r?\n/); //split the text into lines
    let maxLineLength = 0;

    // remove all the white space at the end of each line
    for (let i in chordSheet) {
      chordSheet[i] = chordSheet[i].trimRight();
      if (maxLineLength < chordSheet[i].length) maxLineLength = chordSheet[i].length;
    }

    //parsing each line, separating chords from text if possible
    let song = [];
    for (let line of chordSheet) {
      let chord = "", text = "";
      let parseChord = false;
      let chords = [];
      for (let i in line) {
        let ch = line[i];
        if (ch === '[') { // i.e. start of a chord
          parseChord = true;
          chord = "";
        } else if (ch === ']') { // i.e. end of a chord
          parseChord = false;
          chords.push({pos: text.length, chord: chord})
        } else {
          (parseChord)? chord += ch : text +=ch; 
        }
      }
      song.push({chords: chords, text: text, originalLine: line});
    }

    //now get line types
    let sheet = [];
    
    for (let i=0; i < song.length; ++i) {
      let line = song[i];
      let musicLine = {};
      if (line.chords.length == 0 && line.text.length == 0) continue;
      if (line.chords.length == 0) {
        // this line has no square brackets, i.e. it is a chord-only, or text-only line
        let text = line.text;

        //try parsing it as a chord pro meta data line
        musicLine = parseChordProMetaData(text);
        if (musicLine) {
            sheet.push(musicLine);
            continue;
        }

        let words = splitString(text);
        
        if (!validChords(words)) { // unrecognized chords, consider this line lyric line
          musicLine = {type: "Lyrics", data: line.originalLine};
        } else {
          musicLine = {type: "Chord", chords: words };
        }
      } else { // this line has some square brackets        
        if (line.text.trim().length == 0) { // empty-line text, i.e. this line seems to have only chords          
          if (!validChords(line.chords)) { // unrecognized chords, consider it as Info line
            musicLine = {type:"Info", data: line.originalLine};
          } else {
            musicLine = {type:"Chord", chords: line.chords, text: line.text};
          }
        } else { // lyric-and-chord line
          if (!validChords(line.chords)) { // unrecognized chords, consider it as Info line
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