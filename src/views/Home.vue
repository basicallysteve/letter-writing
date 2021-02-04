<template>
  <div class="home" style="width: 75%; display: flex; flex-flow: column; margin: auto;">
    {{user ? `Hello ${user.name} ` : null}}


    <div v-if="user.is_publisher">
      You have {{streets.length}} streets checked out

      <b-table :data="streets" v-if="streets.length > 0">
        <template v-slot="props">
          <b-table-column field="street_name" label="Street Name">{{props.row.name}}</b-table-column>
          <!-- <b-table-column field="checkout_date" label="Checked Out">{{props.row.last_checkout}}</b-table-column> -->
          <b-table-column field="actions" label="Actions">
            <b-button v-if="props.row.checked_out_by == user.user_id && props.row.checked_out == true" @click="downloadStreet(props.row.territory, props.row)" style="margin-right: 1em;">
              View Street
            </b-button>  
            <b-button @click="returnStreet(props.row)">Return</b-button>
          </b-table-column>
        </template>
      </b-table>
    </div>
    <div v-else>
      Please get in contact with your service committee to finish setting up your account.
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import firebaseMixin from "@/mixins/firebase.mixin.js";
export default {
  data(){
    return {
      streets: []
    }
  },
  methods: {
    loadStreetsForUser(){
      this.fetchStreets(this.user.user_id).then(response=>{
          this.streets = response
        })
    },
    returnStreet(street){
      street.returned_at = new Date();
      street.checked_out = false;
      let territory =  street.territory;
      this.user.num_of_checked_out_streets--;
      delete street.territory;
      this.updateStreet(territory, null, street, street.checked_out_by, false).then(()=>{})
    }
  },
  mixins: [firebaseMixin],

  mounted(){
    this.onTerritoryUpdate(()=>{
      this.loadStreetsForUser();
    })
  },
  props: {
    user: {
      type: Object,
      default(){
        return {}
      }
    }
  },
  watch: {
    'user': {
      immediate: true,
      handler(){
        if(this.user){
          this.loadStreetsForUser();
        }
      }
    }
  }
}
</script>
