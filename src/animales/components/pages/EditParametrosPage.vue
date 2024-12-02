<template>
  <v-dialog v-model="editModal" max-width="600px">
    <v-card>
      <v-card-title class="primary-title text-center">Editar Parámetros</v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <v-text-field
            v-model="localParametro.fecha"
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
            v-model="localParametro.FC"
            label="Frecuencia Cardíaca (FC)"
            type="number"
            step="0.01"
             min="0"
            :rules="requiredRule"
            @blur="validateNumber('FC')"
            @keypress="onlyNumbers"
          ></v-text-field>
          <v-text-field
            v-model="localParametro.FR"
            label="Frecuencia Respiratoria (FR)"
            pe="number"
            step="0.01"
             min="0"
             :rules="requiredRule"
            @blur="validateNumber('FR')"
            @keypress="onlyNumbers"
            required
          ></v-text-field>
          <v-text-field
            v-model="localParametro.temperatura"
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
            v-model="localParametro.mucosas"
            label="Tipo de Mucosas"
            :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
            :rules="[rules.required]"
            @change="validateField('mucosas')"
          ></v-select>
          <v-text-field
            v-model="localParametro.TllC"
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
            v-model="localParametro.pliegueCutaneo"
            label="Pliegue Cutáneo"
            :rules="DatosRulesNorequiered"
             @blur="normalizeText('pliegueCutaneo')"
          ></v-text-field>
          <v-textarea
            v-model="localParametro.observaciones"
            label="Observaciones"
             :rules="DatosRulesNorequiered"
           @blur="normalizeText('observaciones')"
          ></v-textarea>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="onSubmit" :loading="loading" :disabled="!isFormValid">Guardar</v-btn>
        <v-btn color="secondary" @click="closeModal">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import backend from "@/backend";
import Swal from 'sweetalert2';

export default {
  props: {
    parametro: {
      type: Object,
      required: true
    },
    show: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:show', 'parametroActualizado', 'cerrarModal'],
  setup(props, { emit }) {
    const form = ref(null);
    const valid = ref(false);
    const editModal = ref(props.show);
    const loading = ref(false);
    const formattedHora = ref("");
    const fieldErrors = ref({});
    
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
      fcRange: (v) => {
        const fc = parseFloat(v);
        return (fc >= 40 && fc <= 200) || "FC debe estar entre 40 y 200";
      },
      frRange: (v) => {
        const fr = parseFloat(v);
        return (fr >= 10 && fr <= 60) || "FR debe estar entre 10 y 60";
      },
      tempRange: (v) => {
        const temp = parseFloat(v);
        return (temp >= 35 && temp <= 42) || "Temperatura debe estar entre 35°C y 42°C";
      },
      tllcRange: (v) => {
        const tllc = parseFloat(v);
        return (tllc >= 1 && tllc <= 5) || "TllC debe estar entre 1 y 5 segundos";
      }
    };

    const localParametro = reactive({ ...props.parametro });

    const isFormValid = computed(() => {
      return Object.keys(fieldErrors.value).length === 0 && valid.value;
    });

    const formatInputDate = (date) => {
  if (!date) return '';
  // Asegurarse de que la fecha esté en formato YYYY-MM-DD
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
    const validateField = (fieldName) => {
      const value = fieldName === 'hora' ? formattedHora.value : localParametro[fieldName];
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

    const formatHora = (hora) => {
      if (!hora) return "";
      if (hora.includes(':')) {
        const parts = hora.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
      return hora;
    };

    const updateHora = (newValue) => {
      localParametro.hora = newValue;
      validateField('hora');
    };

    watch(
      () => props.show,
      (newShow) => {
        editModal.value = newShow;
      }
    );

    watch(
  () => props.parametro,
  (newParametro) => {
    Object.assign(localParametro, { 
      ...newParametro,
      fecha: formatInputDate(newParametro.fecha) 
    });
    formattedHora.value = formatHora(newParametro.hora);
  },
  { immediate: true }
);
    const closeModal = () => {
      fieldErrors.value = {};
      emit('update:show', false);
      emit('cerrarModal');
    };
    const DatosRulesNorequiered = [
  v => !v || !v.includes('  ') || 'El campo no puede contener espacios dobles',
  v => !v || v.trim().length > 0 || 'El campo no puede contener solo espacios',
  
]
    const normalizeText = (field) => {
      if (localParametro[field]) {
        localParametro[field] = localParametro[field].toUpperCase().trim()
      }
    };
    const errors = reactive({ FC: '', FR: '', temperatura: '', TllC: '' });
    const onlyNumbers = (event) => {
      const charCode = event.which ? event.which : event.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        event.preventDefault()
      }
    };
    const validations = reactive({
      temperatura: true,
      FC: true,
      FR: true
    })
    const validateNumber = (field) => {
      errors[field] = []
      const value = localParametro[field]

      if (!value) {
        errors[field].push(`El ${field} es requerido`)
      } else if (value <= 0) {
        errors[field].push(`El ${field} debe ser mayor que 0`)
      }

      validations[field] = errors[field].length === 0
    };

    /* const onSubmit = async () => {
      ['fecha', 'hora', 'FC', 'FR', 'temperatura', 'mucosas', 'TllC'].forEach(validateField);

      if (isFormValid.value) {
        try {
          loading.value = true;
          localParametro.hora = formattedHora.value;
          
          await backend.patch(`/registroParametros/${localParametro.id}`, localParametro, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });

          Swal.fire({
            title: "Parámetro Actualizado",
            text: "El parámetro ha sido actualizado con éxito.",
            icon: "success"
          });

          emit('parametroActualizado', localParametro);
          closeModal();
        } catch (error) {
          console.error('Error al actualizar el parámetro:', error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "No se pudo actualizar el parámetro."
          });
        } finally {
          loading.value = false;
        }
      }
    };*/
    const onSubmit = async () => {
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
    localParametro.hora = formattedHora.value;

    
    const parametrosToUpdate = {
      ...localParametro,
      FC: Number(localParametro.FC),
      FR: Number(localParametro.FR),
      temperatura: Number(localParametro.temperatura),
      TllC: Number(localParametro.TllC)
    };
    
    await backend.patch(
      `/registroParametros/${localParametro.id}`, 
      parametrosToUpdate, 
      {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }
    );

    Swal.fire({
      title: "Parámetro Actualizado",
      text: "El parámetro ha sido actualizado con éxito.",
      icon: "success"
    });

    emit('parametroActualizado', parametrosToUpdate);
    closeModal();
  } catch (error) {
    console.error('Error al actualizar el parámetro:', error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.message || "No se pudo actualizar el parámetro."
    });
  } finally {
    loading.value = false;
  }
};
    onMounted(() => {
  Object.assign(localParametro, {
    ...props.parametro,
    fecha: formatInputDate(props.parametro.fecha)
  });
  formattedHora.value = formatHora(props.parametro.hora);
});

    return {
      form,
      valid,
      editModal,
      loading,
      localParametro,
      formattedHora,
      closeModal,
      onSubmit,
      updateHora,
      rules,
      validateField,
      isFormValid,
      normalizeText,
      DatosRulesNorequiered,
      onlyNumbers,
      validateNumber,
    };
  }
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