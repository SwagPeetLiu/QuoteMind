<template>
    <!-- fade in effect occurs on the first appearance of the embedded HTML elements -->
    <transition name="fade" appear>
        <slot />
    </transition>
</template>

<script>
export default {
    name: "FadeInElement"
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>