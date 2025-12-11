import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VoterService } from '../service/voter.service';
import { CommonModule } from '@angular/common';
import { VerificationDataService } from '../service/verification-data.service'; // إضافة هذه السطر

@Component({
  selector: 'app-voter-check',
  templateUrl: './voter-check.html',
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./voter-check.css'],
})
export class VoterCheckComponent implements OnInit {
  voterForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  nationalIdFromStorage: string | null = null; // متغير لتخزين الـ NID من localStorage
  isAlreadyVerified = false; // هل المستخدم محقق بالفعل؟

  constructor(
    private fb: FormBuilder,
    private voterService: VoterService,
    private router: Router,
    private verificationDataService: VerificationDataService // إضافة الـ service
  ) {}

  ngOnInit(): void {
    // أولاً: التحقق مما إذا كان هناك NID محفوظ في localStorage
    this.checkLocalStorageNationalId();
    
    // ثانياً: تهيئة الفورم
    this.initializeForm();
  }

  private checkLocalStorageNationalId(): void {
    // الحصول على الـ NID من localStorage إذا كان موجوداً
    this.nationalIdFromStorage = localStorage.getItem('nationalId');
    
    if (this.nationalIdFromStorage) {
      console.log('Found nationalId in localStorage:', this.nationalIdFromStorage);
      
      // التحقق مما إذا كان هذا المستخدم محقق بالفعل
      this.checkIfUserAlreadyVerified(this.nationalIdFromStorage);
    }
  }

  private initializeForm(): void {
    this.voterForm = this.fb.group({
      nationalId: [
        '', // قيمة افتراضية يمكن أن تكون من localStorage
        [Validators.required, Validators.pattern('^[0-9]{14}$')],
      ],
    });

    // إذا كان هناك NID في localStorage، عرضه في الفورم
    if (this.nationalIdFromStorage) {
      this.voterForm.patchValue({
        nationalId: this.nationalIdFromStorage
      });
      
      this.successMessage = 'Your National ID is already saved. You can proceed or enter a new one.';
    }
  }

  // التحقق مما إذا كان المستخدم محقق بالفعل
  private checkIfUserAlreadyVerified(nationalId: string): void {
    const verificationStatus = this.verificationDataService.getVerificationStatus();
    
    if (verificationStatus && verificationStatus.nationalId === nationalId) {
      this.isAlreadyVerified = verificationStatus.verified === true;
      
      if (this.isAlreadyVerified) {
        console.log('User is already verified with NID:', nationalId);
        this.successMessage = `✅ You are already verified! Match percentage: ${verificationStatus.matchPercentage?.toFixed(1)}%`;
        
        // يمكن توجيه المستخدم مباشرة إلى صفحة النجاح
        // أو إعطائه خيار الذهاب إلى هناك
      }
    }
  }

  onSubmit() {
    if (this.voterForm.invalid) {
      this.errorMessage = 'Please enter a valid 14-digit National ID';
      return;
    }

    const enteredNationalId = this.voterForm.value.nationalId;
    
    // إذا كان الـ NID المدخل هو نفسه الموجود في localStorage والمستخدم محقق بالفعل
    if (this.nationalIdFromStorage === enteredNationalId && this.isAlreadyVerified) {
      // توجيه مباشر إلى صفحة النجاح بدون API call
      this.router.navigate(['/success'], {
        state: {
          nationalId: enteredNationalId,
          fromCache: true,
          matchPercentage: this.verificationDataService.getVerificationStatus()?.matchPercentage
        }
      });
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.voterService.checkNationalId({
      nationalId: enteredNationalId
    }).subscribe({
      next: res => {
        this.loading = false;

        if (res.success) {
          // 🟢 حفظ NID في Local Storage
          localStorage.setItem('nationalId', enteredNationalId);
          this.nationalIdFromStorage = enteredNationalId;

          this.successMessage = res.message;

          // التحقق مما إذا كان المستخدم محقق بالفعل بهذا الـ NID
          this.checkIfUserAlreadyVerified(enteredNationalId);

          // إذا كان محقق بالفعل، انتظر قليلاً ثم انتقل للنجاح
          if (this.isAlreadyVerified) {
            setTimeout(() => {
              this.router.navigate(['/success'], {
                state: {
                  nationalId: enteredNationalId,
                  fromCache: true,
                  matchPercentage: this.verificationDataService.getVerificationStatus()?.matchPercentage
                }
              });
            }, 1500);
          } else {
            // إذا لم يكن محقق، انتقل لصفحة التحقق
            this.router.navigate(['/verify']);
          }
        } else {
          this.errorMessage = res.message;
        }
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'An error occurred while verifying the national ID';
        console.error(err);
      }
    });
  }

  // دالة لاستخدام الـ NID المخزن بدلاً من إدخال جديد
  useStoredNationalId(): void {
    if (this.nationalIdFromStorage) {
      this.voterForm.patchValue({
        nationalId: this.nationalIdFromStorage
      });
      this.successMessage = 'Using your stored National ID. Click "Check Voter" to proceed.';
      this.errorMessage = '';
    }
  }

  // دالة لمسح الـ NID من localStorage
  clearStoredNationalId(): void {
    localStorage.removeItem('nationalId');
    this.nationalIdFromStorage = null;
    this.isAlreadyVerified = false;
    this.voterForm.patchValue({ nationalId: '' });
    this.successMessage = 'Stored National ID cleared. Please enter a new one.';
    this.errorMessage = '';
  }

  // دالة للتخطي المباشر إذا كان المستخدم محقق
  skipToSuccess(): void {
    if (this.isAlreadyVerified && this.nationalIdFromStorage) {
      this.router.navigate(['/success'], {
        state: {
          nationalId: this.nationalIdFromStorage,
          fromCache: true,
          matchPercentage: this.verificationDataService.getVerificationStatus()?.matchPercentage
        }
      });
    }
  }
}