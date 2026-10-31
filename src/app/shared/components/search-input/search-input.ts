import { Component, effect, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'shared-search-input',
  imports: [],
  templateUrl: './search-input.html',
  styles: ``,
})
export class SearchInput {

  placeholder = input('Buscar');
  debounceTime = input(1000);
  initialValue = input<string>();

  value = output<string>();

  inputValue = linkedSignal<string>(() => this.initialValue() ?? '');

  debounceEffect = effect((onCleanup) => {
    const value = this.inputValue();

    const timeout = setTimeout(() => {
      this.value.emit(value);
    }, this.debounceTime());

    onCleanup(() => {
      clearTimeout(timeout);
    });
  });
}
