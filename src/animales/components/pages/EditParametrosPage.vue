<template>
  <v-dialog v-model="editModal" max-width="600px">
    <v-card>
      <v-card-title>Editar Parámetros</v-card-title>
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
            :rules="[rules.required, rules.numeric, rules.fcRange]"
            required
            @input="validateField('FC')"
          ></v-text-field>
          <v-text-field
            v-model="localParametro.FR"
            label="Frecuencia Respiratoria (FR)"
            :rules="[rules.required, rules.numeric, rules.frRange]"
            required
            @input="validateField('FR')"
          ></v-text-field>
          <v-text-field
            v-model="localParametro.temperatura"
            label="Temperatura (°C)"
            :rules="[rules.required, rules.numeric, rules.tempRange]"
            required
            @input="validateField('temperatura')"
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
            :rules="[rules.required, rules.numeric, rules.tllcRange]"
            required
            @input="validateField('TllC')"
          ></v-text-field>
          <v-textarea
            v-model="localParametro.observaciones"
            label="Observaciones"
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

    const onSubmit = async () => {
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
      isFormValid
    };
  }
};
</script>

<style scoped>
.v-btn {
  margin-top: 20px;
}
</style>