<template>
    <b-table :data="formattedHistory">
        <template v-slot="props">
            <b-table-column label="Territory">{{props.row.territory.name}}</b-table-column>
            <b-table-column label="Street">{{props.row.street.name}}</b-table-column>
            <b-table-column label="Checked Out By">{{props.row.checked_out_by.name}}</b-table-column>
            <b-table-column label="Checked Out At">{{props.row.checked_out_at}}</b-table-column>
            <b-table-column label="Returned At">{{props.row.returned_at}}</b-table-column>
        </template>
    </b-table>
</template>
<script>
import territoryMixin from "../mixins/territory.mixin.js";
export default {
    asyncComputed: {
        formattedHistory: {
            default: [],
            async get(){
                let arr = [];
                for await(let history of this.history ){
                    let street = await history.street.get();
                    let territory = await history.street.parent.parent.get();
                    let checkedOutBy = await history.checked_out_by.get();
                    history.checked_out_by = checkedOutBy.data() ?? {};
                    history.territory = territory.data() ?? {};
                    history.street = street.data() ?? {};
                arr.push(history);
                }
                return arr;
            }
            
        }
    },
    data(){
        return {
            history: []
        }
    },
    methods: {},
    mounted(){
        this.fetchTerritoryHistory().then(response => {
            this.history = response;
        });

    },
    mixins: [territoryMixin]
}
</script>