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
            @blur="validateNumber('FC')"
            required
            :error-messages="errors.FC"
          ></v-text-field>
          <v-text-field
            v-model="examenObjetivo.Resp"
            label="Frecuencia Respiratoria (FR)"
            :rules="requiredRule"
            @blur="validateNumber('Resp')"
            required
            :error-messages="errors.Resp"
          ></v-text-field>
          <v-text-field
            v-model="examenObjetivo.temperatura"
            label="Temperatura (°C)"
            :rules="requiredRule"
            @blur="validateNumber('temperatura')"
            required
            :error-messages="errors.temperatura"
          ></v-text-field>

          <!-- Campos seleccionables -->
          <v-select
            v-model="examenObjetivo.condicionCorporal"
            label="Condición Corporal"
            :items="[1,2,3,4,5,6,7,8,9]"
          ></v-select>
          
          <v-select
            v-model="examenObjetivo.sensorio"
            label="Sensorio"
            :items="['NORMAL', 'ALERTA', 'DEPRIMIDO', 'OTROS']"
          ></v-select>
          
          <v-select
            v-model="examenObjetivo.fascies"
            label="Fascies"
            :items="['SP', 'DOLOR', 'ANSIEDAD', 'ANGUSTIA']"
          ></v-select>
          
          <v-select
            v-model="examenObjetivo.gangliosLinfaticos"
            label="Ganglios Linfáticos"
            :items="['SP', 'AUMENTADOS']"
          ></v-select>

          <v-select
            v-model="examenObjetivo.mucosasAparentesTipo"
            label="Tipo de Mucosas"
            :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
          ></v-select>

          <v-select
            v-model="examenObjetivo.mucosasAparentesEstado"
            label="Estado de Mucosas"
            :items="['HUMEDAS', 'SECAS']"
          ></v-select>

          <!-- Campos de texto -->
          <v-textarea v-model="examenObjetivo.pielSubcutaneo" label="Piel y Subcutáneo"></v-textarea>
          <v-textarea v-model="examenObjetivo.grandesFuncionales" label="Grandes Funcionales"></v-textarea>
          <v-textarea v-model="examenObjetivo.actitudesAnomalas" label="Actitudes Anómalas"></v-textarea>
          <v-textarea v-model="examenObjetivo.EOP" label="EOP"></v-textarea>
          <v-textarea v-model="examenObjetivo.paraclinicos" label="Paraclínicos"></v-textarea>
          <v-textarea v-model="examenObjetivo.diagnostico" label="Diagnóstico"></v-textarea>
          <v-textarea v-model="examenObjetivo.observaciones" label="Observaciones"></v-textarea>
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
      fichaClinicaId: fichaClinicaId,
      condicionCorporal: '',
      sensorio: '',
      fascies: '',
      gangliosLinfaticos: '',
      pielSubcutaneo: '',
      mucosasAparentesTipo: '',
      mucosasAparentesEstado: '',
      grandesFuncionales: '',
      actitudesAnomalas: '',
      EOP: '',
      paraclinicos: '',
      diagnostico: ''
    });

    const errors = reactive({ FC: '', Resp: '', temperatura: '' });
    const requiredRule = [v => !!v || 'Este campo es requerido'];

    const validateNumber = (field) => {
      if (isNaN(examenObjetivo[field]) || examenObjetivo[field] === '') {
        errors[field] = "El valor debe ser numérico.";
        Swal.fire({
          title: "Error",
          text: `El campo ${field} debe ser un número válido.`,
          icon: "error",
          customClass: { popup: "swal-popup-zindex" },
        });
      } else {
        errors[field] = "";
      }
    };

    const onSubmit = async () => {
      if (!form.value) return;

      validateNumber('FC');
      validateNumber('Resp');
      validateNumber('temperatura');

      if (Object.values(errors).some(error => error)) {
        Swal.fire({
          icon: "warning",
          title: "Formulario Incompleto",
          text: "Por favor completa todos los campos requeridos y verifica los campos numéricos.",
          customClass: { popup: "swal-popup-zindex" },
        });
        return;
      }

      const isValid = await form.value.validate();
      if (isValid) {
        crearExamenObjetivo();
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
          customClass: { popup: "swal-popup-zindex" }
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
      errors,
      loading,
      validateNumber,
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
.swal-popup-zindex {
  z-index: 2000 !important; 
}
</style>