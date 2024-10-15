import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function whitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (typeof control.value === 'string') {
      const trimmedValue = control.value.trim();

      // Only set the value if leading or trailing spaces are present
      if (control.value !== trimmedValue) {
        control.setValue(trimmedValue);
      }
    }

    return null; // No validation errors
  };
}
