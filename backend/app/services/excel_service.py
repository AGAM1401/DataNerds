import os
import pandas as pd
from typing import Dict, Any, List

def get_sheet_names(file_path: str) -> List[str]:
    """Return sheet names for an Excel file or a default sheet name for CSV."""
    if file_path.endswith('.csv'):
        return ['Sheet1']
    excel_file = pd.ExcelFile(file_path)
    return excel_file.sheet_names

def load_data(file_path: str, sheet_name: str = None) -> pd.DataFrame:
    """Load data from CSV or Excel file."""
    if file_path.endswith('.csv'):
        return pd.read_csv(file_path)
    else:
        return pd.read_excel(file_path, sheet_name=sheet_name or 0)

def infer_column_types(df: pd.DataFrame) -> List[Dict[str, str]]:
    """Infer column data types for data modeling and chart suggestions."""
    schema = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if 'int' in dtype or 'float' in dtype:
            col_type = 'number'
        elif 'datetime' in dtype:
            col_type = 'date'
        elif 'bool' in dtype:
            col_type = 'boolean'
        else:
            col_type = 'string'
        
        schema.append({
            'name': str(col),
            'type': col_type,
            'raw_type': dtype
        })
    return schema

def get_data_preview(df: pd.DataFrame, limit: int = 50) -> Dict[str, Any]:
    """Generate preview records, summary stats, and column metadata."""
    preview_df = df.head(limit).fillna("")
    return {
        'total_rows': len(df),
        'total_columns': len(df.columns),
        'columns': infer_column_types(df),
        'rows': preview_df.to_dict(orient='records')
    }
