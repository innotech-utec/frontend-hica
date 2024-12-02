<template>
  <v-dialog v-model="isModalOpen" max-width="600" content-class="custom-dialog">
    <v-card>
      <v-card-title class="primary-title text-center">Registrar Parámetros</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createParametros">
          <v-text-field
            v-model="parametros.fecha"
            label="Fecha"
            type="date"
            :rules="[rules.required, rules.dateFormat]"
            required
            @input="validateField('fecha')"
          ></v-text-field>
          <v-text-field
            v-model="formattedHora"
            label="Hora"
            type="time"
            :rules="[rules.required, rules.timeFormat]"
            required
            @input="validateField('hora')"
          ></v-text-field>
          <v-text-field
            v-model="parametros.FC"
            label="Frecuencia Cardíaca (FC)"
            type="number"
            step="0.01"
             min="0"
            :rules="requiredRule"
            @blur="validateNumber('FC')"
            @keypress="onlyNumbers"
          ></v-text-field>
          <v-text-field
            v-model="parametros.FR"
            label="Frecuencia Respiratoria (FR)"
            type="number"
            step="0.01"
             min="0"
             :rules="requiredRule"
            @blur="validateNumber('FR')"
            @keypress="onlyNumbers"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.temperatura"
            label="Temperatura (°C)"
            type="number"
            step="0.01"
             min="0"
            :rules="requiredRule"
            @blur="validateNumber('temperatura')"
            @keypress="onlyNumbers"
            required
          ></v-text-field>
          <v-select
            v-model="parametros.mucosas"
            label="Tipo de Mucosas"
            :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
            :rules="[rules.required]"
            @change="validateField('mucosas')"
          ></v-select>
          <v-text-field
            v-model="parametros.TllC"
            label="TllC"
            suffix="seg"
            type="number"
            step="0.01"
             min="0"
            :rules="requiredRule"
            @blur="validateNumber('TllC')"
            @keypress="onlyNumbers"
            required
          ></v-text-field>
          <v-text-field
            v-model="parametros.pliegueCutaneo"
            label="Pliegue Cutáneo"
            :rules="DatosRulesNorequiered"
  @blur="normalizeText('pliegueCutaneo')"
          ></v-text-field>
          <v-textarea
            v-model="parametros.observaciones"
            label="Observaciones"
            :rules="DatosRulesNorequiered"
  @blur="normalizeText('observaciones')"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="primary"
          :disabled="!isFormValid"
          :loading="loading"
          @click="createParametros"
        >
          Registrar
        </v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import Swal from "sweetalert2";
import backend from "@/backend";

export default {
  props: ["fichaClinicaId"],
  
  setup(props, { emit }) {
    const form = ref(null);
    const valid = ref(false);
    const isModalOpen = ref(true);
    const loading = ref(false);
    const formattedHora = ref("");
    const fieldErrors = ref({});

    const parametros = reactive({
      fecha: "",
      hora: "",
      FC: "",
      FR: "",
      temperatura: "",
      mucosas: "",
      TllC: "",
      pliegueCutaneo: "",
      observaciones: "",
    });
    const validations = reactive({
      temperatura: true,
      FC: true,
      FR: true
    })
    const validateNumber = (field) => {
      errors[field] = []
      const value = parametros[field]

      if (!value) {
        errors[field].push(`El ${field} es requerido`)
      } else if (value <= 0) {
        errors[field].push(`El ${field} debe ser mayor que 0`)
      }

      validations[field] = errors[field].length === 0
    };

    const rules = {
      required: (v) => !!v || "Este campo es requerido",
      numeric: (v) => !isNaN(parseFloat(v)) && isFinite(v) || "El valor debe ser numérico",
      dateFormat: (v) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return dateRegex.test(v) || "Formato de fecha inválido";
      },
      timeFormat: (v) => {
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(v) || "Formato de hora inválido";
      },
   
    };
    const DatosRulesNorequiered = [
  v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
  v => !v || v.trim().length > 0 || 'El campo no puede contener solo espacios',
  
]
    const normalizeText = (field) => {
      if (parametros[field]) {
        parametros[field] = parametros[field].toUpperCase().trim()
      }
    };
    const errors = reactive({ FC: '', FR: '', temperatura: '', TllC: '' });
    const onlyNumbers = (event) => {
      const charCode = event.which ? event.which : event.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        event.preventDefault()
      }
    };
    const isFormValid = computed(() => {
      return Object.keys(fieldErrors.value).length === 0 && valid.value;
    });

    const validateField = (fieldName) => {
      const value = fieldName === 'hora' ? formattedHora.value : parametros[fieldName];
      let fieldRules = [];
      
      switch(fieldName) {
        case 'fecha':
          fieldRules = [rules.required, rules.dateFormat];
          break;
        case 'hora':
          fieldRules = [rules.required, rules.timeFormat];
          break;
        case 'FC':
          fieldRules = [rules.required, rules.numeric, rules.fcRange];
          break;
        case 'FR':
          fieldRules = [rules.required, rules.numeric, rules.frRange];
          break;
        case 'temperatura':
          fieldRules = [rules.required, rules.numeric, rules.tempRange];
          break;
        case 'TllC':
          fieldRules = [rules.required, rules.numeric, rules.tllcRange];
          break;
        default:
          fieldRules = [rules.required];
      }

      for (const rule of fieldRules) {
        const result = rule(value);
        if (result !== true) {
          fieldErrors.value = {
            ...fieldErrors.value,
            [fieldName]: result
          };
          return;
        }
      }

      const newErrors = { ...fieldErrors.value };
      delete newErrors[fieldName];
      fieldErrors.value = newErrors;
    };

    const closeModal = () => {
      isModalOpen.value = false;
      fieldErrors.value = {};
      emit("closeModal");
    };

    /*const createParametros = async () => {
      ['fecha', 'hora', 'FC', 'FR', 'temperatura', 'mucosas', 'TllC', 'pliegueCutaneo'].forEach(validateField);

      if (isFormValid.value) {
        try {
          loading.value = true;
          parametros.hora = formattedHora.value;

          await backend.post(
            "/registroParametros",
            {
              ...parametros,
              fichaClinicaId: props.fichaClinicaId,
            },
            {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            }
          );

          Swal.fire({
            icon: "success",
            title: "Parámetros Registrados",
            text: "La toma de parámetros ha sido registrada con éxito.",
          });

          emit("parametroRegistrado");
          closeModal();
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Error al registrar parámetros",
            text: error.response?.data?.message || "Ocurrió un error al guardar los parámetros.",
          });
        } finally {
          loading.value = false;
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Formulario incompleto",
          text: "Por favor completa todos los campos requeridos correctamente antes de guardar.",
        });
      }
    };*/
    const createParametros = async () => {
  // Validar los campos numéricos
  validateNumber('FC');
  validateNumber('FR');
  validateNumber('temperatura');
  validateNumber('TllC');

  // Verificar si el formulario es válido usando el ref de v-form
  if (form.value && !form.value.validate()) {
    Swal.fire({
      icon: "warning",
      title: "Formulario incompleto",
      text: "Por favor completa todos los campos requeridos correctamente.",
    });
    return;
  }

  // Verificar las validaciones específicas de campos numéricos
  if (!validations.FC || !validations.FR || !validations.temperatura) {
    Swal.fire({
      icon: "warning",
      title: "Validación",
      text: "Por favor revise los campos marcados con error.",
    });
    return;
  }

  try {
    loading.value = true;
    parametros.hora = formattedHora.value;

    await backend.post(
      "/registroParametros",
      {
        ...parametros,
        fichaClinicaId: props.fichaClinicaId,
      },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );

    Swal.fire({
      icon: "success",
      title: "Parámetros Registrados",
      text: "La toma de parámetros ha sido registrada con éxito.",
    });

    emit("parametroRegistrado");
    closeModal();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al registrar parámetros",
      text: error.response?.data?.message || "Ocurrió un error al guardar los parámetros.",
    });
  } finally {
    loading.value = false;
  }
};

    return {
      form,
      valid,
      isModalOpen,
      loading,
      parametros,
      formattedHora,
      rules,
      isFormValid,
      closeModal,
      createParametros,
      validateField,
      normalizeText,
      DatosRulesNorequiered,
      onlyNumbers,
      validateNumber
    };
  }
};
</script>

<style scoped>
.custom-dialog {
  z-index: 1000 !important;
}

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