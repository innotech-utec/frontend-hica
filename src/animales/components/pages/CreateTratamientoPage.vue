<template>
  <v-dialog v-model="createModal" max-width="600px">
    <v-card>
      <v-card-title class="primary-title text-center">Registrar Nuevo Tratamiento</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <v-text-field
            v-model="tratamiento.fecha"
            label="Fecha"
            type="date"
            :rules="[v => !!v || 'La fecha es requerida']"
            required
          ></v-text-field>
          <v-text-field
            v-model="tratamiento.hora"
            label="Hora"
            type="time"
            :rules="[v => !!v || 'La hora es requerida']"
            required
          ></v-text-field>
          <v-text-field
            v-model="tratamiento.medicacion"
            label="Medicación"
            :rules="DatosRules"
            required
             @blur="normalizeText('medicacion')"
          ></v-text-field>
          <v-textarea
            v-model="tratamiento.observaciones"
            label="Observaciones"
            :rules="DatosRulesNorequiered"
            required
             @blur="normalizeText('observaciones')"
          ></v-textarea>
          
          <v-select
            v-if="!loadingVeterinarios"
            v-model="tratamiento.veterinarioId"
            :items="veterinariosSimplificados"
            item-title="nombre"
            item-value="id"
            label="Veterinario"
            :rules="[v => !!v || 'El veterinario es requerido']"
            required
          >
            <template v-slot:item="{ item, props }">
              <v-list-item
                v-bind="props"
                :title="item.raw.nombre"
              ></v-list-item>
            </template>
          </v-select>
          <v-progress-circular
            v-else
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onSubmit" :loading="loading" :disabled="!valid">Registrar</v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import backend from "@/backend";
import Swal from 'sweetalert2';

export default {
  name: 'TratamientoForm',
  setup(props, { emit }) {
    const route = useRoute();
    const fichaClinicaId = route.query.fichaClinicaId;
    const animalId = route.query.animalId;

    const form = ref(null);
    const valid = ref(false);
    const createModal = ref(true);
    const loading = ref(false);
    const loadingVeterinarios = ref(true);

    const tratamiento = reactive({
      fecha: '',
      hora: '',
      medicacion: '',
      observaciones: '',
      estadoAutorizacion: 'PENDIENTE',
      veterinarioId: null,
      fichaClinicaId: fichaClinicaId,
      animalId: animalId
    });

    const veterinariosSimplificados = ref([]);

    const fetchVeterinarios = async () => {
      loadingVeterinarios.value = true;
      try {
        const response = await backend.get('/veterinarios');
        console.log('Respuesta completa:', response);

        if (Array.isArray(response.data)) {
          veterinariosSimplificados.value = response.data.map(vet => ({
            id: vet.id,
            nombre: `${vet.user.nombre} ${vet.user.apellido}`
          }));
        } else {
          throw new Error('Formato de respuesta inválido');
        }

        console.log('veterinariosSimplificados:', veterinariosSimplificados.value);
      } catch (error) {
        console.error('Error al obtener veterinarios:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los veterinarios.",
        });
      } finally {
        loadingVeterinarios.value = false;
      }
    };

    const onSubmit = async () => {
      if (!form.value) return;
      
      const isValid = await form.value.validate();
      if (isValid) {
        if (!tratamiento.veterinarioId) {
          Swal.fire({
            icon: "warning",
            title: "Error de selección",
            text: "Debe seleccionar un veterinario.",
          });
          return;
        }
        crearTratamiento();
      } else {
        Swal.fire({
          icon: "warning",
          title: "Formulario Incompleto",
          text: "Por favor completa todos los campos requeridos.",
        });
      }
    };
    const normalizeText = (field) => {
      if (tratamiento[field]) {
        tratamiento[field] = tratamiento[field].toUpperCase().trim()
      }
    };
    const DatosRules = [
      v => !!v || 'Este campo es requerido',
      v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
      v => v && v.trim().length > 0 || 'El campo no puede contener solo espacios',
      v => (v && v.length >= 1 && v.length <= 100) || 'El campo debe tener entre 1 y 100 caracteres',
    ]
    const DatosRulesNorequiered = [
  v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
  v => !v || v.trim().length > 0 || 'El campo no puede contener solo espacios',
  
]
    const crearTratamiento = async () => {
      loading.value = true;
      try {
        if (!fichaClinicaId || !animalId) {
          throw new Error('Falta el ID de la ficha clínica o del animal');
        }

        const tratamientoData = {
          ...tratamiento,
          fichaClinicaId: fichaClinicaId,
          animalId: animalId
        };

        await backend.post('/tratamientos', tratamientoData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });


        console.log(fichaClinicaId);
        console.log(tratamiento.veterinarioId);

        //Asignar por defecto ficha a veterinario
        await backend.post('/asignacion', {
          fichaClinicaId: fichaClinicaId,
          veterinarioId: tratamiento.veterinarioId
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        Swal.fire({
          title: "Tratamiento Registrado",
          text: "El tratamiento ha sido registrado con éxito.",
          icon: "success",
        });

        closeModal();
        emit('tratamientoRegistrado');
      } catch (error) {
        console.error('Error al crear tratamiento:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || error.response?.data?.message || "No se pudo registrar el tratamiento.",
        });
      } finally {
        loading.value = false;
      }
    };

    const closeModal = () => {
      createModal.value = false;
      emit('cerrarModal');
    };

    onMounted(() => {
      if (!fichaClinicaId || !animalId) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo obtener la información necesaria de la URL.",
        });
        closeModal();
      } else {
        fetchVeterinarios();
      }
    });

    return {
      form,
      valid,
      createModal,
      tratamiento,
      veterinariosSimplificados,
      loading,
      loadingVeterinarios,
      onSubmit,
      closeModal,
      normalizeText,
      DatosRulesNorequiered,
      DatosRules,
    };
  }
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}

.v-btn.secondary {
  background-color: #008575;
}

.v-btn.secondary:hover {
  background-color: #007460;
}

.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}
</style>