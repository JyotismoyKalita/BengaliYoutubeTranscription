from typing import Any, Dict, Iterator


END_PUNCTUATION = (".", "?", "!")


def word_value(word: Any, field: str):
    if isinstance(word, dict):
        return word[field]
    return getattr(word, field)


def iter_segment_words(segments: Iterator[Any]) -> Iterator[Any]:
    for segment in segments:
        yield from segment.words


def should_split(text: str, word_count: int, word_start: float, prev_end: float, max_gap: float, max_words: int) -> bool:
    return (
        word_start - prev_end > max_gap
        or text.endswith(END_PUNCTUATION)
        or word_count + 1 > max_words
    )


def stream_word_chunks(words: Iterator[Any], max_gap: float = 1.0, max_words: int = 20) -> Iterator[Dict[str, Any]]:
    current_text = ""
    current_start = None
    current_end = None
    prev_end = None
    word_count = 0

    for word in words:
        word_text = word_value(word, "word").strip()
        word_start = word_value(word, "start")
        word_end = word_value(word, "end")

        if current_start is None:
            current_start = word_start
            current_text = word_text
            current_end = word_end
            prev_end = word_end
            word_count = 1
            continue

        if should_split(current_text, word_count, word_start, prev_end, max_gap, max_words):
            yield {"start": current_start, "end": current_end, "text": current_text}
            current_start = word_start
            current_text = word_text
            current_end = word_end
            word_count = 1
        else:
            current_text += " " + word_text
            current_end = word_end
            word_count += 1
        prev_end = word_end

    if current_text:
        yield {"start": current_start, "end": current_end, "text": current_text}


def stream_chunks(segments: Iterator[Any], max_gap: float = 1.0, max_words: int = 20) -> Iterator[Dict[str, Any]]:
    yield from stream_word_chunks(iter_segment_words(segments), max_gap=max_gap, max_words=max_words)
