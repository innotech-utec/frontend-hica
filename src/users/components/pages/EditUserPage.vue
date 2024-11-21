<template>
    <v-card class="card">
        <v-container>
            <v-form @submit.prevent="onSubmit">

                <!-- Correo electrónico -->
                <div class="field">
                    <v-icon class="field__icon">mdi-email</v-icon>
                    <input class="field__input" v-model="user.email" type="email" placeholder="Correo electrónico" />
                </div>

                <!-- Nombre -->
                <div class="field">
                    <v-icon class="field__icon">mdi-account-circle</v-icon>
                    <input class="field__input" v-model="user.nombre" type="text" placeholder="Nombre" />
                </div>

                <!-- Apellido -->
                <div class="field">
                    <v-icon class="field__icon">mdi-account-circle</v-icon>
                    <input class="field__input" v-model="user.apellido" type="text" placeholder="Apellido" />
                </div>

                <!-- Documento -->
                <div class="field">
                    <v-icon class="field__icon">mdi-file-document</v-icon>
                    <input class="field__input" v-model="user.documento" type="text" placeholder="Documento" />
                </div>

                <!-- Checkbox Administrador -->

                <div>
                    <v-checkbox
                        v-model="user.isAdmin"
                        label="Administrador"
                        class="mt-4"
                    />
                </div>

                

                <!-- Botón para guardar -->
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
                nombre: '',
                apellido: '',
                documento: '',
                isAdmin: false
            }
        }
    },

    async mounted() {
        try {
            const userId = this.$route.params.id;
            const response = await backend.get(`usuarios/${userId}`);
            this.user = response.data;
        } catch (error) {
            Swal.fire({
                title: "Error al cargar usuario",
                text: "No se pudieron cargar los datos del usuario",
                icon: "error"
            });
        }
    },

    methods: {
        async onSubmit() {
            try {
                await backend.patch(`usuarios/${this.$route.params.id}`, {
                    email: this.user.email,
                    nombre: this.user.nombre,
                    apellido: this.user.apellido,
                    documento: this.user.documento,
                    isAdmin: this.user.isAdmin
                });

                Swal.fire({
                    title: "Usuario actualizado",
                    text: "Los datos del usuario han sido actualizados",
                    icon: "success"
                });
            } catch (error) {
                Swal.fire({
                    title: "Error al actualizar",
                    text: "No se pudieron actualizar los datos del usuario",
                    icon: "error"
                });
            }
        }
    }

}

</script>
