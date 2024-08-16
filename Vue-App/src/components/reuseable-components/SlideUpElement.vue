<template>
    <transition name="slide-up" appear>
        <slot />
    </transition>
</template>

<script>
export default {
    name: 'SlideUpTransition'
}
</script>

<style scoped>
/* the active transition between entering & Leaving */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.5s ease-out;
}

/* the start state for entering and where leaves ends */
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(25px);
    opacity: 0;
}

/* the end state for entering and where leaves starts */
.slide-up-enter-to,
.slide-up-leave-from {
    transform: translateY(0);
    opacity: 1;
}
</style>