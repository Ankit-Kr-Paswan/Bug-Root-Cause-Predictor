"""
Multinomial Naive Bayes Classifier for Bug Root Cause Prediction.
Pure Python implementation of Bayes' Theorem with Laplace smoothing and Softmax calibration.
100% portable for on-device mobile inference (iOS/Android) with zero C/C++ native dependencies.
"""
import math
from typing import List, Dict, Tuple, Optional

class NaiveBayesClassifier:
    def __init__(self, alpha: float = 0.1):
        """
        alpha: Laplace smoothing parameter (prevents zero probabilities for rare words).
        """
        self.alpha = alpha
        self.classes: List[str] = []
        self.class_to_idx: Dict[str, int] = {}
        self.class_log_priors: List[float] = []          # log P(Class)
        self.feature_log_probs: List[List[float]] = []   # log P(Word | Class)
        self.feature_count_: List[List[float]] = []

    def fit(self, X: List[List[float]], y: List[str]) -> "NaiveBayesClassifier":
        """
        Fit the Naive Bayes model according to X (feature vectors) and y (target labels).
        """
        n_samples = len(y)
        n_features = len(X[0]) if n_samples > 0 else 0

        # 1. Identify unique classes
        self.classes = sorted(list(set(y)))
        self.class_to_idx = {c: i for i, c in enumerate(self.classes)}
        n_classes = len(self.classes)

        # 2. Count class frequencies & accumulate feature weights per class
        class_sample_counts = [0] * n_classes
        self.feature_count_ = [[0.0] * n_features for _ in range(n_classes)]

        for vec, label in zip(X, y):
            c_idx = self.class_to_idx[label]
            class_sample_counts[c_idx] += 1
            for f_idx in range(n_features):
                self.feature_count_[c_idx][f_idx] += vec[f_idx]

        # 3. Calculate class log priors: log(count(c) / total_samples)
        self.class_log_priors = [
            math.log(count / n_samples) for count in class_sample_counts
        ]

        # 4. Calculate feature log probabilities with Laplace smoothing:
        # P(w_i | c) = (sum(w_i in c) + alpha) / (total_words_in_c + alpha * n_features)
        self.feature_log_probs = []
        for c_idx in range(n_classes):
            total_feature_sum = sum(self.feature_count_[c_idx]) + (self.alpha * n_features)
            class_feature_log_probs = []
            for f_idx in range(n_features):
                smoothed_weight = self.feature_count_[c_idx][f_idx] + self.alpha
                prob = smoothed_weight / total_feature_sum
                class_feature_log_probs.append(round(math.log(prob), 6))
            self.feature_log_probs.append(class_feature_log_probs)

        return self

    def predict_log_proba(self, X: List[List[float]]) -> List[List[float]]:
        """
        Calculate raw log joint likelihood for each class:
        log P(C, x) = log P(C) + sum(x_i * log P(w_i | C))
        """
        all_log_probs = []
        for vec in X:
            sample_scores = []
            for c_idx in range(len(self.classes)):
                score = self.class_log_priors[c_idx]
                for f_idx, val in enumerate(vec):
                    if val > 0:
                        score += val * self.feature_log_probs[c_idx][f_idx]
                sample_scores.append(score)
            all_log_probs.append(sample_scores)
        return all_log_probs

    def predict_proba(self, X: List[List[float]]) -> List[List[float]]:
        """
        Convert log-likelihoods to normalized calibrated probabilities (0.0 to 1.0) using Softmax.
        """
        log_probs = self.predict_log_proba(X)
        calibrated_probs = []

        for scores in log_probs:
            # Softmax with max-subtraction trick to avoid numerical overflow
            max_score = max(scores)
            exp_scores = [math.exp(s - max_score) for s in scores]
            total_exp = sum(exp_scores)
            probs = [round(e / total_exp, 4) for e in exp_scores]
            calibrated_probs.append(probs)

        return calibrated_probs

    def predict(self, X: List[List[float]]) -> List[str]:
        """Predict the most likely category for each sample."""
        probas = self.predict_proba(X)
        predictions = []
        for prob_dist in probas:
            best_idx = prob_dist.index(max(prob_dist))
            predictions.append(self.classes[best_idx])
        return predictions

    def to_dict(self) -> dict:
        """Export model parameters into portable JSON for mobile inference."""
        return {
            "model_type": "MultinomialNaiveBayes",
            "version": "1.0.0",
            "alpha": self.alpha,
            "classes": self.classes,
            "class_log_priors": [round(p, 6) for p in self.class_log_priors],
            "feature_log_probs": self.feature_log_probs,
        }
