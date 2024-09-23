<template>
    <v-row class="h-100">
        <v-col cols="12" md="6" style=" display: flex; align-items: center; justify-content: center">
            <div style="width: 500px">
              
            <h1 style="margin: 0; text-align: center"><b>HICA</b></h1>
                <p style="text-align: center">Bienvenidos a Historia Clinica Animal</p>
                <v-container style="display:flex; align-items:center; flex-direction: column">

                    <div class="field">
                        <v-icon class="field__icon">mdi-email</v-icon>
                        <input class="field__input" v-model="email" type="text" placeholder="Correo electrónico" />
                    </div>

                    <div class="field">
                        <v-icon class="field__icon">mdi-lock</v-icon>
                        <input class="field__input" v-model="password" type="password" placeholder="Contraseña" />
                    </div>

                    <v-alert variant="tonal" class="mb-3" v-if="error" type="error" title="Credenciales incorrectas"
                        text="Posiblemente colocó de forma incorrecta el correo electrónico o la contraseña. Por favor, vuelva a intentarlo"></v-alert>

                    <v-btn color="success" rounded v-on:click="onLogin" class="w-100">Iniciar sesión</v-btn>
                </v-container>
            </div>
        </v-col>
        <v-col cols="12" md="6"
            style="padding: 0px; position: relative; background-image: url('./facultad.jpg'); background-size: cover; background-position: center">
            <div
                style="display: flex; align-items:center; justify-content: center; position: absolute; width: 100%; height: 100%; background-color: hsla(221, 86%, 88%, 80%)">
                <div></div>
            </div>
        </v-col>
    </v-row>
</template>

<script>

import { AuthService } from "@/auth/services/AuthService.js";

export default {
    data() {
        return {
            email: '',
            password: '',
            error: null
        }
    },

    methods: {
        async onLogin() {
            try {
                const response = await AuthService.login(this.email, this.password);
                if (response.token) {
                    // Redirigir al home después de login
                    this.$router.push({ name: 'home' });
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    this.error = "Credenciales inválidas";
                } else {
                    this.error = "Error en el servidor. Inténtalo más tarde.";
                }
            }
        }
    }
};
</script>

