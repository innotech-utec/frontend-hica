<template>
    <v-card class="card">
        <v-form @submit.prevent="onSubmit">
            <v-container>
                <!-- Campos del Usuario -->
                <div class="field">
                    <v-icon class="field__icon">mdi-email</v-icon>
                    <input class="field__input" v-model="email" type="email" placeholder="Correo electrónico" />
                </div>

                <div class="field">
                    <v-icon class="field__icon">mdi-account-circle</v-icon>
                    <input class="field__input" v-model="nombre" type="text" placeholder="Nombre" />
                </div>

                <div class="field">
                    <v-icon class="field__icon">mdi-account-circle</v-icon>
                    <input class="field__input" v-model="apellido" type="text" placeholder="Apellido" />
                </div>

                <div class="field">
                    <v-icon class="field__icon">mdi-lock</v-icon>
                    <input class="field__input" v-model="password" type="password" placeholder="Contraseña" />
                </div>

                <div class="field">
                    <v-icon class="field__icon">mdi-lock</v-icon>
                    <input class="field__input" v-model="repeatedPassword" type="password" placeholder="Repetir contraseña" />
                </div>

                <div class="field">
                    <v-icon class="field__icon">mdi-file-document</v-icon>
                    <input class="field__input" v-model="documento" type="text" placeholder="Documento" />
                </div>

                <div class="">
                    <v-checkbox v-model="isAdmin" label="Administrador"class="mt-4"/>
                </div>

                <!-- Botón de Enviar -->
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
            nombre: '',
            apellido: '',
            password: '',
            repeatedPassword: '',
            documento: '',
            isAdmin: false,
            showPassword: false,
            emailRules: [
                v => !!v || 'El correo electrónico es requerido',
                v => /.+@.+\..+/.test(v) || 'Correo electrónico debe ser válido'
            ],
            requiredRule: [v => !!v || 'Este campo es requerido'],
            passwordRules: [v => !!v || 'La contraseña es requerida'],
            repeatPasswordRule: [
                v => !!v || 'Por favor repita la contraseña',
                v => v === this.password || 'Las contraseñas no coinciden'
            ]
        };
    },
    methods: {
        async onSubmit() {
            if (this.password !== this.repeatedPassword) {
                return Swal.fire({
                    icon: "error",
                    title: "¡Ups!",
                    text: 'Las contraseñas ingresadas no coinciden',
                });
            }

            try {
                const response = await backend.post('usuarios', {
                    email: this.email,
                    nombre: this.nombre,
                    apellido: this.apellido,
                    password: this.password,
                    documento: this.documento,
                    isAdmin: this.isAdmin
                });

                console.log('ID de usuario creada:', response.data.id);

                await Swal.fire({
                    title: "Usuario creado",
                    text: "Los datos de " + this.nombre + " " + this.apellido + " han sido guardados",
                    icon: "success"
                });

                // Redirige al listado de usuarios
                // this.$router.push({ name: 'users.index' });
            } catch (error) {
                return Swal.fire({
                    icon: "error",
                    title: "¡Ups!",
                    text: error.response.data.message ?? null,
                });
            }
        }
    }
}
</script>
