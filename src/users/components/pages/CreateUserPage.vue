<template>
 <v-dialog 
  v-model="localDialog"
  max-width="600px" 
  persistent
>
    <v-card class="pa-0">
      <v-card-title class="primary-title">
        Registro de Usuario
      </v-card-title>
      <v-card-text class="pt-6">
        <v-form 
          ref="form" 
          v-model="valid"
          lazy-validation
          validate-on="blur"
          @submit.prevent="onSubmit"
        >
          <!-- Correo electrónico -->
          <v-text-field 
            v-model="user.email" 
            :rules="emailRules"
            label="Correo Electrónico" 
            prepend-icon="mdi-email"
            required
            :error-messages="emailError"
            @blur="validateEmail"
            validate-on-blur
          ></v-text-field>

          <v-text-field 
  v-model="user.nombre" 
  :rules="nombreRules"
  label="Nombre" 
  prepend-icon="mdi-account-circle"
  required
  maxLength="50"
  validate-on-blur
  @blur="normalizeText('nombre')"
></v-text-field>

<!-- Apellido -->
<v-text-field 
  v-model="user.apellido" 
  :rules="apellidoRules"
  label="Apellido" 
  prepend-icon="mdi-account-circle"
  required
  maxLength="50"
  validate-on-blur
  @blur="normalizeText('apellido')"
></v-text-field>

<!-- Documento -->
<v-text-field 
  v-model="user.documento" 
  :rules="documentoRules"
  label="Documento" 
  prepend-icon="mdi-file-document"
  required
  maxLength="30"
  :error-messages="documentoError"
  @blur="validateDocumento; normalizeText('documento')"
  validate-on-blur
></v-text-field>

          <!-- Contraseña -->
          <v-text-field
            v-model="user.password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña"
            prepend-icon="mdi-lock"
            :rules="passwordRules"
            @click:append="showPassword = !showPassword"
            required
            autocomplete="new-password"
            @blur="validatePassword"
            validate-on-blur
          ></v-text-field>

          <!-- Repetir Contraseña -->
          <v-text-field
            v-model="user.repeatedPassword"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Repetir Contraseña"
            prepend-icon="mdi-lock-check"
            :rules="repeatPasswordRule"
            @click:append="showPassword = !showPassword"
            required
            autocomplete="new-password"
            @blur="validatePassword"
            validate-on-blur
          ></v-text-field>

          <v-checkbox 
            v-model="user.isAdmin" 
            label="Administrador"
            class="mt-4"
          ></v-checkbox>
          
          <v-checkbox 
            v-model="esVeterinario" 
            label="Veterinario"
            class="mt-4"
          ></v-checkbox>

          <!-- Campos de Veterinario -->
          <v-row v-if="esVeterinario">
            <v-col cols="12">
              <v-text-field 
                v-model="veterinario.N_de_registro"
                :rules="numeroRegistroRules"
                label="Número de Registro"
                prepend-icon="mdi-card-account-details"
                required
                pattern="[0-9]*"
                inputmode="numeric"
                @keypress="onlyNumbers"
                validate-on-blur
              ></v-text-field>
            </v-col>
            
            <v-col cols="12">
              <v-select
                v-model="veterinario.Dependencia"
                :items="dependencias"
                label="Dependencia"
                prepend-icon="mdi-hospital-building"
                :rules="requiredRule"
                required
                validate-on-blur
              ></v-select>
            </v-col>
          </v-row>

          <div class="button-container">
            <v-card-actions>
              <v-btn 
                rounded 
                color="primary" 
                type="submit"
                :loading="loading"
                :disabled="!isFormValid || loading"
              >
                Registrar
              </v-btn>
              <v-btn 
                rounded 
                color="secondary" 
                @click="confirmCancel"
                :disabled="loading"
                class="ml-2"
              >
                Cancelar
              </v-btn>
            </v-card-actions>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import backend from "@/backend";
import Swal from "sweetalert2";
import ValidationService from "@/validationService";

export default {
  name: 'CreateUserPage',
  props: {
    value: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      valid: false,
      loading: false,
      showPassword: false,
      esVeterinario: false,
      isValidForm: false,
      emailError: '',
      documentoError: '',
      registroError: '',
      
      user: {
        email: '',
        nombre: '',
        apellido: '',
        documento: '',
        password: '',
        repeatedPassword: '',
        isAdmin: false,
      },
      
      veterinario: {
        N_de_registro: '',
        Dependencia: '',
        Foto: null,
      },

      dependencias: [
        "CLÍNICA PEQUEÑOS ANIMALES",
        "EQUINOS",
        "ENDOCRINOLOGÍA y METABOLISMO ANIMAL",
        "GESTIÓN HOSPITALARIA",
        "SEMIOLOGÍA",
      ],
      emailRules: [
        v => !!v || 'El email es requerido',
        v => v && v.trim().length > 0 || 'El email no puede contener solo espacios',
        v => (v && v.length >= 5 && v.length <= 100) || 'El email debe tener entre 5 y 100 caracteres',
        v => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'Debe proporcionar un email válido'
      ],

      nombreRules: [
        v => !!v || 'El nombre es requerido',
        v => v && v.trim().length > 0 || 'El nombre no puede contener solo espacios',
        v => (v && v.length >= 2 && v.length <= 50) || 'El nombre debe tener entre 2 y 50 caracteres',
        v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'El nombre solo puede contener letras y espacios',
        v => !v || !v.includes('  ') || 'El nombre no puede contener espacios dobles'
      ],

      apellidoRules: [
        v => !!v || 'El apellido es requerido',
        v => v && v.trim().length > 0 || 'El apellido no puede contener solo espacios',
        v => (v && v.length >= 2 && v.length <= 50) || 'El apellido debe tener entre 2 y 50 caracteres',
        v => /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(v) || 'El apellido solo puede contener letras y espacios',
        v => !v || !v.includes('  ') || 'El apellido no puede contener espacios dobles'
      ],

      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => v && v.trim().length > 0 || 'El documento no puede contener solo espacios',
        v => (v && v.length >= 3 && v.length <= 30) || 'El documento debe tener entre 3 y 30 caracteres',
        v => /^[a-zA-Z0-9]+$/.test(v) || 'El documento solo puede contener letras y números'
      ],

      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v && v.trim().length > 0 || 'La contraseña no puede contener solo espacios',
        v => !v || !v.includes(' ') || 'La contraseña no puede contener espacios',
        v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
        v => v.length <= 100 || 'La contraseña no puede exceder los 100 caracteres',
        v => /[A-Z]/.test(v) || 'Debe contener al menos una letra mayúscula',
        v => /[a-z]/.test(v) || 'Debe contener al menos una letra minúscula',
        v => /[0-9]/.test(v) || 'Debe contener al menos un número',
        v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Debe contener al menos un carácter especial'
      ],

      numeroRegistroRules: [
        v => !this.esVeterinario || !!v || 'El número de registro es requerido',
        v => !this.esVeterinario || (v && v.trim().length > 0) || 'El número de registro no puede contener solo espacios',
        v => !this.esVeterinario || /^\d+$/.test(v) || 'Solo se permiten números'
      ],

 
      requiredRule: [
        v => !!v || 'Este campo es requerido',
        v => v && v.trim().length > 0 || 'Este campo no puede contener solo espacios'
      ]
    };
  },

  computed: {
    localDialog: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('update:value', value);
      }
    },
   
    isFormValid() {
      // Validación base de usuario
      const baseValidation = (
        this.valid &&
        this.user.email &&
        this.user.nombre &&
        this.user.apellido &&
        this.user.documento &&
        this.user.password &&
        this.user.repeatedPassword &&
        this.user.password === this.user.repeatedPassword &&
        !this.emailError &&
        !this.documentoError
      );

      if (!this.esVeterinario) {
        return baseValidation;
      }


      return baseValidation && (
        this.veterinario.N_de_registro &&
        this.veterinario.Dependencia &&
        !this.registroError
      );
    },

    repeatPasswordRule() {
      return [
        v => !!v || 'Por favor, repita la contraseña',
        v => v === this.user.password || 'Las contraseñas no coinciden'
      ];
    }
  },

  mounted() {
  this.$nextTick(() => {
    if (this.$refs.form) {
      this.$refs.form.resetValidation();
    }
  });
},
  methods: {

    normalizeText(field) {
  if (this.user[field]) {
    this.user[field] = this.user[field].toUpperCase().trim();
  }
  if (this.veterinario[field]) {
    this.veterinario[field] = this.veterinario[field].toUpperCase().trim();
  }
},
    onlyNumbers(e) {
      const char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      e.preventDefault();
    },

    async validarDocumentoAsync(documento) {
      try {
        if (!documento) return true;
        const resultado = await ValidationService.validarDocumentoUnico(documento);
        this.documentoError = resultado.isValid ? '' : resultado.message;
        this.checkFormValidity();
        return resultado.isValid || resultado.message;
      } catch (error) {
        console.error('Error en validación de documento:', error);
        this.documentoError = 'Error al validar el documento';
        this.checkFormValidity();
        return 'Error al validar el documento';
      }
    },

    async validarEmailAsync(email) {
  try {
    const resultado = await ValidationService.validarEmailUnico(email);
    this.emailError = resultado.isValid ? '' : resultado.message; // Solo actualiza si falla
  } catch (error) {
    console.error('Error al validar el correo:', error);
    this.emailError = 'Error al validar el correo';
  }
  this.checkFormValidity(); // Actualiza el estado general del formulario
},

    checkFormValidity() {
  // Aquí solo verificamos campos individuales
  const baseFieldsValid = 
    this.user.email &&
    this.user.nombre &&
    this.user.apellido &&
    this.user.documento &&
    !this.emailError &&
    !this.documentoError;

  if (!this.esVeterinario) {
    this.isValidForm = baseFieldsValid;
    return;
  }

  const veterinarioFieldsValid = 
    this.veterinario.N_de_registro &&
    this.veterinario.Dependencia &&
    !this.registroError;

  this.isValidForm = baseFieldsValid && veterinarioFieldsValid;
},

async handleSubmit() {
  if (!this.isFormValid) return;
  
  this.loading = true;
      try {
        // Validar email y documento antes de continuar
        const documentoResultado = await ValidationService.validarDocumentoUnico(this.user.documento);
        if (!documentoResultado.isValid) {
          throw new Error("El documento ya está registrado en el sistema");
        }

        const emailResultado = await ValidationService.validarEmailUnico(this.user.email);
        if (!emailResultado.isValid) {
          throw new Error("El correo electrónico ya está registrado");
        }

        // Crear usuario
        const usuarioResponse = await backend.post('usuarios', {
          email: this.user.email.toLowerCase(),
          nombre: this.user.nombre.toUpperCase(),
          apellido: this.user.apellido.toUpperCase(),
          documento: this.user.documento.toUpperCase(),
          password: this.user.password,
          isAdmin: this.user.isAdmin,
        });

        // Si es veterinario, registrar los datos adicionales
        if (this.esVeterinario) {
          await this.registrarVeterinario(usuarioResponse.data.id);
        }
        await Swal.fire({
      title: this.esVeterinario ? "Veterinario registrado" : "Usuario registrado",
      text: "El registro se ha completado con éxito",
      icon: "success",
    });

    this.resetForm();
    this.$emit('update:value', false);
    this.$emit('created');
  } catch (error) {
    console.error("Error en el registro:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Error al crear el usuario",
    });
  } finally {
    this.loading = false;
  }
},
    async registrarVeterinario(userId) {
  try {
    await backend.post('veterinarios', {
      N_de_registro: this.veterinario.N_de_registro,
      Dependencia: this.veterinario.Dependencia,
      userId: userId,
    });
  } catch (error) {
    console.error('Error al registrar veterinario:', error);
    throw error;
  }
},

    async onSubmit() {


  if (this.$refs.form && !this.$refs.form.validate()) return; 

  await this.handleSubmit(); 
    },
    async confirmCancel() {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "¿Deseas cancelar el registro del usuario?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, cancelar",
    cancelButtonText: "No",
  });
  
  if (result.isConfirmed) {
    this.resetForm();
    this.$emit('update:value', false);
  }
},
    resetForm() {
      this.user = {
        email: '',
        nombre: '',
        apellido: '',
        documento: '',
        password: '',
        repeatedPassword: '',
        isAdmin: false,
      };
      this.veterinario = {
        N_de_registro: '',
        Dependencia: '',
        Foto: null,
      };
      this.esVeterinario = false;
      this.emailError = '';
      this.documentoError = '';
      this.registroError = '';
      this.isValidForm = false;
      if (this.$refs.form) {
    this.$refs.form.reset();
  }
    }
  },
  
  watch: {
    'user.email': {
     
      handler: async function(newValue) {
      if (newValue && this.$refs.form) {
        await this.validarEmailAsync(newValue);
        }
      }
    },

    'user.documento': {
     
      async handler(newDocumento) {
        if (newDocumento) {
          await this.validarDocumentoAsync(newDocumento);
        } else {
          this.documentoError = '';
          this.checkFormValidity();
        }
      }
    },

    'user.password': {
      handler() {
        this.checkFormValidity();
      }
    },

    'user.repeatedPassword': {
      handler() {
        this.checkFormValidity();
      }
    },

    'veterinario.N_de_registro': {
      handler() {
       
        this.checkFormValidity();
      }
    },

    esVeterinario(newValue) {
      if (!newValue) {
        this.veterinario = {
          N_de_registro: '',
          Dependencia: '',
        
        };
        this.registroError = '';
      }
      this.$nextTick(() => {
        if (this.$refs.form) {
        this.$refs.form.resetValidation(); 
      }
      this.checkFormValidity();
    });
  },

    'user': {
      deep: true,
      handler() {
        this.checkFormValidity();
      }
    },

    'veterinario': {
      deep: true,
      handler() {
        if (this.esVeterinario) {
          this.checkFormValidity();
        }
      }
    },

    valid(newVal) {
    if (newVal !== undefined) {  
      this.checkFormValidity();
    }
  }
  }
};

</script>
<style scoped>
.primary-title {
  background-color: #014582 !important;
  color: white !important;
  font-weight: bold;
  padding: 16px;
  width: 100%;
  margin: 0;
  text-align: center;
  display: flex;
  justify-content: center;
}

.v-card {
  padding: 0 !important;
}

.v-card-text {
  padding: 24px 16px !important;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.v-btn.primary {
  background-color: #014582 !important;
  color: white;
}

.v-btn.primary:hover {
  background-color: #013262 !important;
}

.v-btn.secondary {
  background-color: #008575 !important;
}

.v-btn.secondary:hover {
  background-color: #007460 !important;
}
</style>