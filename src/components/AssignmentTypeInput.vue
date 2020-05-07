<template>
    <b-autocomplete v-model="value" :data="filteredTypes" field="name" @select="($event)=>{$emit('select', $event)}" open-on-focus/>
</template>
<script>
import assignment from "../mixins/assignments.mixin";

export default {
    computed: {
        filteredTypes(){
            return this.types.filter(type=>{
                return type.name.toLowerCase().includes(this.value.toLowerCase());
            });
        },
        value: {
            get(){
                return this.$attrs.value;
            },
            set(newVal){
                this.$emit("input", newVal);
            }
        }
    },
    data(){
        return {
            types: [],
            nameFilter: {
                name: "where",
            }
        }
    },
    methods: {
        async loadTypes(){
            let queries = [
                
            ]
            this.types = await this.fetchAssignmentTypes(queries)
        }
    },
    mixins: [assignment],
    mounted(){
        this.loadTypes()

    },
    props: {
    },
    watch: {
       
    }
    
}

</script>

