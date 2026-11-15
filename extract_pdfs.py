"""Extract public York PDF evidence without retaining binary downloads."""
import io
import json
import time
import urllib.request
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).parent
sources = json.loads((root / "sources.json").read_text(encoding="utf-8"))
results = []
for page in sources["pages"]:
    if page.get("kind") != "PDF":
        continue
    result = {"url": page["url"], "checkedAt": page["checkedAt"]}
    try:
        request = urllib.request.Request(page["url"], headers={"User-Agent": "YorkAIContentAudit/1.0"})
        with urllib.request.urlopen(request, timeout=25) as response:
            data = response.read(20_000_000)
        reader = PdfReader(io.BytesIO(data))
        result["pageCount"] = len(reader.pages)
        result["text"] = "\n\n".join(p.extract_text() or "" for p in reader.pages)[:150000]
        result["status"] = "Text extracted" if result["text"].strip() else "No extractable text"
    except Exception as error:
        result["error"] = f"{type(error).__name__}: {error}"
    results.append(result)
    print(result["url"], result.get("status", result.get("error")), flush=True)
    (root / "pdf-evidence.json").write_text(json.dumps(results, ensure_ascii=True, indent=2), encoding="utf-8")
    time.sleep(0.4)
