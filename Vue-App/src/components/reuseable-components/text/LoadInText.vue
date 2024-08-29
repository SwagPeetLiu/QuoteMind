<template>
  <div  :class="$props.inputClass" ref="line1Ref">
    <span v-for="char in spanElements" :key="char" :class="char === ' ' ? 'space' + $props.inputClass : $props.inputClass">
      {{ char }}
    </span>
  </div>
</template>

<script>
import { gsap } from 'gsap';

export default {
  name: 'LoadInText',
  props: {
    inputClass: {
      type: String,
      required: false,
      default: "text-white font-weight-bold text-glow",
    },
    text: {
      type: String,
      required: true,
      default: "hello quoteminder",
    }
  },
  computed: {
    spanElements() {
      return this.text.split("");
    }
  },
  mounted() {
    const line1 = this.$refs.line1Ref;
    const line1Spans = line1.querySelectorAll('span');

    // Set initial states
    gsap.set(line1, {
      x: -15
    });
    gsap.set(line1Spans, {
      opacity: 0
    });

    // Create timeline
    const tl = gsap.timeline();

    // Add animations to timeline
    tl.to(line1, {
      x: 0,
      duration: 0.75,
    }, "start");

    tl.to(line1Spans, {
      opacity: 1,
      duration: 0.5,
      stagger: 0.05
    }, "start");
  }
}
</script>

<style scoped>
.loadInLine {
  font-size: 0;
}

span {
  display: inline-block;
  margin: 0;
}

span.space {
  display: inline-block;
  width: 10px;
}
</style>