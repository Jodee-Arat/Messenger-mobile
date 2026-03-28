import { API_URL as RUNTIME_API_URL } from '@/libs/constants/url.constant'

export const SERVER_URL = RUNTIME_API_URL
export const API_URL = RUNTIME_API_URL

export const getAuthUrl = (suffix: string) => `/auth${suffix}`
export const getUsersUrl = (suffix: string) => `/users${suffix}`
export const getProductsUrl = (suffix: string) => `/products${suffix}`
export const getCategoriesUrl = (suffix: string) => `/categories${suffix}`
export const getOrdersUrl = (suffix: string) => `/orders${suffix}`
