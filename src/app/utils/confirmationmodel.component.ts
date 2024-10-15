// confirmation-modal.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  template: `
    <div class="modal-header justify-content-end">
      <button type="button" class="btn-close" aria-label="Close" (click)="onCancel()"></button>
    </div>
    <div class="modal-body only-title text-center">
    <h5>{{ message }}</h5>
  </div>
    <div class="modal-footer justify-content-center">
    <button type="button" class="btn btn-primary" (click)="onConfirm()">Yes</button>
      <button type="button" class="btn btn-secondary" (click)="onCancel()">No</button>
    </div>
  `,
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirmation';
  @Input() message: string = 'Are you sure?';

  constructor(public activeModal: NgbActiveModal) {}

  onConfirm() {
    // this.confirm.emit();
    this.activeModal.close('Yes');
  }

  onCancel() {
    // this.cancel.emit();
    this.activeModal.close('No');
  }
}
