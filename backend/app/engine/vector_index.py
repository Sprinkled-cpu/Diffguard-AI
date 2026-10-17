"""Vector Index & Semantic Similarity Engine for DiffGuard AI.

Provides semantic similarity matching between changelog descriptions and code symbols
using vector embeddings and cosine similarity.
"""
import math
import re
from typing import List, Dict, Tuple, Any

class VectorIndex:
    """In-memory semantic vector index with TF-IDF character n-gram cosine similarity."""

    def __init__(self):
        self.documents: List[Dict[str, Any]] = []
        self.vocabulary: Dict[str, int] = {}
        self.doc_vectors: List[Dict[str, float]] = []

    def _tokenize(self, text: str) -> List[str]:
        """Generate word and sub-token n-grams from identifier names and text."""
        # Split on non-alphanumeric and camelCase / snake_case
        clean_text = re.sub(r'([a-z])([A-Z])', r'\1 \2', text)
        words = re.findall(r'[a-zA-Z0-9_]{2,}', clean_text.lower())
        tokens = list(words)
        
        # Add character tri-grams for fuzzy matching
        for word in words:
            if len(word) >= 3:
                for i in range(len(word) - 2):
                    tokens.append(f"tri_{word[i:i+3]}")
        return tokens

    def add_document(self, doc_id: str, text: str, metadata: Dict[str, Any] = None):
        """Index a document (e.g. changelog rule or code symbol)."""
        tokens = self._tokenize(text)
        term_freqs: Dict[str, float] = {}
        for t in tokens:
            term_freqs[t] = term_freqs.get(t, 0.0) + 1.0

        # Normalize
        norm = math.sqrt(sum(v * v for v in term_freqs.values())) or 1.0
        normalized_vector = {k: v / norm for k, v in term_freqs.items()}

        self.documents.append({
            "id": doc_id,
            "text": text,
            "metadata": metadata or {},
            "vector": normalized_vector
        })

    def search(self, query: str, top_k: int = 5, threshold: float = 0.15) -> List[Dict[str, Any]]:
        """Search for top similar indexed items given a query string."""
        q_tokens = self._tokenize(query)
        q_freqs: Dict[str, float] = {}
        for t in q_tokens:
            q_freqs[t] = q_freqs.get(t, 0.0) + 1.0
        
        q_norm = math.sqrt(sum(v * v for v in q_freqs.values())) or 1.0
        q_vector = {k: v / q_norm for k, v in q_freqs.items()}

        results: List[Tuple[float, Dict[str, Any]]] = []
        for doc in self.documents:
            doc_vec = doc["vector"]
            # Cosine similarity between sparse vectors
            score = 0.0
            for term, q_val in q_vector.items():
                if term in doc_vec:
                    score += q_val * doc_vec[term]
            
            if score >= threshold:
                results.append((score, {
                    "id": doc["id"],
                    "text": doc["text"],
                    "metadata": doc["metadata"],
                    "score": round(score, 4)
                }))

        results.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in results[:top_k]]
