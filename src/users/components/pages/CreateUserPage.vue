<template>
  <v-card class="card">
    <v-container>
      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Registro de Usuarios</h2>
        </v-col>
      </v-row>

      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        <!-- Campos del formulario de usuario -->
        <v-text-field v-model="user.email" :rules="emailRules" label="Correo Electrónico" required></v-text-field>
        <v-text-field v-model="user.nombre" :rules="requiredRule" label="Nombre" required></v-text-field>
        <v-text-field v-model="user.apellido" :rules="requiredRule" label="Apellido" required></v-text-field>
        <v-text-field v-model="user.documento" :rules="documentoRules" label="Documento de Identidad" required></v-text-field>

        <!-- Campos de contraseña -->
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

        <!-- Opciones de usuario -->
        <v-checkbox v-model="user.isAdmin" label="Administrador"></v-checkbox>
        <v-checkbox v-model="esVeterinario" label="Veterinario"></v-checkbox>

        <!-- Campos adicionales para veterinario -->
        <v-row v-if="esVeterinario">
          <v-col cols="12">
            <v-text-field 
              v-model="veterinario.N_de_registro"
              :rules="numeroRegistroRules"
              type="number"
              label="Número de Registro"
              required
          ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="veterinario.Dependencia"
              :items="['Clinica Pequeños Animales', 'Equinos', 'Endocrinologia y Metabolismo Animal', 'Gestión Hospitalaria', 'Semiología']"
              label="Dependencia"
              required
            ></v-select>
          </v-col>
          <v-col cols="12">
            <v-file-input v-model="veterinario.Foto" accept="image/png, image/jpeg" label="Subir Foto (JPG, PNG)"></v-file-input>
          </v-col>
        </v-row>

        <!-- Botones de acciones -->
        <v-card-actions>
          <v-btn rounded color="primary" type="submit">Registrar</v-btn>
          <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
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
      showPassword: false,
      esVeterinario: false,
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
      emailRules: [
        v => !!v || 'El correo electrónico es requerido',
        v => /.+@.+\..+/.test(v) || 'El correo debe ser válido',
        v => this.validarEmail(v) || 'Validando email...'
      ],
      requiredRule: [v => !!v || 'Este campo es requerido'],
      veterinarioRules: {
        N_de_registro: [v => !this.esVeterinario || !!v || 'El número de registro es requerido'],
        Dependencia: [v => !this.esVeterinario || !!v || 'La dependencia es requerida'],
      },
      documentoRules: [
        v => !!v || 'El documento es requerido',
        v => this.validarDocumento(v) || 'Validando documento...'
      ],
      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
        v => /[A-Z]/.test(v) || 'Debe contener al menos una letra mayúscula',
        v => /[a-z]/.test(v) || 'Debe contener al menos una letra minúscula',
        v => /[0-9]/.test(v) || 'Debe contener al menos un número',
        v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || 'Debe contener al menos un carácter especial',
      ],
      numeroRegistroRules: [
        v => !this.esVeterinario || !!v || 'El número de registro es requerido',
        v => /^\d+$/.test(v) || 'Solo se permiten números'
      ],
      emailValido: true,
      documentoValido: true,
    };
  },
  computed: {
    repeatPasswordRule() {
      return [
        v => !!v || 'Por favor, repita la contraseña',
        v => v === this.user.password || 'Las contraseñas no coinciden',
      ];
    }
  },
  methods: {

    validateVeterinarioFields() {
      if (!this.esVeterinario) return true;
      
      if (!this.veterinario.N_de_registro) {
        Swal.fire({
          icon: "error",
          title: "Campo requerido",
          text: "El número de registro es obligatorio para veterinarios",
        });
        return false;
      }
      
      if (!this.veterinario.Dependencia) {
        Swal.fire({
          icon: "error",
          title: "Campo requerido",
          text: "La dependencia es obligatoria para veterinarios",
        });
        return false;
      }
      
      return true;
    },

    async validarEmail(email) {
      if (!email || !/.+@.+\..+/.test(email)) return true; // Skip validación si está vacío o inválido
      
      const resultado = await ValidationService.validarEmailUnico(email);
      this.emailValido = resultado.isValid;
      return resultado.isValid || resultado.message;
    },

    async validarDocumento(documento) {
      if (!documento) return true; // Skip validación si está vacío
      
      const resultado = await ValidationService.validarDocumentoUnico(documento);
      this.documentoValido = resultado.isValid;
      return resultado.isValid || resultado.message;
    },

    async onSubmit() {

      if (!this.$refs.form.validate()) return;
      if (!this.validateVeterinarioFields()) return;
      
      // Validar email y documento antes de continuar
      const documentoResultado = await ValidationService.validarDocumentoUnico(this.user.documento);
        if (!documentoResultado.isValid) {
          return Swal.fire({
            icon: "error",
            title: "Documento en uso",
            text: "El documento ya está registrado en el sistema. Por favor, verifique.",
          });
        }

        const emailResultado = await ValidationService.validarEmailUnico(this.user.email);
        if (!emailResultado.isValid) {
          return Swal.fire({
            icon: "error",
            title: "Correo en uso",
            text: "El correo electrónico ya está registrado. Por favor, utilice otro.",
          });
        }

      if (!this.$refs.form.validate()) return;

      if (this.user.password !== this.user.repeatedPassword) {
        return Swal.fire({
          icon: "error",
          title: "¡Ups!",
          text: "Las contraseñas no coinciden.",
        });
      }

      try {
        // Crear el usuario
        const usuarioResponse = await backend.post('usuarios', {
          email: this.user.email,
          nombre: this.user.nombre,
          apellido: this.user.apellido,
          documento: this.user.documento,
          password: this.user.password,
          isAdmin: this.user.isAdmin,
        });

        const userId = usuarioResponse.data.id;

        // Si el usuario es veterinario, registrar también como veterinario
        if (this.esVeterinario) {
          const formData = new FormData();
          formData.append('N_de_registro', this.veterinario.N_de_registro);
          formData.append('Dependencia', this.veterinario.Dependencia);
          formData.append('userId', userId);

          if (this.veterinario.Foto) {
            const file = this.veterinario.Foto;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
              const base64String = reader.result.split(',')[1];
              formData.append('Foto', base64String);

              try {
                await backend.post('veterinarios', {
                  N_de_registro: this.veterinario.N_de_registro,
                  Dependencia: this.veterinario.Dependencia,
                  Foto: base64String,
                  userId: userId,
                });

                Swal.fire({
                  title: "Veterinario registrado",
                  text: "El veterinario ha sido registrado con éxito",
                  icon: "success",
                });
                this.$router.push("/usuarios");

              } catch (error) {
                console.error("Error al registrar el veterinario con imagen:", error);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: error.response?.data?.message || "Error al registrar el veterinario con imagen",
                });
              }
            };
          } else {
            await backend.post('veterinarios', {
              N_de_registro: this.veterinario.N_de_registro,
              Dependencia: this.veterinario.Dependencia,
              userId: userId,
            });

            Swal.fire({
              title: "Veterinario registrado",
              text: "El veterinario ha sido registrado con éxito",
              icon: "success",
            });
            this.$router.push("/usuarios");
          }
        } else {
          Swal.fire({
            title: "Usuario registrado",
            text: "El usuario ha sido registrado con éxito",
            icon: "success",
          });
          this.$router.push("/usuarios");
        }
      } catch (error) {
        if (error.response && error.response.data.message === "El correo ya está registrado.") {
          Swal.fire({
            icon: "error",
            title: "Correo en uso",
            text: "El correo electrónico ya está registrado. Por favor, utilice otro.",
          });
        } else {
          console.error("Error al registrar el usuario o veterinario:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.response?.data?.message || "Error al crear el usuario o veterinario",
          });
        }
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
      this.$refs.form.reset();
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
        this.$router.push("/usuarios");
      }
    }
  },
  watch: {
    'user.email': {
      handler: async function(newEmail) {
        if (newEmail) {
          await this.validarEmail(newEmail);
        }
      }
    },
    'user.documento': {
      handler: async function(newDocumento) {
        if (newDocumento) {
          await this.validarDocumento(newDocumento);
        }
      }
    },
    esVeterinario(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.$refs.form.validate();
        });
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
.v-btn {
  margin-top: 20px;
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
