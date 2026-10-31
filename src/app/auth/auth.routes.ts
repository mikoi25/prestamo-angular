import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layout/auth-layout/auth-layout.component";
import { LoginPageComponent } from "./page/login-page/login-page.component";
import { RegisterPageComponent } from "./page/register-page/register-page.component";

export const authRoutes:Routes =[

    {
       path: '',
       component:AuthLayoutComponent,
       children:[
           {
               path:'login',
               component:LoginPageComponent
           },
           {
               path:'register',
               component:RegisterPageComponent
           },
           {
               path:'**',
               redirectTo:'login'
           },
       ],
    },
   ];
   
   export default authRoutes;