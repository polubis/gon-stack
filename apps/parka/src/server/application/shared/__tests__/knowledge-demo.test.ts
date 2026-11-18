import { describe, expect, it } from 'vitest';
import { createKnowledgeTopicSchema } from '@schemas/knowledge';
import {
  DEMO_CATALOG,
  DEMO_CATEGORY,
  DEMO_LESSONS,
  DEMO_TAGS,
} from '../knowledge-demo';

describe('demo knowledge course', () => {
  it('has exactly ten lessons', () => {
    expect(DEMO_LESSONS).toHaveLength(10);
  });

  it('gives every lesson five or six reels', () => {
    for (const lesson of DEMO_LESSONS)
      expect(lesson.reels.length).toBeGreaterThanOrEqual(5);
    for (const lesson of DEMO_LESSONS)
      expect(lesson.reels.length).toBeLessThanOrEqual(6);
  });

  it('fits every text into the limits the database enforces', () => {
    expect(DEMO_CATEGORY.name.length).toBeLessThanOrEqual(40);
    expect(DEMO_CATALOG.name.length).toBeLessThanOrEqual(80);
    for (const lesson of DEMO_LESSONS) {
      expect(lesson.title.length).toBeLessThanOrEqual(120);
      expect(lesson.description.length).toBeLessThanOrEqual(500);
      for (const reel of lesson.reels) {
        expect(reel.trim().length).toBeGreaterThan(0);
        expect(reel.length).toBeLessThanOrEqual(8000);
      }
    }
    for (const tag of DEMO_TAGS) expect(tag.length).toBeLessThanOrEqual(30);
  });

  it('tags lessons only with known tags', () => {
    for (const lesson of DEMO_LESSONS)
      for (const tag of lesson.tags) expect(DEMO_TAGS).toContain(tag);
  });

  it('starts every reel with a Markdown heading', () => {
    for (const lesson of DEMO_LESSONS)
      for (const reel of lesson.reels) expect(reel).toMatch(/^# \S/);
  });

  it('has unique lesson titles', () => {
    const titles = DEMO_LESSONS.map((l) => l.title);

    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe('knowledge topic contract', () => {
  const base = {
    catalogId: '3f1c2a64-8b7e-4d19-9a55-2c6f0e1d7b10',
    title: 'T',
  };

  it('accepts a topic planned on a real day', () => {
    const result = createKnowledgeTopicSchema().shape.in.safeParse({
      ...base,
      studyDay: '2026-11-18',
    });

    expect(result.success).toBe(true);
  });

  it('accepts a backlog topic with a null day', () => {
    const result = createKnowledgeTopicSchema().shape.in.safeParse({
      ...base,
      studyDay: null,
    });

    expect(result.success).toBe(true);
  });

  it('refuses an impossible day', () => {
    const result = createKnowledgeTopicSchema().shape.in.safeParse({
      ...base,
      studyDay: '2026-02-31',
    });

    expect(result.success).toBe(false);
  });
});
