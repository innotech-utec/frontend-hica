<template>
  <v-card :class="{ 'disabled-module': disabled }">
    <v-card-title class="section-title">Tratamientos Registrados</v-card-title>
    <v-card-text>
      <!-- v-data-table con encabezados -->
      <v-data-table
        v-if="tratamientos.length > 0"
        :items="tratamientos"
        :headers="headers"
        item-key="id"
        class="mb-5"
      >
        <!-- Eliminamos el v-slot:item personalizado y usamos el formato correcto para headers -->
        <template v-slot:[`item.fecha`]="{ item }">
          {{ formatFecha(item.fecha) }}
        </template>
        <template v-slot:[`item.veterinario`]="{ item }">
          {{ item.veterinario?.user?.nombre || 'Desconocido' }} {{ item.veterinario?.user?.apellido || '' }}
        </template>
        <template v-slot:[`item.estadoAutorizacion`]="{ item }">
          <v-chip :color="getEstadoColor(item.estadoAutorizacion)">
            {{ item.estadoAutorizacion }}
          </v-chip>
        </template>
        <template v-slot:[`item.acciones`]="{ item }">
          <v-btn 
            icon 
            @click="openEditModal(item)" 
            :disabled="disabled" 
            outlined 
            style="margin:20px;"
            title="Editar tratamiento"
          >
            <v-icon color="#014582">mdi-pencil</v-icon>
          </v-btn>
          <v-btn 
            icon 
            @click="completarTratamiento(item)" 
            :disabled="disabled || item.estadoAutorizacion !== 'APROBADO'" 
            outlined 
            style="margin:20px;"
            title="Marcar como completado"
          >
            <v-icon :color="item.estadoAutorizacion !== 'APROBADO' ? '#9e9e9e' : '#4CAF50'">
              mdi-check-circle
            </v-icon>
          </v-btn>
        </template>
        
      </v-data-table>

      <p v-else>No hay tratamientos registrados.</p>

      <v-card-actions>
        <v-btn color="primary" @click="openCreateModal" outlined :disabled="disabled">
          <v-icon left>mdi-pencil</v-icon> Registrar Tratamiento
        </v-btn>
      </v-card-actions>
    </v-card-text>

    <!-- Modales para crear y editar tratamientos -->
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
import { ref, onMounted, watch } from 'vue';
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateTratamiento from '@/animales/components/pages/CreateTratamientoPage.vue';
import EditTratamiento from '@/animales/components/pages/EditTratamientoPage.vue';

export default {
  components: {
    CreateTratamiento,
    EditTratamiento,
  },
  props: ['animalId', 'fichaClinicaId', 'disabled'],
  setup(props) {
    const tratamientos = ref([]);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const tratamientoSeleccionado = ref(null);

    // Headers de la tabla actualizados con el formato correcto
    const headers = ref([
      { 
        title: 'Fecha',
        align: 'start',
        sortable: true,
        key: 'fecha',
      },
      { 
        title: 'Hora',
        align: 'start',
        sortable: true,
        key: 'hora',
      },
      { 
        title: 'Medicación',
        align: 'start',
        sortable: true,
        key: 'medicacion',
      },
      { 
        title: 'Observaciones',
        align: 'start',
        sortable: true,
        key: 'observaciones',
      },
      { 
        title: 'Veterinario',
        align: 'start',
        sortable: true,
        key: 'veterinario',
      },
      { 
        title: 'Estado',
        align: 'start',
        sortable: true,
        key: 'estadoAutorizacion',
      },
      { 
        title: 'Acciones',
        align: 'center',
        sortable: false,
        key: 'acciones',
      },
    ]);

    const fetchTratamientos = async () => {
      if (!props.fichaClinicaId) return;

      try {
        const response = await backend.get(`/tratamientos/${props.fichaClinicaId}`, {
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

    const formatFecha = (fecha) => {
      const dateObj = new Date(fecha);
      return dateObj.toLocaleDateString('es-ES', { timeZone: 'UTC' });
    };

    const openCreateModal = () => {
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const openEditModal = (tratamiento) => {
      tratamientoSeleccionado.value = { ...tratamiento };
      showEditModal.value = true;
    };

    const completarTratamiento = async (tratamiento) => {
      try {
        await Swal.fire({
          title: '¿Confirmar acción?',
          text: '¿Está seguro que desea marcar este tratamiento como completado?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#4CAF50',
          cancelButtonColor: '#9e9e9e',
          confirmButtonText: 'Sí, completar',
          cancelButtonText: 'Cancelar'
        }).then(async (result) => {
          if (result.isConfirmed) {
            const response = await backend.put(
              `/tratamientos/${tratamiento.id}/COMPLETADO`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
              }
            );

            if (response.status === 200) {
              await Swal.fire({
                icon: 'success',
                title: 'Tratamiento completado',
                text: 'El tratamiento ha sido marcado como completado exitosamente.',
                timer: 2000,
                showConfirmButton: false
              });
              
              // Recargar los tratamientos para reflejar el cambio
              await fetchTratamientos();
            }
          }
        });
      } catch (error) {
        console.error("Error al completar el tratamiento:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'No se pudo completar el tratamiento.',
        });
      }
    };

    const closeEditModal = () => {
      showEditModal.value = false;
    };

    const getEstadoColor = (estado) => {
      switch (estado?.toLowerCase()) {
        case 'aprobado':
          return 'blue';
        case 'rechazado':
          return 'red';
        case 'completado':
          return 'green';
        case 'pendiente':
        default:
          return 'orange';
      }
    };

    // Vigilar cambios en fichaClinicaId para cargar tratamientos
    watch(() => props.fichaClinicaId, (newId) => {
      if (newId) fetchTratamientos();
    });

    // Llamada inicial para cargar tratamientos
    onMounted(() => {
      if (props.fichaClinicaId) fetchTratamientos();
    });

    return {
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
      completarTratamiento,
      getEstadoColor,
      formatFecha,
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

.section-title {
  font-size: 20px;
  color: #014582;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}

.v-btn {
  margin-top: 20px;
}

.v-btn.primary {
  background-color: #014582;
  color: white;
}

.v-btn.primary:hover {
  background-color: #013262;
}

.v-btn.secondary {
  background-color: #008575;
}

.v-btn.secondary:hover {
  background-color: #007460;
}

/* Estilo para módulos deshabilitados */
.disabled-module {
  opacity: 0.5;
  pointer-events: none;
}
</style>
