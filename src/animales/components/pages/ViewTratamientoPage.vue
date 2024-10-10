<template>
  <v-card>
    <v-card-title>Tratamientos Registrados</v-card-title>
    <v-card-text>
      <!-- Mostrar tabla de tratamientos si ya están registrados -->
      <v-data-table v-if="tratamientos.length > 0" :items="tratamientos" :headers="headers">
        <template #item="{ item }">
          <tr>
            <td>{{ new Date(item.fecha).toLocaleDateString() }}</td>
            <td>{{ item.hora }}</td>
            <td>{{ item.medicacion }}</td>
            <td>{{ item.observaciones }}</td>
            <td>
              <v-chip :color="getEstadoColor(item.estadoAutorizacion)">
                {{ item.estadoAutorizacion }}
              </v-chip>
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Mostrar mensaje si no hay tratamientos registrados -->
      <p v-else>No hay tratamientos registrados.</p>

      <!-- Botón para registrar nuevos tratamientos -->
      <v-btn color="primary" @click="openCreateModal">Registrar Tratamiento</v-btn>
    </v-card-text>

    <!-- Componente para registrar tratamiento -->
    <create-tratamiento
      v-if="showCreateModal"
      :animal-id="animalId"
      :ficha-clinica-id="fichaClinicaId"
      @tratamientoRegistrado="fetchTratamientos"
      @cerrarModal="closeCreateModal"
    ></create-tratamiento>
  </v-card>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateTratamiento from '@/animales/components/pages/CreateTratamientoPage.vue'; // Importar el componente de creación

export default {
  components: {
    CreateTratamiento,
  },
  props: ['animalId', 'fichaClinicaId'], // Se recibe el ID del animal para obtener los tratamientos
  data() {
    return {
      tratamientos: [],
      headers: [
        { text: 'Fecha', value: 'fecha' },
        { text: 'Hora', value: 'hora' },
        { text: 'Medicación', value: 'medicacion' },
        { text: 'Observaciones', value: 'observaciones' },
        { text: 'Estado de Autorización', value: 'estadoAutorizacion' },
      ],
      showCreateModal: false, // Controla la visualización del modal
    };
  },
  methods: {
    async fetchTratamientos() {
      if (!this.animalId) return;

      try {
        // Ruta correcta para obtener los tratamientos por animal ID
        const response = await backend.get(`/tratamientos/${this.animalId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        this.tratamientos = response.data;
      } catch (error) {
        console.error("Error al obtener los tratamientos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los tratamientos registrados.",
        });
      }
    },

    openCreateModal() {
      this.showCreateModal = true; // Abre el modal de creación de tratamiento
    },

    closeCreateModal() {
      this.showCreateModal = false; // Cierra el modal de creación de tratamiento
    },

    getEstadoColor(estado) {
      switch (estado) {
        case 'aprobado':
          return 'green';
        case 'rechazado':
          return 'red';
        case 'pendiente':
        default:
          return 'orange';
      }
    },
  },
  created() {
    this.fetchTratamientos();
  }
};
</script>

<style scoped>
.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
}

.v-btn {
  margin-top: 20px;
}
</style>
