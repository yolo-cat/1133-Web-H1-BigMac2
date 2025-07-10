import toml
from pathlib import Path
def load_prompts(file_path: str) -> dict:
"""从 TOML 文件中加载提示。"""
return toml.load(Path(file_path))
prompts = load_prompts("AI_Coding_Style_Guide_prompts.toml")

### 任務清單
- [ ] 依照 [Level 8] 指引重構 app.js