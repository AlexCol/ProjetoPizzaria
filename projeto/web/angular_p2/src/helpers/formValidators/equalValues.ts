import { AbstractControl } from '@angular/forms';

export function equalValues(controlName1: string, controlName2: string) {
  return (control: AbstractControl) => {
    const value1 = control.get(controlName1)?.value;
    const value2 = control.get(controlName2)?.value;

    if (value1 !== value2) {
      return { valuesNotEqual: true };
    }
    return null;
  };
}
