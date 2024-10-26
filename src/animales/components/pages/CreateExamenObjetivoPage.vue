<template>
  <v-dialog v-model="createModal" max-width="600px">
    <v-card>
      <v-card-title>Registrar Examen Objetivo</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <!-- Campos obligatorios -->
          <v-text-field
            v-model="examenObjetivo.FC"
            label="Frecuencia Cardíaca (FC)"
            :rules="requiredRule"
            required
          ></v-text-field>
          <v-text-field
            v-model="examenObjetivo.Resp"
            label="Frecuencia Respiratoria (FR)"
            :rules="requiredRule"
            required
          ></v-text-field>
          <v-text-field
            v-model="examenObjetivo.temperatura"
            label="Temperatura (°C)"
            :rules="requiredRule"
            required
          ></v-text-field>

          <v-textarea v-model="examenObjetivo.condicionCorporal" label="Condición Corporal"></v-textarea>
          <v-textarea v-model="examenObjetivo.sensorio" label="Sensorio"></v-textarea>
          <v-textarea v-model="examenObjetivo.fascies" label="Fascies"></v-textarea>
          <v-textarea v-model="examenObjetivo.gangliosLinfaticos" label="Ganglios Linfáticos"></v-textarea>
          <v-textarea v-model="examenObjetivo.pielSubcutaneo" label="Piel y Subcutáneo"></v-textarea>
          <v-textarea v-model="examenObjetivo.mucosasAparentes" label="Mucosas Aparentes"></v-textarea>
          <v-textarea v-model="examenObjetivo.grandesFuncionales" label="Grandes Funcionales"></v-textarea>
          <v-textarea v-model="examenObjetivo.actitudesAnomalas" label="Actitudes Anómalas"></v-textarea>
          <v-textarea v-model="examenObjetivo.EOP" label="EOP"></v-textarea>
          <v-textarea v-model="examenObjetivo.paraclinicos" label="Paraclínicos"></v-textarea>
          <v-textarea v-model="examenObjetivo.diagnostico" label="Diagnóstico"></v-textarea>
          <v-textarea v-model="examenObjetivo.observaciones" label="Observaciones"></v-textarea>
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
import { ref, reactive } from 'vue';
import backend from "@/backend";
import Swal from 'sweetalert2';
import { useRoute } from 'vue-router';

export default {
  name: 'CreateExamenObjetivo',
  props: {
    fichaClinicaId: String,
  },
  setup(props, { emit }) {
    const form = ref(null);
    const valid = ref(false);
    const createModal = ref(true);
    const loading = ref(false);
    const route = useRoute();
    const fichaClinicaId = route.query.fichaClinicaId;

    const examenObjetivo = reactive({
      FC: '',
      Resp: '',
      temperatura: '',
      observaciones: '',
      fichaClinicaId: fichaClinicaId,  // Lo obtenemos de los props

      // Otros campos adicionales
      condicionCorporal: '',
      sensorio: '',
      fascies: '',
      gangliosLinfaticos: '',
      pielSubcutaneo: '',
      mucosasAparentes: '',
      grandesFuncionales: '',
      actitudesAnomalas: '',
      EOP: '',
      paraclinicos: '',
      diagnostico: ''
    });

    const requiredRule = [v => !!v || 'Este campo es requerido'];

    const onSubmit = async () => {
      if (!form.value) return;

      const isValid = await form.value.validate();
      if (isValid) {
        crearExamenObjetivo();
      } else {
        Swal.fire({
          icon: "warning",
          title: "Formulario Incompleto",
          text: "Por favor completa todos los campos requeridos.",
        });
      }
    };

    const crearExamenObjetivo = async () => {
      loading.value = true;

      try {
        if (!fichaClinicaId) {
          throw new Error('Falta el ID de la ficha clínica');
        }

        const examenObjetivoData = {
          ...examenObjetivo,
          fichaClinicaId: fichaClinicaId,
        };

        await backend.post('/examenObjetivo', examenObjetivoData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        Swal.fire({
          title: "Examen Registrado",
          text: "El examen objetivo ha sido registrado con éxito.",
          icon: "success",
        });

        closeModal();
        emit('examenRegistrado');
      } catch (error) {
        console.error('Error al registrar el examen objetivo:', error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || error.response?.data?.message || "No se pudo registrar el examen objetivo.",
        });
      } finally {
        loading.value = false;
      }
    };

    const closeModal = () => {
      createModal.value = false;
      emit('cerrarModal');
    };

    return {
      form,
      valid,
      createModal,
      examenObjetivo,
      requiredRule,
      loading,
      onSubmit,
      closeModal,
    };
  }
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
</style>
