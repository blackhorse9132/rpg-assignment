import './assets/main.css'

import { createApp } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import App from './App.vue'
import router from './router'
import { apolloClient } from './apollo/client'
import { useAuth } from './composables/useAuth'

const app = createApp(App)
const auth = useAuth()

auth.fetchMe()

app.provide(DefaultApolloClient, apolloClient)

app.use(router)

app.mount('#app')
