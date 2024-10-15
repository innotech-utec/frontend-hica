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
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateTratamiento from '@/animales/components/pages/CreateTratamientoPage.vue';

export default {
  components: {
    CreateTratamiento,
  },
 
  setup() {
    const route = useRoute();
    const fichaClinicaId = ref(route.query.fichaClinicaId);
    const tratamientos = ref([]);
    const showCreateModal = ref(false);

    const headers = [
      { text: 'Fecha', value: 'fecha' },
      { text: 'Hora', value: 'hora' },
      { text: 'Medicación', value: 'medicacion' },
      { text: 'Observaciones', value: 'observaciones' },
      { text: 'Estado de Autorización', value: 'estadoAutorizacion' },
    ];

    const fetchTratamientos = async () => {
      if (!fichaClinicaId.value) return;

      try {
        const response = await backend.get(`/tratamientos/${fichaClinicaId.value}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        tratamientos.value = response.data;
      } catch (error) {
        console.error("Error al obtener los tratamientos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "No se pudo obtener los tratamientos registrados.",
        });
      }
    };

    const openCreateModal = () => {
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const getEstadoColor = (estado) => {
      switch (estado.toLowerCase()) {
        case 'aprobado':
          return 'green';
        case 'rechazado':
          return 'red';
        case 'pendiente':
        default:
          return 'orange';
      }
    };

    onMounted(() => {
      fetchTratamientos();
    });

    return {
      fichaClinicaId,
      tratamientos,
      headers,
      showCreateModal,
      fetchTratamientos,
      openCreateModal,
      closeCreateModal,
      getEstadoColor
    };
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