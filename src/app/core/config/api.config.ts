export const API_CONFIG = {
  baseUrl: 'http://localhost:8080',
  endpoints: {
    auth: {
      login: '/api/auth/login',
      forgotPassword: '/api/auth/forgot-password',
      resetPassword: '/api/auth/reset-password'
    },
    products: '/api/products',
    services: '/api/services',
    researchAreas: '/api/research-areas',
    partnerships: '/api/partnerships',
    blog: '/api/blog/posts',
    contact: '/api/contact',
    contactAdmin: '/api/contact/admin/messages'
  }
};