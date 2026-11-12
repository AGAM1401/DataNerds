export interface ColumnMeta {
  name: string;
  type: 'number' | 'string' | 'date' | 'boolean';
  raw_type: string;
}

export interface DataPreview {
  total_rows: number;
  total_columns: number;
  columns: ColumnMeta[];
  rows: Record<string, any>[];
}

export interface Dataset {
  dataset_id: string;
  filename: string;
  sheets: string[];
  active_sheet: string;
  preview: DataPreview;
}

export interface AggregationResult {
  status: string;
  chart_type: string;
  dimension: string;
  metric?: string;
  aggregation: string;
  categories: string[];
  values: number[];
  records: Record<string, any>[];
  sql_executed: string;
}

export interface KPICardData {
  label: string;
  value: string;
}
