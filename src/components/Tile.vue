<template>
    <div :class="`tile is-${size} is-${vertical? 'vertical' : 'horizontal'}`">
        <div class="title">
            {{title}}
        </div>
        <div class="content">
            <slot name="content"></slot>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        title: {
            type: String,
            default: ""
        },
        size: {
            type: Number,
            default: 1
        },
        vertical: {
            type: Boolean,
            default: false
        }
    }
}
</script>