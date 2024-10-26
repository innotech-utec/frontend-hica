<template>
  <v-card>
    <v-card-title>Tratamientos Registrados</v-card-title>
    <v-card-text>
      <!-- v-data-table con encabezados -->
      <v-data-table
        v-if="tratamientos.length > 0"
        :items="tratamientos"
        :headers="headers"
        item-key="id"
      >
        <template v-slot:item="{ item }">
          <tr>
            <!-- Usar toLocaleDateString con el formato adecuado para manejar correctamente la fecha -->
            <td>{{ new Date(item.fecha).toLocaleDateString('es-ES', { timeZone: 'UTC' }) }}</td>
            <td>{{ item.hora }}</td>
            <td>{{ item.medicacion }}</td>
            <td>{{ item.observaciones }}</td>
            <td>{{ item.veterinario?.user?.nombre || 'Desconocido' }} {{ item.veterinario?.user?.apellido || '' }}</td>
            <td>
              <v-chip :color="getEstadoColor(item.estadoAutorizacion)">
                {{ item.estadoAutorizacion }}
              </v-chip>
            </td>
            <td>
              <v-card-actions>
              <v-btn icon @click="openEditModal(item)">
                <v-icon color="#014582">mdi-pencil</v-icon> <!-- Cambiado el color del ícono -->
              </v-btn>
            </v-card-actions>
            </td>
          </tr>
        </template>
      </v-data-table>

      <p v-else>No hay tratamientos registrados.</p>

      <v-card-actions>
              
              <v-btn color="primary" @click="openCreateModal" outlined>
                <v-icon left>mdi-pencil</v-icon> Registrar Tratamiento
              </v-btn>
            </v-card-actions>
    </v-card-text>

    <create-tratamiento
      v-if="showCreateModal"
      :animal-id="animalId"
      :ficha-clinica-id="fichaClinicaId"
      @tratamientoRegistrado="fetchTratamientos"
      @cerrarModal="closeCreateModal"
    ></create-tratamiento>

    <edit-tratamiento
      v-if="showEditModal"
      :tratamiento="tratamientoSeleccionado"
      @tratamientoActualizado="fetchTratamientos"
      @cerrarModal="closeEditModal"
    ></edit-tratamiento>
  </v-card>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateTratamiento from '@/animales/components/pages/CreateTratamientoPage.vue';
import EditTratamiento from '@/animales/components/pages/EditTratamientoPage.vue';

export default {
  components: {
    CreateTratamiento,
    EditTratamiento,
  },

  setup() {
    const route = useRoute();
    const fichaClinicaId = ref(route.query.fichaClinicaId);
    const tratamientos = ref([]);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const tratamientoSeleccionado = ref(null);

    // Títulos de las columnas
    const headers = [
      { text: 'Fecha del Tratamiento', value: 'fecha' },
      { text: 'Hora del Tratamiento', value: 'hora' },
      { text: 'Medicación', value: 'medicacion' },
      { text: 'Observaciones', value: 'observaciones' },
      { text: 'Veterinario Asignado', value: 'veterinario' },
      { text: 'Estado de Autorización', value: 'estadoAutorizacion' },
      { text: 'Acciones', value: 'acciones' }, 
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

    const openEditModal = (tratamiento) => {
      tratamientoSeleccionado.value = { ...tratamiento }; // Clonamos el tratamiento
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
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
      showEditModal,
      tratamientoSeleccionado,
      fetchTratamientos,
      openCreateModal,
      closeCreateModal,
      openEditModal,
      closeEditModal,
      getEstadoColor,
    };
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

.v-btn {
  margin-top: 20px;
}
</style>
