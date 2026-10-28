"""
Master Training and Evaluation Pipeline for Bug Root Cause Predictor.
Trains TF-IDF Vectorizer + Multinomial Naive Bayes model on curated dataset.
Evaluates accuracy on held-out test split, exports portable JSON weights for mobile inference.
"""
import json
import random
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime, timezone

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.vectorizer import SimpleTFIDFVectorizer
from src.classifier import NaiveBayesClassifier

def stratified_train_test_split(dataset, test_ratio=0.2, seed=42):
    """
    Split dataset ensuring each category is proportionally represented in train and test sets.
    """
    random.seed(seed)
    by_category = defaultdict(list)
    for item in dataset:
        by_category[item["category"]].append(item)

    train_set = []
    test_set = []

    for category, items in by_category.items():
        shuffled = items.copy()
        random.shuffle(shuffled)
        n_test = max(1, int(round(len(shuffled) * test_ratio)))
        test_set.extend(shuffled[:n_test])
        train_set.extend(shuffled[n_test:])

    random.shuffle(train_set)
    random.shuffle(test_set)
    return train_set, test_set

def run_training_pipeline():
    base_dir = Path(__file__).resolve().parent.parent
    data_file = base_dir / "data" / "preprocessed_errors.json"
    artifacts_dir = base_dir / "artifacts"
    artifacts_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("🧠 STEP 4: MODEL TRAINING & EVALUATION PIPELINE")
    print("==================================================")

    if not data_file.exists():
        print(f"❌ Error: Preprocessed dataset not found at {data_file}")
        return

    with open(data_file, "r", encoding="utf-8") as f:
        dataset = json.load(f)

    print(f"Total dataset size: {len(dataset)} labeled error samples.")

    # 1. Stratified Train / Test Split
    train_data, test_data = stratified_train_test_split(dataset, test_ratio=0.2, seed=42)
    print(f"Split completed: {len(train_data)} training samples (80%), {len(test_data)} test samples (20%).")

    train_texts = [d["cleaned_text"] for d in train_data]
    train_labels = [d["category"] for d in train_data]

    test_texts = [d["cleaned_text"] for d in test_data]
    test_labels = [d["category"] for d in test_data]

    # 2. Vectorize using TF-IDF
    print("\n1️⃣  Fitting TF-IDF Vectorizer on training data...")
    vectorizer = SimpleTFIDFVectorizer(min_df=1, max_features=250)
    X_train = vectorizer.fit_transform(train_texts)
    X_test = vectorizer.transform(test_texts)
    print(f"   Vocabulary extracted: {len(vectorizer.feature_names)} features.")

    # 3. Train Naive Bayes Classifier
    print("\n2️⃣  Training Multinomial Naive Bayes Classifier...")
    model = NaiveBayesClassifier(alpha=0.1)
    model.fit(X_train, train_labels)
    print(f"   Model fitted across {len(model.classes)} categories.")

    # 4. Evaluate on Held-Out Test Set (Unseen Errors)
    print("\n3️⃣  Evaluating on Held-Out Test Errors (Never Seen During Training)...")
    test_preds = model.predict(X_test)
    test_probs = model.predict_proba(X_test)

    correct_count = 0
    print("\n--------------------------------------------------------------------------------")
    print(f"{'Actual Category':<26} | {'Predicted Category':<26} | {'Confidence':<10} | Result")
    print("--------------------------------------------------------------------------------")

    for i in range(len(test_data)):
        actual = test_labels[i]
        predicted = test_preds[i]
        confidence = max(test_probs[i]) * 100.0
        is_correct = actual == predicted
        if is_correct:
            correct_count += 1
            status = "✅ PASS"
        else:
            status = "❌ FAIL"

        print(f"{actual[:25]:<26} | {predicted[:25]:<26} | {confidence:>6.1f}%    | {status}")

    accuracy = (correct_count / len(test_data)) * 100.0
    print("--------------------------------------------------------------------------------")
    print(f"🎯 Test Set Accuracy: {accuracy:.1f}% ({correct_count}/{len(test_data)} correct)")

    # 5. Train Production Model on 100% of the Dataset for Maximum Quality
    print("\n4️⃣  Training Final Production Model on Full Dataset...")
    full_texts = [d["cleaned_text"] for d in dataset]
    full_labels = [d["category"] for d in dataset]

    prod_vectorizer = SimpleTFIDFVectorizer(min_df=1, max_features=250)
    X_full = prod_vectorizer.fit_transform(full_texts)

    prod_model = NaiveBayesClassifier(alpha=0.1)
    prod_model.fit(X_full, full_labels)

    # 6. Export Model Artifacts
    vocab_path = artifacts_dir / "vocab.json"
    weights_path = artifacts_dir / "model_weights.json"
    meta_path = artifacts_dir / "model_metadata.json"

    with open(vocab_path, "w", encoding="utf-8") as f:
        json.dump(prod_vectorizer.to_dict(), f, indent=2)

    with open(weights_path, "w", encoding="utf-8") as f:
        json.dump(prod_model.to_dict(), f, indent=2)

    metadata = {
        "model_type": "MultinomialNaiveBayes",
        "version": "1.0.0",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "training_samples": len(dataset),
        "test_samples": len(test_data),
        "test_accuracy_pct": round(accuracy, 2),
        "categories": prod_model.classes,
        "vocabulary_size": len(prod_vectorizer.feature_names),
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n💾 Model Artifacts Exported Successfully:")
    print(f"   • {vocab_path.relative_to(base_dir.parent)} ({vocab_path.stat().st_size} bytes)")
    print(f"   • {weights_path.relative_to(base_dir.parent)} ({weights_path.stat().st_size} bytes)")
    print(f"   • {meta_path.relative_to(base_dir.parent)} ({meta_path.stat().st_size} bytes)")
    print("\n🎉 Model training complete and ready for Mobile on-device integration!")

if __name__ == "__main__":
    run_training_pipeline()
