<template>
  <v-row>
    <v-col cols="12" class="animal-info">
      <v-card :class="{ 'disabled-module': isDisabled }">
        <v-card-title class="section-title">Detalle de Examen Objetivo</v-card-title>
        <v-card-text class="justified-text">
          <!-- Loading state -->
          <div v-if="loading" class="text-center pa-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          
          <!-- No hay examen -->
          <div v-else-if="!examen">
            <div class="alert-container mb-4">
              <v-icon color="info" class="mr-2">mdi-information</v-icon>
              No hay examen objetivo registrado para esta ficha clínica.
            </div>
            
            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-center">
                <v-card-actions>
                  <v-btn
                    color="#0046B5"
                    @click="openCreateModal"
                    :disabled="isDisabled"
                    class="text-none"
                  >
                    <v-icon left class="mr-1">mdi-plus</v-icon>
                    Registrar Examen Objetivo
                  </v-btn>
                </v-card-actions>

                <v-card-actions>
                  <v-btn
                    color="#FB923C"
                    @click="openResena"
                    :disabled="isDisabled"
                    class="text-none"
                  >
                    <v-icon left class="mr-1">mdi-drawing</v-icon>
                    Reseña Interactiva
                  </v-btn>
                </v-card-actions>
              </v-col>
            </v-row>
          </div>

          
          <div v-else>
            <v-row>
              <!-- Columna izquierda -->
              <v-col cols="12" md="6">
                <div class="field-container">
                  <label class="field-label">Frecuencia Cardíaca (FC)</label>
                  <div class="field-value">{{ examen.FC }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Respiración</label>
                  <div class="field-value">{{ examen.Resp }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Temperatura</label>
                  <div class="field-value">{{ examen.temperatura }} °C</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Condición Corporal</label>
                  <div class="field-value">{{ examen.condicionCorporal }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Sensorio</label>
                  <div class="field-value">{{ examen.sensorio }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Fascies</label>
                  <div class="field-value">{{ examen.fascies }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Ganglios Linfáticos</label>
                  <div class="field-value">{{ examen.gangliosLinfaticos }}</div>
                </div>

              </v-col>

             

              <!-- Columna derecha -->
              <v-col cols="12" md="6">

                <div class="field-container">
                  <label class="field-label">Mucosas Aparentes</label>
                  <div class="field-value">
                    {{ examen.mucosasAparentesTipo }} {{ examen.mucosasAparentesEstado }}
                  </div>
                </div>
                <div class="field-container">
                  <label class="field-label">Piel y Subcutáneo</label>
                  <div class="field-value">{{ examen.pielSubcutaneo }}</div>
                </div>
                
               
                
                <div class="field-container">
                  <label class="field-label">Grandes Funcionales</label>
                  <div class="field-value">{{ examen.grandesFuncionales }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Actitudes Anómalas</label>
                  <div class="field-value">{{ examen.actitudesAnomalas }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">EOP</label>
                  <div class="field-value">{{ examen.EOP }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Paraclínicos</label>
                  <div class="field-value">{{ examen.paraclinicos }}</div>
                </div>
                
                <div class="field-container">
                  <label class="field-label">Diagnóstico</label>
                  <div class="field-value">{{ examen.diagnostico }}</div>
                </div>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <div class="field-container observaciones-container">
                  <label class="field-label">Observaciones</label>
                  <div class="field-value">{{ examen.observaciones }}</div>
                </div>
              </v-col>
            </v-row>
      
            <v-row v-if="!imagenResena">
              <v-col cols="12">
                <div class="alert-container">
                  <v-icon color="info" class="mr-2">mdi-information</v-icon>
                  Aun no se ha cargado una reseña para esta ficha
                </div>
              </v-col>
            </v-row>

           
            <v-row v-else class="mt-4">
              <v-col cols="12" class="d-flex justify-center">
                <img
                  :src="imagenResena"
                  alt="Reseña"
                  class="resena-image"
                />
              </v-col>
            </v-row>

            <v-row class="mt-4">
  <v-col cols="12" class="d-flex justify-center">

  <v-card-actions>
          <v-btn
              color="#0046B5"
              @click="openEditModal"
              :disabled="isDisabled"
              class="text-none"
            >
            <v-icon left class="mr-1">mdi-pencil</v-icon>
            Editar Examen Objetivo
            </v-btn>
  </v-card-actions>



<v-card-actions>
    <v-btn
      color="#FB923C"
      @click="openResena"
      :disabled="isDisabled"
      
       class="text-none"
    >
      <v-icon left class="mr-1">mdi-drawing</v-icon>
      Reseña Interactiva
    </v-btn>
  </v-card-actions>

  </v-col>
</v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- Modales -->
    <v-dialog v-model="showEditModal" max-width="600px">
      <EditExamenObjetivo
        v-if="showEditModal"
        :ficha-clinica-id="fichaClinicaId"
        :examen-objetivo="examen"
        :show-modal="showEditModal"
        @closeModal="closeEditModal"
        @examenActualizado="handleExamenActualizado"
      />
    </v-dialog>

    <v-dialog v-model="showCreateModal" max-width="600px">
      <create-examen-objetivo
        v-if="showCreateModal"
        :ficha-clinica-id="fichaClinicaId"
        :animal-id="animalId"
        @examenRegistrado="handleExamenRegistrado"
        @cerrarModal="closeCreateModal"
      />
    </v-dialog>
  </v-row>
</template>


<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import backend from "@/backend";
import CreateExamenObjetivo from './CreateExamenObjetivoPage.vue';
import EditExamenObjetivo from './EditExamenObjetivoPage.vue';
import Swal from 'sweetalert2';

export default {
  name: 'ViewExamenObjetivo',
  
  components: {
    CreateExamenObjetivo,
    EditExamenObjetivo,
  },
  computed: {
    isDisabled() {
      const estadosCerrados = ["Alta", "Fallecimiento", "Eutanasia"];
      return this.disabled || estadosCerrados.includes(this.estadoFicha);
    },
},
  
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    estadoFicha: {
      type: String,
      default: ''
    }
},

  setup() {
    const route = useRoute();
    const router = useRouter();
    const loading = ref(false);
    const fichaClinicaId = ref(route.query.fichaClinicaId);
    const animalId = ref(route.query.animalId);
    const examen = ref(null);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const imagenResena = ref(null);

    // Cargar imagen de reseña
    const cargarImagenResena = async () => {
      try {
        const response = await backend.get(`/resena/${fichaClinicaId.value}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (response.data && response.data.imagen) {
          imagenResena.value = response.data.imagen;
        } else {
          console.log('No se encontró reseña para esta ficha');
          imagenResena.value = null;
        }
      } catch (error) {
        console.error('Error al cargar la imagen:', error);
        imagenResena.value = null;
      }
    };

    const fetchExamenObjetivo = async () => {
  if (!fichaClinicaId.value) {
    console.error("Falta el ID de la ficha clínica");
    return;
  }

  loading.value = true;
  try {
    const response = await backend.get(`/examenObjetivo/fichaClinica/${fichaClinicaId.value}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.data) {
      examen.value = response.data;
    } else {
      examen.value = null;
    }
  } catch (error) {
    console.error("Error al obtener el Examen Objetivo:", error);
    // Solo mostrar el error si no es un 404
    if (error.response?.status !== 404) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el examen objetivo',
        customClass: { popup: 'swal-popup-zindex' }
      });
    }
    examen.value = null;
  } finally {
    loading.value = false;
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

    // Manejadores de eventos
    const handleExamenRegistrado = async () => {
      await fetchExamenObjetivo();
      closeCreateModal();
    };

    const handleExamenActualizado = async () => {
      await fetchExamenObjetivo();
      closeEditModal();
    };

    // Observadores
    watch(fichaClinicaId, (newVal) => {
      if (newVal) {
        fetchExamenObjetivo();
        cargarImagenResena();
      }
    });

    // Inicialización
    onMounted(() => {
      if (fichaClinicaId.value) {
        fetchExamenObjetivo();
        cargarImagenResena();
      }
    });

    return {
      examen,
      loading,
      fichaClinicaId,
      animalId,
      showCreateModal,
      showEditModal,
      imagenResena,
      openCreateModal,
      closeCreateModal,
      openEditModal,
      closeEditModal,
      openResena,
      handleExamenRegistrado,
      handleExamenActualizado,
      fetchExamenObjetivo,
      cargarImagenResena,
    };
  }
};
</script>

<style scoped>

.section-title {
  font-size: 20px;
  color: #014582;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}


.field-container {
  margin-bottom: 20px;
}
.v-btn {
  transition: transform 0.2s ease;
  
}
.v-btn:hover {
  transform: translateY(-2px);
}
.field-label {
  color: #666;
  font-size: 12px;
  margin-bottom: 8px;
  display: block;
}

.field-value {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px 12px;
  min-height: 38px;
  background-color: white;
  font-size: 14px;
  color: #333;
}


.alert-container {
  background-color: #e3f2fd;
  padding: 12px 16px;
  border-radius: 4px;
  color: #1976d2;
  display: flex;
  align-items: center;
  font-size: 14px;
}


.disabled-module {
  opacity: 0.5;
  pointer-events: none;
}
.resena-image {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}





.observaciones-container {
  margin-top: 16px;
  margin-bottom: 24px;
}

.observaciones-container .field-value {
  min-height: 60px;
}

/* Ajustes responsivos */
@media (max-width: 960px) {
  .field-container {
    margin-bottom: 16px;
  }
}
</style>
