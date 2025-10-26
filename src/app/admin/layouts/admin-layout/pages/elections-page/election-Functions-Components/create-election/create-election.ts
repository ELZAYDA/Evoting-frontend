// create-election.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Election } from '../../models/election';
import { ElectionsService } from '../../../../../../services/elections.service';

@Component({
  selector: 'app-create-election',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-election.html',
  styleUrls: ['./create-election.css']
})
export class CreateElectionComponent implements OnInit {
  election: Election = {
    electionId: 0,
    electionName: '',
    description: '',
    startDate: '',
    endDate: '',
    status: false,
    createdAt: new Date().toISOString().split('T')[0],
    candidatesCount: 0
  };

  isLoading: boolean = false;
  errorMessage: string = '';
  minDate: string = '';

  constructor(
    private electionsService: ElectionsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // تعيين الحد الأدنى للتاريخ هو تاريخ اليوم
    this.minDate = new Date().toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.electionsService.createElection(this.election).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/admin/elections']);
      },
      error: (error) => {
        console.error('Error creating election:', error);
        this.errorMessage = 'فشل في إنشاء الانتخاب. يرجى المحاولة مرة أخرى.';
        this.isLoading = false;
      }
    });
  }

  validateForm(): boolean {
    if (!this.election.electionName?.trim()) {
      this.errorMessage = 'اسم الانتخاب مطلوب';
      return false;
    }

    if (!this.election.startDate) {
      this.errorMessage = 'تاريخ البدء مطلوب';
      return false;
    }

    if (!this.election.endDate) {
      this.errorMessage = 'تاريخ الانتهاء مطلوب';
      return false;
    }

    const startDate = new Date(this.election.startDate);
    const endDate = new Date(this.election.endDate);
    const today = new Date();

    if (startDate < today) {
      this.errorMessage = 'تاريخ البدء يجب أن يكون في المستقبل';
      return false;
    }

    if (endDate <= startDate) {
      this.errorMessage = 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  onCancel(): void {
    this.router.navigate(['/admin/elections']);
  }
}