export interface TestSearches {
  Id: number;
  Code: string;
  Title: string;
  SpecimenType: string;
  RouteName: string;
  Status: number;
  StatusText: string;
}

export interface TestSearchesListResponse {
  TestsList: TestSearches[];
  Total: number;
}

export interface Temperature {
  i: number;
  ttype: string;
  tdaysno: string;
  tvalidity: string;
}

export interface Stability {
  i: number;
  stability_type: string;
}

export interface TestStability {
  TestId: number;
  StabilityArray: Stability[];
  TemperatureArray: Temperature[];
  Id: number;
}

export interface TestStabilitiesListResponse {
  TestStabilitiesList: TestStability[];
  Total: number;
}