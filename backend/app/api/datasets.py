import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Dict, Any, Optional

from app.services.excel_service import (
    get_sheet_names,
    load_data,
    get_data_preview
)

router = APIRouter(prefix="/datasets", tags=["datasets"])

# Local cache for active datasets in memory
# Key: dataset_id -> { 'file_path': str, 'filename': str, 'sheets': List[str], 'loaded_dfs': { sheet: DataFrame } }
DATASET_CACHE: Dict[str, Any] = {}
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls') or file.filename.endswith('.csv')):
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, and .csv files are supported.")
    
    dataset_id = str(uuid.uuid4())[:8]
    file_path = os.path.join(UPLOAD_DIR, f"{dataset_id}_{file.filename}")

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        sheet_names = get_sheet_names(file_path)
        first_sheet = sheet_names[0]
        df = load_data(file_path, sheet_name=first_sheet)
        preview = get_data_preview(df)

        DATASET_CACHE[dataset_id] = {
            'file_path': file_path,
            'filename': file.filename,
            'sheets': sheet_names,
            'loaded_dfs': {first_sheet: df}
        }

        return {
            'dataset_id': dataset_id,
            'filename': file.filename,
            'sheets': sheet_names,
            'active_sheet': first_sheet,
            'preview': preview
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@router.get("/{dataset_id}/sheet")
async def get_sheet_data(dataset_id: str, sheet_name: str = Query(...)):
    if dataset_id not in DATASET_CACHE:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    cache_item = DATASET_CACHE[dataset_id]
    if sheet_name not in cache_item['loaded_dfs']:
        try:
            df = load_data(cache_item['file_path'], sheet_name=sheet_name)
            cache_item['loaded_dfs'][sheet_name] = df
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Could not load sheet: {str(e)}")
    else:
        df = cache_item['loaded_dfs'][sheet_name]

    return {
        'dataset_id': dataset_id,
        'sheet_name': sheet_name,
        'preview': get_data_preview(df)
    }
