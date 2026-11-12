import duckdb
import pandas as pd
from typing import Dict, Any, List, Optional

class DuckDBEngine:
    def __init__(self):
        self.conn = duckdb.connect(database=':memory:')

    def execute_aggregation(
        self,
        df: pd.DataFrame,
        dimension: str,
        metric: Optional[str] = None,
        aggregation: str = 'SUM',
        limit: int = 50,
        sort_order: str = 'DESC'
    ) -> Dict[str, Any]:
        """
        Executes fast aggregation for BI charts:
        SELECT {dimension}, {aggregation}({metric}) AS value
        FROM df
        GROUP BY {dimension}
        ORDER BY value {sort_order}
        LIMIT {limit}
        """
        # Register the dataframe as a virtual in-memory table
        self.conn.register('active_dataset', df)

        allowed_aggs = {'SUM', 'AVG', 'COUNT', 'MIN', 'MAX'}
        agg = aggregation.upper() if aggregation.upper() in allowed_aggs else 'SUM'

        if metric and metric in df.columns:
            # Aggregation with a metric (e.g. SUM(Revenue) by Region)
            sql = f'''
                SELECT "{dimension}" AS category, {agg}("{metric}") AS value
                FROM active_dataset
                WHERE "{dimension}" IS NOT NULL
                GROUP BY "{dimension}"
                ORDER BY value {sort_order}
                LIMIT {limit}
            '''
        else:
            # Frequency / Count of occurrences (e.g. COUNT(*) by Product)
            sql = f'''
                SELECT "{dimension}" AS category, COUNT(*) AS value
                FROM active_dataset
                WHERE "{dimension}" IS NOT NULL
                GROUP BY "{dimension}"
                ORDER BY value {sort_order}
                LIMIT {limit}
            '''

        result_df = self.conn.execute(sql).df()
        
        categories = [str(x) for x in result_df['category'].tolist()]
        values = [round(float(v), 2) if isinstance(v, (int, float)) and not pd.isna(v) else 0 for v in result_df['value'].tolist()]

        return {
            'categories': categories,
            'values': values,
            'records': result_df.to_dict(orient='records'),
            'sql_executed': sql.strip()
        }

    def execute_custom_query(self, df: pd.DataFrame, sql_query: str) -> List[Dict[str, Any]]:
        """Allow custom SQL analytics queries directly on user Excel data."""
        self.conn.register('active_dataset', df)
        return self.conn.execute(sql_query).df().to_dict(orient='records')

duckdb_engine = DuckDBEngine()
