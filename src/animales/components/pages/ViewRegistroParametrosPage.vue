<template>
  <v-row>
    <v-col cols="12" class="animal-info">
      <v-card :class="{ 'disabled-module': isDisabled }">
        <v-card-title class="section-title">Detalle de toma de Parámetros</v-card-title>
        <v-card-text class="justified-text">
          <!-- Mostrar tabla de parámetros si ya están registrados -->
          <v-data-table v-if="parametros.length > 0" :items="parametros" :headers="headers" class="mb-5">
            <template #item="{ item }">
              <tr>
                <td>{{ item.fecha }}</td>
                <td>{{ item.hora }}</td>
                <td>{{ item.FC }}</td>
                <td>{{ item.FR }}</td>
                <td>{{ item.temperatura }}</td>
                <td>{{ item.mucosas }}</td>
                <td>{{ item.TllC }}</td>
                <td>{{ item.pliegueCutaneo }}</td>
                <td>{{ item.observaciones }}</td>
                <td>
                  <v-card-actions>
                    <v-btn icon @click="openEditModal(item)" :disabled="isDisabled" outlined>
                      <v-icon color="#014582">mdi-pencil</v-icon>
                    </v-btn>
                  </v-card-actions>
                </td>
              </tr>
            </template>
          </v-data-table>
          <p v-else>No hay registros de parámetros disponibles.</p>
          <v-card-actions>
            <v-btn color="primary" :disabled="isDisabled" @click="openCreateModal" outlined>
              <v-icon left>mdi-pencil</v-icon> Registrar Parámetros
            </v-btn>
          </v-card-actions>
        </v-card-text>

        <!-- Modal para registrar nuevos parámetros -->
        <CreateParametrosPage
          v-if="showCreateModal"
          :ficha-clinica-id="fichaClinicaId"
          @closeModal="showCreateModal = false"
          @parametroRegistrado="fetchParametros"
        />

        <!-- Modal para editar parámetros -->
        <EditParametrosPage
          v-if="showEditModal"
          :parametro="parametroSeleccionado"
          @ParametroActualizado="fetchParametros"
          @cerrarModal="showEditModal = false"
        />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import CreateParametrosPage from '@/animales/components/pages/CreateParametrosPage.vue';
import EditParametrosPage from '@/animales/components/pages/EditParametrosPage.vue';

export default {
  props: ['fichaClinicaId', 'disabled', 'estadoFicha'],
  components: {
    CreateParametrosPage,
    EditParametrosPage,
  },
  data() {
    return {
      parametros: [],
      tratamientos: [],
      showCreateModal: false,
      showEditModal: false,
      parametroSeleccionado: null,
      headers: [
        { text: 'Fecha', value: 'fecha' },
        { text: 'Hora', value: 'hora' },
        { text: 'Frecuencia Cardíaca (FC)', value: 'FC' },
        { text: 'Frecuencia Respiratoria (FR)', value: 'FR' },
        { text: 'Temperatura (°C)', value: 'temperatura' },
        { text: 'Mucosas', value: 'mucosas' },
        { text: 'TllC', value: 'TllC' },
        { text: 'Pliegue Cutáneo', value: 'pliegueCutaneo' },
        { text: 'Observaciones', value: 'observaciones' },
        { text: 'Acciones', value: 'acciones' }
      ],
    };
  },
  computed: {
    isDisabled() {
      const estadosCerrados = ['Alta', 'Fallecimiento', 'Eutanasia'];
      return this.disabled || estadosCerrados.includes(this.estadoFicha);
    },
  },
  watch: {
    fichaClinicaId(newId) {
      if (newId) {
        this.fetchParametros();
        this.fetchTratamientos();
      }
    }
  },
  methods: {
    formatFecha(fecha) {
      if (!fecha) return "Fecha inválida";
      
      const dateObj = new Date(fecha);
      if (isNaN(dateObj.getTime())) return "Fecha inválida";

      const day = String(dateObj.getUTCDate()).padStart(2, '0');
      const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
      const year = dateObj.getUTCFullYear();
      return `${day}/${month}/${year}`;
    },
    async fetchParametros() {
      if (!this.fichaClinicaId) return;

      try {
        const response = await backend.get(`/registroParametros/fichaClinica/${this.fichaClinicaId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        // Asigna los parámetros aplicando formatFecha antes de renderizar
        this.parametros = response.data.map(parametro => ({
          ...parametro,
          fecha: this.formatFecha(parametro.fecha),
          hora: parametro.hora.slice(0, 5)
        }));
      } catch (error) {
        console.error("Error al obtener los parámetros:", error);
        // Evitar mensaje de error si no hay parámetros en la respuesta
        if (error.response && error.response.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo obtener los parámetros registrados.",
          });
        }
      }
    },
    async fetchTratamientos() {
      if (!this.fichaClinicaId) return;

      try {
        const response = await backend.get(`/tratamientos/${this.fichaClinicaId}`, {
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
      this.showCreateModal = true;
    },
    openEditModal(parametro) {
      this.parametroSeleccionado = { ...parametro };
      this.showEditModal = true;
    },
  },
  created() {
    if (this.fichaClinicaId) {
      this.fetchParametros();
      this.fetchTratamientos();
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
