import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VoterService } from './service/voter.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-voter-check',
  templateUrl: './voter-check.html',
  imports:[ReactiveFormsModule,CommonModule],
  styleUrls: ['./voter-check.css'],
})
export class VoterCheckComponent implements OnInit {
  voterForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private voterService: VoterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.voterForm = this.fb.group({
      nationalId: [
        '',
        [Validators.required, Validators.pattern('^[0-9]{14}$')],
      ],
    });
  }

 onSubmit() {
  if (this.voterForm.invalid) return;

  this.loading = true;
  this.successMessage = '';
  this.errorMessage = '';

  this.voterService.checkNationalId({
    nationalId: this.voterForm.value.nationalId
  }).subscribe({
    next: res => {
      this.loading = false;

      if (res.success) {
        // ✅ حفظ الـ voterId في LocalStorage أو SessionStorage
        sessionStorage.setItem('voterId', res.voterId.toString());

        this.successMessage = res.message;

        // توجيه المستخدم مباشرة لصفحة الانتخابات
        this.router.navigate(['/elections']);
      } else {
        this.errorMessage = res.message;
      }
    },
    error: err => {
      this.loading = false;
      this.errorMessage = err.error?.message || 'حدث خطأ أثناء التحقق من الرقم القومي';
      console.error(err);
    }
  });
}

}
