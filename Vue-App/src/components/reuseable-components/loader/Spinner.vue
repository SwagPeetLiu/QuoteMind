<template>
    <div class="spinner-border" :style="`width: ${size}rem; height: ${size}rem;`" role="status">
        <span class="visually-hidden">Loading...</span>
    </div>
</template>

<script>
export default{
    name: "spinner-loader",
    props:{
        size: {
            type: Number,
            default: 1.5,
            required: false
        }
    }
}
</script>