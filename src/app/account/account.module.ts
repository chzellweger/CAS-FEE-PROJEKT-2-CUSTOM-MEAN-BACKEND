import { NgModule } from '@angular/core';
import { ProfileComponent } from './profile/profile.component';
import { RegisterLoginComponent } from './register-login/register-login.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccountComponent } from './account.component';

@NgModule({
    declarations: [
        AccountComponent,
        ProfileComponent,
        RegisterLoginComponent
    ],
    imports: [
        SharedModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        SharedModule
    ]
})
export class AccountModule {}
