<template>
  <v-card class="card">
    <v-container>

      <v-row>
        <v-col cols="12" class="text-center">
          <h2 class="form-title">Registro de Usuarios</h2>
        </v-col>
      </v-row>
      <v-form ref="form" v-model="valid" @submit.prevent="onSubmit">
        
        <!-- Correo electrónico -->
        <v-text-field v-model="user.email" :rules="emailRules" label="Correo Electrónico" required></v-text-field>

        <!-- Nombre -->
        <v-text-field v-model="user.nombre" :rules="requiredRule" label="Nombre" required></v-text-field>

        <!-- Apellido -->
        <v-text-field v-model="user.apellido" :rules="requiredRule" label="Apellido" required></v-text-field>

        <!-- Documento -->
        <v-text-field v-model="user.documento" :rules="requiredRule" label="Documento" required></v-text-field>

        <!-- Contraseña -->
        <v-text-field
          v-model="user.password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Contraseña"
          :rules="passwordRules"
          @click:append="showPassword = !showPassword"
          required
        ></v-text-field>

        <!-- Repetir Contraseña -->
        <v-text-field
          v-model="user.repeatedPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Repetir Contraseña"
          :rules="repeatPasswordRule"
          @click:append="showPassword = !showPassword"
          required
        ></v-text-field>

        <!-- Checkbox Administrador -->
        <v-checkbox v-model="user.isAdmin" label="Administrador"></v-checkbox>

        <!-- Botón para guardar -->
        <v-btn rounded color="primary" type="submit">Registrar</v-btn>

        <!-- Botón de cancelar con confirmación -->
        <v-btn rounded color="secondary" @click="confirmCancel">Cancelar</v-btn>
      </v-form>
    </v-container>
  </v-card>
</template>

<script>
import backend from "@/backend.js";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      valid: false,
      showPassword: false,
      user: {
        email: '',
        nombre: '',
        apellido: '',
        documento: '',
        password: '',
        repeatedPassword: '',
        isAdmin: false
      },
      emailRules: [
        v => !!v || 'El correo electrónico es requerido',
        v => /.+@.+\..+/.test(v) || 'El correo debe ser válido',
      ],
      requiredRule: [v => !!v || 'Este campo es requerido'],
      passwordRules: [
        v => !!v || 'La contraseña es requerida',
        v => v.length >= 8 || 'La contraseña debe tener al menos 8 caracteres',
      ]
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
    // Método para registrar un usuario
    async onSubmit() {
      if (!this.$refs.form.validate()) return;

      if (this.user.password !== this.user.repeatedPassword) {
        return Swal.fire({
          icon: "error",
          title: "¡Ups!",
          text: "Las contraseñas no coinciden.",
        });
      }

      try {
        await backend.post('usuarios', {
          email: this.user.email,
          nombre: this.user.nombre,
          apellido: this.user.apellido,
          documento: this.user.documento,
          password: this.user.password,
          isAdmin: this.user.isAdmin
        });

        Swal.fire({
          title: "Usuario creado",
          text: `Los datos de ${this.user.nombre} ${this.user.apellido} han sido guardados`,
          icon: "success",
        });

        // Cerrar el modal y redirigir al listado de usuarios
        this.$router.push("/usuarios");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Error al crear el usuario",
        });
      }
    },

    // Método para resetear el formulario
    resetForm() {
      this.user = {
        email: '',
        nombre: '',
        apellido: '',
        documento: '',
        password: '',
        repeatedPassword: '',
        isAdmin: false
      };
      this.$refs.form.reset();  // Resetea el formulario
    },

    // Método para confirmar la cancelación
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
        this.$router.push("/usuarios");  // Redirige a la lista de usuarios
      }
    }
  }
}
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
