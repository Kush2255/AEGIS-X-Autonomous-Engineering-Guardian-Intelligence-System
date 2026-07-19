import os
import re
import json
import math
import google.generativeai as genai
from typing import List, Dict, Any

# Load env variables from local .env file
env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
if os.path.exists(env_file):
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key] = value

GUIDELINES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "guidelines")
INDEX_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "rag_index.json")

class RAGSystem:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if self.api_key:
            genai.configure(api_key=self.api_key)
        self.load_index()

    def chunk_document(self, filepath: str) -> List[Dict[str, Any]]:
        filename = os.path.basename(filepath)
        title = filename.replace(".md", "").replace("_", " ").upper()
        
        # Extract collection ID, e.g. "Collection 01" from filename "collection_01_..."
        match = re.search(r'collection_(\d+)', filename)
        collection_id = f"Collection {match.group(1)}" if match else "General"
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # Split content by markdown headers (e.g., ## Section)
        sections = re.split(r'\n(##\s+)', content)
        chunks = []
        
        # First part (usually title/introduction)
        intro = sections[0].strip()
        if intro:
            chunks.append({
                "source": filename,
                "collection_id": collection_id,
                "title": title + " - Overview",
                "content": intro
            })

        # Loop through the split sections
        i = 1
        while i < len(sections):
            header_prefix = sections[i]  # "## "
            section_content = sections[i+1] if i+1 < len(sections) else ""
            i += 2

            lines = section_content.strip().split("\n")
            section_title = lines[0].strip() if lines else "Section"
            body = "\n".join(lines[1:]).strip()

            if body:
                chunks.append({
                    "source": filename,
                    "collection_id": collection_id,
                    "title": f"{title} - {section_title}",
                    "content": f"{section_title}\n\n{body}"
                })
        
        return chunks

    def build_index(self):
        print("Starting RAG indexing...")
        all_chunks = []
        if not os.path.exists(GUIDELINES_DIR):
            os.makedirs(GUIDELINES_DIR)
            print(f"Guidelines directory {GUIDELINES_DIR} was empty, created it.")
            
        for file in os.listdir(GUIDELINES_DIR):
            if file.endswith(".md"):
                filepath = os.path.join(GUIDELINES_DIR, file)
                print(f"Indexing {file}...")
                chunks = self.chunk_document(filepath)
                all_chunks.extend(chunks)

        # Generate embeddings if Gemini API key is available
        if self.api_key:
            print("Gemini API key found. Generating vector embeddings...")
            try:
                for idx, chunk in enumerate(all_chunks):
                    print(f"Embedding chunk {idx+1}/{len(all_chunks)}: {chunk['title']}")
                    result = genai.embed_content(
                        model="models/embedding-001",
                        content=chunk["content"],
                        task_type="retrieval_document"
                    )
                    chunk["embedding"] = result["embedding"]
            except Exception as e:
                print(f"Error calling Gemini embeddings: {e}. Falling back to TF-IDF text search.")
        else:
            print("No Gemini API key found. Vector embeddings skipped. RAG will run on TF-IDF search.")

        # Save to JSON
        with open(INDEX_PATH, "w", encoding="utf-8") as f:
            json.dump(all_chunks, f, indent=2, ensure_ascii=False)
        
        self.chunks = all_chunks
        print(f"Indexing completed! Successfully saved {len(all_chunks)} chunks to {INDEX_PATH}.")

    def load_index(self):
        if os.path.exists(INDEX_PATH):
            try:
                with open(INDEX_PATH, "r", encoding="utf-8") as f:
                    self.chunks = json.load(f)
            except Exception as e:
                print(f"Error loading index: {e}")
                self.chunks = []
        else:
            self.chunks = []

    # Pure Python TF-IDF search helper
    def _tfidf_search(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        # Tokenize helper
        def tokenize(text: str) -> List[str]:
            return re.findall(r'\w+', text.lower())

        # Document frequencies
        dfs = {}
        doc_tokens = []
        for chunk in self.chunks:
            tokens = tokenize(chunk["content"] + " " + chunk["title"])
            doc_tokens.append(tokens)
            unique_tokens = set(tokens)
            for token in unique_tokens:
                dfs[token] = dfs.get(token, 0) + 1

        N = len(self.chunks)
        if N == 0:
            return []

        # Query tokens
        q_tokens = tokenize(query)
        q_tf = {}
        for token in q_tokens:
            q_tf[token] = q_tf.get(token, 0) + 1

        # Compute TF-IDF scores
        scores = []
        for doc_idx, tokens in enumerate(doc_tokens):
            score = 0.0
            doc_tf = {}
            for token in tokens:
                doc_tf[token] = doc_tf.get(token, 0) + 1
            
            # Dot product
            for token, q_count in q_tf.items():
                if token in doc_tf:
                    # IDF
                    df = dfs.get(token, 1)
                    idf = math.log((N + 1) / (df + 0.5))
                    score += doc_tf[token] * q_count * idf
            
            # Length normalization (cosine-like)
            doc_len = math.sqrt(sum(count ** 2 for count in doc_tf.values())) or 1.0
            q_len = math.sqrt(sum(count ** 2 for count in q_tf.values())) or 1.0
            normalized_score = score / (doc_len * q_len)
            
            scores.append((normalized_score, self.chunks[doc_idx]))

        scores.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, chunk in scores[:limit]:
            if score > 0.02:  # Minimum similarity threshold
                results.append({
                    "score": float(score),
                    "title": chunk["title"],
                    "source": chunk["source"],
                    "collection_id": chunk.get("collection_id", "General"),
                    "content": chunk["content"]
                })
        return results

    def search(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks:
            self.load_index()
            if not self.chunks:
                return []

        # Vector search using Gemini if API key is active and index has embeddings
        if self.api_key and self.chunks and "embedding" in self.chunks[0]:
            try:
                query_embed_res = genai.embed_content(
                    model="models/embedding-001",
                    content=query,
                    task_type="retrieval_query"
                )
                query_vector = query_embed_res["embedding"]
                
                # Cosine similarity
                results = []
                for chunk in self.chunks:
                    chunk_vector = chunk["embedding"]
                    # Compute dot product
                    dot_product = sum(q * c for q, c in zip(query_vector, chunk_vector))
                    q_norm = math.sqrt(sum(q**2 for q in query_vector))
                    c_norm = math.sqrt(sum(c**2 for c in chunk_vector))
                    similarity = dot_product / (q_norm * c_norm) if q_norm * c_norm > 0 else 0.0
                    results.append((similarity, chunk))
                
                results.sort(key=lambda x: x[0], reverse=True)
                
                return [
                    {
                        "score": float(sim),
                        "title": chunk["title"],
                        "source": chunk["source"],
                        "collection_id": chunk.get("collection_id", "General"),
                        "content": chunk["content"]
                    }
                    for sim, chunk in results[:limit]
                ]
            except Exception as e:
                print(f"Gemini search failed: {e}. Falling back to TF-IDF.")
                return self._tfidf_search(query, limit)
        else:
            return self._tfidf_search(query, limit)

# Direct execution script
if __name__ == "__main__":
    rag = RAGSystem()
    rag.build_index()
    # Test query
    test_results = rag.search("what is standard crack width in concrete?")
    print("Test Search Results:")
    for r in test_results:
        print(f"[{r['score']:.4f}] {r['title']} ({r['source']}): {r['content'][:100]}...")
