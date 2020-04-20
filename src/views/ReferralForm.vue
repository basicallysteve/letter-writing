<template>
    <form>
        <div class="modal-card" id="import-window">
            <header class="modal-card-head">
                <p class="modal-card-title">Refer a Friend</p>
            </header>
            <section class="modal-card-body">
                <b-field label="Email">
                    <b-input
                        type="text"
                        v-model="email"
                        placeholder="johnsmith@email.com"
                        required>
                    </b-input>
                </b-field>
            </section>
            <footer class="modal-card-foot">
                <button class="button" type="button" @click="$parent.close()">Close</button>
                <b-button type="is-primary" @click="sendReferral">Send Referral</b-button>
            </footer>
        </div>
    </form>
</template>
<script>
import firebase from "@/mixins/firebase.mixin";
export default {
    data(){
        return {
            email: null
        }
    },
    methods: {
        sendReferral(){
            this.referFriend(this.email, this.$attrs.user);
        }
    },
    mixins: [firebase]
}
</script>