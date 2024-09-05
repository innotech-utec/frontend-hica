<template>
    <v-card v-if="display" class="pt-4 h-100 card">
        <div style="min-height: 250px;">
            <div class="d-flex mb-2" style="justify-content: center">
                <div style="width: 150px; height: 150px; border-radius: 50%; background-size: contain"
                    :style="{ backgroundImage: `url('${profileImage}')` }"></div>
            </div>
            <v-card-title class="text-center" style="padding: 0px">
                {{ user.name }}
            </v-card-title>
            <v-card-subtitle class="text-center" style="margin-top: -8px">
                {{ user.email }}
            </v-card-subtitle>
        </div>
        <v-card-actions class="mb-2">
            <v-row style="padding: 0px 16px;">
                <v-col cols="6">
                    <v-btn rounded color="error" variant="outlined" style="width: 100%" v-on:click="onDeleteUser">
                        <v-icon>mdi-delete</v-icon>
                        eliminar
                    </v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn rounded variant="tonal" color="primary" style="width: 100%" v-on:click="onEditUser">
                        <v-icon>mdi-pencil</v-icon>
                        editar
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-actions>
    </v-card>
</template>
<script>

import backend from '@/backend';
import Swal from 'sweetalert2';
import profileImage from '@/assets/img/user.png'

export default {
    props: {
        user: Object
    },

    data() {
        return {
            display: true,
            profileImage: profileImage
        }
    },

    methods: {
        async onDeleteUser() {

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `¿Quieres eliminar al usuario ${this.user.name}?`,
                icon: 'warning',
                showCancelButton: true,
            });

            if (!result.isConfirmed) {
                return;
            }

            await backend.delete(`usuarios/${this.user.id}`);
            this.display = false;

            Swal.fire('Eliminado', `${this.user.name} ha sido eliminado`);
        },

        async onEditUser() {
            this.$router.push({ name: 'users.edit', params: { id: this.user.id } });
        }
    }
}

</script>