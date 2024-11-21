<template>
    <v-row class="mb-3">
        <v-col cols="12">
            <h2>
                Usuarios
                <v-btn rounded variant="tonal" color="primary" style="float: right" v-on:click="$router.push({name:'users.create'})">
                    <v-icon>mdi-plus</v-icon>
                    Añadir usuario
                </v-btn>
            </h2>
        </v-col>
        <v-col v-for="user in users" cols="12" md="6" lg="4" :key="user.id">
            <UserDetails :user="user"/>
        </v-col>
    </v-row>

    <PaginatorComponent v-if="pages != null" :length="pages" @onChange="onChangePage"/>    

</template>
<script>

import UserDetails from "@/users/components/organisms/UserDetails.vue"
import { UserService } from "@/users/services/UserService.js"
import PaginatorComponent from "@/shared/components/PaginatorComponent.vue";

export default {

    data(){
        return {
            users: [],
            pages: null
        }
    },

    async mounted(){

        const page = this.$route.query.page;

        const response = await UserService.all(page);
        console.log(response)
        this.users = response.data;
        this.pages = response.meta.last
    },

    methods: {
        async onChangePage(page){
            this.$router.push({'name':'users.index', query: {page}});
            const response = await UserService.all(page);
            this.users = response.data;
            this.pages = response.meta.last
        }        
    },


    components: {
        UserDetails,
        PaginatorComponent
    }
};

</script>