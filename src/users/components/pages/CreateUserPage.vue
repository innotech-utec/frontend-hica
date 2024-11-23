<template>
  <v-card class="card">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Registro de Usuarios</h2>
        </v-col>
      </v-row>

      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <v-text-field 
          v-model="user.email" 
          :rules="emailRules"
          label="Correo Electrónico" 
          required
          :error-messages="emailError"
          @input="validateEmail"
        ></v-text-field>

        <v-text-field 
          v-model="user.nombre" 
          :rules="nombreRules"
          label="Nombre" 
          required
          maxLength="50"
        ></v-text-field>

        <v-text-field 
          v-model="user.apellido" 
          :rules="apellidoRules"
          label="Apellido" 
          required
          maxLength="50"
        ></v-text-field>

        <v-text-field 
          v-model="user.documento" 
          :rules="documentoRules"
          label="Documento" 
          required
          maxLength="30"
          :error-messages="documentoError"
          @input="validateDocumento"
        ></v-text-field>

        <v-text-field
          v-model="user.password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          :rules="passwordRules"
          @click:append="showPassword = !showPassword"
          required
        ></v-text-field>

        <v-text-field
          v-model="user.repeatedPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Repetir Contraseña"
          :rules="repeatPasswordRule"
          @click:append="showPassword = !showPassword"
          required
        ></v-text-field>

        <v-checkbox v-model="user.isAdmin" label="Administrador"></v-checkbox>
        <v-checkbox v-model="esVeterinario" label="Veterinario"></v-checkbox>

        <v-row v-if="esVeterinario">
          <v-col cols="12">
            <v-text-field 
              v-model="veterinario.N_de_registro"
              :rules="numeroRegistroRules"
              label="Número de Registro"
              required
              pattern="[0-9]*"
              inputmode="numeric"
              @keypress="onlyNumbers"
              :error-messages="registroError"
            ></v-text-field>
          </v-col>
          
          <v-col cols="12">
            <v-select
              v-model="veterinario.Dependencia"
              :items="dependencias"
              label="Dependencia"
              :rules="requiredRule"
              required
            ></v-select>
          </v-col>
          
          <v-col cols="12">
            <v-file-input 
              v-model="veterinario.Foto" 
              accept="image/png, image/jpeg" 
              label="Subir Foto (JPG, PNG)"
              :rules="fotoRules"
            ></v-file-input>
          </v-col>
        </v-row>

        <v-card-actions>
          <v-btn 
            rounded 
            color="primary" 
            type="submit"
            :loading="loading"
            :disabled="loading || !isValidForm"
          >
            Registrar
          </v-btn>
          <v-btn 
            rounded 
            color="secondary" 
            @click="confirmCancel"
            :disabled="loading"
          >
            Cancelar
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";
import ValidationService from '@/validationService.js';

export default {
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
        'Clinica Pequeños Animales',
        'Equinos',
        'Endocrinologia y Metabolismo Animal',
        'Gestión Hospitalaria',
        'Semiología'
      ],
      
      emailRules: [
        v => !!v || 'El correo electrónico es requerido',
        v => /.+@.+\..+/.test(v) || 'El correo debe ser válido'
      ],

      nombreRules: [
        v => !!v || 'El nombre es requerido',
        v => (v && v.length <= 50) || 'El nombre no puede tener más de 50 caracteres'
      ],

      apellidoRules: [
        v => !!v || 'El apellido es requerido',
        v => (v && v.length <= 50) || 'El apellido no puede tener más de 50 caracteres'
      ],

      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => (v && v.length <= 30) || 'El documento no puede tener más de 30 caracteres',
        v => /^[a-zA-Z0-9]+$/.test(v) || 'El documento solo puede contener letras y números, sin espacios ni caracteres especiales'
      ],

      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
        v => /[A-Z]/.test(v) || 'Debe contener al menos una letra mayúscula',
        v => /[a-z]/.test(v) || 'Debe contener al menos una letra minúscula',
        v => /[0-9]/.test(v) || 'Debe contener al menos un número',
        v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Debe contener al menos un carácter especial'
      ],

      numeroRegistroRules: [
        v => !this.esVeterinario || !!v || 'El número de registro es requerido',
        v => !this.esVeterinario || /^\d+$/.test(v) || 'Solo se permiten números'
      ],

      fotoRules: [
        v => {
          if (!v) return true;
          return v.size <= 5000000 || 'La imagen no debe superar los 5MB';
        }
      ],

      requiredRule: [v => !!v || 'Este campo es requerido']
    };
  },

  computed: {
    repeatPasswordRule() {
      return [
        v => !!v || 'Por favor, repita la contraseña',
        v => v === this.user.password || 'Las contraseñas no coinciden'
      ];
    }
  },

  methods: {
    onlyNumbers(e) {
      const char = String.fromCharCode(e.keyCode);
      if (/^[0-9]+$/.test(char)) return true;
      e.preventDefault();
    },

    validateEmail(value) {
      if (!value) {
        this.emailError = 'El correo electrónico es requerido';
        this.isValidForm = false;
        return;
      }

      if (!/.+@.+\..+/.test(value)) {
        this.emailError = 'El correo debe ser válido';
        this.isValidForm = false;
        return;
      }

      this.emailError = '';
      this.checkFormValidity();
    },

    validateDocumento(value) {
      if (!value) {
        this.documentoError = 'El documento es requerido';
        this.isValidForm = false;
        return;
      }
      
      if (!/^[a-zA-Z0-9]+$/.test(value)) {
        this.documentoError = 'El documento solo puede contener letras y números, sin espacios ni caracteres especiales';
        this.isValidForm = false;
        return;
      }
      
      this.documentoError = '';
      this.checkFormValidity();
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
        if (!email) return true;
        const resultado = await ValidationService.validarEmailUnico(email);
        this.emailError = resultado.isValid ? '' : resultado.message;
        this.checkFormValidity();
        return resultado.isValid || resultado.message;
      } catch (error) {
        console.error('Error en validación de email:', error);
        this.emailError = 'Error al validar el email';
        this.checkFormValidity();
        return 'Error al validar el email';
      }
    },

    checkFormValidity() {
      const baseValidation = (
        this.user.email &&
        this.user.nombre &&
        this.user.apellido &&
        this.user.documento &&
        this.user.password &&
        this.user.repeatedPassword &&
        !this.emailError &&
        !this.documentoError
      );

      if (!this.esVeterinario) {
        this.isValidForm = baseValidation;
        return;
      }

      // Validación específica para veterinarios
      const veterinarioValidation = (
        this.veterinario.N_de_registro &&
        this.veterinario.Dependencia &&
        !this.registroError
      );

      this.isValidForm = baseValidation && veterinarioValidation;
    },

    async handleSubmit() {
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
          email: this.user.email,
          nombre: this.user.nombre,
          apellido: this.user.apellido,
          documento: this.user.documento,
          password: this.user.password,
          isAdmin: this.user.isAdmin,
        });

        // Si es veterinario, registrar los datos adicionales
        if (this.esVeterinario) {
          await this.registrarVeterinario(usuarioResponse.data.id);
        }

        Swal.fire({
          title: this.esVeterinario ? "Veterinario registrado" : "Usuario registrado",
          text: "El registro se ha completado con éxito",
          icon: "success",
        });

        this.$router.push("/usuarios");
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
      const formData = new FormData();
      formData.append('N_de_registro', this.veterinario.N_de_registro);
      formData.append('Dependencia', this.veterinario.Dependencia);
      formData.append('userId', userId);

      if (this.veterinario.Foto) {
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64String = reader.result.split(',')[1];
              await backend.post('veterinarios', {
                N_de_registro: this.veterinario.N_de_registro,
                Dependencia: this.veterinario.Dependencia,
                Foto: base64String,
                userId: userId,
              });
              resolve();
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(this.veterinario.Foto);
        });
      } else {
        await backend.post('veterinarios', {
          N_de_registro: this.veterinario.N_de_registro,
          Dependencia: this.veterinario.Dependencia,
          userId: userId,
        });
      }
    },

    async onSubmit() {
      if (!this.$refs.form.validate()) return;
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
        this.$router.push("/usuarios");
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
      this.$refs.form.reset();
    }
  },
  
  watch: {
    'user.email': {
      immediate: true,
      async handler(newEmail) {
        if (newEmail) {
          await this.validarEmailAsync(newEmail);
        } else {
          this.emailError = '';
          this.checkFormValidity();
        }
      }
    },

    'user.documento': {
      immediate: true,
      async handler(newDocumento) {
        if (newDocumento) {
          await this.validarDocumentoAsync(newDocumento);
        } else {
          this.documentoError = '';
          this.checkFormValidity();
        }
      }
    },

    'veterinario.N_de_registro': {
      handler(newValue) {
        if (this.esVeterinario && !newValue) {
          this.registroError = 'El número de registro es requerido';
        } else if (this.esVeterinario && !/^\d+$/.test(newValue)) {
          this.registroError = 'Solo se permiten números';
        } else {
          this.registroError = '';
        }
        this.checkFormValidity();
      }
    },

    esVeterinario(newValue) {
      if (!newValue) {
        // Reset veterinario fields when unchecked
        this.veterinario = {
          N_de_registro: '',
          Dependencia: '',
          Foto: null
        };
        this.registroError = '';
      }
      this.$nextTick(() => {
        this.$refs.form.validate();
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
    }
  }
};
</script>

<style scoped>
.card {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #014582;
}

.v-btn {
  margin: 8px;
}

.v-btn.rounded {
  background-color: #014582;
  color: white;
}

.v-btn.rounded:hover {
  background-color: #013262;
}

.v-btn.secondary {
  background-color: #008575;
}

.v-btn.secondary:hover {
  background-color: #007460;
}
</style>