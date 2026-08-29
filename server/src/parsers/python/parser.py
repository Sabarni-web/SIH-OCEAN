import sys
import json
# pyrefly: ignore [missing-import]
import numpy as np

try:
    # pyrefly: ignore [missing-import]
    import xarray as xr
except ImportError:
    print(json.dumps({"error": "xarray not installed"}))
    sys.exit(1)

import math

def clean_float(val):
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return 0.0
        return f
    except (TypeError, ValueError):
        return 0.0

def get_dim_bounds(dim_name, dataset):
    if dim_name and dim_name in dataset.variables:
        var = dataset[dim_name]
        if var.size > 0:
            # pyrefly: ignore [unknown-name]
            return clean_float(var.min(skipna=True).values), clean_float(var.max(skipna=True).values)
    return 0.0, 0.0

def parse_netcdf(file_path):
    try:
        # pyrefly: ignore [unknown-name]
        ds = xr.open_dataset(file_path)
        
        variables = []
        for var_name, var in ds.data_vars.items():
            variables.append({
                "id": str(var_name),
                "name": str(var.attrs.get("long_name", var_name)),
                "unit": str(var.attrs.get("units", "unknown")),
                "min": clean_float(var.min(skipna=True).values) if var.size > 0 else 0.0,
                "max": clean_float(var.max(skipna=True).values) if var.size > 0 else 0.0,
                "dimensions": [str(d) for d in var.dims]
            })

        dims = list(ds.dims.keys()) if hasattr(ds.dims, 'keys') else list(ds.dims)
        lat_var = next((v for v in dims if str(v).lower() in ['lat', 'latitude']), None)
        lon_var = next((v for v in dims if str(v).lower() in ['lon', 'longitude']), None)
        depth_var = next((v for v in dims if str(v).lower() in ['depth', 'lev', 'level']), None)

        lat_min, lat_max = get_dim_bounds(lat_var, ds)
        lon_min, lon_max = get_dim_bounds(lon_var, ds)
        depth_min, depth_max = get_dim_bounds(depth_var, ds)

        # Simplified for prototype - return metadata
        result = {
            "variables": variables,
            "spatialBounds": {
                "latMin": lat_min,
                "latMax": lat_max,
                "lonMin": lon_min,
                "lonMax": lon_max
            },
            "depthRange": {
                "min": depth_min,
                "max": depth_max
            }
        }
        
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        parse_netcdf(sys.argv[1])
    else:
        print(json.dumps({"error": "No file path provided"}))
