<template>
    <div class="dot-loader" :style="{ '--loader-width': `${size}px`, '--ball-color': `${color}` }">
        <div class="ball-loader-ball ball1"></div>
        <div class="ball-loader-ball ball2"></div>
        <div class="ball-loader-ball ball3"></div>
    </div>
</template>

<script>
export default {
    name: "DotLoader",
    props: {
        size: Number,
        color: {
            type: String,
            default: "grey"
        }
    }
}
</script>