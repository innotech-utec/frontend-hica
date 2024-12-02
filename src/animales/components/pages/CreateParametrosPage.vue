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
            :rules="[rules.required, rules.numeric, rules.fcRange]"
            required
            @input="validateField('FC')"
          ></v-text-field>
          <v-text-field
            v-model="parametros.FR"
            label="Frecuencia Respiratoria (FR)"
            :rules="[rules.required, rules.numeric, rules.frRange]"
            required
            @input="validateField('FR')"
          ></v-text-field>
          <v-text-field
            v-model="parametros.temperatura"
            label="Temperatura (°C)"
            :rules="[rules.required, rules.numeric, rules.tempRange]"
            required
            @input="validateField('temperatura')"
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
            :rules="[rules.required, rules.numeric, rules.tllcRange]"
            required
            @input="validateField('TllC')"
          ></v-text-field>
          <v-text-field
            v-model="parametros.pliegueCutaneo"
            label="Pliegue Cutáneo"
            :rules="[rules.required]"
            required
            @input="validateField('pliegueCutaneo')"
          ></v-text-field>
          <v-textarea
            v-model="parametros.observaciones"
            label="Observaciones"
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

    const createParametros = async () => {
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
      validateField
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