from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.api.datasets import DATASET_CACHE
from app.services.duckdb_service import duckdb_engine

router = APIRouter(prefix="/analytics", tags=["analytics"])

class AggregationRequest(BaseModel):
    dataset_id: str
    sheet_name: str
    dimension: str
    metric: Optional[str] = None
    aggregation: str = "SUM"
    chart_type: str = "bar"
    limit: int = 50

@router.post("/aggregate")
async def aggregate_data(req: AggregationRequest):
    if req.dataset_id not in DATASET_CACHE:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    cache_item = DATASET_CACHE[req.dataset_id]
    if req.sheet_name not in cache_item['loaded_dfs']:
        raise HTTPException(status_code=400, detail="Sheet not loaded")
    
    df = cache_item['loaded_dfs'][req.sheet_name]

    if req.dimension not in df.columns:
        raise HTTPException(status_code=400, detail=f"Dimension '{req.dimension}' not found in dataset")

    try:
        agg_result = duckdb_engine.execute_aggregation(
            df=df,
            dimension=req.dimension,
            metric=req.metric,
            aggregation=req.aggregation,
            limit=req.limit
        )

        return {
            "status": "success",
            "chart_type": req.chart_type,
            "dimension": req.dimension,
            "metric": req.metric,
            "aggregation": req.aggregation,
            "categories": agg_result["categories"],
            "values": agg_result["values"],
            "records": agg_result["records"],
            "sql_executed": agg_result["sql_executed"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Aggregation query failed: {str(e)}")

@router.get("/{dataset_id}/kpis")
async def get_kpis(dataset_id: str, sheet_name: str):
    if dataset_id not in DATASET_CACHE:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    df = DATASET_CACHE[dataset_id]['loaded_dfs'].get(sheet_name)
    if df is None:
        raise HTTPException(status_code=400, detail="Sheet not loaded")
    
    # Calculate top-level stats
    numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
    kpis = [
        {"label": "Total Rows", "value": f"{len(df):,}"},
        {"label": "Total Columns", "value": str(len(df.columns))}
    ]

    for col in numeric_cols[:2]:
        total_val = float(df[col].sum())
        kpis.append({
            "label": f"Total {col}",
            "value": f"{total_val:,.2f}"
        })

    return {"kpis": kpis}
