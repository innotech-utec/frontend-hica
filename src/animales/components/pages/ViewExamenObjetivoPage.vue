<template>
  <v-row>
    <v-col cols="12" class="animal-info">
      <v-card :class="{ 'disabled-module': disabled }">
        <v-card-title class="section-title">Detalle del Examen Objetivo</v-card-title>
        <v-card-text class="justified-text">
          <!-- Mostrar detalles del examen si ya está creado -->
          <div v-if="examen">
            <p><strong>Frecuencia Cardíaca (FC):</strong> {{ examen.FC }}</p>
            <p><strong>Respiración:</strong> {{ examen.Resp }}</p>
            <p><strong>Temperatura:</strong> {{ examen.temperatura }} °C</p>
            <p><strong>Condición Corporal:</strong> {{ examen.condicionCorporal }}</p>
            <p><strong>Sensorio:</strong> {{ examen.sensorio }}</p>
            <p><strong>Fascies:</strong> {{ examen.fascies }}</p>
            <p><strong>Ganglios Linfáticos:</strong> {{ examen.gangliosLinfaticos }}</p>
            <p><strong>Piel y Subcutáneo:</strong> {{ examen.pielSubcutaneo }}</p>
            <p><strong>Mucosas Aparentes:</strong> {{ examen.mucosasAparentes }}</p>
            <p><strong>Grandes Funcionales:</strong> {{ examen.grandesFuncionales }}</p>
            <p><strong>Actitudes Anómalas:</strong> {{ examen.actitudesAnomales }}</p>
            <p><strong>EOP:</strong> {{ examen.EOP }}</p>
            <p><strong>Paraclínicos:</strong> {{ examen.paraclinicos }}</p>
            <p><strong>Diagnóstico:</strong> {{ examen.diagnostico }}</p>
            <p><strong>Observaciones:</strong> {{ examen.observaciones }}</p>
            <v-card-actions>
              <v-btn color="primary" @click="openEditModal" :disabled="disabled" outlined>
                <v-icon left>mdi-pencil</v-icon> Editar Examen Objetivo
              </v-btn>
              <v-btn color="secondary" @click="openResena" :disabled="disabled" outlined>
                <v-icon left>mdi-drawing</v-icon> Reseña Interactiva
              </v-btn>
            </v-card-actions>
          </div>

          <div v-else>
            <v-card-actions>
              <v-btn color="primary" @click="openCreateModal" :disabled="disabled" outlined>
                <v-icon left>mdi-pencil</v-icon> Registrar Examen Objetivo
              </v-btn>
            </v-card-actions>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- Modal para editar examen objetivo -->
  <v-dialog v-model="showEditModal" max-width="600px">
    <EditExamenObjetivo
      v-if="showEditModal"
      :ficha-clinica-id="fichaClinicaId"
      :examen-objetivo="examen"
      :show-modal="showEditModal"
      @closeModal="closeEditModal"
      @examenActualizado="fetchExamenObjetivo"
    />
  </v-dialog>

  <!-- Modal para crear examen objetivo -->
  <v-dialog v-model="showCreateModal" max-width="600px">
    <create-examen-objetivo
      v-if="showCreateModal"
      :ficha-clinica-id="fichaClinicaId"
      :animal-id="animalId"
      @examenRegistrado="fetchExamenObjetivo"
      @cerrarModal="closeCreateModal"
    />
  </v-dialog>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import backend from "@/backend";
import CreateExamenObjetivo from './CreateExamenObjetivoPage.vue';
import EditExamenObjetivo from './EditExamenObjetivoPage.vue';

export default {
  components: {
    CreateExamenObjetivo,
    EditExamenObjetivo,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const route = useRoute();
    const fichaClinicaId = ref(route.query.fichaClinicaId);
    const animalId = ref(route.query.animalId);
    const examen = ref(null);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);

    const fetchExamenObjetivo = async () => {
      if (!fichaClinicaId.value) {
        console.error("Falta el ID de la ficha clínica");
        return;
      }

      try {
        const response = await backend.get(`/examenObjetivo/fichaClinica/${fichaClinicaId.value}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        examen.value = response.data;
      } catch (error) {
        examen.value = null;
        console.error("Error al obtener el Examen Objetivo:", error);
      }
    };

    const openCreateModal = () => {
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const openEditModal = () => {
      showEditModal.value = true;
    };

    const closeEditModal = () => {
      showEditModal.value = false;
    };

    onMounted(() => {
      fetchExamenObjetivo();
    });

    return {
      examen,
      fichaClinicaId,
      animalId,
      showCreateModal,
      showEditModal,
      openCreateModal,
      closeCreateModal,
      openEditModal,
      closeEditModal,
      fetchExamenObjetivo,
    };
  },
};
</script>

<style scoped>
.disabled-module {
  opacity: 0.6;
  pointer-events: none;
  color: #9e9e9e;
}
.page-title {
  font-size: 28px;
  color: #014582;
  font-weight: bold;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-title {
  font-size: 20px;
  color: #014582;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}
</style>
