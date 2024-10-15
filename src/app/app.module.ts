import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GridModule } from '@progress/kendo-angular-grid';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppSettingsService } from './services/app-settings.service';
import { LoginComponent } from './pages/login/login.component';
import { SidebarComponent } from './pages/layout/sidebar/sidebar.component';
import { HeaderComponent } from './pages/layout/header/header.component';
import { BreadcrumbsComponent } from './pages/layout/breadcrumbs/breadcrumbs.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ToastrModule } from 'ngx-toastr';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { LoadjsDirective } from './shared/loadjs.directive';
import { EmailPasswordComponent } from './pages/email-password/email-password.component';
import { MenuItems } from './shared/menuItems';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { DatePipe, HashLocationStrategy } from '@angular/common';
import { LevelComponent } from './pages/level/level.component';
import { DepartmentComponent } from './pages/department/department.component';
import { PermissionComponent } from './pages/permission/permission.component';
import { UsermasterComponent } from './pages/usermaster/usermaster.component';
import { AddUserComponent } from './pages/usermaster/add-user/add-user.component';
import { UpdateUserComponent } from './pages/usermaster/update-user/update-user.component';
import { PhoneFormatPipe } from './shared/phone-format.pipe';
import { EmailAlertsComponent } from './pages/email-alerts/email-alerts.component';
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { TrimWhitespaceDirective } from 'src/app/shared/tripwhiteSpace.directive';
import { ManageShippingComponent } from './pages/manage-shipping/manage-shipping.component';
import { FilterAndSortingService } from './services/common-filter-sort.service';
import { SalesCentralComponent } from './pages/sales-central/sales-central.component';
import { CreateSalesComponent } from './pages/sales-central/create-sales/create-sales.component';
import { PrintSalesComponent } from './pages/sales-central/print-sales/print-sales.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageProductCategoriesComponent } from './pages/manage-product-categories/manage-product-categories.component';
import { ProductFormComponent } from './pages/manage-products/product-form/product-form.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { BootstrapTooltipDirective } from './shared/tooltip.directive';
import { MemberPhysicianComponent } from './pages/member-physician/member-physician.component';
import { EmailInputMaskDirective } from './shared/emailMask.directive';
import { CustomDropDownListFilterComponent } from './utils/dropdownfilter.component';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { AddEditMembersComponent } from './pages/member-physician/add-edit-members/add-edit-members.component';
import { NumberMaskDirective } from './shared/numbermask.directive';
import { AuthGuard } from './auth/auth.guard';
import { ClientUserListComponent } from './pages/member-physician/client-user-list/client-user-list.component';
import { AddEditClientuserComponent } from './pages/member-physician/add-edit-clientuser/add-edit-clientuser.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from './utils/confirmationmodel.component';
import { AuthenticationComponent } from './pages/member-physician/authentication/authentication.component';
import { CreateTicktesComponent } from './pages/ticket-central/create-ticktes/create-ticktes.component';
import { CreateSalesEmrComponent } from './pages/ticket-central/create-sales-emr/create-sales-emr.component';
import { TicketResolutionComponent } from './pages/ticket-central/ticket-resolution/ticket-resolution.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FocusDirective } from './shared/appFocus.directive';
import { ViewTicketsComponent } from './pages/ticket-central/view-tickets/view-tickets.component';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { OrderByKeysPipe } from './shared/orderkey.pipe';
import { NationalSupplyOrderComponent } from './pages/logistic-central/national-supply-order/national-supply-order.component';
import { AddEditSupplyOrderComponent } from './pages/logistic-central/national-supply-order/add-edit-supply-order/add-edit-supply-order.component';
import { DetailSupplyOrderComponent } from './pages/logistic-central/national-supply-order/detail-supply-order/detail-supply-order.component';
import { orderByKeysRemoveSpacePipe } from './shared/orderPipeAndremovespace.pipe';
import { OrderInformationComponent } from './pages/logistic-central/national-supply-order/order-information/order-information.component';
import { InvoiceComponent } from './pages/logistic-central/national-supply-order/invoice/invoice.component';
import { DecimalFormatPipe } from './shared/decimal-format.pipe';
import { Covid19OrderComponent } from './pages/logistic-central/covid19-order/covid19-order.component';
import { OrderDetailComponent } from './pages/logistic-central/covid19-order/order-detail/order-detail.component';
import { FocusFirstInputDirective } from './shared/focusFirstInput.directive';
import { PatientInfoComponent } from './pages/patient-info/patient-info.component';
import { RejectedSpecimensComponent } from './pages/rejected-specimens/rejected-specimens.component';
import { ViewRejectedSpecimenComponent } from './pages/rejected-specimens/view-rejected-specimen/view-rejected-specimen.component';
import { AddRejectedSpecimenComponent } from './pages/rejected-specimens/add-rejected-specimen/add-rejected-specimen.component';
import { KitsSoldComponent } from './pages/logistic-central/kits-sold/kits-sold.component';
import { UpsPickupComponent } from './pages/ups-pickup/ups-pickup.component';
import { AuthChangePassswordComponent } from './pages/auth-change-passsword/auth-change-passsword.component';
import { AddOnTestsComponent } from './pages/add-on-tests/add-on-tests.component';
import { AddonOrderDetailComponent } from './pages/add-on-tests/addon-order-detail/addon-order-detail.component';
import { NewEmrRequestComponent } from './pages/emr-central/new-emr-request/new-emr-request.component';
import { EmrRequestComponent } from './pages/emr-central/emr-request/emr-request.component';
import { ReturnedDiscaredSpecimenComponent } from './pages/follow-up/returned-discared-specimen/returned-discared-specimen.component';
import { AddSpecimenComponent } from './pages/follow-up/returned-discared-specimen/add-specimen/add-specimen.component';
import { ViewSpecimenComponent } from './pages/follow-up/returned-discared-specimen/view-specimen/view-specimen.component';
import { CreateAccessionComponent } from './pages/follow-up/create-accession/create-accession.component';
import { ResolutionCenterComponent } from './pages/follow-up/resolution-center/resolution-center.component';
import { ViewAddOnComponent } from './pages/follow-up/resolution-center/view-add-on/view-add-on.component';
import { ViewAccessionFollowUpComponent } from './pages/follow-up/resolution-center/view-accession-follow-up/view-accession-follow-up.component';
import { CreateAddOnComponent } from './pages/follow-up/create-add-on/create-add-on.component';
import { ClientBillingComponent } from './pages/client-billing/client-billing.component';
import { Covid19ReqformComponent } from './pages/requistion-center/covid19-reqform/covid19-reqform.component';
import { Covid19ReqdetailComponent } from './pages/requistion-center/covid19-reqdetail/covid19-reqdetail.component';
import { CometChatService } from './services/cometchat.service';
import { AdditionalCorrespondenceComponent } from './pages/follow-up/additional-correspondence/additional-correspondence.component';
import { ViewCorrespondenceComponent } from './pages/follow-up/additional-correspondence/view-correspondence/view-correspondence.component';
import { NpiRequestComponent } from './pages/npi-request/npi-request.component';
import { ViewNpiRequestComponent } from './pages/npi-request/view-npi-request/view-npi-request.component';
import { DeleteDuplicateTestComponent } from './pages/follow-up/delete-duplicate-test/delete-duplicate-test.component';
import { ViewDuplicateTestComponent } from './pages/follow-up/delete-duplicate-test/view-duplicate-test/view-duplicate-test.component';
import { InvoiceGeneratorComponent } from './pages/member-physician/invoice-generator/invoice-generator.component';
import { BillingCycleComponent } from './pages/access-auto-bill/billing-cycle/billing-cycle.component';
import { AddBillingCycleComponent } from './pages/access-auto-bill/billing-cycle/add-billing-cycle/add-billing-cycle.component';
import { ViewBillingCycleComponent } from './pages/access-auto-bill/billing-cycle/view-billing-cycle/view-billing-cycle.component';
import { CreditcardreportComponent } from './pages/reports/creditcardreport/creditcardreport.component';
import { AgingReportComponent } from './pages/access-auto-bill/aging-report/aging-report.component';
import { CashDashComponent } from './pages/access-auto-bill/cash-dash/cash-dash.component';
import { BillingInvoiceComponent } from './pages/access-auto-bill/billing-invoice/billing-invoice.component';
import { PaymentReportComponent } from './pages/access-auto-bill/payment-report/payment-report.component';
import { InvoiceReportComponent } from './pages/access-auto-bill/cash-dash/invoice-report/invoice-report.component';
import { RecurringOrderComponent } from './pages/logistic-central/recurring-order/recurring-order.component';
import { AddEditRecurringOrderComponent } from './pages/logistic-central/recurring-order/add-edit-recurring-order/add-edit-recurring-order.component';
import { EmrDetailComponent } from './pages/emr-central/emr-detail/emr-detail.component';
import { EmrPrintComponent } from './pages/emr-central/emr-print/emr-print.component';
import { ViewdatastageComponent } from './pages/logistic-central/national-supply-order/viewdatastage/viewdatastage.component';
import { ChargeInvoiceComponent } from './pages/access-auto-bill/charge-invoice/charge-invoice.component';
import { AddChargeInvoiceComponent } from './pages/access-auto-bill/charge-invoice/add-charge-invoice/add-charge-invoice.component';
import { AmountFormatDirective } from './shared/amountFormat.directive';
import { TestSearchesComponent } from './pages/web-master/test-searches/test-searches.component';
import { StabilitySearchComponent } from './pages/web-master/test-searches/stability-search/stability-search.component';
import { StabilityFormComponent } from './pages/web-master/test-searches/stability-search/stability-form/stability-form.component';
import { SearchFormComponent } from './pages/web-master/test-searches/search-form/search-form.component';
import { ManageCouponComponent } from './pages/web-master/manage-coupon/manage-coupon.component';
import { ProductFormWebMasterComponent } from './pages/web-master/manage-products-wm/product-form-web-master/product-form-web-master.component';
import { ManageProductsWmComponent } from './pages/web-master/manage-products-wm/manage-products-wm.component';
import { ManageNewsComponent } from './pages/web-master/manage-news/manage-news.component';
import { UpsPickupLogsComponent } from './pages/ups-pickup/ups-pickup-logs/ups-pickup-logs.component';
import { ManageSocialMediaComponent } from './pages/web-master/manage-social-media/manage-social-media.component';
import { PatientInfoDetailsComponent } from './pages/patient-info/patient-info-details/patient-info-details.component';
import { ScrollToBottomDirective } from './shared/scroll-to-bottom.directive';
import { ManageCommonSettingsComponent } from './pages/web-master/manage-common-settings/manage-common-settings.component';
import { CouponLogsComponent } from './pages/reports/coupon-logs/coupon-logs.component';
import { CtrlKeyOpenNewTabDirective } from './utils/newWindow.directive';
import { TestComponent } from './clientPage/test/test.component';




const appInitializerFn = (appSetting: AppSettingsService) => {
  return () => {
    return appSetting.load().then(() => {});
  };
};


@NgModule({
  declarations: [
    AppComponent,
    CtrlKeyOpenNewTabDirective,
    LoginComponent,
    SidebarComponent,
    HeaderComponent,
    BreadcrumbsComponent,
    LayoutComponent,
    DashboardComponent,
    ResetPasswordComponent,
    LoadjsDirective,
    EmailInputMaskDirective,
    FocusDirective,
    NumberMaskDirective,
    EmailPasswordComponent,
    ProfileComponent,
    LoaderComponent,
    ChangePasswordComponent,
    LevelComponent,
    DepartmentComponent,
    PermissionComponent,
    UsermasterComponent,
    AddUserComponent,
    PhoneFormatPipe,
    OrderByKeysPipe,
    UpdateUserComponent,
    EmailAlertsComponent,
    TrimWhitespaceDirective,
    AmountFormatDirective,
    BootstrapTooltipDirective,
    ManageShippingComponent,
    SalesCentralComponent,
    CreateSalesComponent,
    PrintSalesComponent,
    ManageProductsComponent,
    ManageProductCategoriesComponent,
    ProductFormComponent,
    InventoryManagementComponent,
    MemberPhysicianComponent,
    CustomDropDownListFilterComponent,
    AddEditMembersComponent,
    ClientUserListComponent,
    AddEditClientuserComponent,
    ConfirmationModalComponent,
    AuthenticationComponent,
    CreateTicktesComponent,
    CreateSalesEmrComponent,
    TicketResolutionComponent,
    ViewTicketsComponent,
    NationalSupplyOrderComponent,
    AddEditSupplyOrderComponent,
    DetailSupplyOrderComponent,
    OrderInformationComponent,
    InvoiceComponent,
    DecimalFormatPipe,
    Covid19OrderComponent,
    OrderDetailComponent,
    FocusFirstInputDirective,
    PatientInfoComponent,
    RejectedSpecimensComponent,
    ViewRejectedSpecimenComponent,
    AddRejectedSpecimenComponent,
    KitsSoldComponent,
    UpsPickupComponent,
    AuthChangePassswordComponent,
    AddOnTestsComponent,
    AddonOrderDetailComponent,
    NewEmrRequestComponent,
    EmrRequestComponent,
    ReturnedDiscaredSpecimenComponent,
    AddSpecimenComponent,
    ViewSpecimenComponent,
    CreateAccessionComponent,
    ResolutionCenterComponent,
    ViewAddOnComponent,
    ViewAccessionFollowUpComponent,
    CreateAddOnComponent,
    ClientBillingComponent,
    Covid19ReqformComponent,
    Covid19ReqdetailComponent,
    AdditionalCorrespondenceComponent,
    ViewCorrespondenceComponent,
    NpiRequestComponent,
    ViewNpiRequestComponent,
    DeleteDuplicateTestComponent,
    ViewDuplicateTestComponent,
    InvoiceGeneratorComponent,
    BillingCycleComponent,
    AddBillingCycleComponent,
    ViewBillingCycleComponent,
    CreditcardreportComponent,
    AgingReportComponent,
    CashDashComponent,
    BillingInvoiceComponent,
    PaymentReportComponent,
    InvoiceReportComponent,
    RecurringOrderComponent,
    AddEditRecurringOrderComponent,
    EmrDetailComponent,
    EmrPrintComponent,
    ViewdatastageComponent,
    ChargeInvoiceComponent,
    AddChargeInvoiceComponent,
    TestSearchesComponent,
    SearchFormComponent,
    StabilitySearchComponent,
    StabilityFormComponent,
    ManageCouponComponent,
    ManageProductsWmComponent,
    ProductFormWebMasterComponent,
    ManageNewsComponent,  
    UpsPickupLogsComponent,
    ManageSocialMediaComponent,
    PatientInfoDetailsComponent,
    ScrollToBottomDirective,
    ManageCommonSettingsComponent,
    CouponLogsComponent,
    TestComponent,
   
],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GridModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    DateInputsModule,
    DropDownListModule,
    NgbModule,
    DropDownsModule,
    PDFExportModule,
    TooltipModule,
    ToastrModule.forRoot({timeOut: 9000,}),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFn,
      multi: true,
      useClass: HashLocationStrategy,
      deps: [AppSettingsService]
    },
    AuthGuard,
    PhoneFormatPipe,
    FilterAndSortingService,
    CometChatService,
    MenuItems,
    DatePipe,
    OrderByKeysPipe,
    DecimalFormatPipe,
    orderByKeysRemoveSpacePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
