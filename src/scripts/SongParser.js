import Vue from 'vue';

let chordParser = require('./ChordParser').default;

class Line{
  constructor(lineText, lineChords, lineType) {
    if (!lineChords && !lineType && !lineText) {
      this.type = null;
      this.data = null;
      this.sel = null;
      return this;
    }
    let arr = [];
    if (lineType === "Info") {
      for (let ch of lineText) {
        arr.push({char:ch, chord:null});
      }
    } else if (lineType === "Chord") {
      for (let chord of lineChords) {
        arr.push({char:" ", chord: chordParser.parse(chord.chord)});
        arr.push({char:" ", chord:null});
      }
    } else if (lineType === "ChordLyrics") {
      let lastChordPos = 0;
      for (let chord of lineChords) {
        for (let i = lastChordPos; i < chord.pos; ++i) arr.push({char: lineText[i], chord: null});
        arr.push({char: lineText[chord.pos], chord: chordParser.parse(chord.chord)});
        lastChordPos = chord.pos + 1;
      }
      for (let i = lastChordPos; i < lineText.length; ++i) arr.push({char: lineText[i], chord: null});
    }

    this.type = lineType;
    this.data = arr;
    this.sel = null;

    return this;
  }

  item(index) {
    if (!this.data || index == -1 || index > this.data.length) return null;
    return this.data[index];
  }

  getChord(index) {
    let item = this.item(index);
    if (item) return item.chord;
    return null;
  }

  setChord(index, newChord) {
    let item = this.item(index);
    if (item) item.chord = newChord;
  } 

  getCharacter(index) {
    let item = this.item(index);
    if (item) return item.char;
    return null;
  }

  setCharacter(index, newCharacter) {
    let item = this.item(index);
    if (item) item.char = newCharacter;
  }

  append(otherLine) {
    if (!otherLine) return;
    this.type = 'ChordLyrics';
    this.data.push(...otherLine.data);
    return true;
  }

  setSelection(newSelection) {
    if (!newSelection.hasOwnProperty('start') || !newSelection.hasOwnProperty('end')) return;
    if (newSelection.start === newSelection.end) {
      if (newSelection.start < 0 || newSelection.start > this.data.length) {
        newSelection.start = this.data.length;
        newSelection.end = newSelection.start;
      }
    } else {
      if (newSelection.start < 0) newSelection.start = 0;
      else if (newSelection.start > this.data.length) newSelection.start = this.data.length;
      if (newSelection.end < newSelection.start) newSelection.end = newSelection.start;
      else if (newSelection.end > this.data.length) newSelection.end = this.data.length;
    }
    this.sel = newSelection;
  }
}

class Lyrics{
  constructor(song) {
    let data = [];
    for (let line of song.lines) {
      let lineObj = new Line(line.lyrics, line.chords, line.type);
      if (lineObj) data.push(lineObj);
    }
    this.content = data;
    return this;    
  }

  // get line
  line(lineNumber) {
    if (lineNumber >= this.content.length || lineNumber < 0) return null;
    return this.content[lineNumber];
  }
  
  // get line data
  lineData(lineNumber) {
    let line = this.line(lineNumber);
    if (line) return line.data;
    return null;
  }

  getChord(lineNumber, characterNumber) {
    let line = this.line(lineNumber);
    if (line) return line.getChord(characterNumber);
    return null;
  }

  setChord(lineNumber, characterNumber, newChord) {
    let line = this.line(lineNumber);
    if (line) line.setChord(characterNumber, newChord);
  }

  getCharacter(lineNumber, characterNumber) {
    let line = this.line(lineNumber);
    if (line) return line.getCharacter(characterNumber);
    return null;
  }
  setCharacter(lineNumber, characterNumber) {
    let line = this.line(lineNumber);
    if (line) line.setCharacter(characterNumber);
  }

  setSelection(selection) {
    let line = this.line(selection.line);
    if (!line) return;
    line.setSelection(selection);
  }

  //remove selected text
  remSelection(selection) {
    let lineData = this.lineData(selection.line);
    if (!lineData) return;
    if (selection.end != -1) {
      lineData.splice(selection.start, selection.end - selection.start);
    }
    else {
      lineData.splice(selection.start);
    }
  }
  
  //remove line by line number
  remLine(lineNumber) {
    if (this.content.length === 1) {
      let lineData = this.lineData(lineNumber);
      if (lineData.length === 0) lineData.push({char: " ", chord: null});
      return false;
    }
    this.content.splice(lineNumber, 1);
    return true;
  }
  
  //add new line
  addLine(lineNumber, newItem) {
    this.content.splice(lineNumber, 0, newItem);
  }

  splitLine(lineNumber, characterPos) {
    let line = this.line(lineNumber);
    let newLine = new Line();
    newLine.type = line.type;
    newLine.data = line.data.slice(characterPos);
    if (newLine.data.length === 0) newLine.data.push({char:" ", chord:null});
    newLine.data.sel = null;
    this.remSelection({line: lineNumber, start: characterPos, end: -1});
    this.addLine(lineNumber + 1, newLine);
  }
}

let songParser = {};
songParser.parse = function(song) {
  return new Lyrics(song);
}
export default songParser;