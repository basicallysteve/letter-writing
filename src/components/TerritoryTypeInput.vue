<template>
    <b-autocomplete placeholder="Territory Type" v-model="type" :data="filteredTypes" field="name" @select="($event)=>{$emit('select', $event)}" @focus="loadTypes" open-on-focus :clearable="clearable">
        <template #empty>Searching...</template>
    </b-autocomplete>
</template>
<script>
import firebase from "../mixins/firebase.mixin";

export default {
    computed: {
        filteredTypes(){
            if(this.value != null){
                return this.types.filter(type=>{
                    return type.name.toLowerCase().includes(this.value.toLowerCase());
                });
            }
            return this.types;
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
            },
            type: null
        }
    },
    methods: {
        async loadTypes(){
            let queries = [
                
            ]
            this.types = await this.fetchTerritoryTypes(queries)
        }
    },
    mixins: [firebase],
    mounted(){

    },
    props: {
        clearable: {
            type: Boolean,
            default: false
        },
        defaultValue: {
            type: String,
            default: null
        }
    },
    watch: {
       defaultValue:{
           immediate: true,
           handler(){
            this.type = this.defaultValue;
           }
       },
       type(){
           this.value = this.type;
           if(this.type == "" || this.type == null){
               this.$emit("select", null);
           }
       }
    }
    
}

</script>

