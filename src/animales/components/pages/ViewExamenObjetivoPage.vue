<template>
  <v-row>
    <v-col cols="12">
      <v-card :class="{ 'disabled-module': disabled }" flat>
        <v-card-title class="info-title">Detalle del Examen Objetivo</v-card-title>
        <v-card-text>
          <!-- Mostrar detalles del examen si ya está creado -->
          <div v-if="examen">
            <v-row>
              <v-col cols="12" md="6">
                <div class="field-group">
                  <label class="field-label">Frecuencia Cardíaca (FC)</label>
                  <div class="field-value">{{ examen.FC }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Respiración</label>
                  <div class="field-value">{{ examen.Resp }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Temperatura</label>
                  <div class="field-value">{{ examen.temperatura }} °C</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Condición Corporal</label>
                  <div class="field-value">{{ examen.condicionCorporal }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Sensorio</label>
                  <div class="field-value">{{ examen.sensorio }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Fascies</label>
                  <div class="field-value">{{ examen.fascies }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Ganglios Linfáticos</label>
                  <div class="field-value">{{ examen.gangliosLinfaticos }}</div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="field-group">
                  <label class="field-label">Piel y Subcutáneo</label>
                  <div class="field-value">{{ examen.pielSubcutaneo }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Mucosas Aparentes</label>
                  <div class="field-value">{{ examen.mucosasAparentes }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Grandes Funcionales</label>
                  <div class="field-value">{{ examen.grandesFuncionales }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Actitudes Anómalas</label>
                  <div class="field-value">{{ examen.actitudesAnomales }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">EOP</label>
                  <div class="field-value">{{ examen.EOP }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Paraclínicos</label>
                  <div class="field-value">{{ examen.paraclinicos }}</div>
                </div>
                <div class="field-group">
                  <label class="field-label">Diagnóstico</label>
                  <div class="field-value">{{ examen.diagnostico }}</div>
                </div>
              </v-col>
            </v-row>

            <div class="field-group">
              <label class="field-label">Observaciones</label>
              <div class="field-value">{{ examen.observaciones }}</div>
            </div>


            <v-row class="mt-4">
    <v-col cols="12" class="d-flex justify-center">
      <img
        v-if="imagenResena"
        :src="imagenResena"
        alt="Reseña"
        class="resena-image"
      />
      <v-alert
        v-else
        type="info"
        text="Aun no se ha cargado una reseña para esta ficha"
      ></v-alert>
    </v-col>
  </v-row>

            <!-- Botones -->
            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-center">
                <v-btn color="primary" @click="openEditModal" :disabled="disabled" class="mx-2">
                  <v-icon left>mdi-pencil</v-icon> Editar Examen Objetivo
                </v-btn>
                <v-btn color="primary" @click="openResena" :disabled="disabled" class="mx-2">
                  <v-icon left>mdi-drawing</v-icon> Reseña Interactiva
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <div v-else>
            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-center">
                <v-btn color="primary" @click="openCreateModal" :disabled="disabled">
                  <v-icon left>mdi-pencil</v-icon> Registrar Examen Objetivo
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>


  <!-- Los modales se mantienen igual -->
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
import { useRoute, useRouter } from 'vue-router';
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
    const router = useRouter();
    const fichaClinicaId = ref(route.query.fichaClinicaId);
    const animalId = ref(route.query.animalId);
    const examen = ref(null);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const imagenResena = ref(null);

    const cargarImagenResena = async () => {
      try {
        console.log("reseña")
        const response = await backend.get(`/resena/${fichaClinicaId.value}`)
        if (response.data && response.data.imagen) {
          imagenResena.value = response.data.imagen
        } else {
          console.log('No se encontró reseña para esta ficha')
          imagenResena.value = null
        }
      } catch (error) {
        console.error('Error al cargar la imagen:', error)
        imagenResena.value = null
      }
    };

    const fetchExamenObjetivo = async () => {
      if (!fichaClinicaId.value) {
        console.log("fetch examen")
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

    const openResena = () => {
      router.push({
        name: 'resena.create',
        query: {
          fichaClinicaId: fichaClinicaId.value,
          animalId: animalId.value
        }
      });
    };

    onMounted(() => {
      fetchExamenObjetivo();
      cargarImagenResena();
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
      openResena,
      imagenResena,
      cargarImagenResena,
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

.info-title {
  color: #0F3460;
  font-size: 18px;
  font-weight: 500;
  padding: 12px 16px;
}

.field-group {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.field-value {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  background-color: white;
  min-height: 48px;
  display: flex;
  align-items: center;
}

.resena-image {
  max-width: 100%;
  height: auto;
}

.v-btn {
  text-transform: none;
}

.v-btn.primary {
  background-color: #014582;
  color: white;
}

.v-btn.primary:hover {
  background-color: #013262;
}
</style>