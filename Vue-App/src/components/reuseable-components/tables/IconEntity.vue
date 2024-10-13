<template>
    <div class="icon-entity my-1 ms-3 overflow-hidden">

        <div 
            class="icon-container d-flex align-items-center justify-content-center rounded-circle"
            :class="`bg-gradient-${theme}`"
            :style="{ 
                '--icon-size': `${styler.iconSize}px`,
                '--icon-margin-top': `${styler.mt}px`,
                '--icon-margin-bottom': `${styler.mb}px`,
                '--icon-margin-left': `${styler.ml}px`,
                '--icon-margin-right': `${styler.mr}px`,
            }"
        >
            <div class="bg-white rounded-circle d-flex align-items-center justify-content-center">
                <i class="text-gradient" :class="`text-${theme} ${icon}`"></i>
            </div>
        </div>

        <!-- Name & id -->
        <p class="name-container ms-2 my-0 ">
            <span 
                class="icon-name text-gradient font-weight-bold text-truncate"
                :class="[!name? 'text-danger': 'text-dark']"
            >
                {{ name ? name : "???" }}
            </span>
            <span class="icon-id text-secondary">#{{ id? id : "- -" }}</span>
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
        },
        target:{
            type: String,
            required: true,
        }
    },
    computed:{
        // Stylers to adjust the icon based on each entity
        styler(){
            if (this.target === "companies" || this.target === "company") {
                return{ iconSize: 40, mt: 0, mb: 0, ml: 10, mr: 10 }
            }
            else if (this.target.includes("client")) {
                return{ iconSize: 46, mt: -1, mb: 0, ml: 11, mr: 10 }
            }
            else if (this.target.includes("product")) {
                return{ iconSize: 40, mt: 2, mb: 0, ml: 10, mr: 10 }
            }
            else if(this.target.includes("employee")){
                return{ iconSize: 40, mt: 2, mb: 0, ml: 12, mr: 10 }
            }
            else if(this.target.includes("position")){
                return{ iconSize: 40, mt: 1, mb: 0, ml: 9, mr: 10 }
            }
            else if(this.target.includes("transaction")) {
                return{ iconSize: 42, mt: 0, mb: 0, ml: 10, mr: 10 }
            }
            else if (this.target.includes("address")) {
                return { iconSize: 48, mt: 1, mb: 0, ml: 10, mr: 10 }
            }
            else{
                return{ iconSize: 40, mt: 2, mb: 0, ml: 10, mr: 10 }
            }
        }
    }
}
</script>
