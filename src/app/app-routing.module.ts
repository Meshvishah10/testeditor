import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent} from '../app/pages/login/login.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { EmailPasswordComponent } from './pages/email-password/email-password.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { LevelComponent } from './pages/level/level.component';
import { DepartmentComponent } from './pages/department/department.component';
import { PermissionComponent } from './pages/permission/permission.component';
import { UsermasterComponent } from './pages/usermaster/usermaster.component';
import { AddUserComponent } from './pages/usermaster/add-user/add-user.component';
import { UpdateUserComponent } from './pages/usermaster/update-user/update-user.component';
import { EmailAlertsComponent } from './pages/email-alerts/email-alerts.component';
import { ManageShippingComponent } from './pages/manage-shipping/manage-shipping.component';
import { SalesCentralComponent } from './pages/sales-central/sales-central.component';
import { CreateSalesComponent } from './pages/sales-central/create-sales/create-sales.component';
import { ManageProductsComponent } from './pages/manage-products/manage-products.component';
import { ManageProductCategoriesComponent } from './pages/manage-product-categories/manage-product-categories.component';
import { PrintSalesComponent } from './pages/sales-central/print-sales/print-sales.component';
import { ProductFormComponent } from './pages/manage-products/product-form/product-form.component';
import { InventoryManagementComponent } from './pages/inventory-management/inventory-management.component';
import { MemberPhysicianComponent } from './pages/member-physician/member-physician.component';
import { AddEditMembersComponent } from './pages/member-physician/add-edit-members/add-edit-members.component';
import { ClientUserListComponent } from './pages/member-physician/client-user-list/client-user-list.component';
import { AddEditClientuserComponent } from './pages/member-physician/add-edit-clientuser/add-edit-clientuser.component';
import { CreateTicktesComponent } from './pages/ticket-central/create-ticktes/create-ticktes.component';
import { CreateSalesEmrComponent } from './pages/ticket-central/create-sales-emr/create-sales-emr.component';
import { TicketResolutionComponent } from './pages/ticket-central/ticket-resolution/ticket-resolution.component';
import { ViewTicketsComponent } from './pages/ticket-central/view-tickets/view-tickets.component';
import { NationalSupplyOrderComponent } from './pages/logistic-central/national-supply-order/national-supply-order.component';
import { AddEditSupplyOrderComponent } from './pages/logistic-central/national-supply-order/add-edit-supply-order/add-edit-supply-order.component';
import { DetailSupplyOrderComponent } from './pages/logistic-central/national-supply-order/detail-supply-order/detail-supply-order.component';
import { OrderInformationComponent } from './pages/logistic-central/national-supply-order/order-information/order-information.component';
import { InvoiceComponent } from './pages/logistic-central/national-supply-order/invoice/invoice.component';
import { Covid19OrderComponent } from './pages/logistic-central/covid19-order/covid19-order.component';
import { OrderDetailComponent } from './pages/logistic-central/covid19-order/order-detail/order-detail.component';
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
import { AdditionalCorrespondenceComponent } from './pages/follow-up/additional-correspondence/additional-correspondence.component';
import { ViewCorrespondenceComponent } from './pages/follow-up/additional-correspondence/view-correspondence/view-correspondence.component';
import { NpiRequestComponent } from './pages/npi-request/npi-request.component';
import { ViewNpiRequestComponent } from './pages/npi-request/view-npi-request/view-npi-request.component';
import { DeleteDuplicateTestComponent } from './pages/follow-up/delete-duplicate-test/delete-duplicate-test.component';
import { ViewDuplicateTestComponent } from './pages/follow-up/delete-duplicate-test/view-duplicate-test/view-duplicate-test.component';
import { BillingCycleComponent } from './pages/access-auto-bill/billing-cycle/billing-cycle.component';
import { AddBillingCycleComponent } from './pages/access-auto-bill/billing-cycle/add-billing-cycle/add-billing-cycle.component';
import { ViewBillingCycleComponent } from './pages/access-auto-bill/billing-cycle/view-billing-cycle/view-billing-cycle.component';
import { BillingInvoiceComponent } from './pages/access-auto-bill/billing-invoice/billing-invoice.component';
import { CreditcardreportComponent } from './pages/reports/creditcardreport/creditcardreport.component';
import { AgingReportComponent } from './pages/access-auto-bill/aging-report/aging-report.component';
import { CashDashComponent } from './pages/access-auto-bill/cash-dash/cash-dash.component';
import { PaymentReportComponent } from './pages/access-auto-bill/payment-report/payment-report.component';
import { InvoiceReportComponent } from './pages/access-auto-bill/cash-dash/invoice-report/invoice-report.component';
import { RecurringOrderComponent } from './pages/logistic-central/recurring-order/recurring-order.component';
import { AddEditRecurringOrderComponent } from './pages/logistic-central/recurring-order/add-edit-recurring-order/add-edit-recurring-order.component';
import { EmrDetailComponent } from './pages/emr-central/emr-detail/emr-detail.component';
import { ChargeInvoiceComponent } from './pages/access-auto-bill/charge-invoice/charge-invoice.component';
import { AddChargeInvoiceComponent } from './pages/access-auto-bill/charge-invoice/add-charge-invoice/add-charge-invoice.component';
import { TestSearchesComponent } from './pages/web-master/test-searches/test-searches.component';
import { SearchFormComponent } from './pages/web-master/test-searches/search-form/search-form.component';
import { ManageCouponComponent } from './pages/web-master/manage-coupon/manage-coupon.component';
import { StabilitySearchComponent } from './pages/web-master/test-searches/stability-search/stability-search.component';
import { StabilityFormComponent } from './pages/web-master/test-searches/stability-search/stability-form/stability-form.component';
import { ProductFormWebMasterComponent } from './pages/web-master/manage-products-wm/product-form-web-master/product-form-web-master.component';
import { ManageProductsWmComponent } from './pages/web-master/manage-products-wm/manage-products-wm.component';
import { ManageNewsComponent } from './pages/web-master/manage-news/manage-news.component';
import { UpsPickupLogsComponent } from './pages/ups-pickup/ups-pickup-logs/ups-pickup-logs.component';
import { ManageSocialMediaComponent } from './pages/web-master/manage-social-media/manage-social-media.component';
import { PatientInfoDetailsComponent } from './pages/patient-info/patient-info-details/patient-info-details.component';
import { ManageCommonSettingsComponent } from './pages/web-master/manage-common-settings/manage-common-settings.component';
import { CouponLogsComponent } from './pages/reports/coupon-logs/coupon-logs.component';
import { IpaccesserrorComponent } from './pages/ipaccesserror/ipaccesserror.component';
import { TestComponent } from './clientPage/test/test.component';


const routes: Routes = [
  {path:'login',component:LoginComponent},
  {path:'accessdenied',component:IpaccesserrorComponent},
  {path:'forgotPassword',component:ResetPasswordComponent},
  {path:'forgot/:code',component:EmailPasswordComponent},
  {path:'auth/changepassword',component:AuthChangePassswordComponent},
  {path: 'covid19-req-details/:id',component:Covid19ReqdetailComponent},
   {path: 'test',component:TestComponent},
  {path:'lab',
  component:LayoutComponent,
  canActivate:[AuthGuard],
  children:[
    {path:'',redirectTo:'dashboard',pathMatch:'full'},
   
    {path: 'dashboard',component:DashboardComponent,canActivate:[AuthGuard],data: { title: 'Dashboard'}},
    {path: 'level',component:LevelComponent,canActivate:[AuthGuard],data: { title: 'Level'}},
    {path: 'department',component:DepartmentComponent,canActivate:[AuthGuard],data: { title: 'Department'}},
    {path: 'profile',component:ProfileComponent,canActivate:[AuthGuard],data: { title: 'Profile'}},
    {path: 'changepassword',component:ChangePasswordComponent,canActivate:[AuthGuard],data: { title: 'Change Password'}},
    {path: 'department/permission/:id',component:PermissionComponent,canActivate:[AuthGuard],data: { title: 'Permission'}},
    {path: 'user',component:UsermasterComponent,canActivate:[AuthGuard],data: { title: 'User'}},
    {path: 'user/adduser',component:AddUserComponent,canActivate:[AuthGuard],data: { title: 'Create User'}},
    {path: 'user/edituser/:id',component:UpdateUserComponent,canActivate:[AuthGuard],data: { title: 'Edit User'}},
    {path: 'emailalerts',component:EmailAlertsComponent,canActivate:[AuthGuard],data: { title: 'Email Alert'}},
    {path: 'shipping',component:ManageShippingComponent,canActivate:[AuthGuard],data: { title: 'Manage Shipping'}},
    {path: 'salescentral',component:SalesCentralComponent,canActivate:[AuthGuard],data: { title: 'Sales End Of Day Log History'}},
    {path: 'salescentral/create',component:CreateSalesComponent,canActivate:[AuthGuard],data: { title: 'End Of Day'}},
    {path: 'products',component:ManageProductsComponent,canActivate:[AuthGuard],data: { title: 'Manage Product'}},
    {path: 'products/add-product',component:ProductFormComponent,canActivate:[AuthGuard],data: { title: 'Add Product'}},
    {path: 'products/edit-product/:id',component:ProductFormComponent,canActivate:[AuthGuard],data: { title: 'Edit Product'}},
    {path: 'products/product-category',component:ManageProductCategoriesComponent,canActivate:[AuthGuard],data: { title: 'Manage Product Category'}},
    {path: 'product-category',component:ManageProductCategoriesComponent,canActivate:[AuthGuard],data: { title: 'Manage Product Category'}},
    {path: 'salescentral/print/:id',component:PrintSalesComponent,canActivate:[AuthGuard],data: { title: 'Log History'}},
    {path: 'inventory-mgmt',component:InventoryManagementComponent,canActivate:[AuthGuard],data: { title: 'Inventory Managment'}},
    {path: 'memberphysician',component:MemberPhysicianComponent,canActivate:[AuthGuard],data: { title: 'Member Physician'}},
    {path: 'memberphysician/add-member',component:AddEditMembersComponent,canActivate:[AuthGuard],data: { title: 'Add Member Physician'}},
    {path: 'memberphysician/edit-member/:id',component:AddEditMembersComponent,canActivate:[AuthGuard],data: { title: 'Edit Member Physician'}},
    {path: 'memberphysician/user/:id/:name',component:ClientUserListComponent,canActivate:[AuthGuard],data: { title: 'Manage Users'}},
    {path: 'memberphysician/adduser',component:AddEditClientuserComponent,canActivate:[AuthGuard],data: { title: 'Add Client User'}},
    {path: 'memberphysician/edituser/:id',component:AddEditClientuserComponent,canActivate:[AuthGuard],data: { title: 'Edit Client User'}},
    {path: 'ticketcentral/:name',component:CreateTicktesComponent,canActivate:[AuthGuard],data: { title: 'Create Ticket'}},
    {path: 'ticket-resolution',component:TicketResolutionComponent,canActivate:[AuthGuard],data: { title: 'Ticket Resolution Center'}},
    {path: 'ticket/sales-emr',component:CreateSalesEmrComponent,canActivate:[AuthGuard],data: { title: 'Create Sales EMR Request'}},
    {path: 'ticket-resolution/view/:id/:type/:number',component:ViewTicketsComponent,canActivate:[AuthGuard],data: { title: 'View Ticket'}},
    {path: 'logistic-central/national-order',component:NationalSupplyOrderComponent,canActivate:[AuthGuard],data: { title: 'National Supply Orders'}},
    {path: 'logistic-central/national-order/addOrder',component:AddEditSupplyOrderComponent,canActivate:[AuthGuard],data: { title: 'Add National Supply Order'}},
    {path: 'logistic-central/national-order/editOrder/:id',component:AddEditSupplyOrderComponent,canActivate:[AuthGuard],data: { title: 'Edit National Supply Order'}},
    {path: 'logistic-central/national-order/order-details/:id',component:DetailSupplyOrderComponent,canActivate:[AuthGuard],data: { title: 'Orders'}},
    {path: 'logistic-central/national-order/order-information/:id',component:OrderInformationComponent,canActivate:[AuthGuard],data: { title: 'Process Orders'}},  
    {path: 'logistic-central/national-order/order-information/invoice/:id',component:InvoiceComponent,canActivate:[AuthGuard],data: { title: 'Invoice'}},  
    {path: 'logistic-central/kit-sold',component:KitsSoldComponent,canActivate:[AuthGuard],data: { title: 'Kits Sold'}},  
    {path: 'logistic-central/recurring-order',component:RecurringOrderComponent,canActivate:[AuthGuard],data: { title: 'Recurring Order'}},  
    {path: 'logistic-central/recurring-order/addOrder',component:AddEditRecurringOrderComponent,canActivate:[AuthGuard],data: { title: 'Add Recurring Order'}},
    {path: 'logistic-central/recurring-order/addOrder/:pid',component:AddEditRecurringOrderComponent,canActivate:[AuthGuard],data: { title: 'Add Recurring Order'}},
    {path: 'logistic-central/recurring-order/editOrder/:id',component:AddEditRecurringOrderComponent,canActivate:[AuthGuard],data: { title: 'Edit Recurring Order'}},
    {path: 'logistic-central/:name',component:Covid19OrderComponent,canActivate:[AuthGuard],data: { title: 'Logistic Central'}},  
    {path: 'logistic-central/:name/detail/:id',component:OrderDetailComponent,canActivate:[AuthGuard],data: { title: 'Logistic Central Order Detail'}},   
    {path: 'patient-info',component:PatientInfoComponent,canActivate:[AuthGuard],data: { title: 'Update Patient Information'}}, 
    {path: 'patient-info/details/:id',component:PatientInfoDetailsComponent,canActivate:[AuthGuard],data: { title: 'Update Patient Information Details'}},   
    {path: 'rejected-specimens',component:RejectedSpecimensComponent,canActivate:[AuthGuard],data: { title: 'Rejected Specimens'}},
    {path: 'rejected-specimens/view/:id',component:ViewRejectedSpecimenComponent,canActivate:[AuthGuard],data: { title: 'View Rejected Specimen'}},
    {path: 'rejected-specimens/add',component:AddRejectedSpecimenComponent,canActivate:[AuthGuard],data: { title: 'Add Rejected Specimen'}},
    {path: 'ups-pickup',component:UpsPickupComponent,canActivate:[AuthGuard],data: { title: 'UPS Pickup'}},
    {path: 'ups-pickup/log/:id',component:UpsPickupLogsComponent,canActivate:[AuthGuard],data: { title: 'UPS Pickup Log'}},
    {path: 'add-on-test',component:AddOnTestsComponent,canActivate:[AuthGuard],data: { title: 'AddOn Tests'}},
    {path: 'add-on-test/detail/:id',component:AddonOrderDetailComponent,canActivate:[AuthGuard],data: { title: 'Addon Tests Detail'}},   
    {path: 'emr-central/add',component:NewEmrRequestComponent,canActivate:[AuthGuard],data: { title: 'Create EMR Requests'}},
    {path: 'emr-central/edit/:id',component:NewEmrRequestComponent,canActivate:[AuthGuard],data: { title: 'Edit EMR Requests'}},
    {path: 'emr-central',component:EmrRequestComponent,canActivate:[AuthGuard],data: { title: 'EMR Requests'}},
    {path: 'emr-central/detail/:id',component:EmrDetailComponent,canActivate:[AuthGuard],data: { title: 'EMR Request Detail'}}, 
    // {path: 'follow-up/discard-specimen',component:ReturnedDiscaredSpecimenComponent,canActivate:[AuthGuard],data: { title: 'Returned/Discarded Specimen Log'}},
    // {path: 'follow-up/discard-specimen/view/:id',component:ViewSpecimenComponent,canActivate:[AuthGuard],data: { title: 'Rejected Specimen Info'}},
    // {path: 'follow-up/discard-specimen/add',component:AddSpecimenComponent,canActivate:[AuthGuard],data: { title: 'Specimen Create'}},
    {path: 'follow-up/new-accession',component:CreateAccessionComponent,canActivate:[AuthGuard],data: { title: 'Create Accession Follow Up'}},
    {path: 'follow-up/resolution-center',component:ResolutionCenterComponent,canActivate:[AuthGuard],data: { title: 'Resolution Center'}},
    {path: 'follow-up/resolution-center/accession/view/:id',component:ViewAccessionFollowUpComponent,canActivate:[AuthGuard],data: { title: 'View Ticket'}},
    {path: 'follow-up/resolution-center/add-on/view/:id',component:ViewAddOnComponent,canActivate:[AuthGuard],data: { title: 'View Ticket'}},
    {path: 'follow-up/add-on',component:CreateAddOnComponent,canActivate:[AuthGuard],data: { title: 'Create Accession Add-on/Correction'}},
    {path: 'client-billing',component:ClientBillingComponent,canActivate:[AuthGuard],data: { title: 'Client Billing'}},
    {path: 'memberphysician/client-billing/:id/:physicianName/:accountNumber',component:ClientBillingComponent,canActivate:[AuthGuard],data: { title: 'Client Billing'}},
    {path: 'covid19-req-orders',component:Covid19ReqformComponent,canActivate:[AuthGuard],data: { title: 'Covid-19 Req Forms'}},
    {path: 'follow-up/correspondence',component:AdditionalCorrespondenceComponent,canActivate:[AuthGuard],data: { title: 'Additional Correspondence'}},
    {path: 'follow-up/resolution-center/correspondence/view/:id',component:ViewCorrespondenceComponent,canActivate:[AuthGuard],data: { title: 'View Ticket'}},
    {path: 'npi-request',component:NpiRequestComponent,canActivate:[AuthGuard],data: { title: 'NPI Request'}},
    {path: 'ticket-resolution/npi-request/view/:id',component:ViewNpiRequestComponent,canActivate:[AuthGuard],data: { title: 'NPI Request'}},
    {path: 'follow-up/duplicate-test',component:DeleteDuplicateTestComponent,canActivate:[AuthGuard],data: { title: 'Delete Duplicate Test'}},
    {path: 'follow-up/resolution-center/duplicate-test/view/:id',component:ViewDuplicateTestComponent,canActivate:[AuthGuard],data: { title: 'View Ticket'}},
    {path: 'access-auto-bill/billing-cycle',component:BillingCycleComponent,canActivate:[AuthGuard],data: { title: 'Billing cycle'}},
    {path: 'access-auto-bill/billing-cycle/add',component:AddBillingCycleComponent,canActivate:[AuthGuard],data: { title: 'Add Billing Cycle'}},
    {path: 'access-auto-bill/billing-cycle/view/:id',component:ViewBillingCycleComponent,canActivate:[AuthGuard],data: { title: 'View Billing Cycle'}},
    {path: 'access-auto-bill/billing-invoice',component:BillingInvoiceComponent,canActivate:[AuthGuard],data: { title: 'Billing Invoice'}},
    {path: 'reports/creditcard',component:CreditcardreportComponent,canActivate:[AuthGuard],data: { title: 'Credit Card Log'}},
    {path: 'reports/coupon-log',component:CouponLogsComponent,canActivate:[AuthGuard],data: { title: 'Coupon Log'}},
    {path: 'access-auto-bill/aging-report',component:AgingReportComponent,canActivate:[AuthGuard],data: { title: 'Aging Report'}},
    {path: 'access-auto-bill/cash-dash',component:CashDashComponent,canActivate:[AuthGuard],data: { title: 'Cash Dash'}},
    {path: 'access-auto-bill/cash-dash/invoice-report',component:InvoiceReportComponent,canActivate:[AuthGuard],data: { title: 'Invoice Report'}},
    {path: 'access-auto-bill/payment-report',component:PaymentReportComponent,canActivate:[AuthGuard],data: { title: 'Payment Report'}},
    {path: 'access-auto-bill/charge-invoice',component:ChargeInvoiceComponent,canActivate:[AuthGuard],data: { title: 'Charge Invoice'}},
    {path: 'access-auto-bill/charge-invoice/add',component:AddChargeInvoiceComponent,canActivate:[AuthGuard],data: { title: 'New Charge Invoice'}},
    {path: 'web-master/test-searches',component:TestSearchesComponent,canActivate:[AuthGuard],data: { title: 'Test Searches'}},
    {path: 'web-master/test-searches/add',component:SearchFormComponent,canActivate:[AuthGuard],data: { title: 'Add Test Searches'}},
    {path: 'web-master/test-searches/edit/:id',component:SearchFormComponent,canActivate:[AuthGuard],data: { title: 'Edit Test Searches'}},
    {path: 'web-master/test-searches/stability/:id',component:StabilitySearchComponent,canActivate:[AuthGuard],data: { title: 'Stability'}},
    {path: 'web-master/test-searches/stability/:id/add',component:StabilityFormComponent,canActivate:[AuthGuard],data: { title: 'Add Stability'}},
    {path: 'web-master/test-searches/stability/:id/edit/:stabilityid',component:StabilityFormComponent,canActivate:[AuthGuard],data: { title: 'Edit Stability'}},
    {path: 'web-master/manage-coupon',component:ManageCouponComponent,canActivate:[AuthGuard],data: { title: 'Manage Coupons'}},
    {path: 'web-master/manage-products',component:ManageProductsWmComponent,canActivate:[AuthGuard],data: { title: 'Manage Products'}},
    {path: 'web-master/manage-news',component:ManageNewsComponent,canActivate:[AuthGuard],data: { title: 'Manage News'}},
    {path: 'web-master/manage-products/add',component:ProductFormWebMasterComponent,canActivate:[AuthGuard],data: { title: 'Add Product'}},
    {path: 'web-master/manage-products/edit/:id',component:ProductFormWebMasterComponent,canActivate:[AuthGuard],data: { title: 'Edit Product'}},
    {path: 'web-master/manage-social-media',component:ManageSocialMediaComponent,canActivate:[AuthGuard],data: { title: 'Manage Social Media'}},
    {path: 'web-master/manage-common-setting',component:ManageCommonSettingsComponent,canActivate:[AuthGuard],data: { title: 'Manage Common Settings'}},
  ]
},
{path:'',redirectTo:'lab',pathMatch:'full'},
{ path: '**', redirectTo:'/lab' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes , { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
