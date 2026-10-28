import json
import sys
from pathlib import Path

# Add project root to sys.path so we can import preprocessing modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.preprocessing.normalizer import normalize_error_text

def run_preprocessing():
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data"
    raw_file = data_dir / "errors.json"
    output_file = data_dir / "preprocessed_errors.json"

    print("==================================================")
    print("🧹 STEP 2: PREPROCESSING & TEXT NORMALIZATION")
    print("==================================================")

    if not raw_file.exists():
        print(f"❌ Error: Raw dataset not found at {raw_file}")
        return

    with open(raw_file, "r", encoding="utf-8") as f:
        raw_dataset = json.load(f)

    print(f"Loaded {len(raw_dataset)} raw error entries.")

    preprocessed_dataset = []
    for item in raw_dataset:
        normalized = normalize_error_text(item["text"])
        preprocessed_dataset.append({
            "id": item["id"],
            "category": item["category"],
            "language": item["language"],
            "raw_text": item["text"],
            "cleaned_text": normalized
        })

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(preprocessed_dataset, f, indent=2)

    print(f"✅ Preprocessed dataset saved to: {output_file.name}\n")

    # Show a couple of Before vs After comparisons
    print("🔍 Visual Demonstration: Before vs After Normalization\n")
    for sample in preprocessed_dataset[:2]:
        print(f"--- Sample [{sample['id']}] ({sample['category']}) ---")
        print("📌 RAW ERROR (Before):")
        print("   " + "\n   ".join(sample["raw_text"].splitlines()[:2]))
        print("\n✨ CLEANED ERROR (After):")
        print("   " + "\n   ".join(sample["cleaned_text"].splitlines()[:2]))
        print()

    print("🎯 Why this matters:")
    print("   1. Notice how file paths like `/app/src/components/UserList.js` became `<PATH>`.")
    print("   2. Notice how line numbers like `:24:18` became `:<LOC>`.")
    print("   3. Now the machine learning model focuses on the words that matter (`TypeError`, `undefined`, `map`),")
    print("      not on personal file paths or random line numbers!")

if __name__ == "__main__":
    run_preprocessing()

