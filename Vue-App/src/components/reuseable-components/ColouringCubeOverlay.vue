<template>
    <div class="cube-overlay">
      <input type="checkbox" id="shadows" v-model="showShadows" />
      <label for="shadows">Soft shadows</label>
      <div class="cubes" :class="{ 'no-shadows': !showShadows }">
        <!-- Cube components -->
        <cube v-for="cube in cubes" :key="cube.id" :data-cube="cube.id" />
      </div>
    </div>
  </template>

<script>
import { ref, computed } from 'vue';

const Cube = {
  props: ['dataCube'],
  template: `
    <div class="cube" :data-cube="dataCube">
      <div class="cube-wrap">
        <div class="cube-top">
          <div v-if="showShadowZ" class="shadow-z" :data-cube="shadowZCube"></div>
        </div>
        <div class="cube-bottom"></div>
        <div class="cube-front-left"></div>
        <div class="cube-front-right"></div>
        <div class="cube-back-left"></div>
        <div class="cube-back-right"></div>
      </div>
    </div>
  `,
  setup(props) {
    const showShadowZ = computed(() => ['112', '132', '212', '312', '322', '332'].includes(props.dataCube));
    const shadowZCube = computed(() => props.dataCube === '112' ? '111' : props.dataCube);
    return { showShadowZ, shadowZCube };
  }
};

export default {
  components: { Cube },
  setup() {
    const showShadows = ref(true);
    const cubes = ref([
      { id: '111' }, { id: '121' }, { id: '131' },
      { id: '211' }, { id: '221' }, { id: '231' },
      { id: '311' }, { id: '321' }, { id: '331' },
      { id: '112' }, { id: '122' }, { id: '132' },
      { id: '212' }, { id: '222' }, { id: '232' },
      { id: '312' }, { id: '322' }, { id: '332' },
      { id: '113' }, { id: '123' }, { id: '133' },
      { id: '213' }, { id: '223' }, { id: '233' },
      { id: '313' }, { id: '323' }, { id: '333' }
    ]);

    return { showShadows, cubes };
  }
};
</script>

