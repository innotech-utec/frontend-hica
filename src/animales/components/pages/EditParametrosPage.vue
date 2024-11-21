<template>
  <v-dialog v-model="editModal" max-width="600px">
    <v-card>
      <v-card-title>Editar Parámetros</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <!-- Campo de fecha -->
          <v-text-field
            v-model="localParametro.fecha"
            label="Fecha"
            type="date"
            :rules="[v => !!v || 'La fecha es requerida']"
            required
          ></v-text-field>

          <!-- Campo de hora -->
          <v-text-field
            v-model="localParametro.hora"
            label="Hora"
            type="time"
            :rules="[v => !!v || 'La hora es requerida']"
            required
          ></v-text-field>

          <v-text-field
            v-model="localParametro.FC"
            label="FC"
            required
          ></v-text-field>

          <v-textarea
            v-model="localParametro.FR"
            label="FR"
            required
          ></v-textarea>

          <v-textarea
            v-model="localParametro.temperatura"
            label="Temperatura"
            required
          ></v-textarea>

          <v-textarea
            v-model="localParametro.mucosas"
            label="Mucosas"
            required
          ></v-textarea>

          <v-textarea
            v-model="localParametro.TllC"
            label="TllC"
            required
          ></v-textarea>

          <v-textarea
            v-model="localParametro.pliegueCutaneo"
            label="Pliegue Cutáneo"
            required
          ></v-textarea>

          <v-textarea
            v-model="localParametro.observaciones"
            label="Observaciones"
            required
          ></v-textarea>

          <!-- Mostrar el progreso solo si está cargando -->
          <v-progress-circular
            v-if="loading"
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
import { ref, reactive, watch } from 'vue';
import backend from "@/backend";
import Swal from 'sweetalert2';

export default {
  name: 'EditParametro',
  props: {
    parametro: Object,
  },
  setup(props, { emit }) {
    const form = ref(null);
    const valid = ref(false);
    const editModal = ref(true);
    const loading = ref(false);

    // Definir localParametro con valores iniciales del parámetro
    const localParametro = reactive({
      ...props.parametro,
      fecha: props.parametro.fecha ? props.parametro.fecha.substring(0, 10) : '',
      hora: props.parametro.hora ? props.parametro.hora.substring(0, 5) : '',
    });

    // Función para actualizar el parámetro
    const onSubmit = async () => {
      const isValid = await form.value.validate();
      if (isValid) {
        loading.value = true;
        try {
          const parametroData = { ...localParametro };
          parametroData.fecha = localParametro.fecha;
          parametroData.hora = localParametro.hora + ':00';

          await backend.patch(`/registroParametros/${parametroData.id}`, parametroData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });

          Swal.fire({
            title: 'Parámetro Actualizado',
            text: 'El parámetro ha sido actualizado con éxito.',
            icon: 'success',
          });

          closeModal();
          emit('parametroActualizado');
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el parámetro.',
          });
        } finally {
          loading.value = false;
        }
      }
    };

    // Función para cerrar el modal
    const closeModal = () => {
      editModal.value = false;
      emit('cerrarModal');
    };

    // Si el parámetro cambia, actualizar los datos locales
    watch(() => props.parametro, (newParametro) => {
      Object.assign(localParametro, {
        ...newParametro,
        fecha: newParametro.fecha ? newParametro.fecha.substring(0, 10) : '',
        hora: newParametro.hora ? newParametro.hora.substring(0, 5) : '',
      });
    });

    return {
      form,
      valid,
      editModal,
      localParametro,
      loading,
      onSubmit,
      closeModal,
    };
  },
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
</style>
