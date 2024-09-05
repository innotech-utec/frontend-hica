<template>
    <v-card class="card">
        <v-container>
            <v-form @submit.prevent="onSubmit">

                <div class="field">
                    <v-icon class="field__icon">mdi-email</v-icon>
                    <input class="field__input" v-model="user.email" type="email" placeholder="Correo electrónico" />
                </div>

                <div class="field">
                    <v-icon class="field__icon">mdi-account-circle</v-icon>
                    <input class="field__input" v-model="user.name" type="text" placeholder="Nombre" />
                </div>


                <v-btn rounded type="submit" color="primary">
                    <v-icon class="mdi">mdi-content-save</v-icon>
                    Guardar
                </v-btn>

            </v-form>
        </v-container>
    </v-card>
</template>
<script>

import backend from "@/backend.js";
import Swal from 'sweetalert2';

export default {

    data() {
        return {
            user: {
                email: '',
                name: '',
            }
        }
    },

    async mounted() {
        const userId = this.$route.params.id;
        this.user = (await backend.get(`usuarios/${userId}`)).data;
    },

    methods: {
        async onSubmit() {
            await backend.patch(`usuarios/${this.$route.params.id}`, {
                email: this.user.email,
                name: this.user.name
            });

            Swal.fire({
                title: "Usuario actualizado",
                text: "Los datos del usuario han sido actualizados",
                icon: "success"
            });
        }
    }

}

</script>