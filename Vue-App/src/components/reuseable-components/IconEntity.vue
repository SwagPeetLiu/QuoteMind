<template>
    <div class="d-flex align-items-end justify-content-start my-1 ms-3 overflow-hidden">

        <div 
            class="icon-container d-flex align-items-center justify-content-center rounded-circle z-1"
            :class="`bg-gradient-${theme}`"
        >
            <div class="position-absolute bg-white z-2 rounded-circle"></div>
            <i 
                class="fa-solid fa-city text-gradient my-0 mx-3 z-3" 
                :class="`text-${theme}`"
            ></i>
        </div>

        <!-- Name & id -->
        <p class="name-container d-flex flex-column ms-2 my-0">
            <span class="icon-name text-gradient text-dark font-weight-bold text-truncate">{{ name }}</span>
            <span class="icon-id text-secondary text-truncate">#{{ id }}</span>
        </p>
    </div>
</template>

<script>
export default {
    name: "IconEntity",
    props: {
        theme: {
            type: String,
            default: "dark",
        },
        icon: {
            type: String,
            default: "fa-solid fa-user",
        },
        name: {
            type: String,
            default: "name",
        },
        id: {
            type: String,
            required: true,
            default: "id",
        }
    }
}
</script>
