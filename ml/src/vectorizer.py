"""
TF-IDF Vectorizer (Term Frequency - Inverse Document Frequency)
Pure Python implementation matching scikit-learn mathematics.
Zero external dependencies, highly transparent and portable for mobile on-device inference.
"""
import math
import re
from collections import Counter
from typing import List, Dict, Tuple

class SimpleTFIDFVectorizer:
    def __init__(self, min_df: int = 1, max_features: int = 500):
        self.min_df = min_df
        self.max_features = max_features
        self.vocabulary: Dict[str, int] = {}       # term -> feature index
        self.feature_names: List[str] = []         # feature index -> term
        self.idf_weights: List[float] = []         # feature index -> IDF weight
        self.total_docs: int = 0

    @staticmethod
    def tokenize(text: str) -> List[str]:
        """
        Extract clean words/tokens from normalized error text.
        Splits by non-alphanumeric characters while keeping technical words intact.
        """
        tokens = re.findall(r'[a-z_][a-z0-9_]*', text.lower())
        # Filter out extremely short 1-letter tokens except common ones
        return [t for t in tokens if len(t) > 1 and t not in {'at', 'in', 'of', 'to', 'is', 'as', 'it'}]

    def fit(self, raw_documents: List[str]) -> "SimpleTFIDFVectorizer":
        """
        Learn the vocabulary dictionary and calculate Inverse Document Frequency (IDF) for all terms.
        """
        self.total_docs = len(raw_documents)
        doc_count_per_term: Counter = Counter()

        # Step A: Count how many documents contain each term (Document Frequency = DF)
        for doc in raw_documents:
            tokens = set(self.tokenize(doc))
            for token in tokens:
                doc_count_per_term[token] += 1

        # Step B: Filter terms by min_df and select top max_features
        filtered_terms = [
            term for term, count in doc_count_per_term.items()
            if count >= self.min_df
        ]
        # Sort terms by frequency descending, then alphabetically
        sorted_terms = sorted(filtered_terms, key=lambda t: (-doc_count_per_term[t], t))[:self.max_features]

        # Step C: Assign an index to each feature word
        self.vocabulary = {term: idx for idx, term in enumerate(sorted_terms)}
        self.feature_names = sorted_terms

        # Step D: Compute standard smooth IDF formula (same as scikit-learn):
        # idf(t) = ln((1 + N) / (1 + df(t))) + 1
        self.idf_weights = []
        for term in sorted_terms:
            df = doc_count_per_term[term]
            idf = math.log((1 + self.total_docs) / (1 + df)) + 1.0
            self.idf_weights.append(round(idf, 4))

        return self

    def transform(self, raw_documents: List[str]) -> List[List[float]]:
        """
        Transform error texts into numeric TF-IDF feature vectors with L2 normalization.
        """
        num_features = len(self.feature_names)
        vectors = []

        for doc in raw_documents:
            tokens = self.tokenize(doc)
            term_counts = Counter(tokens)
            doc_len = len(tokens) if tokens else 1

            # Vector of size len(vocabulary)
            vector = [0.0] * num_features

            for term, count in term_counts.items():
                if term in self.vocabulary:
                    idx = self.vocabulary[term]
                    tf = count / doc_len                 # Term Frequency
                    idf = self.idf_weights[idx]          # Inverse Document Frequency
                    vector[idx] = tf * idf               # TF-IDF score

            # Apply L2 Normalization (unit length so short & long texts are fair)
            sum_sq = sum(v * v for v in vector)
            if sum_sq > 0:
                l2_norm = math.sqrt(sum_sq)
                vector = [round(v / l2_norm, 4) for v in vector]

            vectors.append(vector)

        return vectors

    def fit_transform(self, raw_documents: List[str]) -> List[List[float]]:
        return self.fit(raw_documents).transform(raw_documents)

    def to_dict(self) -> dict:
        """Export serialized parameters ready for mobile TypeScript consumption."""
        return {
            "total_documents": self.total_docs,
            "vocabulary_size": len(self.feature_names),
            "vocabulary": self.vocabulary,
            "feature_names": self.feature_names,
            "idf_weights": self.idf_weights,
        }

