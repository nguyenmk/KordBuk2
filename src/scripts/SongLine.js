class Line{
  constructor(lineText, lineChords, lineType) {
    let arr = [];
    if (lineType === "Info") {
      for (let ch of lineText) {
        arr.push({char:ch, chord:null});
      }
    } else if (lineType === "Chord") {
      for (let chord of lineChords) {
        arr.push({char:" ", chord: this.chordParser.parse(chord.chord)});
        arr.push({char:" ", chord:null});
      }
    } else if (lineType === "ChordLyrics") {
      let lastChordPos = 0;
      for (let chord of lineChords) {
        for (let i = lastChordPos; i < chord.pos; ++i) arr.push({char: lineText[i], chord: null});
        arr.push({char: lineText[chord.pos], chord: this.chordParser.parse(chord.chord)});
        lastChordPos = chord.pos + 1;
      }
      for (let i = lastChordPos; i < lineText.length; ++i) arr.push({char: lineText[i], chord: null});
    }

    this.type = lineType;
    this.data = arr;
    this.sel = null;

    return this;
  }
}

class Lyrics{
  constructor(song) {
    let data = [];
    for (let line of song.lines) {
      let lineObj = new Line(line);
      if (lineObj) data.push(new Line(line));
    }
    this.content = data;
    return this;    
  }

  // get line
  line(lineNumber) {
    if (!lineNumber || lineNumber >= this.content.length || lineNumber < 0) return null;
    return this.content[lineNumber];
  }
  
  setSelection(selection) {
    let line = this.line(selection.line);
    if (selection.line >= this.content.length || selection.line < 0 || line == null) return;
    line.sel = selection;
  }

  //remove selected text
  remSelection(selection) {
    let line = this.line(selection.line);
    if (!line) return;
    if (selection.end != -1) line.splice(sel.start, sel.end - sel.start);
    else line.splice(sel.start);
  }
  
  //remove line by line number
  remLine(lineNumber) {
    this.data.splice(lineNumber, 1);
  }
  
  //add new line
  addLine(newItem, lineNumber) {
    let line = this.line(lineNumber);
    if (!line) this.data.push(newItem);
    this.data.splice(lineNumber, 0, newItem);
  }
}