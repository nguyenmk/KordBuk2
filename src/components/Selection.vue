<template>
    <q-btn-dropdown class="left-button" color="deep-orange" push glossy no-caps :icon="icon" :label="localValue">
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
</style>

<script>
export default {
    name: 'Selection',
    components: {

    },
    props: ['options', 'v-model', 'value', 'icon'],
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
