<template>
<v-dialog v-model="createModal" max-width="600px">
    <v-card class="generic-modal">
      <v-card-title class="primary-title text-center">Editar Examen Objetivo</v-card-title>
      <v-card-text class="justified-text">
        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="onSubmit">
          <!-- Campos obligatorios -->
          <v-text-field
            v-model="examenObjetivo.FC"
            label="Frecuencia Cardíaca (FC)"
            type="number"
            step="0.01"
             min="0"
            :rules="requiredRule"
            @blur="validateNumber('FC')"
            @keypress="onlyNumbers"
            required
            
          ></v-text-field>
          <v-text-field
            v-model="examenObjetivo.Resp"
            label="Frecuencia Respiratoria (FR)"
            type="number"
            step="0.01"
            min="0"
            :rules="requiredRule"
            @blur="validateNumber('Resp')"
            @keypress="onlyNumbers"
            required
            
          ></v-text-field>
          <v-text-field
            v-model="examenObjetivo.temperatura"
            label="Temperatura (°C)"
            type="number"
            step="0.01"
             min="0"
            :rules="requiredRule"
            @blur="validateNumber('temperatura')"
            @keypress="onlyNumbers"
            required
           
          ></v-text-field>

          <!-- Campos seleccionables -->
          <v-select
            v-model="examenObjetivo.condicionCorporal"
            label="Condición Corporal"
            :items="[1,2,3,4,5,6,7,8,9]"
            :rules="requiredRule"
          ></v-select>
          
          <v-select
            v-model="examenObjetivo.sensorio"
            label="Sensorio"
            :items="['NORMAL', 'ALERTA', 'DEPRIMIDO', 'OTROS']"
            :rules="requiredRule"
          ></v-select>
          
          <v-select
            v-model="examenObjetivo.fascies"
            label="Fascies"
            :items="['SP', 'DOLOR', 'ANSIEDAD', 'ANGUSTIA']"
            :rules="requiredRule"
          ></v-select>
          
          <v-select
            v-model="examenObjetivo.gangliosLinfaticos"
            label="Ganglios Linfáticos"
            :items="['SP', 'AUMENTADOS']"
            :rules="requiredRule"
          ></v-select>

          <v-select
            v-model="examenObjetivo.mucosasAparentesTipo"
            label="Tipo de Mucosas"
            :items="['ROSADAS', 'PALIDAS', 'HIPEREMICAS', 'CONGESTIVAS', 'TOXEMICAS', 'HIPOXICAS']"
            :rules="requiredRule"
          ></v-select>

          <v-select
            v-model="examenObjetivo.mucosasAparentesEstado"
            label="Estado de Mucosas"
            :items="['HUMEDAS', 'SECAS']"
            :rules="requiredRule"
          ></v-select>

          <!-- Campos de texto -->
          <v-textarea 
  v-model="examenObjetivo.pielSubcutaneo" 
  label="Piel y Subcutáneo"
  :rules="DatosRulesNorequiered"
  @blur="normalizeText('pielSubcutaneo')"
 
></v-textarea>

<v-textarea 
  v-model="examenObjetivo.grandesFuncionales" 
  label="Grandes Funcionales"
  :rules="DatosRulesNorequiered"
  @blur="normalizeText('grandesFuncionales')"

></v-textarea>

<v-textarea 
  v-model="examenObjetivo.actitudesAnomalas" 
  label="Actitudes Anómalas"
  :rules="DatosRulesNorequiered"
  @blur="normalizeText('actitudesAnomalas')"
  
></v-textarea>

<v-textarea 
  v-model="examenObjetivo.EOP" 
  label="EOP"
  :rules="DatosRulesNorequiered"
  @blur="normalizeText('EOP')"

></v-textarea>

<v-textarea 
  v-model="examenObjetivo.paraclinicos" 
  label="Paraclínicos"
  :rules="DatosRulesNorequiered"
  @blur="normalizeText('paraclinicos')"
 
></v-textarea>

<v-textarea 
  v-model="examenObjetivo.diagnostico" 
  label="Diagnóstico"
  :rules="DatosRules"
  @blur="normalizeText('diagnostico')"
 
  required
></v-textarea>

<v-textarea 
  v-model="examenObjetivo.observaciones" 
  label="Observaciones"
  :rules="DatosRulesNorequiered"
  @blur="normalizeText('observaciones')"
  
></v-textarea>
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
 

    const validations = reactive({
      temperatura: true,
      FC: true,
      FR: true
    })
    const validateNumber = (field) => {
      errors[field] = []
      const value = examenObjetivo[field]

      if (!value) {
        errors[field].push(`El ${field} es requerido`)
      } else if (value <= 0) {
        errors[field].push(`El ${field} debe ser mayor que 0`)
      }

      validations[field] = errors[field].length === 0
    };

  /*  const validateNumber = (field) => {
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
    };*/

    const onSubmit = async () => {
      if (!form.value) return;

    /*  validateNumber('FC');
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
      }*/

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
    const normalizeText = (field) => {
      if (examenObjetivo[field]) {
        examenObjetivo[field] = examenObjetivo[field].toUpperCase().trim()
      }
    };
    const onlyNumbers = (event) => {
      const charCode = event.which ? event.which : event.keyCode
      if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
        event.preventDefault()
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
      normalizeText,
      DatosRules,
      DatosRulesNorequiered,
      onlyNumbers,
      
    };
  }
};
</script>

<style scoped>
.page-title { 
  font-size: 28px; 
  color: #014582; 
  font-weight: bold; 
  margin: 10px 0; 
}

.add-user-btn { 
  background-color: #014582 !important; 
  color: white !important; 
}

.swal-popup-zindex {
  z-index: 3000 !important; 
}

.justified-text {
  text-align: justify;
}

.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
}
</style>