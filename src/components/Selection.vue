<template>
    <q-btn-dropdown class="left-button dropDown" :color="color" push glossy no-caps :icon="icon" :label="localValue">
        <q-list>
            <q-item v-for="item in options" :key="item.value" clickable v-close-popup @click="onSelect(item.value)">
                <q-item-section>
                <q-item-label>{{item.text}}</q-item-label>
                </q-item-section>
            </q-item>
        </q-list>
    </q-btn-dropdown>
</template>

<style>
    .dropDown{
        font-family:'Courier New', Courier, monospace;
    }
</style>

<script>
export default {
    name: 'Selection',
    components: {

    },
    props: ['options', 'v-model', 'value', 'icon', 'color'],
    data () {
        return {
            localValue: null,
        }
    },
    mounted() {
        this.localValue = this.value;
    },
    methods: {
        onSelect(value) {
            this.localValue = value;
            this.$emit('input', value);
        },
    }  
}
</script>
