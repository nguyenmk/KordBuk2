<template lang="html">

  <tr class="lyrics-line" contenteditable 
        @keydown.up="onUp" @keydown.down="onDown" @keydown.left="onLeft" @keydown.right="onRight" 
        @keydown.home="onHome" @keydown.end="onEnd"
        @keydown.8="onBackspace" @keydown.46="onDelete" @keydown.enter="onEnter"
        @paste = "onPaste"
        @copy = "onCopy"
        @click="onSelect">
    <td v-for="(item, index) of cdata.lyrics.data" :key="index">      
      <Character style="display:inline"
            :cdata="{index: index, line:cdata.line, draggedName: draggedName,
            char: item.char, chord: item.chord, call:triggerDrop}" />
    </td>
  </tr>
</template>

<script lang="js">

  import Character from './Character.vue';
  let LyricSelection = require('../scripts/LyricSelection').default;

  export default  {
    name: 'lyrics-line',
    props: ['cdata', 'sel', 'draggedName'],
    mounted() {
      this.updateSelection(this.sel);
    },
    data() {
      return {
        selection: null,
      }
    },
    methods: {
      onSelect(ev) {
        ev.preventDefault();        
        this.select(this.getSelection());
      }, 
      onHome(ev) {
        ev.preventDefault();        
        let selection = this.getSelection();
        selection.end = (!ev.shiftKey) ? 0 : selection.start;
        selection.start = 0;
        this.$emit('edit', {type: 'move', sel:selection});
      },
      onEnd(ev) {
        ev.preventDefault();
        let selection = this.getSelection();
        selection.start = (!ev.shiftKey)? this.$children.length : selection.end;
        selection.end = this.$children.length;
        this.$emit('edit', {type: 'move', sel:selection});
      },
      onUp(ev) {
        ev.preventDefault();
        let caretPos = this.getCaretPosition();
        let line = this.cdata.line - 1;
        this.$emit('edit', {type:'move', sel: new LyricSelection(line, caretPos, line, caretPos)});
      },
      onDown(ev) {
        ev.preventDefault();
        let caretPos = this.getCaretPosition();
        let line = this.cdata.line + 1;
        this.$emit('edit', {type:'move', sel: new LyricSelection(line, caretPos, line, caretPos)});
      },
      onLeft(ev) {
        ev.preventDefault();
        let selection = this.getSelection();
        
        if (!ev.shiftKey) {
          if (selection.start == selection.end) --selection.start;
          selection.end = selection.start;
        } else {
          --selection.start;
        }
        this.$emit('edit', {type: 'move', sel:selection});
      },
      onRight(ev) {
        ev.preventDefault();
        let selection = this.getSelection();        
        if (!ev.shiftKey) {
          if (selection.start == selection.end) ++selection.end;
          selection.start = selection.end;
        } else {
          ++selection.end;
        }
        this.$emit('edit', {type:'move', sel: selection});
      },
      onBackspace(ev) {
        ev.preventDefault();
        this.$emit('edit', { type: 'backspace', sel: this.getSelection()});
      },
      onEnter(ev) {
        ev.preventDefault();
        this.$emit('edit', { type: 'enter', sel: this.getSelection()});
      },
      onDelete(ev) {
        ev.preventDefault();        
        this.$emit('edit', { type: 'delete', sel: this.getSelection()});
      },
      onPaste(ev) {
        ev.preventDefault();
        let data = JSON.parse(ev.clipboardData.getData("text/plain"));
        ev.lyricsData = {source: data, target:this.getSelection()};
        this.$emit('paste', ev);
      },
      onCopy(ev) {
        ev.preventDefault();
        const selection = this.getSelection();
        ev.clipboardData.setData("text/plain",JSON.stringify(selection));        
      },
      getCaretPosition(mode) {
        let caretOffset = 0;
        let sel = window.getSelection();
        if (sel.rangeCount > 0) {
          let range = window.getSelection().getRangeAt(0);
          let preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(this.$el);
          if (mode === 'start') {
            if (range.startOffset == 0) caretOffset = -1;
            preCaretRange.setEnd(range.startContainer, range.startOffset);
          } else { //mode === 'end'
            if (range.endOffset == 0) caretOffset = -1;
            preCaretRange.setEnd(range.endContainer, range.endOffset);
          }
            
          let clone = preCaretRange.cloneContents();
          caretOffset = caretOffset + clone.childElementCount;
        }
        if (caretOffset < 0) caretOffset = 0;
        else if (caretOffset > this.$children.length) caretOffset = this.$children.length;
        return caretOffset;
      },      
      getSelection() {
        let line = this.cdata.line;
        return new LyricSelection(line, this.getCaretPosition('start'), line, this.getCaretPosition('end'));
      },
      select(selection) {
        if (!selection) return selection;        
        let sel = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(this.$el);
        range.setStart(range.startContainer, selection.start);
        range.setEnd(range.endContainer, selection.end);
        sel.removeAllRanges();
        sel.addRange(range);
        return selection;
      },
      triggerDrop(to, from) {
        this.$emit('drop', { type:'drop', from: from, to: to });
      },
      updateSelection(selection) {
        this.selection = selection;
        this.select(selection);
      }
    },
    computed: {

    },
    watch: {
      sel: function(newVal) {
        if (newVal !== null) {
          this.updateSelection(newVal);
          this.cdata.lyrics.setSelection(null);
        }
      }
    },
    components: {
      Character,
    }
}
</script>

<style>
  .lyrics-line {

  }
</style>
