'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Question, AnswerRecord } from '@/types';

interface QuestionCardProps {
  question: Question;
  onAnswer: (optionIndex: number | number[], score: number) => void;
  onBack: () => void;
  currentIndex: number;
  totalQuestions: number;
  existingAnswer?: AnswerRecord;
  onTextAnswer: (text: string) => void;
}

export default function QuestionCard({
  question,
  onAnswer,
  onBack,
  currentIndex,
  totalQuestions,
  existingAnswer,
  onTextAnswer,
}: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [textValue, setTextValue] = useState('');
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-select from existingAnswer
  useEffect(() => {
    if (!existingAnswer) {
      setSelectedIndex(null);
      setSelectedIndexes([]);
      setTextValue('');
      return;
    }
    if (question.input_type === 'single_select') {
      const idx = existingAnswer.selected_option_index;
      if (typeof idx === 'number') setSelectedIndex(idx);
    } else if (question.input_type === 'multi_select') {
      const idx = existingAnswer.selected_option_index;
      if (Array.isArray(idx)) setSelectedIndexes(idx);
    } else if (question.input_type === 'text') {
      const lbl = existingAnswer.selected_label;
      if (typeof lbl === 'string') setTextValue(lbl);
    }
  }, [question.id, existingAnswer, question.input_type]);

  // Cleanup timer on unmount or question change
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [question.id]);

  function handleSingleSelect(index: number, score: number) {
    if (isPending) return;
    setSelectedIndex(index);
    setIsPending(true);
    timerRef.current = setTimeout(() => {
      setIsPending(false);
      onAnswer(index, score);
    }, 350);
  }

  function toggleMultiSelect(index: number) {
    setSelectedIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      // Max 3 selections
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  }

  function handleMultiContinue() {
    const totalScore = selectedIndexes.reduce((sum, idx) => {
      return sum + (question.options[idx]?.score ?? 0);
    }, 0);
    onAnswer(selectedIndexes, totalScore);
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = textValue.trim();
    if (!trimmed) return;
    onTextAnswer(trimmed);
    onAnswer(-1, 0);
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 48 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -48 }}
        transition={{ duration: 0.28, ease: 'easeOut' as const }}
        className="flex flex-col w-full"
        style={{ minHeight: 0 }}
      >
        {/* Back button */}
        {currentIndex > 0 && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className={cn(
              'self-start mb-4 flex items-center gap-1.5 px-2 py-1 rounded-lg',
              'text-sm transition-colors duration-150',
            )}
            style={{ color: '#737373', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 12L6 8l4-4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>
        )}

        {/* Optional image */}
        {question.image_url && (
          <div className="w-full mb-4 overflow-hidden rounded-lg" style={{ maxHeight: '120px' }}>
            <img
              src={question.image_url}
              alt=""
              className="w-full object-cover"
              style={{ maxHeight: '120px' }}
            />
          </div>
        )}

        {/* Question text */}
        <h2
          className="text-2xl font-bold leading-tight mb-6"
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            color: '#f5f5f5',
            lineClamp: 2,
            WebkitLineClamp: 2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {question.question_text}
        </h2>

        {/* Text input */}
        {question.input_type === 'text' && (
          <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Type your answer…"
              className="w-full px-4 py-3 rounded-xl text-base outline-none"
              style={{
                background: '#111111',
                border: '1px solid #1e1e1e',
                color: '#f5f5f5',
                fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color, #3b82f6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#1e1e1e';
              }}
            />
            <button
              type="submit"
              disabled={!textValue.trim()}
              className={cn(
                'w-full py-3 rounded-xl font-semibold text-base transition-opacity duration-150',
              )}
              style={{
                background: 'var(--accent-color, #3b82f6)',
                color: '#fff',
                border: 'none',
                cursor: textValue.trim() ? 'pointer' : 'not-allowed',
                opacity: textValue.trim() ? 1 : 0.45,
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              }}
            >
              Submit
            </button>
          </form>
        )}

        {/* Single select options */}
        {question.input_type === 'single_select' && (
          <div className="flex flex-col gap-3">
            {question.options.map((option, idx) => (
              <button
                key={option.id}
                onClick={() => handleSingleSelect(idx, option.score)}
                disabled={isPending}
                className={cn(
                  'answer-card w-full text-left px-4 py-3 rounded-xl border',
                  selectedIndex === idx ? 'selected' : '',
                )}
                style={{
                  minHeight: '56px',
                  background: selectedIndex === idx ? 'rgba(59,130,246,0.15)' : '#111111',
                  borderColor: selectedIndex === idx ? 'var(--accent-color, #3b82f6)' : '#1e1e1e',
                  color: '#f5f5f5',
                  cursor: isPending ? 'default' : 'pointer',
                  fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                  fontSize: '0.9375rem',
                  transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
                  boxShadow: selectedIndex === idx
                    ? '0 0 0 1px var(--accent-color, #3b82f6)'
                    : 'none',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Multi select options */}
        {question.input_type === 'multi_select' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              {question.options.map((option, idx) => {
                const isSelected = selectedIndexes.includes(idx);
                const isDisabled = !isSelected && selectedIndexes.length >= 3;
                return (
                  <button
                    key={option.id}
                    onClick={() => !isDisabled && toggleMultiSelect(idx)}
                    className={cn(
                      'answer-card w-full text-left px-4 py-3 rounded-xl border flex items-center justify-between gap-3',
                      isSelected ? 'selected' : '',
                    )}
                    style={{
                      minHeight: '56px',
                      background: isSelected ? 'rgba(59,130,246,0.15)' : '#111111',
                      borderColor: isSelected ? 'var(--accent-color, #3b82f6)' : '#1e1e1e',
                      color: isDisabled && !isSelected ? '#525252' : '#f5f5f5',
                      cursor: isDisabled && !isSelected ? 'not-allowed' : 'pointer',
                      fontFamily: 'var(--font-body, "Outfit", sans-serif)',
                      fontSize: '0.9375rem',
                      transition: 'border-color 0.15s, background-color 0.15s, box-shadow 0.15s',
                      boxShadow: isSelected
                        ? '0 0 0 1px var(--accent-color, #3b82f6)'
                        : 'none',
                      opacity: isDisabled && !isSelected ? 0.5 : 1,
                    }}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <span
                        className="flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{
                          width: '20px',
                          height: '20px',
                          background: 'var(--accent-color, #3b82f6)',
                        }}
                        aria-hidden="true"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2.5 6l2.5 2.5 4.5-5"
                            stroke="#fff"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {selectedIndexes.length > 0 && (
              <button
                onClick={handleMultiContinue}
                className="w-full py-3 mt-1 rounded-xl font-semibold text-base"
                style={{
                  background: 'var(--accent-color, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                  transition: 'opacity 0.15s',
                }}
              >
                Continue →
              </button>
            )}

            <p
              className="text-xs text-center"
              style={{ color: '#525252', fontFamily: 'var(--font-body, "Outfit", sans-serif)' }}
            >
              Select up to 3
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
