"""RAG service — Qdrant vector search for use case retrieval."""

from __future__ import annotations

from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.services import embedding_service
from app.utils.logger import get_logger

log = get_logger(__name__)


class RAGService:
    """Retrieves relevant use cases via vector similarity search."""

    def __init__(self, qdrant_client: QdrantClient, collection_name: str) -> None:
        self._qdrant = qdrant_client
        self._collection = collection_name

    async def query(
        self,
        query_text: str,
        sector_filter: str | None = None,
        top_k: int = 20,
    ) -> list[dict]:
        """
        Search Qdrant for similar use cases.

        Returns list of dicts with keys: use_case_id, score.
        """
        query_vector = await embedding_service.encode(query_text)

        # Build optional sector filter
        qdrant_filter = None
        if sector_filter:
            qdrant_filter = Filter(
                must=[
                    FieldCondition(
                        key="sector_normalized",
                        match=MatchValue(value=sector_filter),
                    )
                ]
            )

        results = self._qdrant.query_points(
            collection_name=self._collection,
            query=query_vector,
            query_filter=qdrant_filter,
            limit=top_k,
        )

        hits = []
        for point in results.points:
            hits.append({
                "use_case_id": point.payload.get("use_case_id"),
                "score": point.score,
            })

        log.info(
            f"RAG query returned {len(hits)} results",
            extra={"sector": sector_filter, "task": "rag_query"},
        )
        return hits
