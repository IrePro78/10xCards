'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { GenerationCandidateDto } from '@/types/types';
import { FlashcardItem } from './FlashcardItem';

interface FlashcardListProps {
	flashcards: GenerationCandidateDto[];
	onAccept: (flashcard: GenerationCandidateDto) => void;
	onEdit: (flashcard: GenerationCandidateDto) => void;
	onReject: (flashcard: GenerationCandidateDto) => void;
}

export function FlashcardList({
	flashcards,
	onAccept,
	onEdit,
	onReject,
}: FlashcardListProps) {
	if (flashcards.length === 0) {
		return null;
	}

	return (
		<div className="space-y-6">
			<AnimatePresence mode="popLayout">
				{flashcards.map((flashcard) => (
					<motion.div
						key={`${flashcard.front.slice(0, 20)}-${flashcard.back.slice(0, 20)}-${Date.now()}`}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, x: -100 }}
						transition={{
							type: 'spring',
							stiffness: 400,
							damping: 25,
							mass: 1,
						}}
						layout
						className="relative"
					>
						<motion.div
							initial={{ scale: 0.95 }}
							animate={{ scale: 1 }}
							transition={{
								type: 'spring',
								stiffness: 300,
								damping: 20,
							}}
						>
							<FlashcardItem
								flashcard={flashcard}
								onAccept={onAccept}
								onEdit={onEdit}
								onReject={onReject}
							/>
						</motion.div>
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
