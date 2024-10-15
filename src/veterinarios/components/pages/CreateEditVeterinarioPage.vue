<template>
    <div>
      <h2 class="page-title">{{ isEdit ? 'Editar Veterinario' : 'Registrar Veterinario' }}</h2>
      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="N_de_registro">Número de Registro</label>
          <input
            type="text"
            id="N_de_registro"
            class="form-control"
            v-model="veterinario.N_de_registro"
            required
          />
        </div>
        <div class="form-group">
          <label for="Dependencia">Dependencia</label>
          <input
            type="text"
            id="Dependencia"
            class="form-control"
            v-model="veterinario.Dependencia"
            required
          />
        </div>
        <div class="form-group">
          <label for="userId">Usuario</label>
          <select id="userId" class="form-control" v-model="veterinario.userId" required>
            <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
              {{ usuario.nombre }} {{ usuario.apellido }}
            </option>
          </select>
        </div>
        <!-- Validado no editable desde el frontend -->
        <div class="form-group">
          <label for="Validado">Validado</label>
          <input
            type="text"
            id="Validado"
            class="form-control"
            v-model="veterinario.Validado"
            disabled
          />
        </div>
        <button type="submit" class="btn btn-primary">{{ isEdit ? 'Actualizar' : 'Guardar' }}</button>
        <button type="button" class="btn btn-secondary" @click="cancelar">Cancelar</button>
      </form>
    </div>
  </template>
  
  <script>
  import backend from "@/backend"; // Asegúrate de tener configurada la instancia para hacer las solicitudes al backend
  import Swal from "sweetalert2";
  
  export default {
    props: ['id'], // Recibe el ID del veterinario en caso de edición
    data() {
      return {
        isEdit: !!this.id, // Determina si es edición o creación
        veterinario: {
          N_de_registro: '',
          Dependencia: '',
          Validado: false,
          userId: null,
        },
        usuarios: [], // Lista de usuarios disponibles para seleccionar
      };
    },
    methods: {
      async fetchUsuarios() {
        try {
          const response = await backend.get('/api/usuarios', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          this.usuarios = response.data.data; // Asumimos que la lista de usuarios viene en response.data.data
        } catch (error) {
          console.error("Error al obtener usuarios:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo obtener la lista de usuarios.",
          });
        }
      },
  
      async fetchVeterinario() {
        try {
          const response = await backend.get(`/api/veterinarios/${this.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          this.veterinario = response.data; // Asumimos que el veterinario viene en response.data
        } catch (error) {
          console.error("Error al obtener el veterinario:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo obtener el veterinario.",
          });
        }
      },
  
      async onSubmit() {
        if (this.isEdit) {
          await this.updateVeterinario();
        } else {
          await this.createVeterinario();
        }
      },
  
      async createVeterinario() {
        try {
          await backend.post('/api/veterinarios', this.veterinario, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          Swal.fire("Veterinario registrado", "El veterinario ha sido registrado con éxito", "success");
          this.$router.push({ name: 'veterinarios.index' });
        } catch (error) {
          console.error("Error al registrar el veterinario:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo registrar el veterinario.",
          });
        }
      },
  
      async updateVeterinario() {
        try {
          await backend.patch(`/api/veterinarios/${this.id}`, this.veterinario, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          Swal.fire("Veterinario actualizado", "El veterinario ha sido actualizado con éxito", "success");
          this.$router.push({ name: 'veterinarios.index' });
        } catch (error) {
          console.error("Error al actualizar el veterinario:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo actualizar el veterinario.",
          });
        }
      },
  
      cancelar() {
        this.$router.push({ name: 'veterinarios.index' });
      },
    },
    created() {
      this.fetchUsuarios();
      if (this.isEdit) {
        this.fetchVeterinario();
      }
    },
  };
  </script>
  
  <style scoped>
  .page-title {
    font-size: 28px;
    color: #014582;
    font-weight: bold;
    margin-bottom: 20px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  .btn {
    margin-right: 10px;
  }
  </style>
  