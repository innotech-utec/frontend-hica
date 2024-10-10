<template>
    <div>
      <h2 class="page-title">Veterinarios Registrados</h2>
      <v-btn color="primary" class="mb-4" @click="redirectToCreatePage">Registrar Veterinario</v-btn>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Número de Registro</th>
            <th>Dependencia</th>
            <th>Validado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="veterinario in veterinarios" :key="veterinario.id">
            <td>{{ veterinario.user.nombre }}</td>
            <td>{{ veterinario.user.apellido }}</td>
            <td>{{ veterinario.N_de_registro }}</td>
            <td>{{ veterinario.Dependencia }}</td>
            <td>{{ veterinario.Validado ? 'Sí' : 'No' }}</td>
            <td>
              <v-btn color="success" small @click="redirectToEditPage(veterinario.id)">Editar</v-btn>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="veterinarios.length === 0">No hay veterinarios registrados en el sistema.</p>
    </div>
  </template>
  
  <script>
  import backend from "@/backend"; // Asegúrate de tener configurada la instancia para hacer las solicitudes al backend
  import Swal from "sweetalert2";
  
  export default {
    data() {
      return {
        veterinarios: [], // Lista de veterinarios obtenida del backend
      };
    },
    methods: {
      async fetchVeterinarios() {
        try {
          // Ruta de la API para obtener la lista de veterinarios
          const response = await backend.get('/api/veterinarios', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          });
          this.veterinarios = response.data.data; // Asumimos que la lista de veterinarios viene en response.data.data
        } catch (error) {
          console.error("Error al obtener veterinarios:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo obtener la lista de veterinarios.",
          });
        }
      },
  
      redirectToCreatePage() {
        this.$router.push({ name: 'veterinarios.create' }); // Redirige a la ruta de creación de veterinario
      },
  
      redirectToEditPage(id) {
        this.$router.push({ name: 'veterinarios.edit', params: { id } }); // Redirige a la ruta de edición de veterinario con el ID
      },
    },
    created() {
      this.fetchVeterinarios(); // Llama a la función para obtener la lista de veterinarios al cargar el componente
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
  
  .table {
    width: 100%;
    margin-bottom: 20px;
    border-collapse: collapse;
  }
  
  .table th,
  .table td {
    border: 1px solid #ddd;
    padding: 8px;
  }
  
  .table th {
    background-color: #f2f2f2;
    text-align: left;
  }
  </style>
  