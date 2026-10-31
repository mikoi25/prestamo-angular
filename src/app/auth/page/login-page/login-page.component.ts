import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';
import { IdentityService } from '../../service/identity.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
      
})
export class LoginPageComponent {
  authService = inject(IdentityService);
  fb = inject(FormBuilder);
  formUtils = FormUtils;
  loginForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.pattern(FormUtils.emailPattern)],
      [FormUtils.checkingServerResponse],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { email = '', password = '' } = this.loginForm.value;

     this.authService
         .authentication({Email:email!,Password:password!})
           .subscribe();
  }
}