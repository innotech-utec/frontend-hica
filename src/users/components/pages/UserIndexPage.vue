<template>
  <v-container>
    <!-- Botón de Volver (Home) -->
    <BackButton />

    <!-- Título de la página -->
    <v-row>
      <v-col cols="12" class="text-center">
        <h2 class="form-title">Usuarios</h2>
      </v-col>
    </v-row>

    <!-- Botón de Añadir Usuario -->
    <v-row>
      <v-col cols="auto">
        <v-btn color="primary" class="add-user-btn" @click="$router.push({ name: 'users.create' })">
          <v-icon>mdi-plus</v-icon>
          Añadir Usuario
        </v-btn>
      </v-col>
    </v-row>

    <!-- Lista de usuarios -->
    <div class="user-list">
      <v-row>
        <v-col v-for="(user, index) in users" :key="index" cols="12" md="6" lg="4">
          <v-card class="mx-auto user-card">
            <v-card-title class="user-card-title">
              <v-icon left :color="user.isAdmin ? '#014582' : '#008575'">
                <template v-if="user.isAdmin">mdi-shield-account</template>
                <template v-else>mdi-stethoscope</template>
              </v-icon>
              {{ user.nombre }} {{ user.apellido }}
            </v-card-title>
            <v-card-subtitle>{{ user.email }}</v-card-subtitle>
            <v-card-subtitle>{{ user.documento }}</v-card-subtitle>
            <v-card-actions>
              <v-btn icon @click="editUser(user.id)" class="action-icon">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon @click="confirmDeleteUser(user.id)" class="action-icon">
                <v-icon small>mdi-delete</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Paginador centrado al final -->
    <div class="pagination-container">
      <PaginatorComponent
        :length="totalPages"
        :currentPage="currentPage"
        @pageChange="handlePageChange"
      />
    </div>

    <!-- Modal para Crear Usuario -->
    <v-dialog v-model="showCreateUserModal" max-width="600px">
      <CreateUserPage @close="showCreateUserModal = false" />
    </v-dialog>

    <!-- Modal para Editar Usuario -->
    <v-dialog v-model="showEditUserModal" max-width="600px">
      <EditUserPage :user="selectedUser" @close="showEditUserModal = false" />
    </v-dialog>
  </v-container>
</template>

<script>
import backend from '@/backend';
import Swal from 'sweetalert2';
import BackButton from '@/shared/components/BackButton.vue';
import CreateUserPage from '@/users/components/pages/CreateUserPage.vue';
import EditUserPage from '@/users/components/pages/EditUserPage.vue';
import PaginatorComponent from '@/shared/components/PaginatorComponent.vue';

export default {
  components: {
    BackButton,
    CreateUserPage,
    EditUserPage,
    PaginatorComponent,
  },
  data() {
    return {
      currentPage: 1,
      totalPages: 1,
      users: [],
      showCreateUserModal: false,
      showEditUserModal: false,
      selectedUser: null,
    };
  },
  methods: {
    async fetchUsers(page = 1) {
      try {
        const response = await backend.get(`/usuarios?page=${page}`);
        this.users = response.data.data;
        this.currentPage = response.data.meta.current;
        this.totalPages = response.data.meta.last;
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
      }
    },
    editUser(id) {
      const user = this.users.find(user => user.id === id);
      this.selectedUser = user;
      this.showEditUserModal = true;
    },
    async confirmDeleteUser(id) {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: '¡No podrás revertir esto!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar',
      });

      if (result.isConfirmed) {
        this.deleteUser(id);
      }
    },
    async deleteUser(id) {
      try {
        await backend.delete(`/usuarios/${id}`);
        this.fetchUsers(this.currentPage);
        Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    },
    handlePageChange(newPage) {
      this.fetchUsers(newPage);
    },
  },
  created() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.add-user-btn {  
    margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  padding: 10px 0;
  display: flex;
  justify-content: center;
}

.user-card {
  margin-bottom: 20px;
}

.form-title {
  font-size: 2.5rem;
  color: #014582;
  font-weight: bold;
  margin-bottom: 10px;
}
</style>
