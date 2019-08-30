
let songParser = {};

songParser.parse = function(song) {
  let data = [];
  for (let line of song.lines) {
    let arr = [];
    if (line.type === "Info") {
      for (let ch of line.data) {
        arr.push({char:ch, chord:null});
      }
    } else if (line.type === "Chord") {
      for (let chord of line.chords) {
        arr.push({char:" ", chord: this.chordParser.parse(chord.chord)});
        arr.push({char:" ", chord:null});
      }
    } else if (line.type === "ChordLyrics") {
      let lastChordPos = 0;
      for (let chord of line.chords) {
        for (let i = lastChordPos; i < chord.pos; ++i) arr.push({char: line.lyrics[i], chord: null});
        arr.push({char: line.lyrics[chord.pos], chord: this.chordParser.parse(chord.chord)});
        lastChordPos = chord.pos + 1;
      }
      for (let i = lastChordPos; i < line.lyrics.length; ++i) arr.push({char: line.lyrics[i], chord: null});
    }
    if (arr.length > 0) {
      data.push({textLine: arr, sel: null, type: line.type});
    }
  }
  let result = {data: data};
  result.line = function(line) {
    if (line >= this.data.length) line = this.data.length -1;
    if (line < 0) line = 0;
    return this.data[line].textLine;
  }
  result.setSel = function(sel) {
    if (sel.line >= this.data.length || sel.line < 0) return;
    this.data[sel.line].sel = sel;
  }
  result.remSel = function(sel) {
    if (sel.end != -1)
      this.line(sel.line).splice(sel.start, sel.end - sel.start);
    else
      this.line(sel.line).splice(sel.start);
  }
  result.remLine = function(lineNumber) {
    this.data.splice(lineNumber, 1);
  }
  result.addLine = function(lineNumber, newItem) {
    this.data.splice(lineNumber, 0, newItem);
  }
  return result;
}