<template>
    <v-card class="card">
        <v-form @submit.prevent="onSubmit">
            <v-container>
                <div class="field">
                    <v-icon class="field__icon">mdi-email</v-icon>
                    <input class="field__input" v-model="email" type="email" placeholder="Correo electrónico" />
                </div>
                <div class="field">
                    <v-icon class="field__icon">mdi-account-circle</v-icon>
                    <input class="field__input" v-model="name" type="text" placeholder="Nombre" />
                </div>
                <div class="field">
                    <v-icon class="field__icon">mdi-lock</v-icon>
                    <input class="field__input" v-model="password" type="password" placeholder="Contraseña" />
                </div>
                <div class="field">
                    <v-icon class="field__icon">mdi-lock</v-icon>
                    <input class="field__input" v-model="repeatedPassword" type="password" placeholder="Repetir contraseña" />
                </div>
                <v-btn rounded type="submit" color="primary">
                    <v-icon>mdi-plus</v-icon>
                    Crear usuario
                </v-btn>
            </v-container>
        </v-form>
    </v-card>
</template>
<script>

import backend from '@/backend.js';

import Swal from 'sweetalert2';

export default {
    data() {
        return {
            email: '',
            name: '',
            password: '',
            repeatedPassword: '',
        }
    },

    methods: {
        async onSubmit() {

            if (this.password != this.repeatedPassword) {
                return Swal.fire({
                    icon: "error",
                    title: "¡Ups!",
                    text: 'Las contraseñas ingresadas no coinciden',
                });
            }

            try {
                await backend.post('usuarios', {
                    email: this.email,
                    name: this.name,
                    password: this.password,
                });
            } catch (error) {
                return Swal.fire({
                    icon: "error",
                    title: "¡Ups!",
                    text: error.response.data.message ?? null,
                });
            }


            this.$router.push({ name: 'users.index' });
        }
    }
}

</script>