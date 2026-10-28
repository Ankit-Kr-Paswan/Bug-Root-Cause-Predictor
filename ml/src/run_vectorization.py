import json
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.vectorizer import SimpleTFIDFVectorizer

def run_step_3():
    base_dir = Path(__file__).resolve().parent.parent
    data_file = base_dir / "data" / "preprocessed_errors.json"
    artifacts_dir = base_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    vocab_file = artifacts_dir / "vocab.json"

    print("==================================================")
    print("🔢 STEP 3: TF-IDF VECTORIZATION (WORDS TO NUMBERS)")
    print("==================================================")

    if not data_file.exists():
        print(f"❌ Error: Preprocessed dataset not found at {data_file}")
        return

    with open(data_file, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    corpus = [item["cleaned_text"] for item in dataset]
    print(f"Loaded {len(corpus)} preprocessed documents.")

    # 1. Initialize and Fit the Vectorizer
    vectorizer = SimpleTFIDFVectorizer(min_df=1, max_features=250)
    vectors = vectorizer.fit_transform(corpus)

    print(f"✅ Built vocabulary containing {len(vectorizer.feature_names)} unique feature words.")

    # 2. Show sample vocabulary words with their IDF scores
    print("\n🔍 What makes a word informative? (IDF Weights):")
    print("   (Higher score = more unique/informative keyword)")
    sample_terms = [
        "typeerror", "undefined", "econnrefused", "memoryerror", 
        "jwt", "queryfailederror", "file", "line"
    ]
    for term in sample_terms:
        if term in vectorizer.vocabulary:
            idx = vectorizer.vocabulary[term]
            idf = vectorizer.idf_weights[idx]
            print(f"   • '{term:<18}' -> Feature #{idx:<3} | IDF Weight: {idf:.4f}")

    # 3. Show how an actual error is converted into numbers
    print("\n🔢 Sample Conversion: Error Text -> Math Vector")
    sample_error = dataset[0]
    sample_vec = vectors[0]
    non_zero = [(vectorizer.feature_names[i], sample_vec[i]) for i in range(len(sample_vec)) if sample_vec[i] > 0]
    # Sort by weight
    non_zero.sort(key=lambda x: -x[1])

    print(f"Sample: \"{sample_error['cleaned_text'].splitlines()[0]}\"")
    print("Resulting Non-Zero Feature Weights:")
    for word, weight in non_zero[:6]:
        print(f"   -> Word '{word:<15}': {weight:.4f}")

    # 4. Save the vocabulary and IDF weights to JSON for mobile
    with open(vocab_file, "w", encoding="utf-8") as f:
        json.dump(vectorizer.to_dict(), f, indent=2)

    print(f"\n💾 Saved Vectorizer Artifact to: {vocab_file}")
    print("This exact JSON artifact can now be loaded directly in our mobile app!")

if __name__ == "__main__":
    run_step_3()

