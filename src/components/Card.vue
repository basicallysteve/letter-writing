<template>
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                <slot name="title"></slot>
            </p>
        </header>
        <div class="card-content">
            <div class="content">
                <slot name="content"></slot>
            </div>
        </div>
        <footer class="card-footer" v-if="footer">
            <slot name="footer"></slot>
        </footer>
    </div>
</template>
<script>
export default {
    name: "card",
    data(){
        return{}
    },
    props: {
        footer: {
            type: Boolean,
            default: false
        }
    }
}
</script>