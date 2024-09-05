<template>

    <v-container>
        <nav class="mb-4" style="display: flex; align-items: center">
            <div style="flex: 1">
                <h1 style="cursor: pointer" v-on:click="$router.push({ name: 'users.index' })">HICA</h1>
            </div>
            <UserProfile/>
        </nav>    

        <router-view></router-view>
    </v-container>
</template>
<script>

    import UserProfile from '@/users/components/organisms/UserProfile.vue';
    

    export default {

        data(){
            return {
                
            }
        },

        methods: {
        },

        components: {
            UserProfile
        }

    };

</script>