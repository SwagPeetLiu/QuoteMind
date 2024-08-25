<template>
    <div class="cssload-loader" :style="{ width: `${size}px`, height: `${size}px` }">
      <div class="cssload-inner cssload-one" :style="{ borderBottomColor: color1 }"></div>
      <div class="cssload-inner cssload-two" :style="{ borderRightColor: color2 }"></div>
      <div class="cssload-inner cssload-three" :style="{ borderTopColor: color3 }"></div>
    </div>
  </template>
  
  <script>
  import { config } from '@/config/config';
  import { getContrastColour } from '@/utils/helpers';

  export default {
    name: 'LoadingAnimation',
    props: {
      size: {
        type: Number,
        default: 80
      }
    },
    data(){
        const currentTheme = this.$store.state.themeColor;
        const darkTheme = config.ChartColours.dark[0];
        const colourPads = {
            primary: [config.ChartColours.primary[0],config.ChartColours[getContrastColour("primary")][0], darkTheme],
            info: [config.ChartColours.info[0],config.ChartColours[getContrastColour("info")][0], darkTheme],
            success: [config.ChartColours.success[0],config.ChartColours[getContrastColour("success")][0], darkTheme],
            warning: [config.ChartColours.warning[0],config.ChartColours[getContrastColour("warning")][0], darkTheme],
            danger: [config.ChartColours.danger[0],config.ChartColours[getContrastColour("danger")][0], darkTheme],
            dark: [config.ChartColours.dark[0],config.ChartColours[getContrastColour("dark")][0], darkTheme],
        };
        return {
            colourPads: colourPads,
            color1: colourPads[currentTheme][0],
            color2: colourPads[currentTheme][1],
            color3: colourPads[currentTheme][2]
        }
    },
    watch:{
        '$store.state.themeColor': {
            handler() {
                const newTheme = this.$store.state.themeColor;
                this.color1 = this.colourPads[newTheme][0];
                this.color2 = this.colourPads[newTheme][1];
                this.color3 = this.colourPads[newTheme][2];
            }
        }
    }
  }
  </script>