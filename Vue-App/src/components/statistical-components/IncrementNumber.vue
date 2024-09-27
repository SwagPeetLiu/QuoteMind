<template>
    <span class="counter">{{ formattedCount }}</span>
</template>

<script>
export default {
    name: 'count-up',
    props: {
        startValue:{
            type: [Number, String],
            required: false,
            default: 0
        },
        endValue: {
            type: [Number, String],
            required: true
        },
        duration: {
            type: Number,
            default: 200
        }
    },
    data(){
        return{
            count : this.startValue,
        }
    },
    computed: {
        formattedCount(){
            return this.count.toLocaleString();
        }
    },
    methods:{
        animateCount(){
            const startTime = Date.now();
            const endTime = startTime + this.duration;
            const updateCount = () => {
                const now = Date.now();
                const progress = Math.min((now - startTime) / this.duration, 1);
                this.count = Math.floor(progress * this.endValue);

                if (now < endTime) {
                    requestAnimationFrame(updateCount);
                } else {
                    this.count = this.endValue;
                }
            };
            requestAnimationFrame(updateCount);
        }
    },
    mounted(){
        this.animateCount();
    }
}
</script>