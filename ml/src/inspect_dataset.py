import json
from collections import Counter
from pathlib import Path

def inspect_dataset():
    data_path = Path(__file__).resolve().parent.parent / "data" / "errors.json"
    with open(data_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    print(f"==================================================")
    print(f"📊 DATASET SUMMARY: {len(records)} total error samples")
    print(f"==================================================")

    category_counts = Counter(r["category"] for r in records)
    print("\n📂 Category Distribution:")
    for cat, count in category_counts.most_common():
        print(f"  - {cat:<28}: {count} samples")

    language_counts = Counter(r["language"] for r in records)
    print("\n💻 Language Distribution:")
    for lang, count in language_counts.most_common():
        print(f"  - {lang:<28}: {count} samples")

    print("\n🔎 First Sample Preview:")
    sample = records[0]
    print(f"  ID:       {sample['id']}")
    print(f"  Category: {sample['category']}")
    print(f"  Language: {sample['language']}")
    print(f"  Text:\n{sample['text'][:120]}...\n")

if __name__ == "__main__":
    inspect_dataset()

