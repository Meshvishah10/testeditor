import { Injectable } from '@angular/core';
import { AppSettingsService } from 'src/app/services/app-settings.service';
@Injectable({
  providedIn: 'root',
})
export class ConstantService {
  apiUrl: any = AppSettingsService.apiUrl();
  //Login Router
  Login = 'Auth';
  //Forgot Password
  ForgotPassword = 'ForgotPassword';
  ResetCodeVerify = 'ForgotPassword/ValidateLink';
  ResetPassword = 'ForgotPassword/ResetPassword';
  GetMenuList = 'Common/GetNCMenusList';
  // Master details For Rolelist , Detaprtments , Location , MenuTypeList
  MasterDetails = 'MasterDetails';
  GetCountryList = 'Common/GetCountryList';
  GetStateList = 'Common/GetStateList';
  // Profile Router
  GetProfile = 'UserProfile';
  UploadProfileImage = 'UserProfile/UploadProfileImage';
  UpdateMyProfile = 'UserProfile';
  // change password
  changePassword = 'ChangePassword';
  AuthChangePassword = 'Auth/ChangePassword';
  //Level Roter
  getAllList = 'Level/GetAllList';
  commonLevel = 'Level';
  changeStatus = 'Level/ChangeStatus';
  //department Router
  getAllDepartment = 'Department/GetAllList';
  commonDepartment = 'Department';
  changeDepartmentStatus = 'Department/ChangeStatus';
  getManuPermission = 'Department/GetMenuPermission';
  updateMenuPermission = 'Department/UpdateMenuPermission';
  //User Router
  getAllUser = 'User/GetAllList';
  commonUser = 'User';
  getUserMenuPermission = 'User/GetDepartmentMenuPermission';
  updateUserMenuPermission = 'User/UpdateMenuPermission';
  UploadUserProfileImage = 'User/UploadProfileImage';
  ChangeUserStatus = 'User/ChangeStatus';
  // Email Alert Router
  commonEmailAlertConfig = 'EmailAlertConfig';
  // Manage Shipping Router
  getAllShipping = 'Shipping/GetAllList';
  commonShipping = 'Shipping';
  // Sales
  createSales = 'SalesCentral';
  // Products
  product = 'Product';
  productList = 'Product/GetProductList';
  changeProductStatus = 'Product/ChangeStatus';
  // Category
  productCategory = 'ProductCategory';
  productCategoryList = 'ProductCategory/GetAllList';
  productCategoryDropDown = 'Common/GetProductCategoryList';
  changeProductCategoryStatus = 'ProductCategory/ChangeStatus';
  // Manage Sales Central Router
  getAllSalesCentral = 'SalesCentral/GetAllList';
  commmonSales = 'SalesCentral';
  //Get Common UserList For Dropdown
  getNCUserlist = 'Common/GetNCUserList';
  //Client Relations Department NC Users List
  getClientRelationNCUsers = 'Common/GetClientRelationsNCUserList';
  // Inventory Mgmt Router
  getAllInventory = 'InventoryManagment/GetAllList';
  // Member Physician
  getClientsList = 'MemberPhysician/GetClientsList';
  changeClientStatus = 'MemberPhysician/ChangeStatusClient';
  DeleteClient = 'MemberPhysician/DeleteClient';
  GetFreeSupliesClient = 'MemberPhysician/GetFreeSuppliesClient';
  UpdateFreeSupliesClient = 'MemberPhysician/UpdateFreeSuppliesClient';
  CreateMemberPhysician = 'MemberPhysician/AddClient';
  UpdateMemberPhysician = 'MemberPhysician/UpdateClient';
  GetClientById = 'MemberPhysician/GetClient';
  UploadClientLogo = 'MemberPhysician/UploadClientLogo';
  getClientCovid19kits = 'MemberPhysician/GetClientCovid19ProductKits';
  getAccountList = 'Common/GetAccountList';
  generateInvoice = 'MemberPhysician/GenerateInvoice';
  downloadAgreement = 'MemberPhysician/GetClientAgreementFile'
  // Client User
  getClientUser = 'MemberPhysician/GetClientUsersList';
  getClientUserById = 'MemberPhysician/GetClientUser';
  addClientUser = 'MemberPhysician/AddClientUser';
  updateClientUser = 'MemberPhysician/UpdateClientUser';
  updateClientUserProfile = 'MemberPhysician/UploadClientUserProfileImage';
  deleteClientUser = 'MemberPhysician/DeleteClientUser';
  changeStatusClientUser = 'MemberPhysician/ChangeStatusClientUser';
  getMenusListClientUser = 'MemberPhysician/GetMenusListClientUser';
  ApproveRejectClient = 'MemberPhysician/ApproveRejectClient';
  getCarddata = 'MemberPhysician/GetCardDataClient';
  UpdateCardData = 'MemberPhysician/UpdateCardDataClient';
  DeleteCardData = 'MemberPhysician/DeleteCardDataClient';
  GetACHData = 'MemberPhysician/GetACHDataClient';
  UpdateACHData = 'MemberPhysician/UpdateACHDataClient';
  DeleteACHData = 'MemberPhysician/DeleteACHDataClient';
  ValidateCredential = 'MemberPhysician/ValidateCredentials';
  // Ticket Central
  //complaints ticket
  commonComplaints = 'ComplaintTicket';
  getComplaintDetails = 'ComplaintTicket/GetTicketDetail';
  ComplaintCallLog = 'ComplaintTicket/CallLog';
  // IT/EMR issue
  commonITIssue = 'ITIssueTicket';
  getITIssueDetails = 'ITIssueTicket/GetTicketDetail';
  ITIssueCallLog = 'ITIssueTicket/CallLog';
  // Client Billing / Account Billing Ticket
  commonClientBilling = 'ClientBillingTicket';
  getClientBillingDetails = 'ClientBillingTicket/GetTicketDetail';
  ClientBillingCallLog = 'ClientBillingTicket/CallLog';
  // Patient Question Ticket
  commonPatientQuestion = 'PatientQuestionTicket';
  getPatientQuestionDetails = 'PatientQuestionTicket/GetTicketDetail';
  PatientQuestionCallLog = 'PatientQuestionTicket/CallLog';
  // Sales Call Ticket
  commonSalesCall = 'SalesCallTicket';
  getSalesCallDetails = 'SalesCallTicket/GetTicketDetail';
  SaleCallLog = 'SalesCallTicket/CallLog';
  // National Call Ticket
  commonNationalCall = 'NationalCallTicket';
  getNationalCallDetails = 'NationalCallTicket/GetTicketDetail';
  NationalCallLog = 'NationalCallTicket/CallLog';
  // Centrifuge Issue Ticket
  commonCentrifugeIssue = 'CentrifugeIssueTicket';
  getCentrifugeIssueDetails = 'CentrifugeIssueTicket/GetTicketDetail';
  CentrifugeIssueCallLog = 'CentrifugeIssueTicket/CallLog';
  //Lab Technical Question
  commonLabTechnical = 'LabTechnicalQuestionTicket';
  LabTechnicalDetails = 'LabTechnicalQuestionTicket/GetTicketDetail';
  LabTechnicalCallLog = 'LabTechnicalQuestionTicket/CallLog';
  // EMR Request
  commonEMRRequest = 'EMRRequestTicket';
  EMRRequestDetails = 'EMRRequestTicket/getTicketDetail';
  EMRRequestCallLog = 'EMRRequestTicket/CallLog';
  // Comp Request
  commonCompRequest = 'COMPRequestTicket';
  CompRequestDetails = 'COMPRequestTicket/GetTicketDetail';
  CompRequestCallLog = 'COMPRequestTicket/CallLog';
  //GetAll Ticket List
  GetAllTickets = 'TicketCentral/GetAllList';
  commonDepartmentlist = 'Common/GetDepartmentList';
  commonAccountList = 'Common/GetAccountList';
  // National Order
  commonNationalOrder = 'NationalOrder';
  getNationalOrderDetails = 'NationalOrder/GetAllList';
  commonPhysicianList = 'Common/GetPhysicianList';
  StatusChangeNationalOrder = 'NationalOrder/ChangeStatus';
  orderHistory = 'NationalOrder/GetOrderHistory';
  commentList = 'NationalOrder/GetCommentList';
  addComment = 'NationalOrder/AddComment';
  orderDetail = 'NationalOrder/GetOrderDetails';
  previousOrderHistory = 'NationalOrder/GetPreviousOrdersHistory';
  duplicateOrder = 'NationalOrder/DuplicateOrderRecord';
  updateMessage = 'NationalOrder/UpdateMessage';
  EditNationalOrder = 'NationalOrder/GetEditOrder';
  GetNCTracking = 'NationalOrder/GetNCTracking';
  UpdateNCTracking = 'NationalOrder/UpdateTracking';
  PastOrderDetail = 'NationalOrder/GetPastOrderDetails';
  updateaddress = 'NationalOrder/UpdateAddress';
  DataStage = 'NationalOrder/GetAllDataStage';
  //Covid 19 order
  covid19Order = 'Covid19Order/GetAllList';
  covid19StatusChange = 'Covid19Order/ChangeStatus';
  covid19TrackingDetail = 'Covid19Order/GetTracking';
  covid19UpdateTracking = 'Covid19Order/UpdateTracking';
  covid19OrderDetail = 'Covid19Order/GetOrderDetail';
  // Saliva Direct order
  salivaDirectOrder = 'SalivaDirectOrder/GetAllList';
  salivaDirectStatusChange = 'SalivaDirectOrder/ChangeStatus';
  salivaDirectTrackingDetail = 'SalivaDirectOrder/GetTracking';
  salivaDirectUpdateTracking = 'SalivaDirectOrder/UpdateTracking';
  salivaDirectOrderDetail = 'SalivaDirectOrder/GetOrderDetail';
  // Non Covid 19 order
  nonCovid19Order = 'NonCovid19Order/GetAllList';
  nonCovid19StatusChange = 'NonCovid19Order/ChangeStatus';
  nonCovid19TrackingDetail = 'NonCovid19Order/GetTracking';
  nonCovid19UpdateTracking = 'NonCovid19Order/UpdateTracking';
  nonCovid19OrderDetail = 'NonCovid19Order/GetOrderDetail';

  // CLS order
  clsOrder = 'CLSOrder/GetAllList';
  clsStatusChange = 'CLSOrder/ChangeStatus';
  clsTrackingDetail = 'CLSOrder/GetTracking';
  clsUpdateTracking = 'CLSOrder/UpdateTracking';
  clsOrderDetail = 'CLSOrder/GetOrderDetail';
  //Kits order
  kitOrder = 'KitOrder/GetAllList';
  kitStatusChange = 'KitOrder/ChangeStatus';
  kitTrackingDetail = 'KitOrder/GetTracking';
  kitUpdateTracking = 'KitOrder/UpdateTracking';
  kitOrderDetail = 'KitOrder/GetOrderDetail';
  //Kits SOLD
  kitSoldList = 'CovidKitsSold/GetAllList';
  kitSoldProductList = 'Common/GetKitsSoldProductTypeList';
  //update PatientInfoUpdate
  patientInfo = 'PatientInfoUpdate/GetPatientInfoList';
  statusUpdatePatientInfo = 'PatientInfoUpdate/ChangeStatus';
  patientInfoDetails = 'PatientInfoUpdate';

  //Rejected Specimen Requested
  specimenReqList = 'RejectedSpecimenRequestInfo/GetAllList';
  specimenDetail = 'RejectedSpecimenRequestInfo/GetRejectedSpecimenDetail';
  specimenCommon = 'RejectedSpecimenRequestInfo';
  addCallLogSpecimen = 'RejectedSpecimenRequestInfo/CallLog';

  // UPS Pickup
  upsPickupList = 'UpsPickup/GetAllList';
  upsPickupStatusChange = 'UpsPickup/ChangeStatus';
  upsPickup = 'UpsPickup';
  GetPickupCommentList = 'UpsPickup/GetCommentList';
  AddPickupComment = 'UpsPickup/AddComment';
  UPSPickupLog = 'UpsPickup/GetUPSPickupLog';

  //Add On Test Order
  addOnTestList = 'AddOnTests/GetAllList';
  addOnTestStatusChange = 'AddOnTests/ChangeStatus';
  addOnTestCommentList = 'AddOnTests/GetCommentList';
  addOnTestAddComment = 'AddOnTests/AddComment';
  addOnTestOrderDetail = 'AddOnTests/GetAddOnTestDetail';

  //Emr Central
  EMRCentral = 'EmrCentral';
  salesUser = 'Common/GetSalesNCUserList';
  EmrCentralList = 'EmrCentral/GetEmrRequestList';
  completeEMRReq = 'EmrCentral/GetCompletedEmrRequestList';
  EMRReqStatusChange = 'EmrCentral/ChangeStatus';
  EMRCommentList = 'EmrCentral/GetCommentList';
  EMRAddComment = 'EmrCentral/AddComment';
  GetEmrApprovalRequestPdf = 'EmrCentral/GetEmrApprovalRequestPdf';
  //follow-up
  //returned discard specimen log
  AllSpecimenList = 'ReturnedDiscardedSpecimenLog/GetAllList';
  Specimen = 'ReturnedDiscardedSpecimenLog';
  SpecimenDetail = 'ReturnedDiscardedSpecimenLog/GetSpecimenDetail';
  SpecimenCallLog = 'ReturnedDiscardedSpecimenLog/CallLog';
  //New Accession Follow Up
  commonAccession = 'NewAccessionFollowUp';
  viewAccession = 'NewAccessionFollowUp/GetNewAccessionFollowUpDetail';
  callLogAccession = 'NewAccessionFollowUp/CallLog';
  commentListAccession = 'NewAccessionFollowUp/GetCommentList';
  addCommentAccession = 'NewAccessionFollowUp/AddComment';
  //resolution center
  ResolutionCenter = 'ResolutionCenter/GetAllList';
  //Add-on/correction
  commentListAddon = 'AccessionAddOnCorrection/GetCommentList';
  addCommentAddon = 'NewAccessionFollowUp/AddComment';
  commenAddOn = 'AccessionAddOnCorrection';
  viewAddOn = 'AccessionAddOnCorrection/GetAccessionAddOnCorrectionDetail';
  callLogAddOn = 'AccessionAddOnCorrection/CallLog';
  //Requistion Central
  covid19RequisitionForm = 'Covid19RequisitionForm';
  covid19ReqList = 'Covid19RequisitionForm/GetAllList';
  //Client-Billing
  clientBillingList = 'ClientBilling/GetAllList';
  clientBillingCommentList = 'ClientBilling/GetCommentList';
  clientBillingAddComment = 'ClientBilling/AddComment';
  clientBillingStatusChange = 'ClientBilling/ChangeApprovalStatus';
  clientBillingUpdate = 'ClientBilling/UpdateClientBilling'
  commonBilling = 'ClientBilling';
  clientBillingFile = 'ClientBilling/GetBillingInvoiceFile';
  clientBillingChargeInvoice = 'ClientBilling/ChargeInvoice';
  GetFreeSupliesClientBilling = 'ClientBilling/GetFreeSuppliesClient';
  UpdateFreeSupliesClientBilling = 'ClientBilling/UpdateFreeSuppliesClient';

  //Additional Correspondence
  commonCorrespondence = 'AdditionalCorrespondence';
  commentListCorrespondence = 'AdditionalCorrespondence/GetCommentList';
  commentAddCorrespondence = 'AdditionalCorrespondence/AddComment';
  detailCorrespondence =
    'AdditionalCorrespondence/GetAdditionalCorrespondenceDetail';
  callLogCorrespondence = 'AdditionalCorrespondence/CallLog';
  //NPI Request
  commonNPIRequest = 'NPIRequest';
  detailNPIRequest = 'NPIRequest/GetAdditionalCorrespondenceDetail';
  callLogNPIRequest = 'NPIRequest/CallLog';
  //Duplicate Request Information
  commonDuplicateReq = 'DeleteDuplicateTest';
  detailDuplicateReq = 'DeleteDuplicateTest/GetDeleteDuplicateTestDetail';
  callLogDuplicateReq = 'DeleteDuplicateTest/CallLog';
  commentListDuplicateReq = 'DeleteDuplicateTest/GetCommentList';
  commentAddDuplicateReq = 'DeleteDuplicateTest/AddComment';
  // Billing Cycle
  //  /admin/BillingCycle/GetAllList
  BillingCycleList = 'BillingCycle/GetAllList';
  BillingCycle = 'BillingCycle';
  BillingCycleDetailsList = 'BillingCycle/GetBillingCycleDetailsList';
  BillingCycleGenerateInvoice = 'BillingCycle/GenerateInvoice';
  ExportBillingCycle = 'BillingCycle/ExportBillingCycle';
  // Reports
  CreditCardLogs = 'CreditCardLog/GetAllList';
  CouponLogs = 'CouponLog/GetAllList';
  CouponOrderDetails = 'CouponLog/GetOrderDetails'
  //Billing Invoice
  BillingInvoice = 'BillingInvoices/GetAllList';
  BillingInvoiceCommentList = 'BillingInvoices/GetCommentList';
  BillingInvoiceAddComment = 'BillingInvoices/AddComment';
  commonBillingInvoice = 'BillingInvoices';
  BillingInvoiceFile = 'BillingInvoices/GetBillingInvoiceFile';
  BillingInvoicePartialPay = 'BillingInvoices/PartialPayInvoice';
  BillingInvoiceChargeInvoice = 'BillingInvoices/ChargeInvoice';
  BillingInvoiceUpdate = 'BillingInvoices/UpdateBillingInvoice';

  // aging report
  AgingReport = 'AgingReport';
  AgingReportExport = 'AgingReport/ExportAgingReportData';
  //Payment Report
  PaymentReportList = 'PaymentReport/GetAllList';
  PaymentReportChargeInvoice = 'PaymentReport/ChargeInvoice';
  // CashDash
  CashDash = 'CashDash';
  GetTotalAmountCollectedReport = 'CashDash/GetTotalAmountCollectedReport';
  // Recurring Order
  CreateRecurringOrder = 'Recurringorder/CreateRecurringOrder';
  RecurringOrderList = 'Recurringorder/GetAllList';
  commonRecurringOrder = 'Recurringorder';
  AddRecurringOrder = 'Recurringorder/AddRecurringorder';
  RecurringStatusChange = 'Recurringorder/ChangeStatus';
  EditRecurringOrder = 'RecurringOrder/GetEditRecurringOrder';
  updateRecurringOrder = 'Recurringorder/UpdateRecurringOrder';
  // DashboardList
  commonDashboardlist = 'Common/GetDashboardList';
  Dashboard = 'Dashboard';
  // Charge Invoice
  getChargeInvoice = 'ChargeInvoice/GetAllList';
  AddChargeInvoice = 'ChargeInvoice';
  // Test
  Test = 'Test';
  TestGetAllList = 'Test/GetAllList';
  TestChangeStatus = 'Test/ChangeStatus';
  TestGetTestStabilitiesList = 'Test/GetTestStabilitiesList';
  TestGetTestStabilityDetails = 'Test/GetTestStabilityDetails';
  TestAddTestStabilityDetails = 'Test/AddTestStabilityDetails';
  TestUpdateTestStabilityDetails = 'Test/UpdateTestStabilityDetails';
  TestDeleteTestStabilityDetails = 'Test/DeleteTestStabilityDetails';
  WebMasterProduct = 'WebMasterProduct';
  WebMasterProductGetAll = 'WebMasterProduct/GetAllList';
  WebMasterProductChangeStatus = 'WebMasterProduct/ChangeStatus';
  GetAffProductCategoryList = 'common/GetAffProductCategoryList'
  //manage-Coupon
  CouponeList = 'Coupon/GetAllList';
  CouponChangeStatus = 'Coupon/ChangeStatus';
  CommonCoupon = 'Coupon';
  commonProductList = 'Common/GetAffProductsList';
   //manage-news
   NewsList='News/GetAllList';
   CommonNews='News';
   NewsChangeStatus='News/ChangeStatus';
   ManageSocialMedia='ManageSocialMedia';
   CommonSetting= 'CommonSetting';
   ProductCategoryUpdateSortOrder = 'ProductCategory/UpdateSortOrder';
   ProductUpdateSortOrder = 'Product/UpdateSortOrder';
}
