<template lang="html">

  <tr class="lyrics-line" contenteditable 
        @keydown.up="onUp" @keydown.down="onDown" @keydown.left="onLeft" @keydown.right="onRight" 
        @keydown.home="onHome" @keydown.end="onEnd"
        @keydown.8="onBackspace" @keydown.46="onDelete" @keydown.enter="onEnter"
        @click="onSelect">
    <td v-for="(item, index) of cdata.lyrics" :key="index">      
      <Character style="display:inline" :type="type"
            :cdata="{index: index, line:cdata.line, draggedName: draggedName,
            char: item.char, chord: item.chord, call:triggerDrop}" />
    </td>
  </tr>
</template>

<script lang="js">

  import Character from './Character.vue';

  export default  {
    name: 'lyrics-line',
    props: ['cdata', 'sel', 'draggedName', 'type'],
    mounted() {

    },
    data() {
      return {

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

        if (!ev.shiftKey) {
          selection.end = 0;
        } else {
          selection.end = selection.start
        }
        selection.start = 0;
        this.$emit('edit', {type: 'move', sel:selection});

        //this.$emit('edit', {type:'move', sel: {start:0, end:0, line: this.cdata.line}}); 
      },
      onEnd(ev) {
        ev.preventDefault();
        let selection = this.getSelection();

        if (!ev.shiftKey) {
          selection.start = this.$children.length;
        } else {
          selection.start = selection.end;
        }
        selection.end = this.$children.length;
        this.$emit('edit', {type: 'move', sel:selection});
      },
      onUp(ev) {
        ev.preventDefault();
        let caretPos = this.getCaretPosition();
        this.$emit('edit', {type:'move', sel: {start: caretPos, end: caretPos, line: this.cdata.line - 1}});
      },
      onDown(ev) {
        ev.preventDefault();
        let caretPos = this.getCaretPosition();                
        this.$emit('edit', {type:'move', sel: {start: caretPos, end: caretPos, line: this.cdata.line + 1}});
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
      moveCaret(caretOffset) {
        if (caretOffset <= -1) caretOffset = 0;
        else if (caretOffset >= this.$children.length + 1) caretOffset = this.$children.length;
        let document = window.document;
        let sel = window.getSelection();
        if (sel.rangeCount > 0) {
          let range = document.createRange();
          range.selectNodeContents(this.$el);
          range.setStart(range.startContainer, caretOffset);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      },
      getSelection() {
        return {start: this.getCaretPosition('start'), end: this.getCaretPosition('end'), line:this.cdata.line};
      },
      select(selection) {
        if (!selection) return selection;
        if (selection.start === selection.end) {
          if (selection.start === -1) {
            selection.start = this.$children.length;
            selection.end = this.$children.length;
          }
        } else {
          if (selection.start < 0) selection.start = 0;
          else if (selection.start > this.$children.length) selection.start = this.$children.length;

          if (selection.end < selection.start) selection.end = selection.start;
          else if (selection.end > this.$children.length) selection.end = this.$children.length;
        }
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
      }
    },
    computed: {

    },
    watch: {
      sel: function(newVal) {
        this.select(newVal);
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
