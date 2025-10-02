import {createBrowserRouter, RouterProvider} from "react-router-dom"
import {lazy, Suspense} from "react"
import {paths} from "@/lib/paths"
import AppShell from "@/layout/AppShell"

const HomePage = lazy(() => import("@/features/home"))
const PaymentsPage = lazy(() => import("@/features/payments"))
const OrdersDelayedList = lazy(() => import("@/features/orders/pages/delayed-list"))
const OrdersDelayedDetail = lazy(() => import("@/features/orders/pages/delayed-detail"))
const ProductsEolList = lazy(() => import("@/features/products/pages/eol-list"))

const router = createBrowserRouter([
    {
        element: <AppShell/>,
        children: [
            {path: paths.home, element: <HomePage/>},
            {path: "/payments", element: <PaymentsPage/>},
            {path: "/orders/delayed", element: <OrdersDelayedList/>},
            {path: "/orders/delayed/:id_order", element: <OrdersDelayedDetail/>},
            {path: "/products/eol", element: <ProductsEolList/>},
        ],
    },
])

export default function AppRouter() {
    return (
        <Suspense fallback={null}>
            <RouterProvider router={router}/>
        </Suspense>
    )
}
