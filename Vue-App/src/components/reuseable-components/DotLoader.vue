<template>
    <div class="dot-loader" :style="{ '--loader-width': `${size}px` }">
        <div class="ball-loader-ball ball1"></div>
        <div class="ball-loader-ball ball2"></div>
        <div class="ball-loader-ball ball3"></div>
    </div>
</template>

<script>
export default {
    name: "DotLoader",
    props: {
        size: Number
    }
}
</script>