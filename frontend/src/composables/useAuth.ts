import { computed, ref } from 'vue';
import { apolloClient } from '@/apollo/client';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION } from '@/graphql/auth';

type AuthUser = {
  id: string;
  email: string;
};

type AuthPayload = {
  accessToken: string;
  user: AuthUser;
};

type RegisterMutationData = {
  register: AuthPayload;
};

type LoginMutationData = {
  login: AuthPayload;
};

type MeQueryData = {
  me: AuthUser | null;
};

const token = ref<string | null>(localStorage.getItem('auth_token'));
const user = ref<AuthUser | null>(null);

const isAuthenticated = computed(() => Boolean(token.value));

function setAuthState(nextToken: string, nextUser: AuthUser) {
  token.value = nextToken;
  user.value = nextUser;
  localStorage.setItem('auth_token', nextToken);
}

async function register(email: string, password: string) {
  const response = await apolloClient.mutate<RegisterMutationData>({
    mutation: REGISTER_MUTATION,
    variables: { input: { email, password } },
  });

  const payload = response.data?.register;
  if (!payload) {
    throw new Error('Registration failed');
  }

  setAuthState(payload.accessToken, payload.user);
}

async function login(email: string, password: string) {
  const response = await apolloClient.mutate<LoginMutationData>({
    mutation: LOGIN_MUTATION,
    variables: { input: { email, password } },
  });

  const payload = response.data?.login;
  if (!payload) {
    throw new Error('Login failed');
  }

  setAuthState(payload.accessToken, payload.user);
}

function logout() {
  token.value = null;
  user.value = null;
  localStorage.removeItem('auth_token');
  apolloClient.clearStore();
}

async function fetchMe() {
  if (!token.value) {
    user.value = null;
    return;
  }

  try {
    const response = await apolloClient.query<MeQueryData>({
      query: ME_QUERY,
      fetchPolicy: 'network-only',
    });
    user.value = response.data?.me ?? null;
  } catch {
    logout();
  }
}

export function useAuth() {
  return {
    token,
    user,
    isAuthenticated,
    register,
    login,
    logout,
    fetchMe,
  };
}
