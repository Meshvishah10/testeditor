import { Directive, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appScrollToBottom]'
})
export class ScrollToBottomDirective implements AfterViewInit, OnChanges {
  @Input() appScrollToBottom: any;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges) {
      setTimeout(() => this.scrollToBottom(), 0);
  }

  private scrollToBottom(): void {
    try {
      const nativeElement = this.el.nativeElement;
      nativeElement.scrollTop = nativeElement.scrollHeight;
    } catch (err) {
      // console.error('Scroll to bottom failed:', err);
    }
  }
}
