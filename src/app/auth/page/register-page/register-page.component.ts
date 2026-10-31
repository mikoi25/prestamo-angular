import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../utils/form-utils';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css',
 
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  formUtils = FormUtils;
  registerForm = this.fb.group({
    email: [
      '',
      [Validators.required, Validators.pattern(FormUtils.emailPattern)],
      [FormUtils.checkingServerResponse],
    ],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  
  onSubmit() {
  throw new Error('Method not implemented.');
  } 

}
