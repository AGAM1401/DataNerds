import axios from 'axios';
import { Dataset, AggregationResult, KPICardData } from '../types';

const API_BASE = '/api';

export const uploadFile = async (file: File): Promise<Dataset> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post<Dataset>(`${API_BASE}/datasets/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const switchSheet = async (datasetId: string, sheetName: string): Promise<Dataset> => {
  const response = await axios.get(`${API_BASE}/datasets/${datasetId}/sheet`, {
    params: { sheet_name: sheetName },
  });
  return {
    dataset_id: datasetId,
    filename: '',
    sheets: [],
    active_sheet: sheetName,
    preview: response.data.preview,
  };
};

export const runAggregation = async (params: {
  dataset_id: string;
  sheet_name: string;
  dimension: string;
  metric?: string;
  aggregation?: string;
  chart_type?: string;
  limit?: number;
}): Promise<AggregationResult> => {
  const response = await axios.post<AggregationResult>(`${API_BASE}/analytics/aggregate`, params);
  return response.data;
};

export const fetchKPIs = async (datasetId: string, sheetName: string): Promise<KPICardData[]> => {
  const response = await axios.get<{ kpis: KPICardData[] }>(`${API_BASE}/analytics/${datasetId}/kpis`, {
    params: { sheet_name: sheetName },
  });
  return response.data.kpis;
};
