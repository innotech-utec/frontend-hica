<template>
  <v-dialog v-model="editModal" max-width="600px">
    <v-card>
      <v-card-title class="primary-title text-center">Editar Tratamiento</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <!-- Campo de fecha -->
          <v-text-field
            v-model="localTratamiento.fecha"
            label="Fecha"
            type="date"
            :rules="[v => !!v || 'La fecha es requerida']"
            required
          ></v-text-field>

          <!-- Campo de hora -->
          <v-text-field
            v-model="localTratamiento.hora"
            label="Hora"
            type="time"
            :rules="[v => !!v || 'La hora es requerida']"
            required
          ></v-text-field>

          <v-text-field
            v-model="localTratamiento.medicacion"
            label="Medicación"
            :rules="DatosRules"
            required
             @blur="normalizeText('medicacion')"
          ></v-text-field>

          <v-textarea
            v-model="localTratamiento.observaciones"
            label="Observaciones"
            :rules="DatosRulesNorequiered"
            required
             @blur="normalizeText('observaciones')"
          ></v-textarea>

          <!-- Veterinarios v-select -->
          <v-select
            v-if="!loadingVeterinarios"
            v-model="localTratamiento.veterinarioId"
            :items="veterinariosSimplificados"
            item-title="nombre"
            item-value="id"
            label="Veterinario"
            :rules="[v => !!v || 'El veterinario es requerido']"
            required
          ></v-select>

          <v-progress-circular
            v-else
            indeterminate
            color="primary"
          ></v-progress-circular>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onSubmit" :loading="loading" :disabled="!valid">Guardar</v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import backend from "@/backend";
import Swal from 'sweetalert2';

export default {
  name: 'EditTratamiento',
  props: {
    tratamiento: Object,
  },
  setup(props, { emit }) {
    const form = ref(null);
    const valid = ref(false);
    const editModal = ref(true);
    const loading = ref(false);
    const loadingVeterinarios = ref(true);

    // Definir localTratamiento con valores iniciales del tratamiento
    const localTratamiento = reactive({
      ...props.tratamiento,
      fecha: props.tratamiento.fecha ? props.tratamiento.fecha.substring(0, 10) : '',
      hora: props.tratamiento.hora ? props.tratamiento.hora.substring(0, 5) : '',
      veterinarioId: props.tratamiento.veterinario?.id || null, // Asigna veterinarioId si ya existe
    });

    const veterinariosSimplificados = ref([]);

    // Cargar los veterinarios y asignar el veterinario correcto
    const fetchVeterinarios = async () => {
      loadingVeterinarios.value = true;
      try {
        const response = await backend.get('/veterinarios');
        if (Array.isArray(response.data)) {
          veterinariosSimplificados.value = response.data.map(vet => ({
            id: vet.id,
            nombre: `${vet.user.nombre} ${vet.user.apellido}`,
          }));

          // Buscar y asignar el veterinario al tratamiento si ya está asignado
          const currentVeterinario = veterinariosSimplificados.value.find(
            vet => vet.id === localTratamiento.veterinarioId
          );
          if (currentVeterinario) {
            localTratamiento.veterinarioId = currentVeterinario.id;
          }
        } else {
          throw new Error('Formato de respuesta inválido');
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los veterinarios.',
        });
      } finally {
        loadingVeterinarios.value = false;
      }
    };
    const normalizeText = (field) => {
      if (localTratamiento[field]) {
        localTratamiento[field] = localTratamiento[field].toUpperCase().trim()
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
    // Función para actualizar el tratamiento
    const onSubmit = async () => {
      const isValid = await form.value.validate();
      if (isValid) {
        try {
          const tratamientoData = { ...localTratamiento };
          tratamientoData.fecha = localTratamiento.fecha;
          tratamientoData.hora = localTratamiento.hora + ':00';

          await backend.patch(`/tratamientos/${tratamientoData.id}`, tratamientoData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });

          Swal.fire({
            title: 'Tratamiento Actualizado',
            text: 'El tratamiento ha sido actualizado con éxito.',
            icon: 'success',
          });

          closeModal();
          emit('tratamientoActualizado');
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el tratamiento.',
          });
        }
      }
    };

    // Función para cerrar el modal
    const closeModal = () => {
      editModal.value = false;
      emit('cerrarModal');
    };

    // Ejecutar fetchVeterinarios al montar el componente
    onMounted(() => {
      fetchVeterinarios();
    });

    // Si el tratamiento cambia, actualizar los datos
    watch(() => props.tratamiento, () => {
      localTratamiento.veterinarioId = props.tratamiento.veterinario?.id || null;
      localTratamiento.fecha = props.tratamiento.fecha ? props.tratamiento.fecha.substring(0, 10) : '';
      localTratamiento.hora = props.tratamiento.hora ? props.tratamiento.hora.substring(0, 5) : '';
    });

    return {
      form,
      valid,
      editModal,
      localTratamiento,
      veterinariosSimplificados,
      loading,
      loadingVeterinarios,
      onSubmit,
      closeModal,
      normalizeText,
      DatosRules,
      DatosRulesNorequiered,
    };
  },
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}
</style>
