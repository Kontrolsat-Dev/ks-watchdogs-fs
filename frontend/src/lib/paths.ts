// src/lib/paths.ts
export const paths = {
    home: "/",
    payments: "/payments",
    orders: {
        delayedList: "/orders/delayed",
        delayedDetail: (id_order: number | string) => `/orders/delayed/${id_order}`,
    },
    products: {
        eolList: "/products/eol",
        eolDetail: (id_product: number | string) => `/products/eol/${id_product}`,
    },
}
