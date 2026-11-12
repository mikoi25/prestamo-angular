import { Routes } from "@angular/router";
import { CustomersList } from "./pages/customers-list/customers-list";
import { CustomersNew } from "./pages/customers-new/customers-new";
import { CustomersPage } from "./pages/customers-page/customers-page";
import { CustomersUpdate } from "./pages/customers-update/customers-update";
import { BuscadorDocumentoComponent } from "./components/buscador-documento.component";

export const customersRoute :Routes = [
   {
    path: '',
    component:CustomersPage,
    children: [
        {
            path:'list',
            component:CustomersList
        },
        {
            path:'buscar',
            component:BuscadorDocumentoComponent
        },
        {
            path:'new',
            component:CustomersNew
        },
        {
            path:'client/:id',
            component:CustomersUpdate
        },
        {
            path:'**',
            redirectTo:'list'
        }
    ]
   },
     {
        path: '**',
        redirectTo: ''
    }
]


export default customersRoute;