-- Migracja: Dodanie indeksu wyszukiwania dla tabeli flashcards
-- Opis: Tworzy indeks GIN dla wyszukiwania pełnotekstowego w polach front i back

-- Dodanie indeksu GIN dla wyszukiwania pełnotekstowego
CREATE INDEX IF NOT EXISTS idx_flashcards_search 
ON flashcards 
USING gin(to_tsvector('english', front || ' ' || back));

-- Komentarz do indeksu
COMMENT ON INDEX idx_flashcards_search IS 'Indeks GIN dla wyszukiwania pełnotekstowego w polach front i back fiszek'; 