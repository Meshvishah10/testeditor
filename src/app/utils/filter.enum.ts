// filter.enum.ts

export enum FilterOperatorType {
    IsLessThan = 0,
    IsLessThanOrEqualTo = 1,
    IsEqualTo = 2,
    IsNotEqualTo = 3,
    IsGreaterThanOrEqualTo = 4,
    IsGreaterThan = 5,
    StartsWith = 6,
    EndsWith = 7,
    Contains = 8,
    IsContainedIn = 9,
    DoesNotContain = 10,
    IsNull = 11,
    IsNotNull = 12,
    IsEmpty = 13,
    IsNotEmpty = 14,
    IsNullOrEmpty = 15,
    IsNotNullOrEmpty = 16,
  }
  
  export function mapOperatorToEnum(operator: string): FilterOperatorType | undefined {
    switch (operator.toLowerCase()) {
      case 'lt':
        return FilterOperatorType.IsLessThan;
      case 'lte':
        return FilterOperatorType.IsLessThanOrEqualTo;
      case 'eq':
        return FilterOperatorType.IsEqualTo;
      case 'neq':
        return FilterOperatorType.IsNotEqualTo;
      case 'gte':
        return FilterOperatorType.IsGreaterThanOrEqualTo;
      case 'gt':
        return FilterOperatorType.IsGreaterThan;
      case 'startswith':
        return FilterOperatorType.StartsWith;
      case 'endswith':
        return FilterOperatorType.EndsWith;
      case 'contains':
        return FilterOperatorType.Contains;
      default:
        return undefined;
    }
  }
  