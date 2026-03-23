import json

def format_to_ts(json_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    ts_content = "export const compiladoClientesData = [\n"
    for item in data:
        ts_content += "  {\n"
        for key, value in item.items():
            # Clean key for JS
            js_key = key.replace(" ", "_").replace("(", "").replace(")", "").replace("/", "_").replace(":", "").replace("?", "").replace("'", "").replace(".", "").replace(",", "")
            if value is None:
                ts_content += f"    {js_key}: null,\n"
            elif isinstance(value, (int, float)):
                ts_content += f"    {js_key}: {value},\n"
            else:
                # Escape quotes
                safe_val = str(value).replace('"', '\\"')
                ts_content += f"    {js_key}: \"{safe_val}\",\n"
        ts_content += "  },\n"
    ts_content += "];\n"
    
    with open("compilado_clientes_data.ts", "w", encoding="utf-8") as f:
        f.write(ts_content)

if __name__ == "__main__":
    format_to_ts("compilado_clientes.json")
