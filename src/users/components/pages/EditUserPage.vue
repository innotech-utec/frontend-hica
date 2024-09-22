<template>
  <v-card class="card">
    <v-container>
      <!-- Título estilizado -->
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Editar Usuario</h2>
        </v-col>
      </v-row>

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
        <v-checkbox v-model="user.isAdmin" label="Administrador" class="mt-4" />

        <!-- Botones de acción -->
        <v-btn rounded type="submit" color="primary">
          <v-icon class="mdi">mdi-content-save</v-icon>
          Guardar
        </v-btn>
        <v-btn rounded @click="confirmCancel('edición')" color="secondary">
          <v-icon class="mdi">mdi-cancel</v-icon>
          Cancelar
        </v-btn>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      user: {
        email: "",
        nombre: "",
        apellido: "",
        documento: "",
        isAdmin: false,
      },
    };
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
        icon: "error",
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
          isAdmin: this.user.isAdmin,
        });

        Swal.fire({
          title: "Usuario actualizado",
          text: "Los datos del usuario han sido actualizados",
          icon: "success",
        });

        // Redirigir a la lista de usuarios
        this.$router.push("/usuarios");
      } catch (error) {
        Swal.fire({
          title: "Error al actualizar",
          text: "No se pudieron actualizar los datos del usuario",
          icon: "error",
        });
      }
    },
    async confirmCancel(action) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: `¿Deseas cancelar la ${action} del usuario?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "Continuar",
      });

      if (result.isConfirmed) {
        this.$router.push("/usuarios");
      }
    },
  },
};
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.form-title {
  font-size: 2.5rem;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Campos del formulario */
.field {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.field__icon {
  margin-right: 10px;
}

.field__input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Botones */
.v-btn {
  background-color: #014582;
  color: white;
  margin-right: 10px;
}

.v-btn:hover {
  background-color: #013262;
}

/* Media Queries para Responsividad */
@media (max-width: 768px) {
  .form-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .form-title {
    font-size: 1.8rem;
  }
}
</style>
