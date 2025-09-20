export const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL
export const API_URL = `${SERVER_URL}/api`

export const getAuthUrl = (suffix: string) => `/auth${suffix}`
export const getUsersUrl = (suffix: string) => `/users${suffix}`
export const getProductsUrl = (suffix: string) => `/products${suffix}`
export const getCategoriesUrl = (suffix: string) => `/categories${suffix}`
export const getOrdersUrl = (suffix: string) => `/orders${suffix}`
