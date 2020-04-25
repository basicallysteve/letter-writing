<template>
    <div >
    <b-field label="Congregation" style="display: flex;flex-flow: column;">
            <div style="display:flex; flex-flow: row; width: 100%">
            <b-autocomplete v-model="congregation.name" :data="congregations" field="name" placeholder="Search..." type="search" style="width: 100%; border-bottom-right-radius: 0; border-top-right-radius: 0;" :loading="isLoading" @select="selectCongregation" open-on-focus :disabled="disabled"></b-autocomplete>
            <p class="control" v-if="!disabled">
                <b-button tag="router-link" :to="{name: 'Congregations', params: {signUp, referral_id, override: true}}" type="is-link" class="button is-primary" style="border-bottom-left-radius: 0; border-top-left-radius: 0; margin: 0;">New Congregation</b-button>
            </p>
            </div>
        </b-field>
    </div>
</template>
<script>
import congregation from "@/mixins/congregation.mixin"
import _ from "lodash";
export default {
    computed: {
        congregation: {
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
            isLoading: false,
            congregations: []
        }
    },
    methods: {
        loadCongregations: _.debounce(function(name){
            this.isLoading = true;
            name = name == "" ? null : name;
            this.fetchCongregationsByName(name).then(response=>{
                this.congregations = response
            }).finally(()=>{
                this.isLoading = false;
            })
        }, 100),
        selectCongregation(congregation){
            this.congregation = congregation;
        }
    },
    mounted(){
        this.loadCongregations();
        if(this.congregation.congregation_id){
            this.fetchCongregation(this.congregation.congregation_id).then(response=>{
                this.congregation = {...this.congregation, ...response}
            })
        }
    },
    mixins: [congregation],
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        signUp: {
            type: Object,
            default(){
                return null;
            }
        },
        referral_id:{
            type: String,
            default: null
        }
    },
    watch: {
        'congregation.congregation_id': {
            handler(newVal){
                this.fetchCongregation(this.congregation.congregation_id).then(response=>{
                    this.congregation = {...this.congregation, ...response}
                })
            }
        },
        'congregation.name': {
            handler(newVal){
                this.loadCongregations(newVal);
            }
        }
    } 
}
</script>