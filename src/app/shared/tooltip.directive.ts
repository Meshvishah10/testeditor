import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

declare var bootstrap: any;

@Directive({
  selector: '[appBootstrapTooltip]'
})
export class BootstrapTooltipDirective implements AfterViewInit, OnDestroy {
  private tooltipInstance: any;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.tooltipInstance = new bootstrap.Tooltip(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.tooltipInstance) {
      this.tooltipInstance.dispose();
    }
  }
}
