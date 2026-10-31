import { Routes } from "@angular/router";
import { PrestamoPage } from "./pages/prestamo-page/prestamo-page";
import { PrestamoList } from "./pages/prestamo-list/prestamo-list";
import { PrestamoNew } from "./pages/prestamo-new/prestamo-new";
import { PrestamoHome } from "./pages/prestamo-home/prestamo-home";
import { PrestamoCobrar } from "./pages/prestamo-cobrar/prestamo-cobrar";

export const prestamo: Routes = [

    {
        path: '',
        component: PrestamoPage,
        children: [
             {
                path:'home',
                component:PrestamoHome
             },
             {
                path:'cobrar',
                component:PrestamoCobrar
             },
            {
                path: 'list',
                component: PrestamoList
            },
            {
                path: 'new',
                component: PrestamoNew
            },
            {
                path: '**',
                redirectTo: 'home'
            }
        ]
    },
    {
        path: '**',
        redirectTo: ''
    }

]


export default prestamo; 